import { useEffect, useMemo, useRef, useState } from "react";

const categories = [
  "All",
  "Everyday",
  "Mindset",
  "Travel",
  "Communication",
  "Work",
];
const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </>
  ),
  close: (
    <>
      <path d="m18 6-12 12M6 6l12 12" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
};
function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function App() {
  const [words, setWords] = useState([]);
  const [query, setQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const searchInput = useRef(null);
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("All");
  const [activeWord, setActiveWord] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learned, setLearned] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    word: "",
    meaning: "",
    example: "",
    category: "Everyday",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({ search: query, category });
          const response = await fetch(`/api/vocabulary?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok)
            throw new Error(
              "Không thể tải từ vựng. Kiểm tra API và kết nối PostgreSQL nhé.",
            );
          setWords(await response.json());
          setError("");
        } catch (err) {
          if (err.name !== "AbortError")
            setError(err.message || "Không thể kết nối máy chủ.");
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      query ? 220 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, retryCount]);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const currentIndex = useMemo(
    () => words.findIndex((item) => item.id === activeWord?.id),
    [words, activeWord],
  );
  const visibleWords =
    view === "Learned"
      ? words.filter((word) => learned.includes(word.id))
      : words;
  const doneCount = learned.length;
  function openCard(word) {
    setActiveWord(word);
    setIsFlipped(false);
  }
  function nextCard() {
    if (!words.length) return;
    openCard(words[(Math.max(currentIndex, 0) + 1) % words.length]);
  }
  async function addWord(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Không thể thêm từ mới.");
      setForm({ word: "", meaning: "", example: "", category: "Everyday" });
      setShowForm(false);
      setCategory("All");
      setQuery("");
      setWords((existing) => [
        result,
        ...existing.filter((item) => item.id !== result.id),
      ]);
      openCard(result);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top">
          <span className="brand-mark">w.</span>
          <span>
            wordwise<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="side-caption">WORKSPACE</div>
        <button className="nav-item selected">
          <Icon name="grid" />
          <span>My learning</span>
          <span className="nav-count">{words.length}</span>
        </button>
        <button className="nav-item" onClick={() => setShowForm(true)}>
          <Icon name="plus" />
          <span>Add a word</span>
        </button>
        <div className="side-caption collection-label">
          COLLECTIONS{" "}
          <button
            aria-label="Thêm bộ sưu tập"
            onClick={() => setShowForm(true)}
          >
            +
          </button>
        </div>
        <div className="collection-list">
          {categories.slice(1).map((item, index) => (
            <button
              className={`collection ${category === item ? "collection-active" : ""}`}
              key={item}
              onClick={() => setCategory(category === item ? "All" : item)}
            >
              <span className={`collection-dot dot-${index}`} />
              {item}
              <span className="collection-arrow">↗</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="mini-streak">
            ✳ <span>Little steps, big progress.</span>
          </div>
          <div className="profile">
            <div className="avatar">L</div>
            <div>
              <b>Language learner</b>
              <small>Your personal space</small>
            </div>
            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumb">
            My learning <span>/</span> <b>Vocabulary</b>
          </div>
          <div className="top-actions">
            <span className="today-label">{formattedDate}</span>
            <div className="top-avatar">L</div>
          </div>
        </header>
        <section className="welcome-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> YOUR DAILY PRACTICE
            </div>
            <h1>
              A little better,
              <br />
              <em>word by word.</em>
            </h1>
            <p className="intro">
              A calm corner for your English journey. Keep showing up — it adds
              up.
            </p>
            <button
              className="primary-button"
              onClick={() => words.length && openCard(words[0])}
            >
              <span>Start learning</span>
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="daily-card">
            <div className="daily-top">
              <span className="daily-icon">
                <Icon name="sparkle" size={18} />
              </span>
              <span className="daily-tag">TODAY'S GOAL</span>
              <span className="daily-dots">···</span>
            </div>
            <div className="daily-number">
              {Math.min(doneCount, 5)}
              <span> / 5 words</span>
            </div>
            <div className="progress-track">
              <div
                style={{ width: `${Math.min((doneCount / 5) * 100, 100)}%` }}
              />
            </div>
            <div className="daily-foot">
              <span>
                {doneCount >= 5
                  ? "Goal reached. Lovely work!"
                  : `${5 - Math.min(doneCount, 5)} more to reach your daily goal`}
              </span>
              <span className="goal-stars">✳ ✳ ✳ ✳ ✳</span>
            </div>
            <div className="daily-decoration">✳</div>
          </div>
        </section>

        <section className="vocabulary-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">YOUR COLLECTION</div>
              <h2>Words to keep</h2>
              <p className="section-description">
                Your growing collection, one lovely word at a time.
              </p>
            </div>
            <button className="add-button" onClick={() => setShowForm(true)}>
              <Icon name="plus" size={17} /> Add a word
            </button>
          </div>
          <div className="toolbar">
            <div className="tabs">
              {["All", "Recent", "Learned"].map((tab) => (
                <button
                  key={tab}
                  className={view === tab ? "tab active-tab" : "tab"}
                  onClick={() => {
                    setView(tab);
                    if (tab !== "Learned") setCategory("All");
                  }}
                >
                  {tab}
                  <span>
                    {tab === "Learned" ? learned.length : words.length}
                  </span>
                </button>
              ))}
            </div>
            <label className="search-box">
              <Icon name="search" size={18} />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a word..."
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <div className="filter-row">
            <span>EXPLORE BY</span>
            {categories.slice(1).map((item) => (
              <button
                className={
                  category === item ? "filter-chip chip-active" : "filter-chip"
                }
                key={item}
                onClick={() => setCategory(category === item ? "All" : item)}
              >
                {item}
              </button>
            ))}
          </div>
          {error && (
            <div className="error-state">
              <span>Something needs a little attention</span>
              <p>{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setRetryCount((count) => count + 1);
                }}
              >
                Try again
              </button>
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              Gathering your words<span> · · ·</span>
            </div>
          ) : (
            !error && (
              <div className="word-grid">
                {visibleWords.map((word, index) => (
                  <article
                    className="word-card"
                    key={word.id}
                    onClick={() => openCard(word)}
                  >
                    <div className={`card-top card-tone-${index % 4}`}>
                      <span className="card-category">{word.category}</span>
                      <button
                        className="card-bookmark"
                        aria-label="Open flashcard"
                        onClick={(event) => {
                          event.stopPropagation();
                          openCard(word);
                        }}
                      >
                        ↗
                      </button>
                      <div className="card-index">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="card-word">{word.word}</div>
                      <div className="card-hint">
                        Tap to reveal meaning <span>↗</span>
                      </div>
                    </div>
                    <div className="card-bottom">
                      <span className="card-meaning">{word.meaning}</span>
                      <span className="card-open">
                        <Icon name="arrow" size={17} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
          {!loading && !error && visibleWords.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✳</div>
              <h3>
                {view === "Learned"
                  ? "Your learned words will live here"
                  : "No words here yet"}
              </h3>
              <p>
                {view === "Learned"
                  ? "Mark a flashcard as known and it will appear in this collection."
                  : "Try another search, or add a word to your collection."}
              </p>
              {view !== "Learned" && (
                <button
                  className="add-button"
                  onClick={() => setShowForm(true)}
                >
                  <Icon name="plus" size={17} /> Add your first word
                </button>
              )}
            </div>
          )}
          {!loading && visibleWords.length > 0 && (
            <div className="list-footer">
              <span>
                Showing <b>{visibleWords.length}</b> words in your collection
              </span>
              <span>
                Made for curious minds <i>✳</i>
              </span>
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setShowForm(false)
          }
        >
          <form className="word-form" onSubmit={addWord}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowForm(false)}
            >
              <Icon name="close" />
            </button>
            <div className="eyebrow">GROW YOUR COLLECTION</div>
            <h2>A new word, a new world.</h2>
            <p>Add a word you want to remember.</p>
            <label>
              English word
              <input
                autoFocus
                required
                value={form.word}
                onChange={(event) =>
                  setForm({ ...form, word: event.target.value })
                }
                placeholder="e.g. serendipity"
              />
            </label>
            <label>
              Vietnamese meaning
              <input
                required
                value={form.meaning}
                onChange={(event) =>
                  setForm({ ...form, meaning: event.target.value })
                }
                placeholder="e.g. Sự tình cờ may mắn"
              />
            </label>
            <label>
              Example sentence
              <input
                required
                value={form.example}
                onChange={(event) =>
                  setForm({ ...form, example: event.target.value })
                }
                placeholder="A sentence that brings it to life..."
              />
            </label>
            <label>
              Collection
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.slice(1).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="primary-button form-submit" type="submit">
              Save to my words <Icon name="arrow" size={18} />
            </button>
          </form>
        </div>
      )}

      {activeWord && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setActiveWord(null)
          }
        >
          <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
            <button className="modal-close" onClick={() => setActiveWord(null)}>
              <Icon name="close" />
            </button>
            <div className="flash-top">
              <span>YOUR FLASHCARD</span>
              <span>
                {String(Math.max(currentIndex, 0) + 1).padStart(2, "0")} /{" "}
                {String(words.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flash-ornament">✳</div>
            <div className="flash-category">{activeWord.category}</div>
            {!isFlipped ? (
              <>
                <h2>{activeWord.word}</h2>
                <p className="flash-pronunciation">
                  Tap the card to reveal its meaning
                </p>
                <button
                  className="flip-button"
                  onClick={() => setIsFlipped(true)}
                >
                  Reveal meaning <span>↗</span>
                </button>
              </>
            ) : (
              <>
                <h2 className="flash-meaning">{activeWord.meaning}</h2>
                <div className="example-box">
                  <span>IN A SENTENCE</span>
                  <p>“{activeWord.example}”</p>
                </div>
                <button
                  className="flip-button"
                  onClick={() => setIsFlipped(false)}
                >
                  Show the word again <span>↗</span>
                </button>
              </>
            )}
            <div className="flash-actions">
              <button
                onClick={() => {
                  setLearned((items) =>
                    items.includes(activeWord.id)
                      ? items
                      : [...items, activeWord.id],
                  );
                  nextCard();
                }}
              >
                <Icon name="check" size={17} /> I know this
              </button>
              <button onClick={nextCard}>
                Next word <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
