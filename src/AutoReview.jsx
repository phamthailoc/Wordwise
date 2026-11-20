import Modal from "./components/Modal.jsx";
import ReviewSetup from "./components/ReviewSetup.jsx";
import ReviewSession from "./components/ReviewSession.jsx";
import ReviewSummary from "./components/ReviewSummary.jsx";
import { shuffle, speakWord, isValidReviewTime } from "./utils/review.js";
import { useEffect, useMemo, useRef, useState } from "react";

function AutoReview({ words, onClose, onMarkKnown }) {
  const availableTopics = useMemo(
    () => [...new Set(words.map((word) => word.category))].sort(),
    [words],
  );
  const availableParts = useMemo(
    () => [...new Set(words.map((word) => word.partOfSpeech))].sort(),
    [words],
  );
  const [phase, setPhase] = useState("setup");
  const [selectedTopics, setSelectedTopics] = useState(availableTopics);
  const [selectedParts, setSelectedParts] = useState(availableParts);
  const [frontSeconds, setFrontSeconds] = useState(3);
  const [backSeconds, setBackSeconds] = useState(6);
  const [queue, setQueue] = useState([]);
  const [pendingCards, setPendingCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [ratings, setRatings] = useState({});
  const [summary, setSummary] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [setupError, setSetupError] = useState("");
  const remainingTime = useRef(null);
  const timerStartedAt = useRef(null);
  const activeCard = queue[index];
  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const matchingWords = useMemo(
    () =>
      words.filter(
        (word) =>
          selectedTopics.includes(word.category) &&
          selectedParts.includes(word.partOfSpeech),
      ),
    [words, selectedTopics, selectedParts],
  );

  function toggleTopic(topic) {
    setSelectedTopics((selected) =>
      selected.includes(topic)
        ? selected.filter((item) => item !== topic)
        : [...selected, topic],
    );
  }

  function togglePart(part) {
    setSelectedParts((selected) =>
      selected.includes(part)
        ? selected.filter((item) => item !== part)
        : [...selected, part],
    );
  }

  function startRound(cards, nextRound = 1) {
    if (!cards.length) {
      setSetupError("Không có từ phù hợp. Hãy chọn chủ đề hoặc loại từ khác.");
      return;
    }
    setQueue(shuffle(cards));
    setPendingCards([]);
    setIndex(0);
    setRound(nextRound);
    setRatings({});
    setSummary(null);
    setIsFlipped(false);
    setIsPaused(false);
    setSetupError("");
    remainingTime.current = null;
    setPhase("review");
  }

  function startSelectedReview() {
    if (!isValidReviewTime(frontSeconds) || !isValidReviewTime(backSeconds)) {
      setSetupError(
        "Thời gian phải là số giây lớn hơn 0 và không quá 24 ngày.",
      );
      return;
    }
    startRound(matchingWords);
  }

  function completeRound(nextRatings) {
    const again = queue.filter((card) => nextRatings[card.id] !== "known");
    setPendingCards(again);
    setSummary({
      round,
      studied: queue.length,
      known: queue.length - again.length,
      needsReview: again.length,
    });
    setPhase("summary");
  }

  function rateCard(rating) {
    if (!activeCard) return;
    if (rating === "known") onMarkKnown?.(activeCard.id);
    const nextRatings = { ...ratings, [activeCard.id]: rating };
    setRatings(nextRatings);
    remainingTime.current = null;
    timerStartedAt.current = null;
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setIsFlipped(false);
    } else {
      completeRound(nextRatings);
    }
  }

  const rateCardRef = useRef(rateCard);
  rateCardRef.current = rateCard;

  // Preserve the remaining time on pause. New cards always get a full duration.
  useEffect(() => {
    if (phase !== "review" || isPaused || !activeCard) return undefined;

    const isShowingWord = !isFlipped;
    const duration = Number(isShowingWord ? frontSeconds : backSeconds) * 1000;
    const wait = remainingTime.current ?? duration;
    remainingTime.current = null;
    timerStartedAt.current = Date.now();
    const timer = setTimeout(() => {
      timerStartedAt.current = null;
      remainingTime.current = null;
      if (isShowingWord) setIsFlipped(true);
      else rateCardRef.current("again");
    }, wait);

    return () => {
      clearTimeout(timer);
      if (timerStartedAt.current !== null) {
        remainingTime.current = Math.max(
          0,
          wait - (Date.now() - timerStartedAt.current),
        );
        timerStartedAt.current = null;
      }
    };
  }, [phase, isPaused, activeCard?.id, isFlipped, frontSeconds, backSeconds]);

  useEffect(() => {
    if (phase !== "review" || isPaused || isFlipped || !activeCard)
      return undefined;
    speakWord(activeCard.word);
    return () => window.speechSynthesis?.cancel();
  }, [phase, isPaused, isFlipped, activeCard?.id]);

  function flipNow() {
    if (!isFlipped) {
      remainingTime.current = null;
      timerStartedAt.current = null;
      setIsFlipped(true);
    }
  }

  function togglePause() {
    setIsPaused((paused) => !paused);
    if (!isPaused) window.speechSynthesis?.cancel();
  }

  function stopReview() {
    window.speechSynthesis?.cancel();
    remainingTime.current = null;
    onClose();
  }

  function continueWithReviewCards() {
    startRound(pendingCards, round + 1);
  }

  const title =
    phase === "setup"
      ? "Thiết lập Auto Review"
      : phase === "review"
        ? "Auto Review"
        : "Hoàn thành lượt ôn";

  return (
    <Modal
      className={`auto-review-dialog ${phase === "review" ? "study-dialog" : ""}`}
      title={title}
      onClose={stopReview}
    >
      <button
        className="modal-close"
        onClick={stopReview}
        aria-label="Đóng ôn tự động"
      >
        ×
      </button>
      {phase === "review" ? (
        <header className="study-header">
          <h2>{title}</h2>
          <span>
            Lượt {round} · {index + 1}/{queue.length}
          </span>
        </header>
      ) : (
        <h2>{title}</h2>
      )}

      {phase === "setup" && (
        <ReviewSetup
          availableTopics={availableTopics}
          availableParts={availableParts}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          selectedParts={selectedParts}
          setSelectedParts={setSelectedParts}
          toggleTopic={toggleTopic}
          togglePart={togglePart}
          frontSeconds={frontSeconds}
          setFrontSeconds={setFrontSeconds}
          backSeconds={backSeconds}
          setBackSeconds={setBackSeconds}
          setupError={setupError}
          speechSupported={speechSupported}
          startSelectedReview={startSelectedReview}
          matchingWords={matchingWords}
        />
      )}

      {phase === "review" && activeCard && (
        <ReviewSession
          activeCard={activeCard}
          isFlipped={isFlipped}
          flipNow={flipNow}
          rateCard={rateCard}
          togglePause={togglePause}
          isPaused={isPaused}
        />
      )}

      {phase === "summary" && summary && (
        <ReviewSummary
          summary={summary}
          round={round}
          continueWithReviewCards={continueWithReviewCards}
          stopReview={stopReview}
        />
      )}
    </Modal>
  );
}

export default AutoReview;
