import { partOfSpeechOptions } from "../constants/vocabulary.js";
import { isValidReviewTime } from "../utils/review.js";

export default function ReviewSetup({
  availableTopics,
  selectedTopics,
  setSelectedTopics,
  selectedParts,
  setSelectedParts,
  toggleTopic,
  togglePart,
  frontSeconds,
  setFrontSeconds,
  backSeconds,
  setBackSeconds,
  cardLimit,
  setCardLimit,
  setupError,
  speechSupported,
  startSelectedReview,
  matchingWords,
}) {
  const validTime =
    isValidReviewTime(frontSeconds) && isValidReviewTime(backSeconds);
  return (
    <div className="review-setup">
      <p className="review-lead">
        Choose categories and word types, then set the card timing.
      </p>
      <div className="review-setting-group">
        <div className="review-setting-title">
          <b>Categories</b>
          <button
            type="button"
            onClick={() =>
              setSelectedTopics(
                selectedTopics.length === availableTopics.length
                  ? []
                  : availableTopics,
              )
            }
          >
            {selectedTopics.length === availableTopics.length
              ? "Clear all"
              : "Select all"}
          </button>
        </div>
        <div className="review-chip-list">
          {availableTopics.map((topic) => (
            <button
              type="button"
              key={topic}
              aria-pressed={selectedTopics.includes(topic)}
              className={
                selectedTopics.includes(topic)
                  ? "review-chip selected"
                  : "review-chip"
              }
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <div className="review-setting-group">
        <div className="review-setting-title">
          <b>Word types</b>
          <button type="button" onClick={() => setSelectedParts(["all"])}>
            All types
          </button>
        </div>
        <div className="review-chip-list">
          {partOfSpeechOptions.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={
                selectedParts.includes("all") || selectedParts.includes(value)
              }
              className={
                selectedParts.includes("all") || selectedParts.includes(value)
                  ? "review-chip selected"
                  : "review-chip"
              }
              onClick={() => togglePart(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="review-options-grid">
        <label>
          Show word before flipping (seconds)
          <input
            type="number"
            min="0"
            step="any"
            required
            aria-invalid={!isValidReviewTime(frontSeconds)}
            value={frontSeconds}
            onChange={(event) => setFrontSeconds(event.target.value)}
          />
        </label>
        <label>
          Review answer before next (seconds)
          <input
            type="number"
            min="0"
            step="any"
            required
            aria-invalid={!isValidReviewTime(backSeconds)}
            value={backSeconds}
            onChange={(event) => setBackSeconds(event.target.value)}
          />
        </label>
        <label className="review-count-select">
          Cards in the first round
          <select
            value={cardLimit}
            onChange={(event) => setCardLimit(event.target.value)}
          >
            <option value="all">All matching words</option>
            <option value="10">10 words</option>
            <option value="20">20 words</option>
          </select>
        </label>
      </div>
      <p className="muted">
        Nhập số giây tùy chọn, ví dụ 2.5, 30 hoặc 120. Thời gian bắt đầu khi mặt
        thẻ xuất hiện.
      </p>
      {!validTime && (
        <p className="form-error" role="alert">
          Nhập số giây lớn hơn 0 cho cả hai mặt thẻ (tối đa khoảng 24 ngày).
        </p>
      )}
      {setupError && <div className="form-error">{setupError}</div>}
      {!speechSupported && (
        <p className="speech-note">
          This browser does not support automatic pronunciation.
        </p>
      )}
      <button
        className="primary-button form-submit"
        onClick={startSelectedReview}
        disabled={matchingWords.length === 0 || !validTime}
      >
        Start review{" "}
        <span>
          {cardLimit === "all"
            ? matchingWords.length
            : Math.min(matchingWords.length, Number(cardLimit))}{" "}
          words
        </span>
      </button>
    </div>
  );
}
