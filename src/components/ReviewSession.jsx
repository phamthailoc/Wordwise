import VocabularyCard from "./VocabularyCard.jsx";

export default function ReviewSession({
  activeCard,
  isFlipped,
  flipNow,
  rateCard,
  togglePause,
  isPaused,
}) {
  return (
    <div className="review-session">
      <VocabularyCard word={activeCard} isFlipped={isFlipped} />
      <div className="review-rating">
        {!isFlipped ? (
          <button onClick={flipNow}>Xem nghĩa</button>
        ) : (
          <button onClick={() => rateCard("known")}>Đã nhớ</button>
        )}
        <button onClick={() => rateCard("again")}>Cần ôn</button>
      </div>
      <div className="review-session-actions">
        <button onClick={togglePause}>
          {isPaused ? "Tiếp tục" : "Tạm dừng"}
        </button>
      </div>
    </div>
  );
}
