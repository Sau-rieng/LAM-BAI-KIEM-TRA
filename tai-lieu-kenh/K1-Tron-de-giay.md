# Quy ước ĐỀ GIẤY và TRỘN ĐỀ

**Phân việc:**

- **Kênh ra đề (K9, K10, K12)** chỉ soạn **đề gốc 1 mã** (mã `…-201`) theo `K1-Ra-de.md`, mục "Đề giấy". Kênh ra đề **không trộn**.
- **Kênh TRỘN ĐỀ** (project riêng) nhận đề gốc, trộn thành 4 mã, làm đáp án và file nạp bằng công cụ `tron.py` (tải sẵn vào kênh). Giáo viên tải file về rồi nạp lên trang giáo viên.

Giáo viên nạp file Excel ở trang giáo viên (**Kiểm tra → 📥 Nạp đề mới**), in đề, học sinh tô phiếu trả lời, giáo viên quét phiếu bằng điện thoại để chấm.

## 0. Giáo viên mang đến kênh TRỘN ĐỀ

1. `KHO-DE-<khối>-<bài>-201.xlsx` (đề gốc: tab đề có cột Goc trống cũng được, `CAU HINH THEM`, `KIEN THUC THEM`, `GIAI THICH THEM`, và `TU LUAN THEM` nếu đề có tự luận).
2. `<khối>-<bài>-201.docx` (đề Word gốc; có PHẦN IV tự luận thì để ở cuối, trước dòng HẾT).
3. Hình: công cụ tự lấy hình trong file Word gốc (hình đặt tên image1.png… theo đúng thứ tự trong Word). Hình trên iPad vẫn do kênh ra đề đưa lên `hinh/<mã>-201/`.
4. Một câu dặn: số mã (mặc định 4), lớp, trường/kỳ thi in ở đầu đề, mã 201 giữ nguyên thứ tự gốc hay trộn luôn.

Chạy: `python3 tron.py --kho KHO-DE-….xlsx --word ….docx --so-ma 4 --truong "TRƯỜNG THPT …" --lop "12G01, 12G02" --ra ra/`. Công cụ in ra cảnh báo (lời giải không đổi được chữ cái, thiếu hình, thiếu kiến thức…): xử lý hết cảnh báo rồi mới gửi.

## 1. Cấu trúc đề (theo phiếu trả lời)

| Phần | Dạng | Tối đa (sức chứa phiếu) |
|---|---|---|
| I | Trắc nghiệm 4 phương án A–D | 40 câu |
| II | Đúng/Sai, mỗi câu 4 ý a b c d | 8 câu |
| III | Trả lời ngắn, đáp án là **số** | 6 câu |

- Số câu mỗi phần theo yêu cầu giáo viên. Điểm ghi theo mặc định; giáo viên tự chỉnh lại trên trang giáo viên (🎯 Điểm từng phần). Tổng điểm **không bắt buộc** bằng 10 (ví dụ đề có thêm phần tự luận chấm tay).
- Thang câu đúng/sai (cột `ThangDS`):
  - `K10`: đúng 1/2/3/4 ý được 0.2 / 0.4 / 0.7 / 1 × điểm câu.
  - `K12` (thang Bộ): đúng 1/2/3/4 ý được 0.1 / 0.25 / 0.5 / 1 × điểm câu.
  - Hoặc ghi 4 số tự chọn, ví dụ `0.2;0.4;0.7;1`.
- Đáp án Phần III viết số, **dấu chấm** thập phân. Số phải tô được trên phiếu: tối đa 4 kí tự gồm chữ số, dấu "−" và dấu phẩy.

## 2. Mã đề

- Thường trộn **4 mã**: `201`, `202`, `203`, `204` (dãy 2xx dành riêng cho đề giấy).
- Tên tab = mã đợt: `H<khối>-B<bài>-2xx`, ví dụ `H10-B18-201` … `H10-B18-204`. Các mã cùng phần trước `-2xx` là **một đợt**.

## 3. Cách trộn

- **Trộn thứ tự câu trong từng phần**, không đưa câu sang phần khác.
- **Phần I**: trộn thứ tự 4 phương án, rồi sửa cột `DapAn` cho đúng chữ cái mới.
- **Phần II**: trộn thứ tự 4 ý a–d, rồi sửa `DapAn` (4 chữ Đ/S) theo thứ tự ý mới.
- **Phần III**: chỉ trộn thứ tự câu.
- **Không** trộn phương án ở câu có (công cụ tự nhận ra) "Cả A và B", "Tất cả các phương án trên", "A và C"…: giữ nguyên thứ tự phương án của câu đó.
- **Câu chùm** (nhiều câu dùng chung một dữ kiện): giữ các câu đó liền nhau, đúng thứ tự gốc; chỉ di chuyển cả chùm. Kênh ra đề đánh dấu bằng cột `Nhom` (cột L, cùng tên chùm, vd `C1`) ở đề gốc.
- Đề KHTN tích hợp: sau khi trộn, các môn Lý – Hóa – Sinh phải **xen kẽ**, không để nhiều câu cùng môn liền nhau (xem lại thứ tự sau khi chạy công cụ).
- Mã `201` mặc định **giữ nguyên thứ tự gốc**; `202`… trộn.

