export function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

// setTimeout accepts at most 2,147,483,647 milliseconds (about 24 days).
export function isValidReviewTime(value) {
  const seconds = Number(value);
  return (
    Number.isFinite(seconds) && seconds > 0 && seconds * 1000 <= 2147483647
  );
}

export function speakWord(word) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}
