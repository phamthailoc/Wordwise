import { categoryLabel, partOfSpeechLabels } from "../constants/vocabulary.js";
import ExampleSentences from "./ExampleSentences.jsx";
import { useState } from "react";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import RelatedWords from "./RelatedWords.jsx";

export default function Flashcard({
  words,
  initialWord,
  onClose,
  onMarkKnown,
}) {
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
    <Modal className="flashcard" title="Flashcards" onClose={onClose}>
      <header className="flashcard-header">
        <div className="flash-top">
          <span>FLASHCARDS</span>
          <span>
            {index + 1} / {words.length}
          </span>
        </div>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Đóng thẻ từ"
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="flash-ornament" aria-hidden="true">
        ✳
      </div>
      <div className="flash-category">
        {categoryLabel(word.category)} · {partOfSpeechLabels[word.partOfSpeech]}
      </div>
      {!isFlipped ? (
        <>
          <h2>{word.word}</h2>
          <p className="flash-pronunciation">
            Thử nhớ nghĩa trước khi xem đáp án.
          </p>
          <button className="flip-button" onClick={() => setIsFlipped(true)}>
            Xem nghĩa ↗
          </button>
        </>
      ) : (
        <>
          <h2 className="flash-meaning">{word.meaning}</h2>
          <RelatedWords relatedWords={word.relatedWords} />
          <ExampleSentences examples={word.examples} className="example-box" />
          <button className="flip-button" onClick={() => setIsFlipped(false)}>
            Xem lại từ ↗
          </button>
        </>
      )}
      <div className="flash-actions">
        <button
          onClick={() => {
            onMarkKnown(word.id);
            nextWord();
          }}
        >
          <Icon name="check" size={17} /> Đã nhớ
        </button>
        <button onClick={nextWord}>
          Từ tiếp theo <Icon name="arrow" size={17} />
        </button>
      </div>
    </Modal>
  );
}
