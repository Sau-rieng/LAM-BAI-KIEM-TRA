# LÀM BÀI KIỂM TRA – Hóa học

Hệ thống kiểm tra trên iPad: học sinh làm bài trên trang web (GitHub Pages), bài nộp ghi vào Google Sheet "SO THEO DOI <lớp>" và lưu PDF trong Google Drive (thư mục BAI LAM HOC SINH).

## Các khối

| Khối | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Trang làm bài (chọn lớp, SBD 2 số cuối, xáo câu/đáp án, khóa khi rời màn hình, tự gửi lại) | Đã làm (`LAM-BAI.html`) |
| 2 | Kho đề KHO DE HOA 10 + chấm trên Google, PDF đầy đủ, DE GOC, trang xem lại bài (`LAM-BAI.html`, `XEM-LAI.html`, `apps-script/SoTheoDoi.gs`) | Đã làm |
| 3 | Trang giáo viên: mở/đóng đợt kiểm tra, xem ai đã nộp theo thời gian thực | Chưa làm |
| 4 | Thống kê: phổ điểm, tỉ lệ đúng từng câu, tiến bộ qua các đợt | Chưa làm |
| 5 | Hồ sơ học sinh: lịch sử điểm và link PDF từng bài | Chưa làm |

Trang mục lục: `index.html`.

## Cấu hình
- Thêm lớp: sửa `cau-hinh-lop.js` (tên lớp, 6 số đầu SBD, link /exec).
- Mã Apps Script cho mỗi file SO THEO DOI: `apps-script/SoTheoDoi.gs` (điền KHO_DE_ID).
- KHO DE HOA 10: tab `CAU HINH` (MaDot, TenBai, ThoiGian_phut, TrangThai MO/DONG, ChoXemLai CO/KHONG, Lop), tab `MA` (MaGV, MaMoKhoa), mỗi đợt một tab (Cau, NoiDung, A, B, C, D, DapAn, Hinh).