## 4. File Excel

Tab mỗi mã đề, dòng 1 đúng thứ tự (như đề thường, thêm cột K):

`Cau | NoiDung | A | B | C | D | DapAn | Hinh | Loai | Diem | Goc`

- `Cau`: số câu **trong mã đề này**: `I.1`, `I.2`… `II.1`… `III.1`…, xếp Phần I → II → III.
- `Goc`: câu gốc (câu trong đề trước khi trộn), **bắt buộc**:
  - Phần I, III: `I.7`, `III.2`.
  - Phần II: thêm thứ tự ý sau dấu `:`. Ví dụ `II.2:cadb` nghĩa là ý a của câu trộn là ý c của câu gốc, ý b là ý a gốc, ý c là ý d gốc, ý d là ý b gốc. Không trộn ý thì ghi `II.2:abcd` hoặc `II.2`.
- `Hinh`: như đề thường (URL hoặc tên file). Câu có hình thì mã nào cũng ghi hình ở đúng dòng câu đó.

Tab `CAU HINH THEM`:

`MaDot | TenBai | ThoiGian_phut | TrangThai | ChoXemLai | Lop | Kieu | ThangDS`

- Mỗi mã một dòng. `Kieu` = `GIAY`. `ThangDS` = `K10` hoặc `K12` (các mã cùng đợt giống nhau). `TrangThai` = `DONG`, `ChoXemLai` = `KHONG`.

Tab `TU LUAN THEM` (`MaDot | Cau | NoiDung | Hinh | Diem | LoiGiai`, xem `K1-Ra-de.md`): tự luận giống nhau ở mọi mã, **mỗi mã một bộ dòng** (công cụ trộn tự chép). Thiếu tab này thì học sinh không xem được lời giải tự luận; công cụ báo cảnh báo.

Tab `KIEN THUC THEM` (`MaDot | Cau | KienThuc | MucDo`) và `GIAI THICH THEM` (`MaDot | Cau | GiaiThich`): **mỗi mã đề đủ mọi câu**, `Cau` theo số câu của mã đó. Lời giải Phần I viết theo **chữ cái của mã đó** (đã đổi sau khi trộn).

## 5. Trang nạp tự kiểm (lỗi thì không cho nạp)

- Mã đề phải là 2xx; mỗi phần không vượt 40 · 8 · 6 câu; thứ tự phần I → II → III.
- Câu nào cũng có `Goc` đúng dạng; không hai câu cùng câu gốc; mã nào cũng đủ các câu gốc.
- Cùng câu gốc ở các mã phải: cùng nội dung câu dẫn, cùng bộ phương án, đáp án trỏ cùng phương án đúng; ý Đ/S khớp thứ tự ghi ở `Goc`; cùng đáp án Phần III, cùng điểm, cùng kiến thức.

## 6. File gửi giáo viên

Ngoài file Excel nạp kho, gửi kèm để in:

- **Mỗi mã đề 1 file Word và 1 file PDF**: `DE-<mã đợt>.docx` và `DE-<mã đợt>.pdf` (vd `DE-H12-HK1-202.docx`, `DE-H12-HK1-202.pdf`).
  - Khổ A4, chữ Times New Roman, in đen trắng; đầu đề như đề của Bộ, ô "Mã đề 2xx" bên phải, dòng họ tên, số báo danh.
  - Đủ Phần I, II, III theo thứ tự đã trộn, phần tự luận (nếu có) giống nhau ở mọi mã, có hình và bảng.
  - Chân trang "Mã đề 2xx – Trang n", số trang đánh từ 1 ở mỗi mã.
- **1 file đáp án** Word và PDF: đáp án mọi mã theo từng phần, kèm bảng đối chiếu câu của từng mã về câu gốc.

## 7. Claude (kênh TRỘN ĐỀ) tự soát trước khi gửi file

- [ ] Đủ 4 mã (hoặc số mã giáo viên yêu cầu), tên tab đúng `…-201` … `…-204`.
- [ ] Đã sửa `DapAn` sau khi trộn phương án/ý; đối chiếu lại từng mã với đề gốc.
- [ ] Cột `Goc` có ở mọi câu; câu Đ/S ghi đúng thứ tự ý.
- [ ] Điểm từng câu đúng yêu cầu giáo viên; `ThangDS` đúng khối giáo viên yêu cầu.
- [ ] Mỗi mã đủ kiến thức, mức độ, lời giải cho mọi câu.
- [ ] Đủ file Word + PDF cho từng mã và file đáp án; mở file PDF xem lại hình, bảng, số trang.
- [ ] Đề có tự luận thì file nạp có tab `TU LUAN THEM` đủ các mã.
- [ ] Công cụ không còn cảnh báo (hoặc đã sửa tay phần cảnh báo).
