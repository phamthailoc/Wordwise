export default function ReviewSummary({
  summary,
  round,
  continueWithReviewCards,
  stopReview,
}) {
  return (
    <div className="review-summary">
      <div className="summary-badge">LƯỢT {summary.round}</div>
      <div className="summary-count">
        {summary.studied}
        <span> từ đã ôn</span>
      </div>
      <div className="summary-stats">
        <div>
          <b>{summary.known}</b>
          <span>Đã nhớ</span>
        </div>
        <div>
          <b>{summary.needsReview}</b>
          <span>Cần ôn</span>
        </div>
      </div>
      {summary.needsReview > 0 ? (
        <>
          <p>{summary.needsReview} từ đã sẵn sàng cho lượt ôn tiếp theo.</p>
          <button
            className="primary-button form-submit"
            onClick={continueWithReviewCards}
          >
            Ôn tiếp các từ chưa nhớ <span>Lượt {round + 1}</span>
          </button>
        </>
      ) : (
        <>
          <p>Bạn đã đánh dấu nhớ tất cả các từ trong lượt này.</p>
          <button className="primary-button form-submit" onClick={stopReview}>
            Hoàn tất
          </button>
        </>
      )}
      <button className="secondary-review-action" onClick={stopReview}>
        Về trang học tập
      </button>
    </div>
  );
}
