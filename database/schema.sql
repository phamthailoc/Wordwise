CREATE TABLE IF NOT EXISTS vocabulary (
  id BIGSERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  meaning VARCHAR(255) NOT NULL,
  example TEXT NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'Everyday',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO vocabulary (word, meaning, example, category) VALUES
  ('serendipity', 'Sự tình cờ may mắn', 'Finding that little bookshop was pure serendipity.', 'Everyday'),
  ('resilient', 'Kiên cường, có khả năng phục hồi', 'She stayed resilient through every challenge.', 'Mindset'),
  ('wanderlust', 'Niềm đam mê du lịch', 'His wanderlust took him across three continents.', 'Travel'),
  ('eloquent', 'Hùng biện, diễn đạt lưu loát', 'She gave an eloquent speech about her hometown.', 'Communication'),
  ('ephemeral', 'Thoáng qua, ngắn ngủi', 'The beauty of the sunset was ephemeral.', 'Everyday'),
  ('meticulous', 'Tỉ mỉ, cẩn thận', 'He is meticulous about keeping his notes organized.', 'Work'),
  ('serene', 'Thanh bình, yên ả', 'We found a serene spot beside the lake.', 'Travel'),
  ('gratitude', 'Lòng biết ơn', 'A small note can express a lot of gratitude.', 'Mindset')
ON CONFLICT (word) DO NOTHING;
