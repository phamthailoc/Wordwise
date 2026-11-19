# Wordwise — English Learning Web App

Một ứng dụng học từ vựng tiếng Anh một trang, xây dựng bằng React, Vite, Express và PostgreSQL. Giao diện hỗ trợ tìm từ theo tiếng Anh/nghĩa tiếng Việt, lọc theo chủ đề, thêm từ kèm câu ví dụ và lật flashcard. Từ mới được lưu trong PostgreSQL nên vẫn còn sau khi tải lại trang.

## Công nghệ và cấu trúc

- Frontend: React + Vite, JavaScript thuần.
- Backend: Node.js + Express, tổ chức theo `Route → Controller → Model`.
- Database: PostgreSQL.
- Tiện ích học: bộ lọc chủ đề, bộ đếm mục tiêu 5 từ trong phiên và trạng thái “I know this”.

```text
src/                  Giao diện React và CSS
server/routes/        Khai báo endpoint
server/controllers/   Kiểm tra input và điều phối request
server/models/        Truy vấn PostgreSQL
database/schema.sql   Tạo bảng và dữ liệu mẫu
```

## Chạy local

Yêu cầu Node.js 18+ và PostgreSQL đang chạy.

1. Tạo database tên `english_learning` (hoặc chọn tên khác trong `DATABASE_URL`).
2. Chạy `database/schema.sql` trong database để tạo bảng và nạp 8 từ mẫu. Lệnh có thể chạy lại an toàn.
3. Sao chép `.env.example` thành `.env` và cập nhật `DATABASE_URL` với thông tin PostgreSQL local.
4. Cài dependencies và chạy ứng dụng:

   ```bash
   npm install
   npm run dev
   ```

5. Mở `http://localhost:5173`. API mặc định chạy ở `http://localhost:4000`; kiểm tra kết nối bằng `/api/health`.

## API

- `GET /api/vocabulary?search=...&category=...` — tìm từ theo từ tiếng Anh hoặc nghĩa tiếng Việt; lọc chủ đề tùy chọn.
- `POST /api/vocabulary` — thêm `{ "word", "meaning", "example", "category" }`.

## Kiểm tra luồng chính

Sau khi PostgreSQL, API và giao diện đã chạy, thêm một từ mới trong **Add a word**, tìm từ đó bằng ô **Find a word...**, mở thẻ và bấm **Reveal meaning**. Tải lại trang: từ vẫn xuất hiện vì API đọc dữ liệu đã lưu trong PostgreSQL. Có thể xác nhận trực tiếp bằng `GET /api/vocabulary?search=<từ>`.

## Build

```bash
npm run build
```

## Production

Frontend được build thành static assets trong `dist/`; Express phục vụ API trên Node.js; PostgreSQL là database production. Trước khi deploy, cấu hình `DATABASE_URL`, `PORT` và `CLIENT_ORIGIN` trong môi trường hosting, bật TLS cho kết nối database, và đặt frontend/API cùng origin hoặc cập nhật CORS. Chưa có demo production; thêm link demo tại đây sau khi hosting được chọn.

## Git workflow

Nhánh phát triển dùng `dev`; từng tính năng làm trên `feature/*` tạo từ `dev`, sau đó mở PR về `dev`. Khi `dev` ổn định, mở PR `dev → main`. Không commit `.env`, `node_modules` hoặc `dist`.
