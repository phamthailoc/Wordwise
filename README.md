# Wordwise — English Learning Web App

Ứng dụng học từ vựng TOEIC bằng React, Vite, Express và PostgreSQL, gồm ba trang:

- **Học tập:** Start learning → Flashcards hoặc Auto Review.
- **Từ vựng:** thêm, xem, sửa, xóa; tìm theo từ/nghĩa; lọc chủ đề và loại từ.
- **Nhập danh sách:** dán JSON có category riêng cho từng từ, xem trước rồi lưu tối đa 100 từ mỗi lượt.
- **Thống kê:** số từ, số chủ đề, số từ đánh dấu đã nhớ trong phiên và số từ theo chủ đề.

Điều hướng dùng URL hash (`#home`, `#vocabulary`, `#statistics`) để giữ code đơn giản và hỗ trợ nút Back của trình duyệt.

## Công nghệ và cấu trúc

- Frontend: React + Vite, JavaScript thuần.
- Backend: Node.js + Express, tổ chức theo `Route → Controller → Model`.
- Database: PostgreSQL.
- Auto Review: chọn nhiều chủ đề/loại từ, chỉnh thời gian trước và sau khi lật, đánh dấu từ đã nhớ/cần ôn; lượt tiếp theo chỉ gồm từ cần ôn và chờ người học bấm tiếp tục.
- Phát âm dùng Speech Synthesis tích hợp trong trình duyệt.

```text
src/App.jsx           Điều hướng trang, tải danh sách từ và mở chế độ học
src/pages/            Trang quản lý từ vựng và thống kê
src/components/       Form thêm/sửa, flashcard, hộp thoại, các màn Auto Review
src/AutoReview.jsx    Điều phối setup → ôn → tổng kết → ôn tiếp
src/api/              Gọi API từ giao diện
src/constants/        Danh sách chủ đề và loại từ
src/utils/            Hàm trộn thẻ và phát âm
src/styles.css        CSS chung, chia thành các phần có chú thích
server/routes/        Khai báo endpoint
server/controllers/   Kiểm tra input và điều phối request
server/models/        Truy vấn PostgreSQL
database/schema.sql   Tạo bảng và nạp 30 từ TOEIC mẫu
database/migrations/ Cập nhật database cũ và thay bộ từ tổng quát bằng TOEIC
```

## Chạy local

Yêu cầu Node.js 18+ và PostgreSQL đang chạy.

1. Tạo database tên `english_learning` (hoặc chọn tên khác trong `DATABASE_URL`).
2. Chạy `database/schema.sql` trong database để tạo bảng và nạp 30 từ TOEIC mẫu. Lệnh nạp mẫu có thể chạy lại an toàn.
   Nếu database đã có bảng `vocabulary` từ phiên bản trước, chạy `database/migrations/001_replace_general_words_with_toeic.sql` một lần. Migration này xóa toàn bộ từ cũ và thay bằng bộ từ TOEIC mới.
3. Sao chép `.env.example` thành `.env` trong thư mục gốc dự án và điền cấu hình local theo mẫu dưới đây. `.env.example` chỉ chứa ba tên biến với giá trị rỗng để đưa vào Git; thông tin đăng nhập thật chỉ điền trong `.env` trên máy:

   ```env
   PORT=4000
   DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>
   CLIENT_ORIGIN=http://localhost:5173
   ```

   Thay các phần `<...>` bằng thông tin PostgreSQL trên máy. Không đưa mật khẩu thật vào README hoặc mã nguồn frontend. `DATABASE_URL` chỉ được backend sử dụng; không đặt thành biến `VITE_*`.
4. Cài dependencies và chạy ứng dụng:

   ```bash
   npm install
   npm run dev
   ```

5. Mở `http://localhost:5173`. API mặc định chạy ở `http://localhost:4000`; kiểm tra kết nối bằng `/api/health`.

## API

- `GET /api/vocabulary?search=...&category=...` — tìm từ và lọc theo chủ đề.
- `POST /api/vocabulary` — thêm từ, loại từ, ví dụ, chủ đề và từ liên quan.
- `POST /api/vocabulary/import` — nhập `{ "words": [...] }`; mỗi từ có `category` tùy chọn. Trả số từ đã thêm, trùng, không hợp lệ và kết quả từng mục. Từ trùng được so sánh không phân biệt hoa/thường. Các mục không hợp lệ được bỏ qua; các mục hợp lệ được lưu trong cùng transaction.
- `PUT /api/vocabulary/:id` — sửa một từ theo mã.
- `DELETE /api/vocabulary/:id` — xóa một từ theo mã.

## Kiểm tra luồng chính

### Thêm một từ hoặc nhập danh sách

Trong trang **Từ vựng**, bấm **+ Thêm từ ▾**, chọn **Nhập thủ công** để nhập một từ hoặc **Import JSON** để dán danh sách từ. Cả hai dùng bảng `vocabulary` hiện tại, không thêm bảng mới. Hướng dẫn và mẫu JSON được ẩn trong mục **Hướng dẫn & mẫu nhập**. Form nhập thủ công đánh dấu `(optional)` cho category, câu ví dụ và từ đồng/trái nghĩa.

Form thêm một từ dùng nhãn **Category (optional)**: chọn gợi ý, nhập tên mới hoặc bỏ trống. Category được lưu trực tiếp trong bảng `vocabulary`; không tạo bảng chủ đề. Tên mới tự xuất hiện trong bộ lọc và Auto Review khi có từ thuộc category đó. Category cùng tên được nhóm chung; bỏ trống, thiếu trường hoặc `null` được lưu là **Chưa phân loại**.

