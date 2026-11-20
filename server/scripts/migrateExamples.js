import "dotenv/config";
import { readFile } from "node:fs/promises";
import { pool } from "../db.js";

try {
  const sql = await readFile(
    new URL(
      "../../database/migrations/002_add_vocabulary_examples.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await pool.query(sql);
  console.log("Đã chuyển ví dụ sang bảng vocabulary_examples.");
} catch (error) {
  console.error("Không thể chuyển dữ liệu:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
