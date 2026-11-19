import { Router } from 'express';
import { listVocabulary, createVocabulary } from '../controllers/vocabularyController.js';

const router = Router();
router.get('/', listVocabulary);
router.post('/', createVocabulary);
export default router;