Mẫu danh sách (không cần chọn category bên ngoài JSON; mỗi từ có thể thuộc category khác nhau):

```json
[
  {
    "word": "purchase",
    "meaning": "mua",
    "partOfSpeech": "verb",
    "category": "Office",
    "example": "The company plans to purchase new computers.",
    "synonyms": ["buy", "acquire"],
    "antonyms": ["sell"]
  }
]
```

Bắt buộc: `word`, `meaning`, `partOfSpeech` (`noun`, `verb`, `adjective`, `adverb`, `phrase`). Có thể bỏ `category`, `example`, `synonyms`, `antonyms`. Category tối đa 60 ký tự; các trường khác mặc định là chuỗi rỗng và hai mảng rỗng. Không bọc JSON trong Markdown khi dán.

**Xem trước** hiển thị kết quả từng mục. **Lưu các từ hợp lệ** bỏ qua mục lỗi/từ trùng và giữ nguyên dữ liệu cũ. Server kiểm tra lại khi lưu, nên số từ thêm thực tế có thể khác xem trước nếu dữ liệu đã thay đổi. Giới hạn request là 1 MB.

Prompt gợi ý: “Tạo 50 từ TOEIC. Chỉ trả một mảng JSON với word, meaning tiếng Việt, partOfSpeech, category, example, synonyms và antonyms. Category là chủ đề của từng từ, ví dụ Office, Travel; có thể bỏ trống. Không có từ trái nghĩa phù hợp thì dùng []. Không lặp từ.” Rà soát nghĩa và từ liên quan trước khi lưu.

### Ôn tập

Hai ô **Show word before flipping (seconds)** và **Review answer before next (seconds)** cho nhập số giây dương tùy chọn, kể cả số thập phân (ví dụ `2.5`, `30`, `120`). Thời gian bắt đầu khi mặt thẻ xuất hiện. Tạm dừng giữ thời gian còn lại. Giới hạn kỹ thuật của bộ hẹn giờ là khoảng 24 ngày; không còn giới hạn 15/20 giây của thanh trượt cũ. Cấu hình hiện chỉ dùng trong lượt ôn đang mở.

Phát âm nằm ở `src/utils/review.js`: `SpeechSynthesisUtterance(word)` tạo nội dung cần đọc, `lang = "en-US"` yêu cầu tiếng Anh Mỹ, `rate = 0.9` đọc chậm hơn tốc độ mặc định, rồi `speechSynthesis.speak()` giao việc đọc cho trình duyệt. App không lưu file audio trong PostgreSQL và không gọi GPT để phát âm. Giọng thực tế phụ thuộc thiết bị/trình duyệt; có thể là dịch vụ local hoặc từ xa.

Trong `src/AutoReview.jsx`, hai effect độc lập điều khiển bộ đếm thời gian và giọng đọc. Nếu lật thẻ hoặc dừng, giọng đọc hiện tại bị hủy. Do đó thời gian mặt trước quá ngắn có thể làm câu đọc chưa hoàn tất. Khi tiếp tục mặt trước sau khi pause, từ được đọc lại từ đầu, còn bộ đếm tiếp tục phần thời gian còn lại.

Trong **Start learning → Auto Review**, chọn một hoặc nhiều chủ đề và loại từ, đặt thời gian hiện mặt trước/mặt sau rồi bắt đầu. Mỗi thẻ tự phát âm từ; sau khi lật, chọn **I knew it** hoặc **Review again**. Nếu không chọn trước khi hết giờ, từ đó được đưa vào lượt cần ôn. Khi hết lượt, app chờ bấm **Continue** để ôn riêng các từ cần nhớ lại. Tạm dừng sẽ giữ thời gian còn lại.

**Start learning → Flashcards** cho phép lật thủ công và chuyển sang từ kế tiếp. Nút đóng có vị trí riêng cạnh số thứ tự thẻ. Trang Từ vựng dành cho quản lý dữ liệu; các chế độ ôn nằm trong Start learning.

Tiến độ ôn và số từ đã nhớ chỉ giữ trong phiên đang mở, mất khi tải lại trang. Từ vựng và các thay đổi CRUD được lưu trong PostgreSQL.

## Cách đọc code

1. Đọc `src/App.jsx` để hiểu dữ liệu chung và điều hướng.
2. Đọc `src/pages/VocabularyPage.jsx` để xem tìm kiếm, lọc, thêm/sửa/xóa.
3. Theo `src/api/vocabulary.js` → Route → Controller → Model để hiểu cách dữ liệu được lưu.
4. Đọc `Flashcard.jsx` cho chế độ thủ công; `AutoReview.jsx` cho vòng lặp ôn tự động. Các màn trình bày được tách riêng để phần điều phối dễ theo dõi.

## Build

```bash
npm run build
```

## Production

Frontend được build thành static assets trong `dist/`; Express phục vụ API trên Node.js; PostgreSQL là database production. Trước khi deploy, cấu hình `DATABASE_URL`, `PORT` và `CLIENT_ORIGIN` trong môi trường hosting, bật TLS cho kết nối database, và đặt frontend/API cùng origin hoặc cập nhật CORS. Chưa có demo production; thêm link demo tại đây sau khi hosting được chọn.

## Git workflow

Nhánh phát triển dùng `dev`; từng tính năng làm trên `feature/*` tạo từ `dev`, sau đó mở PR về `dev`. Khi `dev` ổn định, mở PR `dev → main`. Không commit `.env`, `node_modules` hoặc `dist`.
