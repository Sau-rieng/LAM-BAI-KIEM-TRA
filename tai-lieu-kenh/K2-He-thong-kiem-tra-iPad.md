# K2 – Hệ thống kiểm tra iPad đang chạy

Tải file này vào kênh K2 (cùng Quy-uoc-chung.md và Mau-dinh-dang-de.md). Hệ thống đã hoàn chỉnh; mọi yêu cầu mới là sửa trên hệ thống này, không xây lại.

## Thành phần

| Thành phần | Ở đâu | Việc |
| --- | --- | --- |
| Trang làm bài | `LAM-BAI.html` (repo LAM-BAI-KIEM-TRA) | HS chọn lớp, gõ 2 số cuối SBD + mã GV, vào phòng chờ, làm bài, nộp |
| Trang xem lại | `XEM-LAI.html` | HS gõ SBD + MAXEM, xem bài mình (chỉ đợt GV bật xem lại), điểm TB + biểu đồ |
| Trang giáo viên (ứng dụng **Khám phá Hóa học**) | `GIAO-VIEN.html` | Mã quản lý; Kiểm tra: mở phòng chờ → bắt đầu → đóng đề, bật xem lại, sửa tên/thời gian/lớp của đề, theo dõi nộp bài; Trò chơi: mở/đóng, thời gian, lớp, QR, kết quả; Hồ sơ HS; Cài đặt: đổi các mã |
| Danh sách lớp | `cau-hinh-lop.js` | Tên lớp, 6 số đầu SBD, link `/exec` từng sổ |
| Hình trong đề | `hinh/<mã đợt>/imageN.png` | Chèn bằng `<img src="https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/hinh/<mã đợt>/imageN.png">` |
| Mã chấm | `apps-script/SoTheoDoi.gs` + `apps-script/PhanTichAI.gs` | Dán giống nhau vào cả 5 Sổ theo dõi; dòng 9 `KHO_DE_ID` = ID file KHODEHOA |

## Kho đề KHODEHOA

- Tab `CAU HINH`: MaDot | TenBai | ThoiGian_phut | TrangThai (DONG/CHO/MO) | ChoXemLai (CO/KHONG) | Lop (vd `10E01` hoặc `12G01, 12G02`, trống = tất cả) | BatDauLuc (tự ghi).
- Tab `MA`: MaGV, MaMoKhoa, MaLamLai, MaQuanLy, GeminiKey (tên không phân biệt hoa/thường). Không chép các giá trị này ra ngoài.
- Mỗi đợt một tab tên = mã đợt: Cau | NoiDung | A | B | C | D | DapAn | Hinh | Loai | Diem.
  - Cau: `I.1`, `II.1`, `III.1` (giữ phần; trên iPad câu xáo trong từng phần, phương án TN xáo).
  - Loai: TN (DapAn A–D), DS (A–D là ý a–d, DapAn 4 chữ Đ/S), TLN (số hoặc chữ; nhiều cách đúng ngăn bằng `;`, không phân biệt dấu/hoa thường; số thập phân dùng dấu chấm, HS gõ 18,36 hay 18.36 đều đúng).
  - Diem: điểm tối đa của câu (trống: TN 0.25, DS 1, TLN 0.25). Tổng quy về thang 10.

## Quy trình một bài kiểm tra

1. Nạp đề: Claude tách đề Word → file Excel (một tab mỗi đợt + tab CAU HINH THEM) và đưa hình lên repo. GV: KHODEHOA → Tệp → Nhập → Tải lên → **Chèn trang tính mới** (không tích "nhập giao diện"), chép các dòng CAU HINH THEM xuống tab CAU HINH rồi xóa tab đó.
2. Trên lớp: trang giáo viên (ứng dụng "Kiểm tra Hóa học", có trang chủ + thanh menu Trang chủ · Đề kiểm tra · Hồ sơ HS · nút Mã QR) → bấm **Mã QR vào thi** để chiếu mã QR chung (dẫn tới LAM-BAI.html: HS chọn lớp, gõ SBD + mã GV như cũ; nút chuyển sang mã QR Xem lại bài). Mở phòng chờ, phát đề, đóng đề vẫn ở mục Đề kiểm tra như cũ: ① Mở phòng chờ → HS vào, đề tải sẵn (khóa mã) → ② Bắt đầu → ③ Đóng đề. Tùy chọn: nút "📺 Màn hình chiếu" trong từng đề = mã QR riêng của đề (điền sẵn lớp + đề + mã GV) và đồng hồ to, số em đã vào.
3. Nộp bài: chấm trên Apps Script, ghi tab BAI LAM, lưu PDF vào `BAI LAM HOC SINH/<lớp>/<mã đợt>/`.
4. Thi nhiều ca cùng một đề: hết ca → ③ Đóng đề → ① Mở phòng chờ (giờ của ca trước tự xóa) → ② Bắt đầu.
5. Sau khi các lớp thi xong: bật "Cho xem lại". Mỗi lần HS mở xem một bài được ghi vào tab XEM LAI; trang giáo viên (Theo dõi) hiện "Đã xem lại x/y" và "✓ đã xem lại <ngày giờ>" từng em.
6. Vắng thi: trang giáo viên → Theo dõi (nút "Ghi vắng" cạnh em chưa vào) hoặc 📋 Hồ sơ HS → bấm tên em → "Vắng có phép/không phép" + ghi chú; lưu tab VANG THI, bảng điểm hiện chữ V, khi em thi bù thì có nhãn "thi bù".
7. Làm lại: GV nhập MaLamLai trên iPad của em đó → ghi lần 2; bảng điểm lấy lần sau cùng.
8. Thống kê: menu 🤖 Phân tích AI trong sổ (thống kê đợt, AI phân tích lớp, gợi ý từng HS); trang giáo viên → 📋 Hồ sơ HS; tab BANG DIEM.
9. Đánh giá theo kiến thức: tab `KIEN THUC` trong KHODEHOA (MaDot | Cau | KienThuc = yêu cầu cần đạt | MucDo = Biết/Hiểu/Vận dụng). Trang giáo viên → Theo dõi → 🧭 Đánh giá theo kiến thức (kiến thức sai nhiều → ít, em cần hỗ trợ = đúng dưới 65%, AI nhận xét, so sánh lớp cùng đề, Excel); Hồ sơ HS → 🧭 Kiến thức (cộng dồn, so sánh khối) và mục kiến thức trong hồ sơ từng em. Khi nạp đề mới, Claude gửi kèm các dòng KIEN THUC.

