# Quy ước chung – tải vào MỌI kênh (K1–K9)

Giáo viên Hóa học, bộ Kết nối tri thức. Đề in đen trắng (hình dùng ký hiệu, gạch chéo, nét đứt; không dùng màu). Hướng dẫn từng bước cho người không chuyên tin, bằng tiếng Việt. Số thập phân dùng **dấu chấm** ở mọi nơi (điểm, đáp án, số liệu): 7.8, 18.36.

## Lớp đang dạy

| Lớp | Môn | 6 số đầu SBD |
| --- | --- | --- |
| 10E01 | Hóa 10 | 261001 |
| 12G01 | Hóa 12 | 261201 |
| 12G02 | Hóa 12 | 261202 |
| 9D01 | KHTN 9 | 260901 |
| 9D03 | KHTN 9 | 260903 |

Viết tên lớp đúng như bảng (không viết 12G2, 9D1, 9D3). Ngoài ra còn ra đề KHTN 8 tích hợp Lý–Hóa–Sinh, chấm phiếu bằng app QM.

## Mã học sinh

- Mã HS = SBD 8 số = 6 số đầu của lớp + số thứ tự 2 chữ số. Ví dụ 26100105 = lớp 10E01, số 05.
- Trên iPad học sinh chỉ gõ 2 số cuối; trang tự ghép 6 số đầu theo lớp đã chọn.
- Danh sách lớp nằm ở tab DANHSACH của Sổ theo dõi từng lớp (MAHS, HO TEN, GHI CHU, MAXEM). MAXEM là mã xem bài riêng của từng em.

## Mã đợt kiểm tra (cũng là tên file đề)

Quy tắc: `H<khối>-B<số bài>-<mã đề>`; đề theo chương thì `H<khối>-C<chương>-<mã đề>` (C14 = chương 1–4).

| Ví dụ | Nghĩa |
| --- | --- |
| `H9-B18-101` | Hóa 9, Bài 18, mã đề 101 |
| `H10-B6-101` | Hóa 10, Bài 6, mã đề 101 |
| `H12-C14-101` | Hóa 12, chương 1–4, mã đề 101 |

- Mã đề 3 chữ số, in trên đề và trùng mã khai báo trong app QM. Cùng một bài thì các mã khác nhau (101, 102…); khác bài có thể trùng.
- Đặt tên file Word đúng bằng mã đợt: `H9-B18-101.docx`.
- Tên bài (cột TenBai): `Hóa 9 – Bài 18: Tính chất chung của kim loại – Mã 101`.
- Mã đợt là tên tab đề trong kho đề, tên thư mục ảnh `hinh/<mã đợt>/` và tên thư mục PDF bài làm, nên chỉ dùng chữ không dấu, số và dấu gạch ngang.
- Khảo bài và kiểm tra cùng phạm vi phân biệt bằng dãy mã đề (vd chương 1–4: khảo bài 501, kiểm tra 101–104) và ghi rõ trong tên bài.
- Phiếu ôn tập / củng cố lỗ hổng đưa lên iPad (kênh K7) dùng dãy mã 9xx, vd `H10-B5-901`; tên bài ghi rõ "Phiếu củng cố".

## Kiến thức và mức độ của từng câu hỏi

Mọi câu hỏi Claude soạn (đề kiểm tra, khảo bài, câu hỏi trò chơi, phiếu học tập) đều gắn **Kiến thức** (yêu cầu cần đạt, lấy đúng tên trong `Danh-muc-kien-thuc.md`) và **Mức độ** (Biết / Hiểu / Vận dụng). Đề kiểm tra ghi trong bảng KIẾN THỨC sau đáp án (xem `Mau-dinh-dang-de.md`). Khi nạp kho đề, Claude gửi kèm các dòng cho tab `KIEN THUC` của KHODEHOA. Kiến thức mới thì thêm vào danh mục để các kênh dùng chung một tên.

## Dữ liệu ở đâu

| Thứ | Nơi lưu |
| --- | --- |
| Sổ theo dõi | Mỗi lớp một Google Sheet `SO THEO DOI <lớp>`; tab DANHSACH, BAI LAM, BAT DAU, PHONG CHO, HOAT DONG, TRO CHOI NHOM, NHOM, XEM LAI, VANG THI, BANG DIEM |
| Kho đề | Một Google Sheet chung `KHODEHOA`; tab CAU HINH, MA, KIEN THUC, mỗi đợt một tab |
| Bài làm PDF | Google Drive: `BAI LAM HOC SINH/<lớp>/<mã đợt>/` |
| Trang kiểm tra iPad | Repo GitHub `Sau-rieng/LAM-BAI-KIEM-TRA` → https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/ |
| Trò chơi, mô phỏng 3D | Repo GitHub `Sau-rieng/TRO--CHOI-IPAD` (trang mục lục MUCLUC.html) |

Bảng điểm tổng hợp: tab BANG DIEM trong Sổ theo dõi (điểm mỗi bài = lần làm sau cùng).

## Gửi dữ liệu hoạt động (game, mô phỏng) về Sổ theo dõi

Mỗi lớp có một link Apps Script `/exec` (danh sách trong file `cau-hinh-lop.js` của repo LAM-BAI-KIEM-TRA). Trang gửi:

```
POST <link /exec của lớp>
{"loai":"hoatdong","mahs":"26100105","mahoatdong":"H10-B5-GAME1",
 "cauhoi":"Câu 3","solanthu":2,"dungsai":"dung","thoigian":45}
```

Dòng được ghi vào tab HOAT DONG của lớp đó. Học sinh chọn lớp + gõ 2 số cuối SBD như trang kiểm tra.

## Bảo mật

- Đáp án chỉ nằm trong KHODEHOA và được chấm trên Apps Script; không đưa đáp án vào trang web hay repo công khai.
- Các mã MaGV, MaMoKhoa, MaLamLai, MaQuanLy và khóa Gemini chỉ nằm trong tab MA của KHODEHOA. Không ghi chúng vào kênh, trang web hay repo.

## Tên cuộc trò chuyện

`Lớp – Bài/Chủ đề – Việc`, ví dụ `10E01 – Bài 5 Cấu tạo BTH – Đề 15p`.
