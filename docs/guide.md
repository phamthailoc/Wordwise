# Setup and data guide

[Back to README](../README.md)

## Existing databases

With dependencies installed and `.env` configured, run:

```sh
npm run db:migrate:examples
```

Migration `002_add_vocabulary_examples.sql` creates the child table, copies non-empty sentences from the old `example` column, and removes that column. It runs in a transaction and can be run again safely. Do not rerun migration 001: it is a historical reset of the original sample vocabulary.

For a fresh database, run `database/schema.sql` instead. It creates both tables and inserts 30 sample words. Repeating it does not overwrite existing words.

## Data model

- `vocabulary`: word, Vietnamese meaning, category, part of speech, related words, and creation date.
- `vocabulary_examples`: `id`, `vocabulary_id`, `sentence`, and `position`.
- The foreign key uses `ON DELETE CASCADE`. Each word's example positions are unique.
- API writes update the word and its sentences in one transaction; a failed write rolls back both.
- Categories are text on each word. No separate categories table is used.

## API

| Method | Endpoint                                  | Purpose                                       |
| ------ | ----------------------------------------- | --------------------------------------------- |
| GET    | `/api/health`                             | Check whether the API is running              |
| GET    | `/api/vocabulary?search=...&category=...` | List, search, and filter words                |
| POST   | `/api/vocabulary`                         | Create a word                                 |
| PUT    | `/api/vocabulary/:id`                     | Replace a word and its examples               |
| DELETE | `/api/vocabulary/:id`                     | Delete a word and its examples                |
| POST   | `/api/vocabulary/import`                  | Import a body containing `{ "words": [...] }` |

Create/update requests use `relatedWords: { "synonyms": [], "antonyms": [] }`.
Import items use `synonyms` and `antonyms` directly as shown below.

## JSON import

Choose the vocabulary page, open the add menu, and select list import. Paste a JSON array, preview it, and save the valid words.

```json
[
  {
    "word": "purchase",
    "meaning": "mua",
    "partOfSpeech": "verb",
    "category": "Office",
    "examples": [
      "The company plans to purchase new computers.",
      "You can purchase tickets online."
    ],
    "synonyms": ["buy", "acquire"],
    "antonyms": ["sell"]
  }
]
```

Required: `word`, `meaning`, and `partOfSpeech` (`noun`, `verb`, `adjective`, `adverb`, or `phrase`).
Optional: `category`, `examples`, `synonyms`, and `antonyms`. Missing or blank categories are stored as unclassified. New category names become available in filters after saving a word.

Only `examples` is supported; the old `example` input is rejected. Examples must be an array of strings. Blank sentences are removed and order is preserved. No examples means `[]`.

Each import accepts 1-100 words and a request body up to 1 MB. Duplicates are compared without case sensitivity and skipped. Invalid items are reported and skipped. The server validates again when saving; the result may differ from the preview if the database changed in between.

## Study modes

- **Flashcards:** flip manually and advance manually. No remembered-word rating.
- **Auto Review:** all matching words are shuffled. Default front/back durations are 3/6 seconds. Mark a word as remembered or needing review. Unrated words enter the next round; the next round waits for the learner to start it. Pause preserves remaining time.
- **WordFlow:** all matching words are shuffled. Default group size is 6; any positive whole number is allowed. Available rates are 0.5, 0.75, 0.9, 1, 1.25, 1.5, and 2. Speech `onend` advances the current word; the next group starts immediately. Resume replays the current word. WordFlow does not record remembered words.

The interface is Vietnamese; product and mode names stay in English. Display labels for categories and word types do not change the stored values.

## Read the code

1. `src/App.jsx`: shared data, page navigation, and mode selection.
2. `src/pages/VocabularyPage.jsx`: search, filters, and CRUD dialogs.
3. `src/api/vocabulary.js` -> `server/routes/` -> `server/controllers/` -> `server/models/`: request flow and persistence.
4. `src/components/VocabularyCard.jsx`: shared front/back presentation and rotation, without study scheduling.
5. `src/AutoReview.jsx` and `src/WordFlow.jsx`: timing and speech coordination.
6. `src/utils/review.js`: shuffling, review-time validation, and pronunciation.

Speech uses `SpeechSynthesisUtterance` and `speechSynthesis.speak()`. No audio files are stored in PostgreSQL. In Auto Review, speech and the card timer are independent: flipping cancels the current pronunciation. WordFlow waits for pronunciation to finish instead.

## Verification checklist

- Create a word with three examples; find it and reveal its meaning.
- Reload and reopen edit: all examples remain in order.
- Delete one example, save, and check the two remaining sentences.
- Import multiple examples; verify duplicate skipping and invalid-field errors.
- Delete the word and check that no linked examples remain.
- Try Flashcards flip/back/next; verify stable button positions.
- Try Auto Review pause/resume and a repeat round.
- Try WordFlow pause/resume and completion after the final group.
- Check a 390px viewport, keyboard focus, and the close button.
- Run `npm run build`.
