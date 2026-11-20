import { pool } from "../db.js";
import { prepareImport } from "../../shared/vocabularyImport.js";

const wordColumns = `id, word, meaning, category,
  part_of_speech AS "partOfSpeech", related_words AS "relatedWords",
  created_at AS "createdAt"`;

export async function findAll(search, category) {
  const result = await pool.query(
    `SELECT ${wordColumns},
       COALESCE((SELECT json_agg(sentence ORDER BY position, id)
         FROM vocabulary_examples WHERE vocabulary_id = vocabulary.id), '[]'::json) AS examples
     FROM vocabulary
     WHERE ($1 = '' OR word ILIKE '%' || $1 || '%' OR meaning ILIKE '%' || $1 || '%')
       AND ($2 = 'All' OR category = $2)
     ORDER BY created_at DESC, id DESC`,
    [search.trim(), category],
  );
  return result.rows;
}

// The word and its sentences must either all save or all roll back.
async function transaction(action) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertExamples(client, vocabularyId, examples) {
  if (!examples.length) return;
  await client.query(
    `INSERT INTO vocabulary_examples (vocabulary_id, sentence, position)
     SELECT $1, sentence, position FROM unnest($2::text[]) WITH ORDINALITY AS items(sentence, position)`,
    [vocabularyId, examples],
  );
}

async function insertWord(client, data) {
  const result = await client.query(
    `INSERT INTO vocabulary (word, meaning, category, part_of_speech, related_words)
     VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING ${wordColumns}`,
    [
      data.word.trim(),
      data.meaning.trim(),
      data.category,
      data.partOfSpeech,
      JSON.stringify(data.relatedWords),
    ],
  );
  const word = result.rows[0];
  await insertExamples(client, word.id, data.examples);
  return { ...word, examples: data.examples };
}

export function create(data) {
  return transaction((client) => insertWord(client, data));
}

export function update(id, data) {
  return transaction(async (client) => {
    const result = await client.query(
      `UPDATE vocabulary SET word = $1, meaning = $2, category = $3,
       part_of_speech = $4, related_words = $5::jsonb
       WHERE id = $6 RETURNING ${wordColumns}`,
      [
        data.word.trim(),
        data.meaning.trim(),
        data.category,
        data.partOfSpeech,
        JSON.stringify(data.relatedWords),
        id,
      ],
    );
    if (!result.rows[0]) return undefined;
    await client.query(
      "DELETE FROM vocabulary_examples WHERE vocabulary_id = $1",
      [id],
    );
    await insertExamples(client, id, data.examples);
    return { ...result.rows[0], examples: data.examples };
  });
}

export async function remove(id) {
  // PostgreSQL deletes the linked examples through ON DELETE CASCADE.
  const result = await pool.query("DELETE FROM vocabulary WHERE id = $1", [id]);
  return result.rowCount > 0;
}

export function importMany(words) {
  return transaction(async (client) => {
    await client.query("LOCK TABLE vocabulary IN SHARE ROW EXCLUSIVE MODE");
    const existing = await client.query("SELECT word FROM vocabulary");
    const rows = prepareImport(
      words,
      existing.rows.map((row) => row.word),
    );
    const ready = rows.filter((row) => row.status === "ready");
    for (const row of ready) await insertWord(client, row.data);
    return {
      added: ready.length,
      duplicates: rows.filter((row) => row.status === "duplicate").length,
      invalid: rows.filter((row) => row.status === "error").length,
      rows: rows.map(({ data, ...row }) => ({
        ...row,
        status: row.status === "ready" ? "added" : row.status,
      })),
    };
  });
}
