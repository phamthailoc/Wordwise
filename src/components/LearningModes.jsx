import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";

export default function LearningModes({
  wordCount,
  onChooseFlashcards,
  onChooseAutoReview,
  onClose,
}) {
  return (
    <Modal
      className="learning-mode-dialog"
      title="Chọn cách học"
      onClose={onClose}
    >
      <button
        className="modal-close"
        aria-label="Đóng lựa chọn cách học"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <div className="eyebrow">HỌC MỖI NGÀY</div>
      <h2 id="learning-mode-title">Bạn muốn học theo cách nào?</h2>
      <p>Chọn một chế độ cho lượt học này.</p>
      <div className="learning-mode-list">
        <button
          className="learning-mode-option"
          disabled={wordCount === 0}
          onClick={onChooseFlashcards}
        >
          <Icon name="book" size={25} />
          <span>
            <b>Flashcards</b>
            <small>Tự lật thẻ và chuyển từ theo nhịp học của bạn.</small>
          </span>
          <Icon name="arrow" size={18} />
        </button>
        {wordCount === 0 && (
          <p className="learning-mode-note">
            Chưa có từ phù hợp để bắt đầu học.
          </p>
        )}
        <button className="learning-mode-option" onClick={onChooseAutoReview}>
          <Icon name="sparkle" size={25} />
          <span>
            <b>Auto Review</b>
            <small>Nghe phát âm và ôn tập bằng thẻ tự lật.</small>
          </span>
          <Icon name="arrow" size={18} />
        </button>

      </div>
    </Modal>
  );
}
