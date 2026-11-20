import { useEffect, useState } from "react";
import { getVocabulary } from "./api/vocabulary.js";
import LearningModes from "./components/LearningModes.jsx";
import Flashcard from "./components/Flashcard.jsx";
import AutoReview from "./AutoReview.jsx";
import WordFlow from "./WordFlow.jsx";
import VocabularyPage from "./pages/VocabularyPage.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";

function getPage() {
  const name = window.location.hash.slice(1);
  return ["home", "vocabulary", "statistics"].includes(name) ? name : "home";
}

export default function App() {
  const [page, setPage] = useState(getPage);
  const [words, setWords] = useState([]);
  const [knownIds, setKnownIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [manualWords, setManualWords] = useState([]);
  const [initialWord, setInitialWord] = useState(null);

  useEffect(() => {
    const navigate = () => {
      setPage(getPage());
      setMode(null);
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  async function loadWords(signal) {
    setLoading(true);
    setError("");
    try {
      setWords(await getVocabulary(signal));
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadWords(controller.signal);
    return () => controller.abort();
  }, []);

  function markKnown(id) {
    setKnownIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }

  function openFlashcards(selectedWords, firstWord = selectedWords[0]) {
    if (!selectedWords.length) return;
    setManualWords(selectedWords);
    setInitialWord(firstWord);
    setMode("flashcards");
  }

  return (
    <>
      <header className="site-header">
        <a href="#home" className="brand">
          Wordwise
        </a>
        <nav aria-label="Điều hướng chính">
          <a href="#home" aria-current={page === "home" ? "page" : undefined}>
            Học tập
          </a>
          <a
            href="#vocabulary"
            aria-current={page === "vocabulary" ? "page" : undefined}
          >
            Từ vựng
          </a>
          <a
            href="#statistics"
            aria-current={page === "statistics" ? "page" : undefined}
          >
            Thống kê
          </a>
        </nav>
      </header>
      <main className="page">
        {error && (
          <div className="error-state" role="alert">
            {error} <button onClick={() => loadWords()}>Thử lại</button>
          </div>
        )}
        {loading ? (
          <p role="status">Đang tải từ vựng…</p>
        ) : (
          <>
            {page === "home" && (
              <section className="home-page">
                <p className="eyebrow">GÓC HỌC TẬP</p>
                <h1>Mỗi ngày, nhớ thêm một chút.</h1>
                <p>
                  Chọn cách học phù hợp: Flashcards, Auto Review hoặc nghe theo
                  nhóm với WordFlow.
                </p>
                <button
                  className="primary-button"
                  disabled={!words.length || !!error}
                  onClick={() => setMode("choose")}
                >
                  Bắt đầu học →
                </button>
                {!words.length && !error && (
                  <p>Thêm từ trong trang Từ vựng để bắt đầu.</p>
                )}
              </section>
            )}
            {page === "vocabulary" && (
              <VocabularyPage words={words} onChange={() => loadWords()} />
            )}
            {page === "statistics" && (
              <StatisticsPage words={words} knownIds={knownIds} />
            )}
          </>
        )}
      </main>
      {mode === "choose" && (
        <LearningModes
          wordCount={words.length}
          onClose={() => setMode(null)}
          onChooseFlashcards={() => openFlashcards(words)}
          onChooseAutoReview={() => setMode("auto")}
          onChooseWordFlow={() => setMode("flow")}
        />
      )}
      {mode === "flashcards" && (
        <Flashcard
          words={manualWords}
          initialWord={initialWord}
          onClose={() => setMode(null)}
        />
      )}
      {mode === "auto" && (
        <AutoReview
          words={words}
          onClose={() => setMode(null)}
          onMarkKnown={markKnown}
        />
      )}
      {mode === "flow" && (
        <WordFlow words={words} onClose={() => setMode(null)} />
      )}
    </>
  );
}
