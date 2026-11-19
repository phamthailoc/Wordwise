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
      title="Choose a learning mode"
      onClose={onClose}
    >
      <button
        className="modal-close"
        aria-label="Close learning modes"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <div className="eyebrow">YOUR DAILY PRACTICE</div>
      <h2 id="learning-mode-title">How would you like to learn?</h2>
      <p>Choose a study mode for this session.</p>
      <div className="learning-mode-list">
        <button
          className="learning-mode-option"
          disabled={wordCount === 0}
          onClick={onChooseFlashcards}
        >
          <Icon name="book" size={25} />
          <span>
            <b>Flashcards</b>
            <small>Flip cards and move between words at your own pace.</small>
          </span>
          <Icon name="arrow" size={18} />
        </button>
        {wordCount === 0 && (
          <p className="learning-mode-note">
            No words match your library filters. Clear them to use Flashcards.
          </p>
        )}
        <button className="learning-mode-option" onClick={onChooseAutoReview}>
          <Icon name="sparkle" size={25} />
          <span>
            <b>Auto Review</b>
            <small>
              Choose topics, listen to words, and review with automatic card
              flips.
            </small>
          </span>
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </Modal>
  );
}
