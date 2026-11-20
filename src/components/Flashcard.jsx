import { useState } from "react";
import Modal from "./Modal.jsx";
import VocabularyCard from "./VocabularyCard.jsx";

export default function Flashcard({ words, initialWord, onClose }) {
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      words.findIndex((word) => word.id === initialWord.id),
    ),
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const word = words[index];

  function nextWord() {
    setIndex((current) => (current + 1) % words.length);
    setIsFlipped(false);
  }

  return (
    <Modal className="study-dialog" title="Flashcards" onClose={onClose}>
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Đóng thẻ từ"
      >
        ×
      </button>
      <header className="study-header">
        <h2>Flashcards</h2>
        <span>
          {index + 1}/{words.length}
        </span>
      </header>
      <div className="review-session">
        <VocabularyCard word={word} isFlipped={isFlipped} />
        <div className="review-rating">
          <button onClick={() => setIsFlipped((flipped) => !flipped)}>
            {isFlipped ? "Xem lại từ" : "Xem nghĩa"}
          </button>
          <button onClick={nextWord}>Từ tiếp theo</button>
        </div>
      </div>
    </Modal>
  );
}
