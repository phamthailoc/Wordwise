BEGIN;

CREATE TABLE IF NOT EXISTS vocabulary_examples (
  id BIGSERIAL PRIMARY KEY,
  vocabulary_id BIGINT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL CHECK (btrim(sentence) <> ''),
  position INTEGER NOT NULL CHECK (position > 0),
  UNIQUE (vocabulary_id, position)
);

-- Copy old sentences before removing the old column. Safe to run again.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vocabulary' AND column_name = 'example'
  ) THEN
    INSERT INTO vocabulary_examples (vocabulary_id, sentence, position)
    SELECT id, btrim(example), 1 FROM vocabulary WHERE btrim(example) <> ''
    ON CONFLICT (vocabulary_id, position) DO NOTHING;
    ALTER TABLE vocabulary DROP COLUMN example;
  END IF;
END $$;

COMMIT;
