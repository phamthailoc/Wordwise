export function normalizeExamples(data = {}) {
  if (Object.hasOwn(data, "example")) {
    throw new Error('Trường example đã bỏ. Hãy dùng examples: ["Câu ví dụ"].');
  }
  const sentences = data.examples === undefined ? [] : data.examples;
  if (
    !Array.isArray(sentences) ||
    sentences.some((text) => typeof text !== "string")
  ) {
    throw new Error("examples phải là mảng các câu văn bản.");
  }
  return sentences.map((text) => text.trim()).filter(Boolean);
}
