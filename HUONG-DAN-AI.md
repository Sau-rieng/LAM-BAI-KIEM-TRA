# Hướng dẫn cài tính năng "Phân tích AI" (Khối 4)

Sau khi cài, mỗi file **SO THEO DOI <lớp>** có thêm menu **🤖 Phân tích AI**. Menu này:

1. **Thống kê một đợt:** tạo tab `TK <MaDot>` gồm điểm trung bình, phân bố mức Tốt/Khá/Đạt/Chưa đạt, tỉ lệ đúng từng câu và phương án sai được chọn nhiều nhất. Phần này không dùng AI.
2. **AI phân tích cả lớp:** tạo tab `AI <MaDot>` gồm nhận xét chung, lỗ hổng kiến thức, sai lầm thường gặp và kế hoạch ôn tập 1 tiết. AI cũng soạn 5–8 câu ôn tập mới và đưa vào KHO ĐỀ ở tab `<MaDot>-OT`. Đợt ôn tập này để ở trạng thái **ĐÓNG** cho đến khi thầy/cô duyệt.
3. **AI gợi ý từng học sinh:** tạo tab `GOI Y <MaDot>` gồm lời nhận xét và nội dung cần ôn cho từng em. Khi thầy/cô **tích cột ChoHSXem**, học sinh mới thấy gợi ý ở trang Xem lại bài.

**Bảo mật:** hệ thống **không gửi họ tên học sinh** cho AI. AI chỉ nhận mã HS, điểm, các câu sai và nội dung đề.

---

## Bước 1. Lấy khóa AI miễn phí (làm 1 lần)

1. Vào **aistudio.google.com** và đăng nhập bằng tài khoản Google của thầy/cô.
2. Bấm **Get API key**, rồi **Create API key**, rồi sao chép dãy ký tự vừa hiện ra.
3. Mở file **KHO DE HOA 10**, vào tab **MA** và thêm một dòng mới:

| Ten | Ma |
| --- | --- |
| GeminiKey | *(dán khóa vừa sao chép)* |

Không chia sẻ file KHO ĐỀ cho người khác, vì trong đó có mã giáo viên và khóa AI.

## Bước 2. Dán mã vào từng file Sổ theo dõi (5 lớp + DEMO)

Phần AI nay đã **gộp vào `SoTheoDoi.gs`**: mỗi sổ chỉ còn **một** tệp mã. Lặp lại các bước sau với từng file `SO THEO DOI 10E01`, `12G01`, `12G02`, `9D01`, `9D03`, `DEMO`:

1. Mở file và vào **Tiện ích mở rộng**, rồi **Apps Script**.
2. Trong tệp `SoTheoDoi`, **ghi lại dãy ID ở dòng 9** (`KHO_DE_ID = '...'`).
3. Xóa toàn bộ nội dung tệp `SoTheoDoi`, dán toàn bộ nội dung file `apps-script/SoTheoDoi.gs` mới, rồi **điền lại ID ở dòng 9** như cũ.
4. Nếu bên trái còn tệp **`PhanTichAI`**: bấm dấu ⋮ cạnh tên tệp → **Xóa**. (Quên xóa thì sổ vẫn chạy, nhưng nên xóa cho gọn.)
5. Bấm **💾 Lưu**.
6. Bấm **Triển khai**, chọn **Quản lý các bản triển khai**, bấm ✏️ (sửa), ở mục Phiên bản chọn **Phiên bản mới**, rồi bấm **Triển khai**. Link `/exec` **giữ nguyên**, không cần sửa `cau-hinh-lop.js`.
7. Quay lại file Sheet và **tải lại trang**. Menu **🤖 Phân tích AI** sẽ hiện trên thanh menu.
8. Lần đầu bấm menu, Google sẽ hỏi quyền. Bấm **Tiếp tục**, chọn tài khoản, bấm **Nâng cao**, rồi **Đi tới… (không an toàn)**, rồi **Cho phép**. Cảnh báo này là bình thường với tập lệnh do chính thầy/cô tạo.

## Bước 3. Kiểm tra kết nối

Chọn **🤖 Phân tích AI**, rồi **Kiểm tra kết nối AI**. Nếu hiện "AI trả lời: H2O" là đã xong.

## Cách dùng sau mỗi đợt kiểm tra

1. Chọn **🤖 Phân tích AI**, rồi **⭐ Làm tất cả 3 bước**. Nhập mã đợt, hoặc để trống để lấy đợt mới nhất. Quá trình mất khoảng 30–90 giây.
2. Đọc tab `AI <MaDot>` để chuẩn bị tiết ôn tập.
3. Mở KHO ĐỀ, vào tab `<MaDot>-OT` và **kiểm tra lại từng câu, đáp án** (AI có thể sai). Sửa nếu cần, rồi đổi `TrangThai` của đợt đó thành **MO** ở tab CAU HINH để học sinh luyện tập lại.
4. Mở tab `GOI Y <MaDot>` và đọc, sửa lời nhận xét. Sau đó **chọn cả cột G (ChoHSXem) và bấm phím cách** để tích hết. Học sinh vào trang **Xem lại bài** sẽ thấy khung "🤖 Gợi ý ôn tập dành cho em".

## Lỗi thường gặp

| Thông báo | Cách xử lý |
| --- | --- |
| Chưa có khóa AI | Làm lại Bước 1. Kiểm tra chữ `GeminiKey` có đúng chính tả, không có dấu cách |
| Khóa AI không hợp lệ (mã 400/403) | Tạo khóa mới ở aistudio.google.com rồi dán lại |
| Đã hết lượt dùng AI miễn phí | Gói miễn phí giới hạn số lần gọi mỗi phút và mỗi ngày. Đợi vài phút hoặc chạy lại ngày hôm sau |
| Không tìm thấy mô hình | Google đã đổi tên mô hình. Vào aistudio.google.com xem tên mô hình Flash mới, rồi thêm dòng `GeminiModel` với tên đó ở tab MA |
| Không có menu 🤖 | Tải lại trang Sheet. Kiểm tra tệp `SoTheoDoi` đã dán bản mới và đã lưu |

Lưu ý: với gói miễn phí, Google có thể dùng nội dung gửi lên để cải thiện sản phẩm. Vì vậy hệ thống chỉ gửi mã số, không gửi tên học sinh.
