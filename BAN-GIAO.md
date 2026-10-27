# Bàn giao: hệ thống "Khám phá Hóa học" (cập nhật 27/10/2026)

Tài liệu này để mở một cuộc trò chuyện mới với Claude và làm tiếp đúng chỗ đã dừng.
Không ghi mã thật ở đây: mã thật chỉ nằm trong tab MA của file KHODEHOA (Drive của giáo viên).

## 1. Giáo viên và cách làm việc

- Giáo viên Hóa (bộ Kết nối tri thức). Các lớp: 10E01, 12G01, 12G02, 9D01, 9D03. Sổ điểm trường: vnEdu.
- In đen trắng. Số thập phân dùng **dấu chấm** (7.8).
- Khi giáo viên đề xuất tính năng: **nêu các hướng làm để giáo viên chọn trước, rồi mới làm**.
- Mỗi câu hỏi soạn ra phải gắn **Kiến thức (yêu cầu cần đạt)** và **Mức độ (Biết/Hiểu/Vận dụng)**, và có **lời giải chi tiết** (giải thích từng phương án; xem K1).
- Viết hướng dẫn từng bước, dễ hiểu, xưng "thầy/cô".

## 2. Kho mã nguồn (GitHub, người dùng Sau-rieng)

| Repo | Trang | Nội dung |
| --- | --- | --- |
| `Sau-rieng/LAM-BAI-KIEM-TRA` | https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/ | Ứng dụng chính |
| `Sau-rieng/TRO--CHOI-IPAD` | https://sau-rieng.github.io/TRO--CHOI-IPAD/ | 11 trò chơi luyện tập |

Đẩy code: `git fetch origin main && git rebase FETCH_HEAD && git push origin HEAD:main`.
Commit kết thúc bằng 2 dòng ghi công (Co-Authored-By / Claude-Session) theo hướng dẫn của phiên.

### Các trang trong LAM-BAI-KIEM-TRA

- `GIAO-VIEN.html`: trang giáo viên. Đăng nhập bằng MaQuanLy. Thanh trên: Trang chủ · Kiểm tra · Trò chơi · Tài nguyên · Hồ sơ HS · Cài đặt, chuông tin nhắn (số đỏ), Mã QR.
  - Kiểm tra: 📥 Nạp đề mới (chọn file KHO-DE-<mã đợt>.xlsx, xem trước rồi ghi vào kho), phòng chờ → bắt đầu → đóng đề, màn hình chiếu có QR riêng của đề, theo dõi nộp bài, phân tích câu sai, 🧭 đánh giá theo kiến thức (ngưỡng yếu 65%, AI nhận xét), xuất Excel, dán điểm vnEdu, sửa tên/thời gian/lớp của đề.
  - Trò chơi: mở/đóng, thời gian, lớp được chơi, QR, kết quả theo lớp/ngày, Excel.
  - Tài nguyên: lượt xem từng mô phỏng theo lớp, ai đã xem; tab khối ngang.
  - Tin nhắn: mỗi học sinh một cuộc trò chuyện, xem nội dung câu em hỏi, ✨ Gợi ý AI rồi giáo viên sửa và gửi.
  - Cài đặt: đổi MaGV, MaMoKhoa, MaLamLai, MaQuanLy, MaTroChoi, MaMoKhoaTroChoi (bản DEMO chỉ xem).
- `LAM-BAI.html`: học sinh làm bài (chọn lớp + 2 số cuối SBD + mã giáo viên; QR riêng của đề tự điền).
- `XEM-LAI.html`: **Tài khoản học sinh** (SBD + mã xem bài) với 3 ô: Xem lại bài (mỗi câu có nút 💡 Giải thích nếu có lời giải và 💬 Hỏi thầy/cô câu này) · Tài nguyên (mô phỏng tải tạm vào khung, không lưu) · Hỏi thầy/cô (số đỏ khi có trả lời).
- `index.html`, `DUNG-THU.html` (trang cho Ban giám khảo, lớp DEMO), `GIAM-KHAO.html` (hướng dẫn Ban giám khảo: giao diện giống trang Dùng thử, 9 bước gồm Tài nguyên 3D và Hỏi thầy/cô; bản in A4 đen trắng 2 trang).
- `cau-hinh-lop.js`: danh sách lớp + link /exec của từng sổ; `?demo` chuyển sang lớp DEMO.
- `tai-nguyen/danh-muc.js` + `tai-nguyen/*.html` + `tai-nguyen/anh/*`: 10 mô phỏng (Hóa 10 Bài 12 ×5; Hóa 12 Bài 6, 15 ×3, 21). Thêm mục mới: đặt file vào `tai-nguyen/`, ảnh bìa 16:10 vào `tai-nguyen/anh/`, thêm 1 dòng vào `danh-muc.js` (ma, ten, khoi, bai, loai, kienthuc, mota, file, anh). Danh mục tải kèm `?v=thời gian` nên không bị bản cũ.
- `hinh/giao-dien/`: `nen-hoa.svg` (nền nét vẽ), `banner-ptn.svg` (banner phòng thí nghiệm), `bieu-tuong.js` (biểu tượng `window.BT`). Giao diện: nền xanh nhạt, ô/tab xanh nhạt nổi, chữ Be Vietnam Pro, màu ink #172033, hồng #b8235a, xanh #1f5fbf.
- `doc-excel.js`: đọc .xls/.xlsx (dán điểm vnEdu); `docExcelTatCa` đọc mọi tab .xlsx (Nạp đề). Excel xuất ra do trang tự tạo (không dùng thư viện ngoài).

### Máy chủ: `apps-script/SoTheoDoi.gs`

