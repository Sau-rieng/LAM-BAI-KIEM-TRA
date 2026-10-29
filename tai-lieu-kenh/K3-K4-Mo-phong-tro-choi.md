# Mô phỏng 3D và trò chơi luyện tập (Project MO PHONG 3D)

Ứng dụng chung tên **Khám phá Hóa học** (trang giáo viên GIAO-VIEN.html: Kiểm tra · Trò chơi · Hồ sơ HS · Cài đặt).

Tải vào Project MO PHONG 3D, cùng `Quy-uoc-chung.md`, `Danh-muc-kien-thuc.md`.

## Nơi đăng

- Repo GitHub `Sau-rieng/TRO--CHOI-IPAD` → https://sau-rieng.github.io/TRO--CHOI-IPAD/ ; mỗi sản phẩm một file HTML, thêm vào trang mục lục `MUCLUC.html`.
- Tên file viết hoa không dấu, mở đầu bằng môn + khối: `HOA10-<TEN>.html`, `HOA12-<TEN>.html`, `KHTN9-<TEN>.html`; trò nhóm thêm `-NHOM`, trò cá nhân có bản nhóm cùng tên thêm `-CANHAN` (vd `HOA10-CHIMDUATHU-NHOM.html`). Mã trò (`MA-TRO`) đã đặt thì giữ nguyên dù đổi tên file.
- Đổi tên file: giữ file tên cũ làm trang chuyển hướng sang tên mới (link, mã QR cũ vẫn mở được), sửa `TC_TRO`, `TC_MAC_DINH` và `MUCLUC.html`.
- Chạy mượt trên iPad (Safari), điều khiển cảm ứng; Three.js lấy từ CDN; giao diện tiếng Việt.

## Nối với hệ thống chung (bắt buộc với trò chơi; từ 25/10/2026 không tạo Sheet riêng cho trò nữa)

Đặt 2 thẻ này TRƯỚC script chính, và giữ dòng `window.CAU_HINH={SHEET_URL:''}` ở `<head>`:

```html
<script src="https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/cau-hinh-lop.js" data-banner="khong"></script>
<script src="noi-so-theo-doi.js"></script>
```

- Đăng ký trò mới ở 2 chỗ: `TC_TRO` trong `noi-so-theo-doi.js` (tên file → mã trò) và `TC_MAC_DINH` trong `SoTheoDoi.gs` (mã, tên, CA NHAN/NHOM, khối, file, số phút). Trò tự hiện trong trang giáo viên → Trò chơi.
- Đăng nhập: form có ô **Mã vào chơi**; gọi `api({kind:'login', code, lop, name, sbd})` (hoặc `TC.vao(lop, ma, sbd)`). Thời gian chơi lấy từ `minutes` trả về, không viết cứng.
- Mở khóa khi rời màn hình: `api({kind:'unlock', code})` (hoặc `TC.moKhoa(ma)`). Không viết mã giáo viên trong file HTML.
- Kết thúc: cá nhân gọi `guiSoTheoDoi(rep, 'MA-TRO', 'Tên trò', tongSoCau)` (`rep` cần `sbd` 8 số, `correct`, `startedAt`/`endedAt`) rồi gửi `fetch(SHEET_URL, …kind:'result')` để hiện "Đã gửi". Nhóm gọi `guiNhomSoTheoDoi` (`rep` cần `lop`, `group`, `correct`, `id`).
- Giáo viên mở/đóng, đặt thời gian, lớp được chơi, lấy QR và xem kết quả trong trang giáo viên → Trò chơi (không làm trang thống kê riêng; trang thống kê và Apps Script của Sheet riêng cũ đã chuyển vào thư mục `cu/`). Mã vào chơi / mã mở khóa trò chơi đặt ở Cài đặt (tab MA: MaTroChoi, MaMoKhoaTroChoi).
- Mở với `?demo`: lớp DEMO (mã vào chơi 1111, mở khóa 2222); thêm `if(window.LAM_DEMO)SBD_PREFIX.DEMO='269999';` sau bảng SBD_PREFIX.

## Câu hỏi trong trò chơi / mô phỏng

