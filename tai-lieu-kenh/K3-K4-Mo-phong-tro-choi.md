# Mô phỏng 3D và trò chơi luyện tập (Project MO PHONG 3D)

Ứng dụng chung tên **Khám phá Hóa học** (trang giáo viên GIAO-VIEN.html: Kiểm tra · Trò chơi · Hồ sơ HS · Cài đặt).

Tải vào Project MO PHONG 3D, cùng `Quy-uoc-chung.md`, `Danh-muc-kien-thuc.md`.

## Nơi đăng

- Repo GitHub `Sau-rieng/TRO--CHOI-IPAD` → https://sau-rieng.github.io/TRO--CHOI-IPAD/ ; mỗi sản phẩm một file HTML, thêm vào trang mục lục `MUCLUC.html`.
- Tên file viết hoa không dấu: `HOA10-<TEN>.html`, trò nhóm thêm `-NHOM` (vd `HOA10-CHIMDUATHU-NHOM.html`).
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
- Giáo viên mở/đóng, đặt thời gian, lớp được chơi, lấy QR và xem kết quả trong trang giáo viên → Trò chơi. Mã vào chơi / mã mở khóa trò chơi đặt ở Cài đặt (tab MA: MaTroChoi, MaMoKhoaTroChoi).
- Mở với `?demo`: lớp DEMO (mã vào chơi 1111, mở khóa 2222); thêm `if(window.LAM_DEMO)SBD_PREFIX.DEMO='269999';` sau bảng SBD_PREFIX.

## Câu hỏi trong trò chơi / mô phỏng

- Mỗi câu gắn **Kiến thức** (đúng tên trong `Danh-muc-kien-thuc.md`) và **Mức độ** (Biết / Hiểu / Vận dụng), để trong mảng câu hỏi dạng `{hoi, pa, da, kt, md}`.
- Đúng khoa học, đúng mức chương trình Kết nối tri thức của khối; mô hình đơn giản hóa thì ghi chú trên trang.
- Mã hoạt động (`MA-TRO`): viết hoa không dấu, có khối và bài, vd `DAINOI-HOA10`, `H10-B5-GAME1`.

## Mô phỏng 3D

Mô phỏng (cấu trúc, thí nghiệm ảo, hiện tượng) là **tài nguyên học tập**: học sinh xem trong *Tài khoản học sinh → Tài nguyên* (đăng nhập SBD + mã xem bài), giáo viên xem lượt xem ở trang giáo viên → Tài nguyên.

Soạn sao cho chuyển lên được ngay:
- Một file HTML duy nhất, tự chạy; thư viện (Three.js…) lấy từ CDN; không đăng nhập, không gửi Sheet (hệ thống tự ghi lượt xem).
- Chạy tốt trên iPad (cảm ứng, xoay ngang/dọc), chữ tiếng Việt, ghi rõ trên trang: tên, bài SGK, mô hình có đơn giản hóa không.
- Kèm 4 dòng thông tin khi giao: Tên · Khối/Bài SGK · Loại (Cấu trúc / Thí nghiệm / Hiện tượng / Quy trình) · Kiến thức (đúng tên trong Danh-muc-kien-thuc.md), và 1 ảnh chụp màn hình đẹp làm ảnh bìa.

**Chuyển lên Tài nguyên:** Project này không đưa file lên GitHub. Giáo viên tải file HTML (+ ảnh chụp) về, gửi vào cuộc trò chuyện có quyền sửa repo `Sau-rieng/LAM-BAI-KIEM-TRA` và nói "chuyển". Ở đó: đặt file vào `tai-nguyen/`, ảnh bìa vào `tai-nguyen/anh/` (16:10, dưới 80 KB), thêm 1 mục vào `tai-nguyen/danh-muc.js` (ma, ten, khoi, bai, loai, kienthuc, mota, file, anh), kiểm tra chạy được rồi đẩy lên.


- Thanh trượt chỉnh thông số (nhiệt độ, nồng độ, số cặp electron…), mô hình đổi theo ngay.
- Kèm 3–5 câu hỏi khám phá; câu trả lời gửi về tab HOAT DONG như trò cá nhân.

## Đã có (tháng 10/2026)

Cá nhân: Đại Nội Hóa 10, Đại Nội KHTN 9, Chim đưa thư, Đua xe F1, Đua xe Polymer, Polymer F1, Leo Langbiang, Escape Forest H12 Chương 1-2-3, Khám phá hang động (Ester). Nhóm: Chim đưa thư, Đua xe F1, Đua xe Polymer, Ruộng lúa Chu kì, Grand Prix Điện hoá, Escape Forest H12 Chương 1-2-3. Đã nối hệ thống chung (Escape Forest H12 và Hang động nối 29/10/2026). Chưa nối: Escape Forest Bài 1 Ester (`index.html`), Toán 6, Toán 3 cửu chương.
