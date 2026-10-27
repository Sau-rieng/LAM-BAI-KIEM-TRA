# K1 – Ra đề có hình ảnh (đề giấy + đề iPad, một nguồn)

Tải file này vào kênh K1, cùng `Quy-uoc-chung.md`, `Mau-dinh-dang-de.md`, `Danh-muc-kien-thuc.md`.

## Mỗi đề Claude giao ra 3 thứ

| Thứ | Tên file | Dùng để |
| --- | --- | --- |
| Đề Word | `<mã đợt>.docx` (vd `H10-B10-101.docx`) | In cho học sinh (trang đề) + giữ trang ĐÁP ÁN, BẢNG KIẾN THỨC cho giáo viên |
| File nạp kho | `KHO-DE-<mã đợt>.xlsx` | Nhập vào KHODEHOA: tab đề + `CAU HINH THEM` + `KIEN THUC THEM` |
| Hình | `hinh/<mã đợt>/image1.png…` trong repo LAM-BAI-KIEM-TRA | Hiện hình khi làm bài trên iPad (Claude tự đưa lên) |

Một đề soạn một lần dùng được cả giấy (app QM) lẫn iPad.

## Cấu trúc đề Word (bắt buộc)

1. Trang đề: tiêu đề, PHẦN I (TN) – PHẦN II (Đ/S, 4 ý a–d) – PHẦN III (trả lời ngắn), "Câu 1." in đậm, phương án "A." … "D." in đậm, ý "a)" … "d)" in đậm, hình dùng chung có chú thích nghiêng `Hình 1. …`, kết thúc `----- HẾT -----`.
2. Trang mới: ĐÁP ÁN (bảng Phần I, II, III như `Mau-dinh-dang-de.md`).
3. Trang mới: BẢNG KIẾN THỨC: Câu | Kiến thức (yêu cầu cần đạt) | Mức độ, cuối bảng ghi tổng số câu mỗi mức. Kiến thức chép đúng tên trong `Danh-muc-kien-thuc.md`; bài mới thì đặt 3–6 kiến thức và gửi kèm đoạn bổ sung danh mục.

Khi in cho học sinh: chỉ in trang đề (trang 1 đến trang có chữ HẾT).

## Điểm và thời gian (mặc định)

| Loại đề | Số câu | Điểm mỗi câu | Thời gian |
| --- | --- | --- | --- |
| Khảo bài ngắn (như đề Hóa 9 đang có) | 8: 4 TN · 2 Đ/S · 2 TLN | TN 0.5 · Đ/S 1 · TLN 0.25 (tự quy về thang 10) | 7–15 phút |
| Khảo bài | 20: 14 TN · 2 Đ/S · 4 TLN | TN 0.5 · Đ/S 1 · TLN 0.25 | 15 phút |
| Kiểm tra | 28: 18 TN · 4 Đ/S · 6 TLN | TN 0.25 · Đ/S 1 · TLN 0.25 | 45–50 phút |

Tỉ lệ mức độ gợi ý: kiểm tra ~40% Biết · 30% Hiểu · 30% Vận dụng; khảo bài có thể nhiều Hiểu, ít nhất 2–3 câu Vận dụng.

## Hình vẽ

- Đen trắng: nét liền, nét đứt, gạch chéo, kí hiệu; không dùng màu để phân biệt.
- Chữ trong hình đủ lớn khi in A4 (≥ 10 pt), không lộ đáp án.
- Hình là ảnh PNG chèn vào Word (không vẽ bằng Shapes).

## Kiểm tra trước khi giao

- Mỗi câu: đúng khoa học, một đáp án duy nhất; số liệu tính lại ra đúng đáp án.
- Đáp án Phần I phân bố đều A–D, không lặp quá 3 lần liền.
- Chạy thử tách đề (Word → kho): đủ số câu, đủ đáp án, đủ nhãn kiến thức, không có kiến thức lạ ngoài danh mục.
- Mã đợt theo `Quy-uoc-chung.md`: `H<khối>-B<bài>-<mã đề>`; khảo bài và kiểm tra cùng phạm vi phân biệt bằng dãy mã đề (vd khảo bài 501, kiểm tra 101–104); phiếu ôn/bù đưa lên iPad dùng dãy 9xx.

## Nạp đề vào kho (giáo viên)

1. KHODEHOA → Tệp → Nhập → Tải lên `KHO-DE-<mã đợt>.xlsx` → **Chèn trang tính mới**.
2. Chép dòng trong `CAU HINH THEM` xuống cuối tab CAU HINH; chép các dòng trong `KIEN THUC THEM` xuống cuối tab KIEN THUC.
3. Xóa 2 tab `… THEM`. Trang giáo viên → Đề kiểm tra: đề mới hiện ở khối tương ứng.

## Đề mẫu đã làm

`H10-B10-101` – Hóa 10 Bài 10 Quy tắc octet, khảo bài 15 phút, 20 câu (Biết 5 · Hiểu 12 · Vận dụng 3), 1 hình, lớp 10E01.
