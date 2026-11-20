CREATE TABLE IF NOT EXISTS vocabulary (
  id BIGSERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  meaning VARCHAR(255) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'Office',
  part_of_speech VARCHAR(30) NOT NULL DEFAULT 'noun',
  related_words JSONB NOT NULL DEFAULT '{"synonyms": [], "antonyms": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vocabulary
  ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(30) NOT NULL DEFAULT 'noun',
  ADD COLUMN IF NOT EXISTS related_words JSONB NOT NULL DEFAULT '{"synonyms": [], "antonyms": []}'::jsonb;

CREATE TABLE IF NOT EXISTS vocabulary_examples (
  id BIGSERIAL PRIMARY KEY,
  vocabulary_id BIGINT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL CHECK (btrim(sentence) <> ''),
  position INTEGER NOT NULL CHECK (position > 0),
  UNIQUE (vocabulary_id, position)
);

WITH seed (word, meaning, sentence, category, part_of_speech, related_words) AS (
  VALUES
  ('agenda', 'Chương trình nghị sự', 'Please review the agenda before the staff meeting.', 'Meetings', 'noun', '{"synonyms": ["schedule", "plan"], "antonyms": []}'),
  ('colleague', 'Đồng nghiệp', 'A colleague will help you prepare the client presentation.', 'Office', 'noun', '{"synonyms": ["coworker", "workmate"], "antonyms": []}'),
  ('confirm', 'Xác nhận', 'Please confirm your attendance by Thursday.', 'Office', 'verb', '{"synonyms": ["verify", "validate"], "antonyms": ["cancel"]}'),
  ('deadline', 'Hạn chót', 'The team completed the report before the deadline.', 'Office', 'noun', '{"synonyms": ["due date", "cutoff"], "antonyms": []}'),
  ('attend', 'Tham dự', 'All department managers will attend the training session.', 'Meetings', 'verb', '{"synonyms": ["participate in", "be present at"], "antonyms": ["miss"]}'),
  ('postpone', 'Hoãn lại', 'The meeting was postponed until Friday afternoon.', 'Meetings', 'verb', '{"synonyms": ["put off", "delay"], "antonyms": ["advance"]}'),
  ('available', 'Có sẵn; rảnh', 'Ms. Lee is available for an interview after lunch.', 'Office', 'adjective', '{"synonyms": ["free"], "antonyms": ["unavailable"]}'),
  ('vacant', 'Còn trống', 'The vacant conference room can hold twenty people.', 'Office', 'adjective', '{"synonyms": ["unoccupied", "empty"], "antonyms": ["occupied"]}'),
  ('itinerary', 'Lịch trình chuyến đi', 'The travel agency sent the final itinerary this morning.', 'Travel', 'noun', '{"synonyms": ["travel plan", "schedule"], "antonyms": []}'),
  ('depart', 'Khởi hành', 'The shuttle will depart from the hotel at seven.', 'Travel', 'verb', '{"synonyms": ["leave", "set off"], "antonyms": ["arrive"]}'),
  ('reservation', 'Sự đặt chỗ', 'I made a reservation at a restaurant near the airport.', 'Travel', 'noun', '{"synonyms": ["booking"], "antonyms": []}'),
  ('luggage', 'Hành lý', 'Passengers should label their luggage before boarding.', 'Travel', 'noun', '{"synonyms": ["baggage", "suitcase"], "antonyms": []}'),
  ('purchase', 'Mua; sự mua hàng', 'Employees can purchase office supplies through the company portal.', 'Purchasing', 'verb', '{"synonyms": ["buy", "acquire"], "antonyms": ["sell"]}'),
  ('discount', 'Khoản giảm giá', 'Bulk orders qualify for a ten percent discount.', 'Purchasing', 'noun', '{"synonyms": ["price reduction", "markdown"], "antonyms": ["surcharge"]}'),
  ('invoice', 'Hóa đơn thanh toán', 'The supplier emailed the invoice to the accounting department.', 'Purchasing', 'noun', '{"synonyms": ["bill", "statement"], "antonyms": []}'),
  ('refund', 'Khoản hoàn tiền', 'Customers may request a refund within thirty days.', 'Purchasing', 'noun', '{"synonyms": ["reimbursement", "repayment"], "antonyms": []}'),
  ('shipment', 'Lô hàng; việc vận chuyển', 'The shipment is expected to arrive at the warehouse tomorrow.', 'Purchasing', 'noun', '{"synonyms": ["delivery", "consignment"], "antonyms": []}'),
  ('supplier', 'Nhà cung cấp', 'The supplier offered a lower price for larger orders.', 'Purchasing', 'noun', '{"synonyms": ["vendor", "provider"], "antonyms": []}'),
  ('budget', 'Ngân sách', 'The marketing team must stay within its annual budget.', 'Finance', 'noun', '{"synonyms": ["funds", "allowance"], "antonyms": []}'),
  ('expense', 'Chi phí', 'Please submit your travel expenses by the end of the month.', 'Finance', 'noun', '{"synonyms": ["cost", "expenditure"], "antonyms": []}'),
  ('revenue', 'Doanh thu', 'Online sales contributed to the company’s increased revenue.', 'Finance', 'noun', '{"synonyms": ["income", "earnings"], "antonyms": []}'),
  ('increase', 'Tăng; sự gia tăng', 'The company plans to increase production next quarter.', 'Finance', 'verb', '{"synonyms": ["rise", "grow"], "antonyms": ["decrease", "decline"]}'),
  ('decrease', 'Giảm; sự suy giảm', 'A new supplier helped decrease shipping costs.', 'Finance', 'verb', '{"synonyms": ["decline", "reduce"], "antonyms": ["increase", "rise"]}'),
  ('recruit', 'Tuyển dụng', 'The firm hopes to recruit two software developers this year.', 'Human Resources', 'verb', '{"synonyms": ["hire", "employ"], "antonyms": ["dismiss"]}'),
  ('applicant', 'Ứng viên', 'Each applicant must complete an online assessment.', 'Human Resources', 'noun', '{"synonyms": ["candidate", "job seeker"], "antonyms": []}'),
  ('employee', 'Nhân viên', 'Every new employee receives an orientation schedule.', 'Human Resources', 'noun', '{"synonyms": ["staff member", "worker"], "antonyms": []}'),
  ('promotion', 'Sự thăng chức', 'Her promotion to regional manager was announced on Monday.', 'Human Resources', 'noun', '{"synonyms": ["advancement", "raise in rank"], "antonyms": ["demotion"]}'),
  ('qualify', 'Đủ điều kiện', 'Applicants must qualify for the position before applying.', 'Human Resources', 'verb', '{"synonyms": ["be eligible", "meet the requirements"], "antonyms": ["disqualify"]}'),
  ('renew', 'Gia hạn; làm mới', 'The company decided to renew its lease for another year.', 'Office', 'verb', '{"synonyms": ["extend", "revalidate"], "antonyms": ["cancel"]}'),
  ('efficient', 'Hiệu quả', 'The new filing system makes document searches more efficient.', 'Office', 'adjective', '{"synonyms": ["effective", "productive"], "antonyms": ["inefficient"]}')
), inserted AS (
  INSERT INTO vocabulary (word, meaning, category, part_of_speech, related_words)
  SELECT word, meaning, category, part_of_speech, related_words::jsonb FROM seed
  ON CONFLICT (word) DO NOTHING
  RETURNING id, word
)
INSERT INTO vocabulary_examples (vocabulary_id, sentence, position)
SELECT inserted.id, seed.sentence, 1 FROM inserted JOIN seed USING (word);
