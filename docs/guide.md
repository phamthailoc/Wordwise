# Hướng dẫn thiết lập và dữ liệu

[Quay lại README](../README.md)

## Thiết lập PostgreSQL bằng pgAdmin 4

1. Kết nối đến PostgreSQL đang chạy trên máy.
2. Nhấp phải **Databases → Create → Database**, đặt tên `english_learning`.
3. Chọn database vừa tạo, mở **Tools → Query Tool**.
4. Mở file `database/schema.sql` trong Query Tool và chạy toàn bộ nội dung.
5. Làm mới **Schemas → public → Tables** để thấy `vocabulary` và `vocabulary_examples`.
6. Điền tài khoản, mật khẩu, host, port và tên database tương ứng vào `DATABASE_URL` trong `.env`.

Nếu dùng dòng lệnh, cần có `createdb` và `psql` trong PATH:

```powershell
createdb -U postgres english_learning
psql -U postgres -d english_learning -f database/schema.sql
```

Thư mục `database` chỉ giữ một file thiết lập hiện tại: `schema.sql`. File tạo hai bảng và nạp 30 từ mẫu; chạy lại trên cấu trúc hiện tại không ghi đè dữ liệu có sẵn. Database của dự án đang dùng cấu trúc này có thể tiếp tục hoạt động.

## Cấu trúc dữ liệu

- `vocabulary`: từ tiếng Anh, nghĩa tiếng Việt, chủ đề, loại từ, nhóm đồng nghĩa/trái nghĩa và ngày tạo.
- `vocabulary_examples`: `id`, `vocabulary_id`, `sentence` và `position`.
- Quan hệ một–nhiều: mỗi từ có thể có nhiều câu ví dụ. `position` lưu thứ tự câu và không trùng trong cùng một từ.
- Khóa ngoại dùng `ON DELETE CASCADE`: xóa từ thì xóa các ví dụ liên quan.
- Thêm/sửa từ và các câu nằm trong một transaction; nếu lưu lỗi, toàn bộ thao tác được hoàn tác.
- Chủ đề là chuỗi nằm trong bảng `vocabulary`, không có bảng chủ đề riêng.

## API

| Phương thức | Đường dẫn                                 | Chức năng                                    |
| ----------- | ----------------------------------------- | -------------------------------------------- |
| GET         | `/api/health`                             | Kiểm tra backend đang chạy                   |
| GET         | `/api/vocabulary?search=...&category=...` | Lấy danh sách, tìm kiếm và lọc từ            |
| POST        | `/api/vocabulary`                         | Thêm từ                                      |
| PUT         | `/api/vocabulary/:id`                     | Cập nhật từ và danh sách ví dụ               |
| DELETE      | `/api/vocabulary/:id`                     | Xóa từ cùng các ví dụ                        |
| POST        | `/api/vocabulary/import`                  | Nhập danh sách với body `{ "words": [...] }` |

Khi thêm/sửa một từ, nhóm từ liên quan dùng `relatedWords: { "synonyms": [], "antonyms": [] }`. Trong danh sách import, dùng trực tiếp `synonyms` và `antonyms` như mẫu dưới đây.

## Mẫu nhập danh sách từ

Tại trang **Từ vựng**, mở nút thêm từ và chọn **Nhập danh sách**. Dán mảng JSON, bấm **Xem trước**, rồi lưu các từ hợp lệ.

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

- Bắt buộc: `word`, `meaning`, `partOfSpeech`.
- Giá trị loại từ: `noun`, `verb`, `adjective`, `adverb`, `phrase`.
- Không bắt buộc: `category`, `examples`, `synonyms`, `antonyms`.
- Chủ đề thiếu hoặc trống được lưu là **Chưa phân loại**. Chủ đề mới xuất hiện trong bộ lọc sau khi lưu từ.
- `examples` là mảng chuỗi. Câu trống được bỏ qua; các câu còn lại giữ nguyên thứ tự. Không có ví dụ thì dùng `[]`.

Mỗi lượt nhận 1–100 từ, body tối đa 1 MB. Từ trùng được so sánh không phân biệt hoa/thường và bỏ qua. Mục lỗi được báo trong bảng xem trước và không được lưu. Server kiểm tra lại khi lưu, nên kết quả có thể khác bản xem trước nếu dữ liệu đã thay đổi.

## Các chế độ học

- **Flashcards:** tự lật và tự chuyển từ; không đánh dấu đã nhớ.
- **Auto Review:** trộn toàn bộ từ khớp bộ lọc; thời gian mặc định trước/sau khi lật là 3/6 giây. Từ chưa đánh dấu hoặc chọn cần ôn sẽ vào lượt tiếp theo. App chờ người học bấm ôn tiếp. Tạm dừng giữ thời gian còn lại.
- **WordFlow:** trộn từ khớp bộ lọc; số từ mỗi nhóm mặc định là 6, cho nhập số nguyên dương. Tốc độ có sẵn: 0.5×, 0.75×, 0.9×, 1×, 1.25×, 1.5×, 2×. Đọc xong mới sang từ tiếp; hết nhóm chuyển ngay, hết danh sách tự dừng. Tiếp tục sau khi tạm dừng sẽ đọc lại từ hiện tại. Không cập nhật số từ đã nhớ.

Giao diện dùng tiếng Việt; giữ tên sản phẩm và chế độ học bằng tiếng Anh. Tên chủ đề và loại từ hiển thị nguyên giá trị nhận từ database, không qua bảng dịch. Bộ lọc và thiết lập ôn tập chỉ liệt kê các giá trị đang có trong kho từ. Form thêm/sửa vẫn cho chọn các loại từ được API hỗ trợ và nhập chủ đề mới.

## Cách đọc code

1. `src/App.jsx`: dữ liệu chung, điều hướng và chọn chế độ học.
2. `src/pages/VocabularyPage.jsx`: tìm kiếm, lọc và các thao tác thêm/sửa/xóa.
3. `src/api/vocabulary.js` → `server/routes/` → `server/controllers/` → `server/models/`: luồng yêu cầu và lưu dữ liệu.
4. `src/components/VocabularyCard.jsx`: hai mặt thẻ và hiệu ứng xoay dùng chung.
5. `src/AutoReview.jsx`, `src/WordFlow.jsx`: điều khiển thời gian và phát âm.
6. `src/utils/review.js`: trộn danh sách, kiểm tra thời gian và đọc từ.

Phát âm dùng `SpeechSynthesisUtterance` và `speechSynthesis.speak()`, không lưu file âm thanh trong PostgreSQL. Trong Auto Review, giọng đọc và bộ đếm thời gian chạy độc lập; lật thẻ sẽ dừng tiếng đọc hiện tại. WordFlow đợi sự kiện đọc xong rồi mới chuyển từ.

## Danh sách kiểm tra thủ công

- Thêm từ với ba ví dụ, tìm từ và xem nghĩa.
- Tải lại, mở sửa và kiểm tra ví dụ còn đủ, đúng thứ tự.
- Xóa một câu, lưu và kiểm tra hai câu còn lại.
- Import nhiều ví dụ; kiểm tra từ trùng và dữ liệu sai.
- Xóa từ và kiểm tra các ví dụ liên quan đã được xóa.
- Thử lật/xem lại/chuyển từ trong Flashcards, kiểm tra vị trí nút.
- Thử tạm dừng, tiếp tục và ôn lại trong Auto Review.
- Thử phát âm, tạm dừng và kết thúc danh sách trong WordFlow.
- Kiểm tra màn hình 390px, phím Tab và nút đóng.
- Chạy `npm run build`.
