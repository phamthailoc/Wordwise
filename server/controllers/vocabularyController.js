import * as vocabularyModel from '../models/vocabularyModel.js';

export async function listVocabulary(request, response, next) {
  try {
    const words = await vocabularyModel.findAll(request.query.search || '', request.query.category || 'All');
    response.json(words);
  } catch (error) {
    next(error);
  }
}

export async function createVocabulary(request, response, next) {
  const { word, meaning, example, category } = request.body;
  if (![word, meaning, example].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ message: 'Vui lòng nhập từ, nghĩa và câu ví dụ.' });
  }

  try {
    const newWord = await vocabularyModel.create({ word, meaning, example, category });
    response.status(201).json(newWord);
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'Từ này đã có trong bộ sưu tập.' });
    next(error);
  }
}
