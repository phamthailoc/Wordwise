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
    <Modal className="flashcard" title="Vocabulary flashcard" onClose={onClose}>
      <header className="flashcard-header">
        <div className="flash-top">
          <span>YOUR FLASHCARD</span>
          <span>
            {index + 1} / {words.length}
          </span>
        </div>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close flashcard"
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="flash-ornament" aria-hidden="true">
        ✳
      </div>
      <div className="flash-category">
        {word.category} · {word.partOfSpeech}
      </div>
      {!isFlipped ? (
        <>
          <h2>{word.word}</h2>
          <p className="flash-pronunciation">
            Recall the meaning, then reveal the answer.
          </p>
          <button className="flip-button" onClick={() => setIsFlipped(true)}>
            Reveal meaning ↗
          </button>
        </>
      ) : (
        <>
          <h2 className="flash-meaning">{word.meaning}</h2>
          <RelatedWords relatedWords={word.relatedWords} />
          {word.example && (
            <div className="example-box">
              <span>IN A SENTENCE</span>
              <p>“{word.example}”</p>
            </div>
          )}
          <button className="flip-button" onClick={() => setIsFlipped(false)}>
            Show the word again ↗
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
          <Icon name="check" size={17} /> I know this
        </button>
        <button onClick={nextWord}>
          Next word <Icon name="arrow" size={17} />
        </button>
      </div>
    </Modal>
  );
}
