import { useState } from "react";
import { deleteVocabulary } from "../api/vocabulary.js";
import AddWordForm from "../components/AddWordForm.jsx";
import ImportWordsForm from "../components/ImportWordsForm.jsx";
import AddWordMenu from "../components/AddWordMenu.jsx";

export default function VocabularyPage({ words, onChange }) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [part, setPart] = useState("all");
  const [editingWord, setEditingWord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const topics = [...new Set(words.map((word) => word.category))].sort();
  const availableParts = [
    ...new Set(words.map((word) => word.partOfSpeech)),
  ].sort();
  const filteredWords = words.filter((word) => {
    const matches = `${word.word} ${word.meaning}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return (
      matches &&
      (topic === "all" || word.category === topic) &&
      (part === "all" || word.partOfSpeech === part)
    );
  });

  function openForm(word = null) {
    setEditingWord(word);
    setShowForm(true);
  }

  async function removeWord(id) {
    setDeleting(true);
    setError("");
    try {
      await deleteVocabulary(id);
      setDeleteId(null);
      await onChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <h1>Từ vựng</h1>
        <AddWordMenu
          onAdd={() => openForm()}
          onImport={() => setShowImport(true)}
        />
      </div>
      <div className="library-filters">
        <label>
          Tìm từ
          <input
            type="search"
            placeholder="Từ tiếng Anh hoặc nghĩa tiếng Việt"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Chủ đề
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            <option value="all">Tất cả chủ đề</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Loại từ
          <select
            value={part}
            onChange={(event) => setPart(event.target.value)}
          >
            <option value="all">Tất cả loại từ</option>
            {availableParts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setSearch("");
            setTopic("all");
            setPart("all");
          }}
        >
          Xóa bộ lọc
        </button>
      </div>
      <p className="muted">
        {filteredWords.length} / {words.length} từ
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="vocabulary-list">
        {filteredWords.map((word) => (
          <article className="vocabulary-row" key={word.id}>
            <div>
              <h2>
                {word.word} <small>{word.partOfSpeech}</small>
              </h2>
              <p>{word.meaning}</p>
              <span className="muted">{word.category}</span>
            </div>
            <div className="row-actions">
              {deleteId === word.id ? (
                <>
                  <span>Xóa từ này?</span>
                  <button
                    disabled={deleting}
                    className="danger-button"
                    onClick={() => removeWord(word.id)}
                  >
                    Xóa
                  </button>
                  <button disabled={deleting} onClick={() => setDeleteId(null)}>
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openForm(word)}
                    aria-label={`Sửa từ ${word.word}`}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(word.id)}
                    aria-label={`Xóa từ ${word.word}`}
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {!filteredWords.length && (
        <p>Không có từ phù hợp. Thử đổi bộ lọc hoặc thêm từ mới.</p>
      )}
      {showImport && (
        <ImportWordsForm
          existingWords={words}
          onClose={() => setShowImport(false)}
          onSave={() => {
            setShowImport(false);
            onChange();
          }}
        />
      )}
      {showForm && (
        <AddWordForm
          initialWord={editingWord}
          suggestedCategories={topics}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            onChange();
          }}
        />
      )}
    </section>
  );
}
