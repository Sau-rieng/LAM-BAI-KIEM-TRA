# Bàn giao sang khung chat mới – hệ thống "Khám phá Hóa học"

Dán file này vào đầu khung chat mới (hoặc đính kèm) để Claude nắm bối cảnh.

## 1. Kho mã (GitHub)
- **Sau-rieng/LAM-BAI-KIEM-TRA** (GitHub Pages): GIAO-VIEN.html (trang GV), XEM-LAI.html (= **Tài khoản HS**), LAM-BAI.html (làm bài iPad), GIAM-KHAO.html, cau-hinh-lop.js (`{ten, tiento, url}` từng lớp), khao-sat.js (15 câu khảo sát), vendor/jsQR.js, tai-lieu-kenh/*.md, apps-script/SoTheoDoi.gs.
  - Đẩy thẳng lên main: `git fetch -q origin main && git rebase -q FETCH_HEAD && git push -q origin HEAD:main`.
- **Sau-rieng/TRO--CHOI-IPAD**: trò chơi (Đua xe F1…). Làm trên nhánh → PR → squash merge.
- Mỗi commit kết thúc bằng dòng Co-Authored-By/Claude-Session; PR kết thúc bằng "🤖 Generated with Claude Code".

## 2. Máy chủ (Apps Script `SoTheoDoi.gs`)
- Mỗi lớp 1 **sổ** (Google Sheet, tên `SO THEO DOI <lớp>`; từ bản 19/11 nhận cả "SOTHEODOI-12CLB", "Sổ theo dõi_…") + 1 **KHO** dùng chung (đề, kiến thức, giải thích, bộ câu trò chơi, LUYEN THEM, RUBRIC, KHAO SAT DOT).
- Thêm action mới: thêm vào **cả** danh sách `case` **và** chuỗi `if (d.action === ...)`.
- **Sau mỗi lần sửa server luôn nhắc GV**: dán SoTheoDoi.gs mới vào TẤT CẢ sổ (10E01, 12G01, 12G02, 12CLB, 12AFTER, 9D01, 9D03, DEMO) → Triển khai → Quản lý → ✎ → Phiên bản mới.
- AI: `goiAI(yeuCau, tep, nhietDo, {he, thuLai})` dùng GeminiKey trong tab MA của kho. Không gửi tên HS cho AI.

## 3. Lớp
10E01 · 12G01 · 12G02 · 12CLB (SBD 261200xx) · 12AFTER (SBD 26120701–55) · 9D01 · 9D03 · DEMO (dùng KHO_DE_ID của DEMO, không đưa đề thật lên DEMO).

## 4. Quy ước của thầy/cô
- Trả lời tiếng Việt ngắn gọn; số thập phân dùng dấu chấm (7.8).
- Tính năng mới: **đưa phương án (AskUserQuestion) cho GV chọn trước rồi mới làm**.
- Đề: gắn kiến thức (YCCĐ) + mức độ cho mọi câu; có lời giải chi tiết; chỉ bài 45 phút có tự luận; in trắng đen.
- Bảo mật: không xin mã GV thật, không đọc/chép file KHO DE (có mã + khóa AI), token GitHub chỉ ở tab MA.

## 5. Tính năng đã có (đến 19/11/2026)
- **Kiểm tra**: iPad + phiếu giấy quét điện thoại; nạp nhiều file Excel; đổi mã đề khi trùng (tab DOI MA); M1 Phân tích đề (sửa đáp án, chấm lại); M2 Ma trận – Đặc tả (CV 7991); M5 chấm tự luận theo rubric (chỉ đề ≥45 phút): quét mặt trước xong bấm 📷 Chụp mặt sau → ghép vào bài em, AI chấm nháp, GV ✓ Duyệt mới cộng điểm/HS thấy (tab TU LUAN DIEM cột TT: DUYET/NHAP, _ANH).
- **Trò chơi**: cá nhân/nhóm, xuất phát chung, kết quả theo buổi, nút "Cho HS xem lại" (mặc định tắt).
- **Điểm TX**: chụp ảnh/PDF/Excel/dán (Claude đọc)/nhập tay; **📗 Quét nộp vở** bằng QR nhãn vở (`VO<SBD>`, nhãn cũ `KPHH-VO <SBD>` vẫn nhận; nhãn hỏng gõ 2 số cuối SBD): chọn lớp, chế độ Đúng hạn (X, +1) / Trễ (X nền vàng, +0.5), Xong → chốt Không nộp (KN, −1); cột "Điểm vở" chỉ hiển thị, không vào TB TX.
- **Tài khoản HS**: Xem lại bài + 💡, Kiến thức cần ôn, Luyện lại phần yếu (10 câu, không tính điểm), Bảng điểm của em, Điểm TX, Nhãn vở (QR), Hỏi thầy/cô, Tài nguyên, **Khảo sát** (khi GV mở đợt).
- **Hồ sơ HS**: từng em (kiến thức, **🔁 Rèn luyện phần yếu**: đã/chưa luyện, tiến bộ trước→luyện→sau, câu vẫn sai, nút Nhắc gửi vào Hỏi thầy/cô kèm nút "Luyện ngay"), nhận xét AI (M4), Luyện tập cả lớp, **📋 Khảo sát** (đợt có giờ mở/đóng, ẩn danh – chỉ biết ai đã/chưa làm, biểu đồ, so sánh lớp/đợt, AI tóm tắt, chép sang Claude, Excel).
- **Số liệu minh chứng (M6)** cho cuộc thi đổi mới sáng tạo (chấm 5/12, dùng thật trước 30/11): có thêm số phiếu khảo sát, mức đồng ý TB, % HS tự thấy tiến bộ.

## 5b. Bảo mật (19/11)
- Mã xem bài sai 5 lần/15 phút → khóa SBD 15 phút; sai mã quản lý 8 lần/10 phút → chặn thao tác GV 30 phút trừ máy đã đăng nhập đúng (thiết bị `tb` lưu localStorage `gv_tb`, danh sách Script Properties `may_tin`); dò mã mở khóa → báo.
- Sự việc ghi tab **BAO MAT** (kho); Nhật ký điểm tab **NHAT KY DIEM** (mỗi sổ) + hoàn tác; kiểm tra điểm sửa ngoài trang GV (ảnh chụp tab KIEM TRA DIEM, mỗi 3 giờ). Xem ở Cài đặt → 🛡 Bảo mật; trang chủ hiện băng ⚠ khi có sự việc mới.
- Mọi thao tác ghi điểm mới phải gọi `nkGhi(...)` với khóa `TX|id|ma` hoặc `BL|madot|ma|lan`, nếu không sẽ bị báo nhầm là sửa ngoài hệ thống.

## 5c. Tài khoản chung nhiều lớp (20/11)
- Em học nhiều lớp (12G01 + 12CLB + 12AFTER) dùng 1 SBD: GV ghi SBD lớp chính (tiền tố trùng lớp chính) vào DANHSACH lớp phụ. Mật khẩu (mã xem bài) lấy theo lớp chính, kho tab **TAI KHOAN** (MaHS, MaXem, LopChinh, CacLop) đồng bộ khi GV mở trang (≤30 phút/lần, `dongBoTK`), lớp phụ tự chép mật khẩu. Đổi mật khẩu ở sổ lớp chính.
- Ô SBD ở XEM-LAI, LAM-BAI, các trò chơi nhận 2 số cuối hoặc đủ 8 số. Tài khoản HS gộp bài/bảng điểm/TX/khảo sát các lớp (nhãn lớp); Kiến thức cần ôn có nút chọn lớp. Quét nộp vở: sổ lớp đang quét tự kiểm tra em có trong danh sách.

## 5d. Tài khoản GV đóng vai HS (20/11)
- Mỗi lớp tự có SBD `<tiền tố lớp>00` (VD 26100100), tên GV, mã xem bài 0000 – không thêm vào DANHSACH, không vào sĩ số.
- Chỉ mở được trên máy đã đăng nhập trang GV (XEM-LAI gửi kèm `gv_tb`, server so `may_tin` của sổ đó); máy lạ nhập đúng 0000 → chặn + cảnh báo THU_TK_GV.
- Bài/điểm/trò chơi/luyện tập của SBD …00 bị ẩn khỏi mọi thống kê trang GV (cờ `AN_GV` + `boGV(rows, cột MaHS)`); khảo sát của GV không lưu phiếu; quét vở không nhận …00. Hàm đọc dữ liệu mới cho trang GV phải lọc bằng `boGV`.

## 6. Việc còn treo / nhắc GV
- Dán SoTheoDoi.gs mới vào tất cả sổ (nhiều thay đổi từ 17–19/11 chưa chắc đã triển khai).
- Đổi tên file sổ 12CLB thành `SO THEO DOI 12CLB` nếu chưa triển khai bản mới.
- Tải các md đã cập nhật lên kênh (Kenh-Diem-TX.md, K1-Ra-de.md, K1-Tron-de-giay.md, Quy-uoc-chung.md).
- Tạo dữ liệu mẫu DEMO cho M1–M5; kiểm tra GeminiKey có trong tab MA.
- Mở đợt khảo sát đầu tiên (Hồ sơ HS → 📋 Khảo sát).
