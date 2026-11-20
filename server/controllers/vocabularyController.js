import { normalizeExamples } from "../../shared/vocabularyExamples.js";
import * as vocabularyModel from "../models/vocabularyModel.js";
import { prepareImport } from "../../shared/vocabularyImport.js";

export async function importVocabulary(request, response, next) {
  const { words } = request.body || {};
  try {
    prepareImport(words);
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
  try {
    response.json(await vocabularyModel.importMany(words));
  } catch (error) {
    next(error);
  }
}

export async function listVocabulary(request, response, next) {
  const { search = "", category = "All" } = request.query;
  if (typeof search !== "string" || typeof category !== "string") {
    return response
      .status(400)
      .json({ message: "Bộ lọc phải là chuỗi văn bản." });
  }
  try {
    const words = await vocabularyModel.findAll(search, category);
    response.json(words);
  } catch (error) {
    next(error);
  }
}

export function createVocabulary(request, response, next) {
  return saveVocabulary(request, response, next);
}

export function updateVocabulary(request, response, next) {
  if (!/^\d+$/.test(request.params.id)) {
    return response.status(400).json({ message: "Mã từ không hợp lệ." });
  }
  return saveVocabulary(request, response, next, request.params.id);
}

// Add and edit use the same input rules.
async function saveVocabulary(request, response, next, id = null) {
  const {
    word,
    meaning,
    category = "",
    partOfSpeech = "noun",
    relatedWords = {},
  } = request.body || {};
  if (
    ![word, meaning].every((value) => typeof value === "string" && value.trim())
  ) {
    return response
      .status(400)
      .json({ message: "Vui lòng nhập từ và nghĩa tiếng Việt." });
  }
  let examples;
  try {
    examples = normalizeExamples(request.body);
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
  const allowedParts = ["noun", "verb", "adjective", "adverb", "phrase"];
  if (
    word.trim().length > 100 ||
    meaning.trim().length > 255 ||
    (category != null &&
      (typeof category !== "string" || category.trim().length > 60)) ||
    !allowedParts.includes(partOfSpeech)
  ) {
    return response
      .status(400)
      .json({ message: "Từ, nghĩa, chủ đề hoặc loại từ không hợp lệ." });
  }
  if (
    !relatedWords ||
    typeof relatedWords !== "object" ||
    Array.isArray(relatedWords)
  ) {
    return response
      .status(400)
      .json({ message: "Nhóm từ liên quan không hợp lệ." });
  }

  try {
    const cleanWords = (items) =>
      Array.isArray(items)
        ? items
            .filter((item) => typeof item === "string" && item.trim())
            .map((item) => item.trim())
        : [];
    const data = {
      word,
      meaning,
      examples,
      category: category?.trim() || "Chưa phân loại",
      partOfSpeech,
      relatedWords: {
        synonyms: cleanWords(relatedWords?.synonyms),
        antonyms: cleanWords(relatedWords?.antonyms),
      },
    };
    const savedWord = id
      ? await vocabularyModel.update(id, data)
      : await vocabularyModel.create(data);
    if (!savedWord)
      return response.status(404).json({ message: "Không tìm thấy từ." });
    response.status(id ? 200 : 201).json(savedWord);
  } catch (error) {
    if (error.code === "23505")
      return response
        .status(409)
        .json({ message: "Từ này đã có trong bộ sưu tập." });
    next(error);
  }
}

export async function deleteVocabulary(request, response, next) {
  if (!/^\d+$/.test(request.params.id)) {
    return response.status(400).json({ message: "Mã từ không hợp lệ." });
  }
  try {
    const deleted = await vocabularyModel.remove(request.params.id);
    if (!deleted)
      return response.status(404).json({ message: "Không tìm thấy từ." });
    response.json({ message: "Đã xóa từ." });
  } catch (error) {
    next(error);
  }
}