- Mỗi câu gắn **Kiến thức** (đúng tên trong `Danh-muc-kien-thuc.md`) và **Mức độ** (Biết / Hiểu / Vận dụng): câu dạng đối tượng thêm 2 khóa `kt`, `md` (vd `{hoi, pa, da, kt, md}`); câu dạng mảng thêm 2 phần tử cuối `kt`, `md`; câu sinh tự động gắn theo dạng câu. Bài chưa có trong danh mục thì thêm mục mới vào danh mục trước.
- Ngân hàng câu dùng chung cho nhiều trò để trong 1 file `.js` (vd `POLYMER-CAUHOI.js`, `HOA12-PIN-CAUHOI.js`).
- Đúng khoa học, đúng mức chương trình Kết nối tri thức của khối; mô hình đơn giản hóa thì ghi chú trên trang.
- Mã hoạt động (`MA-TRO`): viết hoa không dấu, có khối và bài, vd `DAINOI-HOA10`, `H10-B5-GAME1`.

## Mô phỏng 3D

Mô phỏng (cấu trúc, thí nghiệm ảo, hiện tượng) là **tài nguyên học tập**: học sinh xem trong *Tài khoản học sinh → Tài nguyên* (đăng nhập SBD + mã xem bài), giáo viên xem lượt xem ở trang giáo viên → Tài nguyên.

Soạn sao cho chuyển lên được ngay:
- Một file HTML duy nhất, tự chạy; thư viện (Three.js…) lấy từ CDN; không đăng nhập, không gửi Sheet (hệ thống tự ghi lượt xem).
- Chạy tốt trên iPad (cảm ứng, xoay ngang/dọc), chữ tiếng Việt, ghi rõ trên trang: tên, bài SGK, mô hình có đơn giản hóa không.
- Kèm 4 dòng thông tin khi giao: Tên · Khối/Bài SGK · Loại (Cấu trúc / Thí nghiệm / Hiện tượng / Quy trình) · Kiến thức (đúng tên trong Danh-muc-kien-thuc.md), và 1 ảnh chụp màn hình đẹp làm ảnh bìa.

**Đưa lên Tài nguyên (cách chính, từ 29/10/2026):** giáo viên tải file HTML (+ ảnh chụp) về, mở trang giáo viên → **Tài nguyên** → **📥 Tải tài nguyên lên** → chọn file .html (tên tự lấy từ `<title>`), chọn ảnh bìa, khối, bài, loại → Tải lên. File lưu trong Google Drive của giáo viên (thư mục TAI NGUYEN HOC TAP, tab `TAI NGUYEN` của KHODEHOA); học sinh mở trong tài khoản theo khối; giáo viên Sửa / Ẩn với HS / Xóa ngay trên trang. Vì vậy file phải **gói gọn một tệp** (CSS, JS, ảnh nhúng sẵn hoặc tải từ https), đặt `<title>` đúng tên tài nguyên.

**Cách cũ (đưa vào repo GitHub, mở nhanh hơn, có link công khai):** gửi file vào cuộc trò chuyện có quyền sửa repo `Sau-rieng/LAM-BAI-KIEM-TRA` và nói "chuyển". Ở đó: đặt file vào `tai-nguyen/`, ảnh bìa vào `tai-nguyen/anh/` (16:10, dưới 80 KB), thêm 1 mục vào `tai-nguyen/danh-muc.js` (ma, ten, khoi, bai, loai, kienthuc, mota, file, anh), kiểm tra chạy được rồi đẩy lên.


- Thanh trượt chỉnh thông số (nhiệt độ, nồng độ, số cặp electron…), mô hình đổi theo ngay.
- Kèm 3–5 câu hỏi khám phá; câu trả lời gửi về tab HOAT DONG như trò cá nhân.

## Đã có (cập nhật 29/10/2026)

Tất cả trò dưới đây đã nối hệ thống chung, đặt tên theo mẫu và gắn Kiến thức – Mức độ cho từng câu.

| Khối | Cá nhân | Nhóm |
| --- | --- | --- |
| KHTN 9 | `KHTN9-DAINOI` (Đại Nội Huế) | |
| Hóa 10 | `HOA10-DAINOI`, `HOA10-CHIMDUATHU`, `HOA10-DUAXEF1-CANHAN`, `HOA10-LANGBIANG` | `HOA10-CHIMDUATHU-NHOM`, `HOA10-DUAXEF1-NHOM`, `HOA10-RUONGLUA-CHUKI-NHOM` |
| Hóa 12 | `HOA12-POLYMER-F1`, `HOA12-DUAXEF1-POLYMER-CANHAN`, `HOA12-CHUONG123`, `HOA12-HANGDONG` | `HOA12-DUAXEF1-POLYMER-NHOM`, `HOA12-PIN-F1-NHOM`, `HOA12-CHUONG123-NHOM` |

Đã bỏ (29/10/2026): Toán 3, Toán 6, Escape Forest Bài 1 Ester (bản sơ khai). `index.html` chuyển sang `MUCLUC.html`.
