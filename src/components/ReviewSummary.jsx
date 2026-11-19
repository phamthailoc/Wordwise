export default function ReviewSummary({
  summary,
  round,
  continueWithReviewCards,
  stopReview,
}) {
  return (
    <div className="review-summary">
      <div className="summary-badge">ROUND {summary.round}</div>
      <div className="summary-count">
        {summary.studied}
        <span> words reviewed</span>
      </div>
      <div className="summary-stats">
        <div>
          <b>{summary.known}</b>
          <span>Known</span>
        </div>
        <div>
          <b>{summary.needsReview}</b>
          <span>Need review</span>
        </div>
      </div>
      {summary.needsReview > 0 ? (
        <>
          <p>{summary.needsReview} words are ready for your next round.</p>
          <button
            className="primary-button form-submit"
            onClick={continueWithReviewCards}
          >
            Continue with words to review <span>Round {round + 1}</span>
          </button>
        </>
      ) : (
        <>
          <p>Great work — every selected word is marked as known.</p>
          <button className="primary-button form-submit" onClick={stopReview}>
            Finish session
          </button>
        </>
      )}
      <button className="secondary-review-action" onClick={stopReview}>
        Back to vocabulary
      </button>
    </div>
  );
}