Mỗi lớp có 1 Google Sheet "SO THEO DOI <lớp>" (và "SO THEO DOI DEMO") chứa script này, triển khai dạng Web app.
Dòng 10 `KHO_DE_ID`: bản trên GitHub đã điền sẵn ID KHODEHOA thật (5 sổ lớp dán là dùng được); **sổ DEMO phải sửa dòng 10 thành ID kho DEMO** (bản sao riêng). **Mỗi lần sửa**: dán vào cả 5 sổ + DEMO → Triển khai → Quản lý → ✎ → Phiên bản mới.
Phần AI (hàm `goiAI`, menu 🤖 Phân tích AI, khóa GeminiKey trong tab MA) **đã gộp vào `SoTheoDoi.gs`**: mỗi sổ chỉ một tệp mã; sổ còn tệp `PhanTichAI` cũ thì xóa (quên xóa vẫn chạy vì hằng số AI đã đổi tên có hậu tố _AI).

- KHODEHOA: tab `CAU HINH` (MaDot | TenBai | ThoiGian_phut | TrangThai MO/CHO/DONG | ChoXemLai | Lop | BatDauLuc), `MA`, `KIEN THUC` (MaDot | Cau | KienThuc | MucDo), `GIAI THICH` (MaDot | Cau | GiaiThich – nút 💡 Giải thích ở trang xem lại), `TRO CHOI` (tự tạo), mỗi đề một tab.
- Sổ lớp: `DANHSACH` (MAHS, HO TEN, GHI CHU, MAXEM), `BAI LAM`, `BAT DAU`, `PHONG CHO`, `XEM LAI`, `VANG THI`, `HOAT DONG` (trò cá nhân), `TRO CHOI NHOM`, `NHOM`, `XEM TAI NGUYEN`, `TIN NHAN`, `BANG DIEM`.
- Hành động học sinh: batdau, nop, mokhoa, chobai, vaobai, xemlai (trả kèm tinMoi), daxem, xemtn, tn_gui, tn_xem, tc_vao, tc_mokhoa, loai=hoatdong / loai=nhom.
- Hành động giáo viên (cần MaQuanLy): gv_dot, gv_dat (trangthai/xemlai/ten/phut/lop), gv_theodoi, gv_hoso, gv_bangdiem, gv_vang, gv_dathi, gv_cau, gv_nhom, gv_kienthuc, gv_ainx, gv_trochoi, gv_tcdat, gv_tckq, gv_ma, gv_madat, gv_tainguyen, gv_tin, gv_tin_hs, gv_tin_gui, gv_tin_goiy, gv_napde.

### Trò chơi (TRO--CHOI-IPAD)

- 11 trò nối hệ thống chung qua `noi-so-theo-doi.js`: SHEET_URL được thay bằng địa chỉ ảo, đăng nhập/mở khóa kiểm tra ở sổ lớp (tab TRO CHOI + mã trò chơi), kết quả vào HOAT DONG / TRO CHOI NHOM. Sổ chưa cập nhật thì tự dùng Sheet riêng cũ.
- Trò mới: thêm vào `TC_TRO` (noi-so-theo-doi.js) và `TC_MAC_DINH` (SoTheoDoi.gs).

### Bản dùng thử (DEMO) – mã công khai cho Ban giám khảo

Lớp DEMO, SBD 26999901–10 · mã giáo viên 1111 · mở khóa 2222 · làm lại 3333 · trang giáo viên 4444 · mã xem bài 11+SBD · trò chơi 1111/2222.

## 3. Các Project (kênh) trên Claude

8 Project theo "Cách 1": K1 – RA DE CO HINH ANH (ra đề, trộn đề app QM) · TAI LIEU KHAO BAI · K2-KIEM TRA IPAD (hệ thống + nhận xét K8 + hồ sơ dự thi) · BT VÀ ÔN TAP (K7 phiếu củng cố, HSG) · MO PHONG 3D (K3–K4) · TAI LIEU HOA 9 / 10 / 12.
Tài liệu kênh nằm trong thư mục `tai-lieu-kenh/` của repo này (bản mới nhất). Mô phỏng làm ở MO PHONG 3D → tải HTML về → gửi vào phiên có quyền sửa repo và nói "chuyển".

## 4. Việc giáo viên còn phải làm

1. Dán `apps-script/SoTheoDoi.gs` bản mới nhất vào 5 sổ + DEMO và triển khai phiên bản mới (cần cho: trò chơi quản lý chung, tài nguyên, tin nhắn, **nút Nạp đề mới**).
2. Trang giáo viên → Cài đặt: đặt **Mã vào chơi** và **Mã mở khóa trò chơi** riêng.
3. Mỗi sổ sau khi dán bản mới: tải lại Sheet → 🤖 Phân tích AI → Kiểm tra kết nối AI để cấp quyền (cả sổ DEMO nếu muốn Ban giám khảo thử Gợi ý AI). KHO DE DEMO cần dòng GeminiKey riêng ở tab MA.
4. Mở thử trên iPad 9 mô phỏng 3D (dùng three.js từ CDN) vì phiên trước không chạy được hình 3D để kiểm tra.

## 5. Việc có thể làm tiếp (giáo viên chưa chọn)

- Thêm mục "Toán 6" vào Tài nguyên cho mô phỏng hai ca nô (bài 3.13); bổ sung kiến thức Hóa 10 Bài 12, Hóa 12 Bài 6/15/21 vào Danh mục kiến thức.
- Kênh K5 (gộp vào K1), mẫu K6, K9 chưa làm.

## 6. Kiểm thử

Phiên trước kiểm thử bằng máy chủ giả lập Node (chạy `SoTheoDoi.gs` với SpreadsheetApp giả) và Playwright (Chromium có sẵn). Dữ liệu đề thật **không** đưa lên repo; phiên mới tự dựng lại máy chủ giả với đề mẫu.
