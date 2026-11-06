# Quy ước soạn BỘ CÂU TRÒ CHƠI (kênh K1 – Ra đề)

Tải file này vào kênh K1 cùng `Quy-uoc-chung.md` và `Danh-muc-kien-thuc.md`. Khi giáo viên yêu cầu **"soạn bộ câu trò chơi"** cho một bài hoặc chủ đề, Claude soạn đúng quy ước dưới đây và gửi **một file Excel**. Giáo viên nạp ở trang giáo viên: **Trò chơi → 📥 Bộ câu trò chơi**.

## 1. Bộ câu dùng cho trò chơi nào

- Mọi trò dạng **khung** (hiện có: **Đua xe F1**, sau này thêm khung khác) đều dùng chung một bộ câu. Phần đồ họa và luật chơi giữ nguyên, chỉ thay nội dung.
- Nạp bộ câu của khối nào thì trò khung **của khối đó** chọn được bộ câu ấy.
- Trên bảng điều khiển, giáo viên chọn cho từng buổi: **bộ câu**, **cá nhân hay nhóm**, **số phút** (mặc định 5).

## 2. Một lượt chơi = 11 câu = 10 điểm

| Phần | Dạng | Số câu mỗi lượt | Điểm |
|---|---|---|---|
| I | Trắc nghiệm 4 phương án | 6 | 0.5 điểm/câu → 3 điểm |
| II | Đúng/Sai, mỗi câu 4 ý a b c d | 3 | 2 điểm/câu → 6 điểm. Đúng 1 ý: 0.3 · 2 ý: 0.7 · 3 ý: 1.2 · 4 ý: 2.0 |
| III | Trả lời ngắn (chỉ ghi số) | 2 | 0.5 điểm/câu → 1 điểm |

- Hết giờ thì dừng. Xong 11 câu trước giờ thì về đích sớm.
- Xếp hạng theo điểm. Bằng điểm thì ai (nhóm nào) xong nhanh hơn đứng trên.
- Kết quả lưu vào hồ sơ học sinh (cá nhân) hoặc kết quả nhóm, ghi rõ tên bộ câu.

## 3. Bộ câu gấp 5 lần một lượt

Mỗi bộ câu gồm **30 câu Phần I · 15 câu Phần II · 10 câu Phần III**. Mỗi lượt, máy bốc ngẫu nhiên 6 + 3 + 2 câu và ưu tiên các kiến thức khác nhau, nên chơi lại hay ngồi cạnh nhau ít khi trùng câu.

Trang nạp **chặn** bộ câu không đủ một lượt (dưới 6 · 3 · 2 câu) và **nhắc** bộ câu dưới chuẩn 30 · 15 · 10.

## 4. Nội dung

- **Lý thuyết bám sát SGK Kết nối tri thức** của đúng khối và bài; không có câu tính toán.
- Câu phải **ngắn**, vì khung câu hỏi trên màn hình đua xe nhỏ:
  - Câu dẫn Phần I: tối đa khoảng 200 ký tự.
  - Mỗi phương án: tối đa 80 ký tự.
  - Mỗi ý đúng/sai: tối đa 120 ký tự.
- **Phần II**: lời dẫn chung ngắn ("Cho các phát biểu về …"), 4 ý độc lập, có cả ý đúng và ý sai.
- **Phần III**: chỉ hỏi **đếm số lượng**, ví dụ "Có bao nhiêu chất…", "Có bao nhiêu phát biểu đúng…", "Số electron lớp ngoài cùng…". Đáp án là **số nguyên, tối đa 4 chữ số**, tránh số thập phân.
- Phần I: phương án nhiễu hợp lý; không dùng "Tất cả đều đúng/sai". Máy tự xáo thứ tự phương án, nên không viết "cả A và B".
- Dàn đều các bài hoặc mục trong chủ đề. Mỗi kiến thức có câu ở nhiều phần.
- Hạn chế hình. Chỉ dùng hình khi thật cần, và chỉ ở Phần I hoặc Phần II.
- Không lấy câu của đề kiểm tra **chưa thi**. Đáp án trò chơi có sẵn trên máy học sinh để chấm ngay, nên không dùng câu cần giữ bí mật.

## 5. File Excel

- Mỗi bộ câu là **một tab**. Một file có thể chứa nhiều bộ (nhiều tab).
- **Tên tab = mã bộ**: `TC-<khối>-<tên ngắn>`.
  - Khối viết là `H10`, `H11`, `H12` hoặc `K9` (KHTN 9).
  - Phần sau chỉ gồm chữ không dấu, số, dấu `-` `_` `.`.
  - Ví dụ: `TC-H10-C1` (Chương 1), `TC-H12-POLYMER`, `TC-K9-KIMLOAI`.
