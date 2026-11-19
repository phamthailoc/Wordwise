import { pool } from "../db.js";
import { prepareImport } from "../../shared/vocabularyImport.js";

const wordColumns = `id, word, meaning, example, category,
  part_of_speech AS "partOfSpeech", related_words AS "relatedWords",
  created_at AS "createdAt"`;

export async function findAll(search, category) {
  const result = await pool.query(
    `SELECT ${wordColumns}
     FROM vocabulary
     WHERE ($1 = '' OR word ILIKE '%' || $1 || '%' OR meaning ILIKE '%' || $1 || '%')
       AND ($2 = 'All' OR category = $2)
     ORDER BY created_at DESC, id DESC`,
    [search.trim(), category],
  );
  return result.rows;
}

export async function create({
  word,
  meaning,
  example,
  category,
  partOfSpeech,
  relatedWords,
}) {
  const result = await pool.query(
    `INSERT INTO vocabulary (word, meaning, example, category, part_of_speech, related_words)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING ${wordColumns}`,
    [
      word.trim(),
      meaning.trim(),
      example.trim(),
      category?.trim() || "Chưa phân loại",
      partOfSpeech?.trim() || "noun",
      JSON.stringify(relatedWords || { synonyms: [], antonyms: [] }),
    ],
  );
  return result.rows[0];
}

export async function update(id, data) {
  const result = await pool.query(
    `UPDATE vocabulary SET word = $1, meaning = $2, example = $3,
     category = $4, part_of_speech = $5, related_words = $6::jsonb
     WHERE id = $7 RETURNING ${wordColumns}`,
    [
      data.word.trim(),
      data.meaning.trim(),
      data.example.trim(),
      data.category.trim(),
      data.partOfSpeech,
      JSON.stringify(data.relatedWords),
      id,
    ],
  );
  return result.rows[0];
}

export async function remove(id) {
  const result = await pool.query("DELETE FROM vocabulary WHERE id = $1", [id]);
  return result.rowCount > 0;
}

export async function importMany(words) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Prevent another save from introducing duplicates while this batch is checked.
    await client.query("LOCK TABLE vocabulary IN SHARE ROW EXCLUSIVE MODE");
    const existing = await client.query("SELECT word FROM vocabulary");
    const rows = prepareImport(
      words,
      existing.rows.map((row) => row.word),
    );
    const ready = rows
      .filter((row) => row.status === "ready")
      .map((row) => row.data);
    if (ready.length) {
      await client.query(
        `INSERT INTO vocabulary (word, meaning, example, category, part_of_speech, related_words)
         SELECT word, meaning, example, category, "partOfSpeech", "relatedWords"
         FROM jsonb_to_recordset($1::jsonb) AS items(
           word text, meaning text, example text, category text,
           "partOfSpeech" text, "relatedWords" jsonb
         )`,
        [JSON.stringify(ready)],
      );
    }
    await client.query("COMMIT");
    return {
      added: ready.length,
      duplicates: rows.filter((row) => row.status === "duplicate").length,
      invalid: rows.filter((row) => row.status === "error").length,
      rows: rows.map(({ data, ...row }) => ({
        ...row,
        status: row.status === "ready" ? "added" : row.status,
      })),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
