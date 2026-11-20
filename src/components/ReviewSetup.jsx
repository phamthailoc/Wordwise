import { isValidReviewTime } from "../utils/review.js";

export default function ReviewSetup({
  availableTopics,
  availableParts,
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
        Chọn chủ đề, loại từ và thời gian hiển thị thẻ.
      </p>
      <div className="review-setting-group">
        <div className="review-setting-title">
          <b>Chủ đề</b>
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
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
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
          <b>Loại từ</b>
          <button
            type="button"
            onClick={() =>
              setSelectedParts(
                selectedParts.length === availableParts.length
                  ? []
                  : availableParts,
              )
            }
          >
            {selectedParts.length === availableParts.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
        </div>
        <div className="review-chip-list">
          {availableParts.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={selectedParts.includes(value)}
              className={
                selectedParts.includes(value)
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
          Thời gian trước khi lật thẻ (giây)
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
          Thời gian xem nghĩa (giây)
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
      </div>
      {!validTime && (
        <p className="form-error" role="alert">
          Nhập số giây lớn hơn 0 cho cả hai mặt thẻ (tối đa khoảng 24 ngày).
        </p>
      )}
      {setupError && <div className="form-error">{setupError}</div>}
      {!speechSupported && (
        <p className="speech-note">
          Trình duyệt này chưa hỗ trợ phát âm tự động.
        </p>
      )}
      <button
        className="primary-button form-submit"
        onClick={startSelectedReview}
        disabled={matchingWords.length === 0 || !validTime}
      >
        Bắt đầu ôn <span>{matchingWords.length} từ</span>
      </button>
    </div>
  );
}
