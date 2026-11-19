import { pool } from '../db.js';

export async function findAll(search, category) {
  const result = await pool.query(
    `SELECT id, word, meaning, example, category, created_at AS "createdAt"
     FROM vocabulary
     WHERE ($1 = '' OR word ILIKE '%' || $1 || '%' OR meaning ILIKE '%' || $1 || '%')
       AND ($2 = 'All' OR category = $2)
     ORDER BY created_at DESC, id DESC`,
    [search.trim(), category],
  );
  return result.rows;
}

export async function create({ word, meaning, example, category }) {
  const result = await pool.query(
    `INSERT INTO vocabulary (word, meaning, example, category)
     VALUES ($1, $2, $3, $4)
     RETURNING id, word, meaning, example, category, created_at AS "createdAt"`,
    [word.trim(), meaning.trim(), example.trim(), category?.trim() || 'Everyday'],
  );
  return result.rows[0];
}
