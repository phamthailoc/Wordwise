import { categoryLabel, partOfSpeechLabels } from "../constants/vocabulary.js";
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
        <span>LƯỢT {round}</span>
        <span>
          {index + 1} / {queue.length}
        </span>
      </div>
      {isPaused && (
        <p className="review-paused" role="status">
          Đã tạm dừng
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
          <span>{categoryLabel(activeCard.category)}</span>
          <span>{partOfSpeechLabels[activeCard.partOfSpeech]}</span>
        </div>
        {!isFlipped ? (
          <>
            <div className="review-word">{activeCard.word}</div>
            <button
              className="speak-again"
              onClick={() => speakWord(activeCard.word)}
              disabled={!speechSupported}
            >
              🔊 Nghe phát âm
            </button>
            <p className="review-hint">
              Nghe và thử nhớ nghĩa trước khi thẻ tự lật.
            </p>
            <button className="flip-button" onClick={flipNow}>
              Xem nghĩa <span>↗</span>
            </button>
          </>
        ) : (
          <>
            <div className="review-meaning">{activeCard.meaning}</div>
            <RelatedWords relatedWords={activeCard.relatedWords} />
            <ExampleSentences examples={activeCard.examples} className="review-example" />
            <div className="review-rating">
              <button onClick={() => rateCard("known")}>✓ Đã nhớ</button>
              <button onClick={() => rateCard("again")}>↻ Cần ôn</button>
            </div>
            <p className="review-hint">
              Chưa chọn? Từ này sẽ được đưa vào lượt ôn tiếp theo.
            </p>
          </>
        )}
      </div>
      <div className="review-session-actions">
        <button onClick={togglePause}>{isPaused ? "Tiếp tục" : "Tạm dừng"}</button>
        <button onClick={stopReview}>Kết thúc</button>
      </div>
    </div>
  );
}
