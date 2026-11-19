import { Router } from "express";
import {
  listVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  importVocabulary,
} from "../controllers/vocabularyController.js";

const router = Router();
router.get("/", listVocabulary);
router.post("/", createVocabulary);
router.post("/import", importVocabulary);
router.put("/:id", updateVocabulary);
router.delete("/:id", deleteVocabulary);
export default router;
