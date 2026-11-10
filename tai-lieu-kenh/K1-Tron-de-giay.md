# Quy ước TRỘN ĐỀ GIẤY (kênh ra đề K9, K10, K12)

Tải file này vào kênh ra đề cùng `Quy-uoc-chung.md`, `K1-Ra-de.md`, `Danh-muc-kien-thuc.md`. Khi giáo viên yêu cầu **"trộn đề giấy"** cho một đề, Claude trộn đúng quy ước dưới đây và gửi **một file Excel** `KHO-DE-<mã bài>-GIAY.xlsx`. Giáo viên nạp ở trang giáo viên: **Kiểm tra → 📥 Nạp đề mới**. Đề giấy in ra giấy, học sinh tô phiếu trả lời, giáo viên quét phiếu bằng điện thoại để chấm.

## 1. Cấu trúc đề (theo phiếu trả lời)

| Phần | Dạng | Tối đa (sức chứa phiếu) |
|---|---|---|
| I | Trắc nghiệm 4 phương án A–D | 40 câu |
| II | Đúng/Sai, mỗi câu 4 ý a b c d | 8 câu |
| III | Trả lời ngắn, đáp án là **số** | 6 câu |

- Số câu mỗi phần và điểm mỗi câu theo yêu cầu giáo viên. Tổng điểm **không bắt buộc** bằng 10 (ví dụ đề có thêm phần tự luận chấm tay).
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
- **Không** trộn phương án ở câu có "Cả A và B", "Tất cả các phương án trên", "A và C"…: giữ nguyên thứ tự phương án của câu đó.
- **Câu chùm** (nhiều câu dùng chung một dữ kiện): giữ các câu đó liền nhau, đúng thứ tự gốc; chỉ di chuyển cả chùm.
- Đề KHTN tích hợp: sau khi trộn, các môn Lý – Hóa – Sinh phải **xen kẽ**, không để nhiều câu cùng môn liền nhau.

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

Tab `KIEN THUC THEM` (`MaDot | Cau | KienThuc | MucDo`) và `GIAI THICH THEM` (`MaDot | Cau | GiaiThich`): **mỗi mã đề đủ mọi câu**, `Cau` theo số câu của mã đó. Lời giải Phần I viết theo **chữ cái của mã đó** (đã đổi sau khi trộn).

## 5. Trang nạp tự kiểm (lỗi thì không cho nạp)

- Mã đề phải là 2xx; mỗi phần không vượt 40 · 8 · 6 câu; thứ tự phần I → II → III.
- Câu nào cũng có `Goc` đúng dạng; không hai câu cùng câu gốc; mã nào cũng đủ các câu gốc.
- Cùng câu gốc ở các mã phải: cùng nội dung câu dẫn, cùng bộ phương án, đáp án trỏ cùng phương án đúng; ý Đ/S khớp thứ tự ghi ở `Goc`; cùng đáp án Phần III, cùng điểm, cùng kiến thức.

## 6. Claude tự soát trước khi gửi file

- [ ] Đủ 4 mã (hoặc số mã giáo viên yêu cầu), tên tab đúng `…-201` … `…-204`.
- [ ] Đã sửa `DapAn` sau khi trộn phương án/ý; đối chiếu lại từng mã với đề gốc.
- [ ] Cột `Goc` có ở mọi câu; câu Đ/S ghi đúng thứ tự ý.
- [ ] Điểm từng câu đúng yêu cầu giáo viên; `ThangDS` đúng khối giáo viên yêu cầu.
- [ ] Mỗi mã đủ kiến thức, mức độ, lời giải cho mọi câu.
