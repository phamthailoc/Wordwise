import { useEffect, useRef, useState } from "react";
import Modal from "./components/Modal.jsx";
import { shuffle } from "./utils/review.js";

function isPositiveInteger(value) {
  return Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

const readingSpeeds = [
  { value: 0.5, label: "Rất chậm" },
  { value: 0.75, label: "Chậm" },
  { value: 0.9, label: "Mặc định" },
  { value: 1, label: "Bình thường" },
  { value: 1.25, label: "Nhanh" },
  { value: 1.5, label: "Rất nhanh" },
  { value: 2, label: "Ôn nhanh" },
];

export default function WordFlow({ words, onClose }) {
  const categories = [...new Set(words.map((word) => word.category))].sort();
  const availableTypes = [
    ...new Set(words.map((word) => word.partOfSpeech)),
  ].sort();
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [selectedTypes, setSelectedTypes] = useState(availableTypes);
  const [groupSize, setGroupSize] = useState(6);
  const [rate, setRate] = useState(0.9);
  const [phase, setPhase] = useState("setup");
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const activeRow = useRef(null);

  const speechSupported =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const matchingWords = words.filter(
    (word) =>
      selectedCategories.includes(word.category) &&
      selectedTypes.includes(word.partOfSpeech),
  );
  const count = matchingWords.length;
  const size = Number(groupSize);
  const validSettings =
    isPositiveInteger(groupSize) &&
    readingSpeeds.some((speed) => speed.value === Number(rate));
  const groupStart = Math.floor(index / size) * size;
  const groupWords = queue.slice(groupStart, groupStart + size);

  function toggleCategory(category) {
    setSelectedCategories((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );
  }

  function start(event) {
    event.preventDefault();
    if (!validSettings || !count || !speechSupported) return;
    setQueue(shuffle(matchingWords));
    setIndex(0);
    setPaused(false);
    setError("");
    setPhase("playing");
  }

  // Read one word. Only its end event advances to the next word/group.
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    let cancelled = false;
    const speech = window.speechSynthesis;
    speech.cancel();
    const utterance = new window.SpeechSynthesisUtterance(queue[index].word);
    utterance.lang = "en-US";
    utterance.rate = Number(rate);
    utterance.onend = () => {
      if (cancelled) return;
      if (index + 1 === queue.length) setPhase("done");
      else setIndex(index + 1);
    };
    function handleSpeechError() {
      if (cancelled) return;
      setError(
        "Không thể phát âm. Kiểm tra âm thanh/giọng đọc của trình duyệt rồi bấm Tiếp tục để thử lại.",
      );
      setPaused(true);
    }
    utterance.onerror = handleSpeechError;
    try {
      speech.speak(utterance);
    } catch {
      handleSpeechError();
    }
    return () => {
      cancelled = true;
      utterance.onend = null;
      utterance.onerror = null;
      speech.cancel();
    };
  }, [phase, index, paused, queue, rate]);

  useEffect(() => {
    if (phase === "playing")
      activeRow.current?.scrollIntoView({ block: "nearest" });
  }, [phase, index]);

  return (
    <Modal className="word-flow" title="WordFlow" onClose={onClose}>
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Đóng WordFlow"
      >
        ×
      </button>
      <h2>WordFlow</h2>
      {phase === "setup" && (
        <form className="word-flow-setup" onSubmit={start}>
          <div>
            <div className="review-setting-title">
              <b>Chủ đề</b>
              <button
                type="button"
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.length === categories.length
                      ? []
                      : categories,
                  )
                }
              >
                {selectedCategories.length === categories.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
            </div>
            <div className="review-chip-list">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategories.includes(category)}
                  className={
                    selectedCategories.includes(category)
                      ? "review-chip selected"
                      : "review-chip"
                  }
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="review-setting-title">
              <b>Loại từ</b>
              <button
                type="button"
                onClick={() =>
                  setSelectedTypes(
                    selectedTypes.length === availableTypes.length
                      ? []
                      : availableTypes,
                  )
                }
              >
                {selectedTypes.length === availableTypes.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
            </div>
            <div className="review-chip-list">
              {availableTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  aria-pressed={selectedTypes.includes(type)}
                  className={
                    selectedTypes.includes(type)
                      ? "review-chip selected"
                      : "review-chip"
                  }
                  onClick={() =>
                    setSelectedTypes((selected) =>
                      selected.includes(type)
                        ? selected.filter((item) => item !== type)
                        : [...selected, type],
                    )
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <label>
            Số từ mỗi nhóm
            <input
              id="flow-group-size"
              type="number"
              required
              min="1"
              step="1"
              value={groupSize}
              onChange={(event) => setGroupSize(event.target.value)}
            />
          </label>
          <label>
            Tốc độ đọc (mặc định 0.9×)
            <select
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
            >
              {readingSpeeds.map((speed) => (
                <option key={speed.value} value={speed.value}>
                  {speed.value}× — {speed.label}
                </option>
              ))}
            </select>
          </label>
          {!speechSupported && (
            <p role="alert" className="form-error">
              Trình duyệt chưa hỗ trợ phát âm. Hãy dùng trình duyệt có Web
              Speech API.
            </p>
          )}
          {!validSettings && (
            <p role="alert" className="form-error">
              Số từ phải là số nguyên dương. Vui lòng chọn tốc độ đọc có sẵn.
            </p>
          )}
          {!matchingWords.length && (
            <p>Không có từ khớp chủ đề và loại từ đã chọn.</p>
          )}
          {validSettings && (
            <p className="muted">
              {count} từ · {size} từ/nhóm · {Math.ceil(count / size)} nhóm · Chỉ
              đọc tiếng Anh
            </p>
          )}
          <button
            className="primary-button"
            disabled={!validSettings || !count || !speechSupported}
            type="submit"
          >
            Bắt đầu
          </button>
        </form>
      )}

      {phase === "playing" && (
        <>
          <p className="muted">
            Nhóm {Math.floor(index / size) + 1}/{Math.ceil(queue.length / size)}{" "}
            · Từ {index + 1}/{queue.length}
          </p>
          {paused && <p role="status">Đã tạm dừng</p>}
          <ol className="flow-word-list" start={groupStart + 1}>
            {groupWords.map((word, offset) => (
              <li
                key={word.id}
                ref={groupStart + offset === index ? activeRow : null}
                aria-current={
                  groupStart + offset === index ? "true" : undefined
                }
              >
                <strong>{word.word}</strong>
                <span>{word.meaning}</span>
              </li>
            ))}
          </ol>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="review-session-actions">
            <button
              onClick={() => {
                setError("");
                setPaused(!paused);
              }}
            >
              {paused ? "Tiếp tục" : "Tạm dừng"}
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="review-summary">
          <h3>Đã chạy hết danh sách</h3>
          <p>
            Đã đọc {queue.length} từ trong {Math.ceil(queue.length / size)}{" "}
            nhóm.
          </p>
          <button className="primary-button" onClick={onClose}>
            Hoàn tất
          </button>
          <button onClick={() => setPhase("setup")}>Thiết lập lượt mới</button>
        </div>
      )}
    </Modal>
  );
}
