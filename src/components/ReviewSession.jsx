import ExampleSentences from "./ExampleSentences.jsx";
import RelatedWords from "./RelatedWords.jsx";
import { speakWord } from "../utils/review.js";

export default function ReviewSession({
  activeCard,
  round,
  index,
  queue,
  isFlipped,
  speechSupported,
  flipNow,
  rateCard,
  togglePause,
  isPaused,
  stopReview,
}) {
  return (
    <div className="review-session">
      <div className="review-session-meta">
        <span>ROUND {round}</span>
        <span>
          {index + 1} / {queue.length}
        </span>
      </div>
      {isPaused && (
        <p className="review-paused" role="status">
          Paused — the timer is stopped.
        </p>
      )}
      <div className="review-progress">
        <div
          style={{
            width: `${((index + (isFlipped ? 0.5 : 0)) / queue.length) * 100}%`,
          }}
        />
      </div>
      <div className={`review-card-face ${isFlipped ? "answer-face" : ""}`}>
        <div className="review-card-tags">
          <span>{activeCard.category}</span>
          <span>{activeCard.partOfSpeech}</span>
        </div>
        {!isFlipped ? (
          <>
            <div className="review-word">{activeCard.word}</div>
            <button
              className="speak-again"
              onClick={() => speakWord(activeCard.word)}
              disabled={!speechSupported}
            >
              🔊 Play pronunciation
            </button>
            <p className="review-hint">
              Listen, recall the meaning, then let the card flip.
            </p>
            <button className="flip-button" onClick={flipNow}>
              Flip now <span>↗</span>
            </button>
          </>
        ) : (
          <>
            <div className="review-meaning">{activeCard.meaning}</div>
            <RelatedWords relatedWords={activeCard.relatedWords} />
            <ExampleSentences examples={activeCard.examples} className="review-example" />
            <div className="review-rating">
              <button onClick={() => rateCard("known")}>✓ I knew it</button>
              <button onClick={() => rateCard("again")}>↻ Review again</button>
            </div>
            <p className="review-hint">
              No choice? This word will be included in the next round.
            </p>
          </>
        )}
      </div>
      <div className="review-session-actions">
        <button onClick={togglePause}>{isPaused ? "Continue" : "Pause"}</button>
        <button onClick={stopReview}>End review</button>
      </div>
    </div>
  );
}
