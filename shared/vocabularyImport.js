// Used by both preview and server validation so they follow the same rules.
export const MAX_IMPORT_WORDS = 100;
const wordTypes = ["noun", "verb", "adjective", "adverb", "phrase"];

export function prepareImport(words, existingWords = []) {
  if (
    !Array.isArray(words) ||
    words.length === 0 ||
    words.length > MAX_IMPORT_WORDS
  ) {
    throw new Error(
      `Danh sách phải là mảng JSON có từ 1 đến ${MAX_IMPORT_WORDS} từ.`,
    );
  }

  const seen = new Set(existingWords.map((word) => word.trim().toLowerCase()));
  return words.map((item, index) => {
    const row = {
      number: index + 1,
      word: typeof item?.word === "string" ? item.word.trim() : "",
      status: "error",
      message: "",
    };
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...row, message: "Mỗi phần tử phải là một đối tượng JSON." };
    }
    if (
      item.category != null &&
      (typeof item.category !== "string" || item.category.trim().length > 60)
    ) {
      return {
        ...row,
        message: "category phải là chuỗi tối đa 60 ký tự, hoặc bỏ trống.",
      };
    }
    const category = item.category?.trim() || "Chưa phân loại";
    if (!row.word || row.word.length > 100)
      return { ...row, message: "word cần từ 1 đến 100 ký tự." };
    if (
      typeof item.meaning !== "string" ||
      !item.meaning.trim() ||
      item.meaning.trim().length > 255
    ) {
      return { ...row, message: "meaning cần từ 1 đến 255 ký tự." };
    }
    if (!wordTypes.includes(item.partOfSpeech))
      return {
        ...row,
        message:
          "partOfSpeech phải là noun, verb, adjective, adverb hoặc phrase.",
      };
    if (item.example !== undefined && typeof item.example !== "string")
      return { ...row, message: "example phải là chuỗi văn bản." };
    for (const field of ["synonyms", "antonyms"]) {
      if (
        item[field] !== undefined &&
        (!Array.isArray(item[field]) ||
          item[field].some((value) => typeof value !== "string"))
      ) {
        return { ...row, message: `${field} phải là mảng các chuỗi văn bản.` };
      }
    }
    const key = row.word.toLowerCase();
    if (seen.has(key))
      return {
        ...row,
        status: "duplicate",
        message: "Trùng từ đã có hoặc trùng trong danh sách.",
      };
    seen.add(key);
    return {
      ...row,
      status: "ready",
      message: "Sẵn sàng thêm",
      data: {
        word: row.word,
        meaning: item.meaning.trim(),
        partOfSpeech: item.partOfSpeech,
        category,
        example: (item.example || "").trim(),
        relatedWords: {
          synonyms: (item.synonyms || [])
            .map((word) => word.trim())
            .filter(Boolean),
          antonyms: (item.antonyms || [])
            .map((word) => word.trim())
            .filter(Boolean),
        },
      },
    };
  });
}