- Tên file: `BO-CAU-<mã bộ>.xlsx` (một bộ) hoặc `BO-CAU-<khối>-<ngày>.xlsx` (nhiều bộ).
- Dòng 1 là tiêu đề cột, đúng thứ tự sau:

| Cột | Tên cột | Phần I (trắc nghiệm) | Phần II (đúng/sai) | Phần III (trả lời ngắn) |
|---|---|---|---|---|
| A | `Cau` | `I.1` … `I.30` | `II.1` … `II.15` | `III.1` … `III.10` |
| B | `NoiDung` | câu dẫn | lời dẫn chung | câu hỏi |
| C–F | `A` `B` `C` `D` | 4 phương án | 4 ý a) b) c) d) (không ghi "a)") | để trống |
| G | `DapAn` | `A`/`B`/`C`/`D` | 4 chữ Đ/S theo thứ tự a→d, vd `ĐSĐS` | một số, vd `3` |
| H | `Hinh` | để trống, hoặc tên file hình `image1.png` | như Phần I | để trống |
| I | `KienThuc` | **bắt buộc**, đúng tên trong `Danh-muc-kien-thuc.md` | như Phần I | như Phần I |
| J | `MucDo` | **bắt buộc**: `Biết` / `Hiểu` / `Vận dụng` | như Phần I | như Phần I |
| K | `GiaiThich` | **bắt buộc**, vì sao đúng, vì sao sai (ngắn) | 4 phần ngăn bởi ` \| `: `a … \| b … \| c … \| d …` | cách đếm, liệt kê ra |
| L | `TenBo` | chỉ ghi ở **dòng 2**: tên bộ hiện cho học sinh, vd `Hóa 10 – Chương 1: Cấu tạo nguyên tử` | | |

- Công thức hóa học viết bằng chữ số dưới/trên Unicode (H₂SO₄, Fe³⁺, 1s²2s²2p⁶), không dùng HTML.
- Hình: tải lên GitHub thư mục `hinh/<mã bộ>/` như hình của đề kiểm tra.
- Số thập phân (nếu buộc phải có) dùng **dấu chấm**.

## 6. Mẫu vài dòng

| Cau | NoiDung | A | B | C | D | DapAn | KienThuc | MucDo | GiaiThich | TenBo |
|---|---|---|---|---|---|---|---|---|---|---|
| I.1 | Hạt mang điện tích âm trong nguyên tử là | electron | proton | neutron | hạt nhân | A | Thành phần nguyên tử: proton, neutron, electron (điện tích, khối lượng) | Biết | Electron mang điện âm; proton mang điện dương; neutron không mang điện. | Hóa 10 – Chương 1: Cấu tạo nguyên tử |
| II.1 | Cho các phát biểu về hạt nhân nguyên tử: | Hạt nhân gồm proton và neutron. | Neutron mang điện tích dương. | Khối lượng nguyên tử tập trung chủ yếu ở hạt nhân. | Hạt nhân có kích thước lớn hơn vỏ nguyên tử. | ĐSĐS | Thành phần nguyên tử: proton, neutron, electron (điện tích, khối lượng) | Hiểu | a Đúng: hạt nhân gồm p và n. \| b Sai: neutron không mang điện. \| c Đúng: khối lượng electron rất nhỏ. \| d Sai: hạt nhân rất nhỏ so với nguyên tử. | |
| III.1 | Cho các hạt: proton, neutron, electron, hạt nhân. Có bao nhiêu hạt mang điện? | | | | | 3 | Thành phần nguyên tử: proton, neutron, electron (điện tích, khối lượng) | Hiểu | Proton (+), electron (−), hạt nhân (+) ⇒ 3. | |

## 7. Claude tự soát trước khi gửi file

- [ ] Đủ 30 · 15 · 10 câu, số câu liên tục, không trùng.
- [ ] Mỗi câu Phần I có đúng 1 đáp án đúng; mỗi câu Phần II có 4 ý, đáp án 4 chữ Đ/S; mỗi câu Phần III có đáp án là số nguyên.
- [ ] Mọi câu có KienThuc, MucDo, GiaiThich. Tỉ lệ mức độ gợi ý: Biết khoảng 40%, Hiểu khoảng 40%, Vận dụng khoảng 20%.
- [ ] Không câu nào quá dài. Không có câu tính toán.
- [ ] Tên tab đúng mã bộ; ô L2 có tên bộ.
- [ ] Nội dung đúng SGK Kết nối tri thức của khối.

Trang nạp tự soát lại các lỗi trên: báo **Lỗi** thì không cho nạp, báo **Lưu ý** thì vẫn nạp được. Giáo viên xem lại toàn bộ câu trong mục **"Xem … câu"** trước khi bấm Nạp.
