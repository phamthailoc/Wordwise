# Wordwise

A vocabulary learning app for building and reviewing an English word collection through flashcards, automated review, and continuous listening.

**React + Vite | JavaScript | Node.js + Express | PostgreSQL**

## Features

- **Flashcards:** reveal meanings at your own pace, replay pronunciation, and move between words.
- **Auto Review:** filter by category and word type, set card timing, and repeat words marked for review.
- **WordFlow:** listen to shuffled words in groups with adjustable group size and reading speed. Each word finishes before the next begins.
- **Vocabulary library:** create, edit, delete, search, and filter words; preview JSON imports of up to 100 words and skip duplicates.
- **Word details:** store multiple example sentences, synonyms, and antonyms; view library counts and words remembered during the current session.

## Run locally

Requires **Node.js 18+**, **PostgreSQL**, and the PostgreSQL `createdb`/`psql` commands on PATH.
Run these commands from the repository root:

```sh
npm install
cp .env.example .env
```

Fill in `.env` with your local settings. Keep real credentials out of Git:

```env
PORT=4000
DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:5432/english_learning
CLIENT_ORIGIN=http://localhost:5173
```

For a **new database**, create it and load the schema and 30 sample words:

```sh
createdb -U postgres english_learning
psql -U postgres -d english_learning -f database/schema.sql
npm run dev
```

Use your PostgreSQL username and connection settings for both commands and `DATABASE_URL`.
Open [localhost:5173](http://localhost:5173). The API runs on port 4000.

**Already have the old database?** Keep it, skip schema/seed setup, and run
`npm run db:migrate:examples` before `npm run dev`. This preserves existing words and moves their sentences into the examples table. See the [setup and data guide](docs/guide.md).

## Architecture

```text
React UI -> API requests -> Express Route -> Controller -> Model -> PostgreSQL

src/pages/          Vocabulary management and statistics
src/components/     Forms, dialogs, and the shared VocabularyCard
src/AutoReview.jsx  Timed review and repeat rounds
src/WordFlow.jsx    Sequential speech and group playback
src/api/            HTTP requests
shared/             Input validation shared by client and server
server/             Routes, controllers, models, and database connection
database/          Schema, sample data, and migrations
```

`vocabulary` has many `vocabulary_examples`. Sentences retain their order and are deleted with their word. Saving a word and its examples uses a database transaction.

## Validation

```sh
npm run build
```

Manual checks: create a word with multiple examples, search for it, reveal its meaning, reload, edit its examples, and delete it. Also check Auto Review repeat rounds, WordFlow pause/resume, and the mobile layout. These are manual checks, not an automated test suite.

## Status

Local development; **not deployed yet**. Vocabulary changes persist in PostgreSQL. Remembered-word progress is session-only and resets on reload. Pronunciation uses the browser's Web Speech API; available voices depend on the browser and device.

Development uses `feature/* -> dev -> main`. Release and hosting configuration will be finalized before deployment.

[API, import format, migrations, and code walkthrough](docs/guide.md)
