# LÀM BÀI KIỂM TRA – Hóa học

Hệ thống kiểm tra trên iPad: học sinh làm bài trên trang web (GitHub Pages), bài nộp ghi vào Google Sheet "SO THEO DOI <lớp>" và lưu PDF trong Google Drive (thư mục BAI LAM HOC SINH).

## Các khối

| Khối | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Trang làm bài (chọn lớp, SBD 2 số cuối, xáo câu/đáp án, khóa khi rời màn hình, tự gửi lại) | Đã làm (`LAM-BAI.html`) |
| 2 | Kho đề KHO DE HOA 10 + chấm trên Google, PDF đầy đủ, DE GOC, trang xem lại bài (`LAM-BAI.html`, `XEM-LAI.html`, `apps-script/SoTheoDoi.gs`) | Đã làm |
| 3 | Trang giáo viên `GIAO-VIEN.html`: mở/đóng đề, bật xem lại, theo dõi HS đang làm/đã nộp/chưa vào (cần dòng `MaQuanLy` trong tab MA) | Đã làm |
| 4 | Thống kê + AI (Gemini): tỉ lệ đúng từng câu, AI phân tích lỗ hổng, soạn đề ôn tập, gợi ý từng HS hiện ở trang xem lại (`apps-script/PhanTichAI.gs`, xem `HUONG-DAN-AI.md`) | Đã làm |
| 5 | Hồ sơ học sinh: lịch sử điểm và link PDF từng bài | Chưa làm |

Trang mục lục: `index.html`.

## Cấu hình
- Thêm lớp: sửa `cau-hinh-lop.js` (tên lớp, 6 số đầu SBD, link /exec).
- Mã Apps Script cho mỗi file SO THEO DOI: `apps-script/SoTheoDoi.gs` (điền KHO_DE_ID).
- KHO DE: tab `CAU HINH` (MaDot, TenBai, ThoiGian_phut, TrangThai MO/DONG, ChoXemLai CO/KHONG, Lop), tab `MA` (MaGV, MaMoKhoa, MaLamLai, GeminiKey), mỗi đợt một tab (Cau, NoiDung, A, B, C, D, DapAn, Hinh, Loai, Diem).
  - `Loai`: `TN` trắc nghiệm (DapAn A–D) · `DS` đúng/sai (A–D là ý a–d, DapAn 4 chữ Đ/S, chấm theo thang 0,1/0,25/0,5/1) · `TLN` trả lời ngắn (DapAn số, 18,36 = 18.36).
  - `Cau`: `I.1`, `II.1`, `III.1`… để PDF và trang xem lại chia theo phần. `Diem`: điểm tối đa của câu; tổng quy về thang 10.
  - Hình trong đề: thẻ `<img src="https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/hinh/<MaDot>/imageN.png">` ngay trong NoiDung hoặc phương án; ảnh lưu ở thư mục `hinh/`.