## Nối với trò chơi (repo TRO--CHOI-IPAD)

- 7 trò cá nhân (Đại Nội Hóa 10/KHTN 9, Chim đưa thư, Đua xe F1 cá nhân, Đua xe Polymer cá nhân, Polymer F1, Leo Langbiang) gửi thêm mỗi lượt chơi vào tab HOAT DONG của sổ lớp (DungSai dạng "đúng/tổng") → Hồ sơ HS: cột 🎮 và mục "Trò chơi luyện tập".
- 4 trò nhóm (Chim đưa thư nhóm, Đua xe F1 nhóm, Đua xe Polymer nhóm, Ruộng lúa Chu kì nhóm) gửi vào tab TRO CHOI NHOM → Hồ sơ HS → 👥 Nhóm; GV ghi thành viên (tab NHOM) để kết quả nhóm hiện trong hồ sơ từng em.
- Tệp nối dùng chung: `noi-so-theo-doi.js` (đặt cùng `cau-hinh-lop.js` trước script chính của trò chơi). Sheet riêng của từng trò vẫn giữ nguyên.

## Lớp dùng thử DEMO

- Trang `DUNG-THU.html` (kèm `GIAM-KHAO.html`: hướng dẫn 7 bước in 1 tờ A4 cho ban giám khảo); các trang và trò chơi mở với `?demo` chỉ dùng lớp DEMO (SBD 26999901–10, mã xem 1101–1110).
- Kho đề bản sao `KHODEHOA DEMO` + sổ `SO THEO DOI DEMO` (hàm `taoHocSinhThu`), mã riêng: MaGV 1111, MaMoKhoa 2222, MaLamLai 3333, MaQuanLy 4444; trò chơi dùng thử: vào chơi 1111, mở khóa 2222.
- Link /exec của sổ DEMO ghi trong `cau-hinh-lop.js` (DS_LOP_DEMO).

## Khi sửa mã Apps Script

Gửi lại file đầy đủ. GV dán đè vào cả 5 sổ, dán lại `KHO_DE_ID` ở dòng 9, rồi **Triển khai → Quản lý → ✎ → Phiên bản mới → Triển khai**. Lớp nào báo "Yeu cau khong hop le" là chưa triển khai phiên bản mới. Hàm `kiemTra()` trong sổ in ra tên kho đề, danh sách đợt, mã nào có/thiếu.

## Giới hạn cần nhớ

- Google cho khoảng 30 lượt chạy cùng lúc mỗi tài khoản; phòng chờ + đề tải sẵn giúp 20–22 HS bắt đầu cùng lúc mà không quá tải.
- Rời màn hình khi làm bài: lần 1 khóa (GV nhập MaMoKhoa để mở), lần 2 tự nộp.

## Đề đã có trong kho (18/10/2026)

- Hóa 12: H12-C1-101, H12-C3-301, H12-C4-401, H12-C14-501 (khảo bài 15 phút); H12-C14-101/102/103/104 (kiểm tra 50 phút).
- Hóa 10: H10-B5-101/102/103/104, H10-B6-101, H10-B7-101, H10-B8-101 (H10-B5-LV đã bỏ, thay bằng H10-B5-104).
- Hóa 9 (9D01, 9D03): H9-B18-101/102, H9-B19-201/202, H9-B21-401/402.
10. Trò chơi quản lý chung (25/10/2026): tab `TRO CHOI` trong KHODEHOA (MaTro | TenTro | Kieu | Khoi | File | TrangThai | ThoiGian_phut | Lop, sổ tự tạo); tab MA thêm `MaTroChoi`, `MaMoKhoaTroChoi` (chưa đặt thì dùng tạm MaGV, MaMoKhoa). Trò chơi đăng nhập/mở khóa qua sổ lớp (`tc_vao`, `tc_mokhoa`), kết quả vào HOAT DONG / TRO CHOI NHOM. Các Sheet riêng của từng trò chỉ còn là lưu trữ cũ.
