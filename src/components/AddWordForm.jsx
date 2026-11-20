import { partOfSpeechOptions } from "../constants/vocabulary.js";
import { useState } from "react";
import { createVocabulary, updateVocabulary } from "../api/vocabulary.js";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";

function splitWords(text) {
  return text
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
}

export default function AddWordForm({
  initialWord,
  suggestedCategories = [],
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({
    word: initialWord?.word || "",
    meaning: initialWord?.meaning || "",
    examples: initialWord?.examples?.length ? initialWord.examples : [""],
    category: initialWord?.category || "",
    partOfSpeech: initialWord?.partOfSpeech || "noun",
    synonyms: initialWord?.relatedWords?.synonyms?.join(", ") || "",
    antonyms: initialWord?.relatedWords?.antonyms?.join(", ") || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const categoryOptions = [
    ...new Set([...suggestedCategories, initialWord?.category]),
  ]
    .filter((category) => category && category !== "Chưa phân loại")
    .sort();
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitWord(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        word: form.word,
        meaning: form.meaning,
        examples: form.examples.map((text) => text.trim()).filter(Boolean),
        category: form.category,
        partOfSpeech: form.partOfSpeech,
        relatedWords: {
          synonyms: splitWords(form.synonyms),
          antonyms: splitWords(form.antonyms),
        },
      };
      const newWord = initialWord
        ? await updateVocabulary(initialWord.id, payload)
        : await createVocabulary(payload);
      onSave(newWord);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      className="word-form"
      title={initialWord ? "Sửa từ vựng" : "Thêm từ vựng"}
      onClose={onClose}
    >
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Đóng biểu mẫu từ vựng"
      >
        <Icon name="close" />
      </button>
      <h2>{initialWord ? "Sửa từ vựng" : "Thêm từ vựng"}</h2>
      <form onSubmit={submitWord}>
        <label>
          Từ tiếng Anh
          <input
            name="word"
            required
            maxLength={100}
            value={form.word}
            onChange={updateField}
            placeholder="Ví dụ: purchase"
          />
        </label>
        <label>
          Nghĩa tiếng Việt
          <input
            name="meaning"
            required
            maxLength={255}
            value={form.meaning}
            onChange={updateField}
            placeholder="Ví dụ: mua hàng"
          />
        </label>
        <div className="example-fields">
          <span>Câu ví dụ (không bắt buộc)</span>
          {form.examples.map((sentence, index) => (
            <div className="example-field" key={index}>
              <input
                aria-label={`Câu ví dụ ${index + 1}`}
                value={sentence}
                onChange={(event) =>
                  setForm({
                    ...form,
                    examples: form.examples.map((text, position) =>
                      position === index ? event.target.value : text,
                    ),
                  })
                }
                placeholder="Nhập câu ví dụ tiếng Anh…"
              />
              <button
                type="button"
                aria-label={`Xóa ví dụ ${index + 1}`}
                onClick={() =>
                  setForm({
                    ...form,
                    examples: form.examples.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, examples: [...form.examples, ""] })
            }
          >
            + Thêm ví dụ
          </button>
        </div>
        <label>
          Chủ đề (không bắt buộc)
          <select
            value={
              customCategory
                ? "__new__"
                : form.category === "Chưa phân loại"
                  ? ""
                  : form.category
            }
            onChange={(event) => {
              const isNew = event.target.value === "__new__";
              setCustomCategory(isNew);
              setForm({ ...form, category: isNew ? "" : event.target.value });
            }}
          >
            <option value="">Chưa phân loại</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="__new__">Nhập chủ đề mới…</option>
          </select>
        </label>
        {customCategory && (
          <label>
            Chủ đề mới (không bắt buộc)
            <input
              name="category"
              maxLength={60}
              value={form.category}
              onChange={updateField}
              placeholder="Nhập tên chủ đề mới"
            />
          </label>
        )}
        <label>
          Loại từ
          <select
            name="partOfSpeech"
            value={form.partOfSpeech}
            onChange={updateField}
          >
            {partOfSpeechOptions.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ đồng nghĩa (không bắt buộc, cách nhau bằng dấu phẩy)
          <input
            name="synonyms"
            value={form.synonyms}
            onChange={updateField}
            placeholder="buy, acquire"
          />
        </label>
        <label>
          Từ trái nghĩa (không bắt buộc, cách nhau bằng dấu phẩy)
          <input
            name="antonyms"
            value={form.antonyms}
            onChange={updateField}
            placeholder="sell"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary-button form-submit"
          disabled={saving}
          type="submit"
        >
          {saving ? "Đang lưu…" : "Lưu từ"}
          <Icon name="arrow" size={18} />
        </button>
      </form>
    </Modal>
  );
}
