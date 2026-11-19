import { useState } from "react";
import { createVocabulary, updateVocabulary } from "../api/vocabulary.js";
import { categories, partOfSpeechOptions } from "../constants/vocabulary.js";
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
    example: initialWord?.example || "",
    category: initialWord?.category || "",
    partOfSpeech: initialWord?.partOfSpeech || "noun",
    synonyms: initialWord?.relatedWords?.synonyms?.join(", ") || "",
    antonyms: initialWord?.relatedWords?.antonyms?.join(", ") || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const categoryOptions = [
    ...new Set([
      ...categories.slice(1),
      ...suggestedCategories,
      initialWord?.category,
    ]),
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
        example: form.example,
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
      title={initialWord ? "Edit word" : "Add a word"}
      onClose={onClose}
    >
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Close add word form"
      >
        <Icon name="close" />
      </button>
      <h2>{initialWord ? "Sửa từ vựng" : "Thêm từ vựng"}</h2>
      <form onSubmit={submitWord}>
        <label>
          English word
          <input
            name="word"
            required
            maxLength={100}
            value={form.word}
            onChange={updateField}
            placeholder="e.g. purchase"
          />
        </label>
        <label>
          Vietnamese meaning
          <input
            name="meaning"
            required
            maxLength={255}
            value={form.meaning}
            onChange={updateField}
            placeholder="e.g. mua hàng"
          />
        </label>
        <label>
          Example sentence (optional)
          <input
            name="example"
            value={form.example}
            onChange={updateField}
            placeholder="A sentence that brings it to life..."
          />
        </label>
        <label>
          Category (optional)
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
            <option value="__new__">Nhập category mới…</option>
          </select>
        </label>
        {customCategory && (
          <label>
            Category mới (optional)
            <input
              name="category"
              maxLength={60}
              value={form.category}
              onChange={updateField}
              placeholder="Nhập tên category mới"
            />
          </label>
        )}
        <label>
          Part of speech
          <select
            name="partOfSpeech"
            value={form.partOfSpeech}
            onChange={updateField}
          >
            {partOfSpeechOptions.map((part) => (
              <option key={part}>{part}</option>
            ))}
          </select>
        </label>
        <label>
          Synonyms (optional, comma separated)
          <input
            name="synonyms"
            value={form.synonyms}
            onChange={updateField}
            placeholder="buy, acquire"
          />
        </label>
        <label>
          Antonyms (optional, comma separated)
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
          {saving ? "Saving…" : "Save to my words"}
          <Icon name="arrow" size={18} />
        </button>
      </form>
    </Modal>
  );
}
