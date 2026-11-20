import { useState } from "react";
import Modal from "./Modal.jsx";
import { categoryLabel } from "../constants/vocabulary.js";
import { importVocabulary } from "../api/vocabulary.js";
import {
  MAX_IMPORT_WORDS,
  prepareImport,
} from "../../shared/vocabularyImport.js";

const sample = JSON.stringify(
  [
    {
      word: "purchase",
      meaning: "mua",
      partOfSpeech: "verb",
      category: "Office",
      examples: [
        "The company plans to purchase new computers.",
        "You can purchase tickets online.",
      ],
      synonyms: ["buy", "acquire"],
      antonyms: ["sell"],
    },
  ],
  null,
  2,
);

export default function ImportWordsForm({ existingWords, onClose, onSave }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState(null);
  const [parsedWords, setParsedWords] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const readyCount = rows?.filter((row) => row.status === "ready").length || 0;

  function resetPreview() {
    setRows(null);
    setError("");
  }

  function preview() {
    resetPreview();
    let words;
    try {
      words = JSON.parse(text);
    } catch {
      setError(
        "JSON chưa hợp lệ. Hãy dán nguyên mảng [...] và bỏ dấu ``` nếu có.",
      );
      return;
    }
    try {
      setRows(
        prepareImport(
          words,
          existingWords.map((word) => word.word),
        ),
      );
      setParsedWords(words);
    } catch (validationError) {
      setError(validationError.message);
    }
  }

  async function save() {
    if (saving || !readyCount) return;
    setSaving(true);
    setError("");
    try {
      const response = await importVocabulary(parsedWords);
      setResult(response);
      setRows(response.rows);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function close() {
    if (saving) return;
    if (result) onSave();
    else onClose();
  }

  return (
    <Modal className="import-form" title="Nhập danh sách từ" onClose={close}>
      <button
        className="modal-close"
        disabled={saving}
        aria-label="Đóng nhập danh sách"
        onClick={close}
      >
        ×
      </button>
      <h2>Nhập danh sách từ</h2>
      {!result && (
        <>
          <label>
            Danh sách JSON
            <textarea
              rows={10}
              value={text}
              disabled={saving}
              placeholder="Dán mảng JSON tại đây..."
              onChange={(event) => {
                setText(event.target.value);
                resetPreview();
              }}
            />
          </label>
          <details>
            <summary>Hướng dẫn & mẫu nhập</summary>
            <p>
              Tối đa {MAX_IMPORT_WORDS} từ mỗi lượt. Từ trùng được bỏ qua, không
              ghi đè dữ liệu cũ.
            </p>
            <p>
              Bắt buộc: word (từ), meaning (nghĩa), partOfSpeech (loại từ).
              Không bắt buộc: category (chủ đề), examples (mảng câu ví dụ),
              synonyms (đồng nghĩa), antonyms (trái nghĩa).
            </p>
            <p>
              Mỗi từ có thể có chủ đề riêng trong trường category. Chủ đề mới
              được lưu cùng từ; bỏ trống thì dùng Chưa phân loại.
            </p>
            <pre>{sample}</pre>
            <p>
              Giá trị partOfSpeech: noun (danh từ), verb (động từ), adjective
              (tính từ), adverb (trạng từ) hoặc phrase (cụm từ). Không có từ
              liên quan thì dùng [].
            </p>
          </details>
          <button disabled={saving} onClick={preview}>
            Xem trước
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {result && (
        <p role="status">
          Đã thêm <b>{result.added}</b> từ; bỏ qua <b>{result.duplicates}</b> từ
          trùng và <b>{result.invalid}</b> mục không hợp lệ.
        </p>
      )}
      {rows && (
        <>
          {!result && (
            <p>
              {readyCount} từ hợp lệ sẽ được thêm. Các mục lỗi/trùng bên dưới sẽ
              bỏ qua.
            </p>
          )}
          <div className="import-preview">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Từ</th>
                  <th>Chủ đề</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.number}>
                    <td>{row.number}</td>
                    <td>{row.word || "—"}</td>
                    <td>
                      {categoryLabel(
                        row.data?.category ||
                          (typeof parsedWords[row.number - 1]?.category ===
                          "string"
                            ? parsedWords[row.number - 1].category.trim() ||
                              "Chưa phân loại"
                            : "Chưa phân loại"),
                      )}
                    </td>
                    <td className={row.status === "error" ? "form-error" : ""}>
                      {row.status === "added" ? "Đã thêm" : row.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result && (
            <button
              className="primary-button form-submit"
              disabled={saving || readyCount === 0}
              onClick={save}
            >
              {saving ? "Đang lưu…" : `Lưu ${readyCount} từ hợp lệ`}
            </button>
          )}
        </>
      )}
      {result && (
        <button className="primary-button form-submit" onClick={close}>
          Hoàn tất
        </button>
      )}
    </Modal>
  );
}
