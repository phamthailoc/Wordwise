import RelatedWords from "./RelatedWords.jsx";
import ExampleSentences from "./ExampleSentences.jsx";
import { speakWord } from "../utils/review.js";

// Shared presentation; each study mode controls when to flip or move on.
export default function VocabularyCard({ word, isFlipped }) {
  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  return (
    <div className="review-flip-stage">
      {/* Each new word starts at the front without rotating back first. */}
      <div
        key={word.id}
        className={`review-flip-inner ${isFlipped ? "is-flipped" : ""}`}
      >
        {[false, true].map((isBack) => (
          <div
            key={isBack ? "back" : "front"}
            className={`review-card-face ${isBack ? "answer-face" : "review-front"}`}
            aria-hidden={isBack !== isFlipped}
            inert={isBack !== isFlipped ? "" : undefined}
          >
            <div className="review-word-heading">
              <div className="review-word">{word.word}</div>
              <button
                className="speak-again"
                onClick={() => speakWord(word.word)}
                disabled={!speechSupported}
                aria-label="Nghe phát âm"
                title="Nghe phát âm"
              >
                🔊
              </button>
            </div>
            <div className="review-word-type">{word.partOfSpeech}</div>
            {isBack && (
              <>
                <div className="review-meaning">{word.meaning}</div>
                <RelatedWords relatedWords={word.relatedWords} />
                <ExampleSentences
                  examples={word.examples}
                  className="review-example"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
