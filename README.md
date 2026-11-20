# Wordwise

Ứng dụng học từ vựng tiếng Anh với thẻ từ, ôn tập tự động và luyện nghe theo nhóm. Người học có thể tự xây dựng kho từ và chọn cách ôn phù hợp.

**React + Vite · JavaScript · Node.js + Express · PostgreSQL**

## Tính năng chính

- **Flashcards:** tự lật thẻ, nghe phát âm và chuyển sang từ tiếp theo.
- **Auto Review:** chọn chủ đề, loại từ và thời gian hiển thị; ôn tiếp các từ chưa nhớ sau mỗi lượt.
- **WordFlow:** nghe và xem nghĩa theo nhóm; tùy chỉnh số từ và tốc độ đọc, tự chuyển sau khi đọc xong mỗi từ.
- **Quản lý từ vựng:** thêm, sửa, xóa, tìm kiếm, lọc và nhập danh sách JSON tối đa 100 từ mỗi lượt.
- **Thông tin từ và thống kê:** nhiều câu ví dụ, đồng nghĩa, trái nghĩa, số từ theo chủ đề và số từ đã nhớ trong phiên.

## Chạy trên máy

Cần cài **Node.js 18+** và **PostgreSQL**. Có thể thiết lập database bằng pgAdmin 4 hoặc dòng lệnh.

### 1. Cài thư viện và tạo cấu hình

Mở terminal tại thư mục dự án. Với PowerShell trên Windows:

```powershell
npm install
Copy-Item .env.example .env
```

Điền thông tin PostgreSQL trên máy vào `.env`:

```env
PORT=4000
DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:5432/english_learning
CLIENT_ORIGIN=http://localhost:5173
```

Thay `<USER>` và `<PASSWORD>` bằng tài khoản của bạn; chỉnh host, port và tên database nếu khác. `.env` chứa thông tin local và không được đưa lên Git. `.env.example` chỉ giữ ba biến rỗng.

### 2. Tạo database và nạp dữ liệu mẫu

Thư mục `database` chỉ có **`schema.sql`**, gồm cấu trúc hiện tại và 30 từ mẫu.

Nếu đã thêm công cụ PostgreSQL vào PATH, chạy:

```powershell
createdb -U postgres english_learning
psql -U postgres -d english_learning -f database/schema.sql
```

Dùng tài khoản và thông tin kết nối khớp với `DATABASE_URL`. Với pgAdmin 4: tạo database `english_learning`, mở **Query Tool** của database đó, mở file `database/schema.sql` và chạy. Xem [hướng dẫn chi tiết](docs/guide.md).

Nếu database đang dùng đã có hai bảng `vocabulary` và `vocabulary_examples` theo cấu trúc hiện tại, có thể dùng tiếp. File SQL không xóa hoặc ghi đè từ đã có khi chạy lại trên cấu trúc này.

### 3. Khởi động ứng dụng

```powershell
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173). Backend mặc định chạy tại `http://localhost:4000`.

## Kiến trúc và cấu trúc code

Ứng dụng theo mô hình Client–Server. Backend tổ chức theo **Route → Controller → Model**.

```text
React → Gọi API → Express Route → Controller → Model → PostgreSQL

src/pages/          Trang quản lý từ vựng và thống kê
src/components/     Form, hộp thoại và thẻ VocabularyCard dùng chung
src/AutoReview.jsx  Điều khiển ôn tự động và các lượt ôn tiếp
src/WordFlow.jsx    Điều khiển đọc nối tiếp theo nhóm
src/api/            Gửi yêu cầu đến backend
shared/             Kiểm tra dữ liệu dùng chung cho client và server
server/             Route, controller, model và kết nối database
database/schema.sql Cấu trúc database hiện tại và dữ liệu mẫu
```

Một từ trong `vocabulary` có nhiều câu trong `vocabulary_examples`. Các câu được giữ đúng thứ tự, lưu cùng từ trong một transaction và tự xóa khi từ bị xóa.

## Kiểm tra

```powershell
npm run build
```

Luồng kiểm tra thủ công: thêm từ có nhiều ví dụ → tìm từ → xem nghĩa → tải lại trang → sửa ví dụ → xóa từ. Kiểm tra thêm vòng ôn tiếp của Auto Review, phát âm và tạm dừng của WordFlow, bố cục màn hình nhỏ. Dự án chưa có bộ kiểm thử tự động.

## Trạng thái dự án

Dự án đang chạy local, **chưa deploy**. Từ vựng được lưu trong PostgreSQL; tiến độ đã nhớ chỉ giữ trong phiên và mất khi tải lại trang. Phát âm dùng Web Speech API, giọng đọc phụ thuộc trình duyệt và thiết bị.

Quy trình Git: `feature/* → dev → main`. Phát hành được thực hiện sau khi hoàn thiện tính năng và kiểm tra.

[Hướng dẫn database, API, mẫu import và cách đọc code](docs/guide.md)
