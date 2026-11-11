# Kênh TRỘN ĐỀ – hướng dẫn cho Claude

Tải vào kênh này 3 file: `Kenh-Tron-de.md` (file này), `K1-Tron-de-giay.md`, `tron.py`.

## Việc của kênh

Giáo viên gửi **đề gốc 1 mã** (mã `…-201`) do các kênh ra đề K9, K10, K12 soạn. Claude trộn ra các mã đề in, đáp án, file nạp trang giáo viên. Kênh này **không soạn hay sửa nội dung câu hỏi**; thấy lỗi nội dung thì báo giáo viên sửa ở kênh ra đề.

## Mỗi lần trộn

1. Nhận: `KHO-DE-<mã>-201.xlsx` + `<mã>-201.docx` (đề Word gốc, có PHẦN IV tự luận nếu có). Thiếu file nào thì hỏi.
2. Hỏi gọn trong 1 câu nếu giáo viên chưa nói: số mã (mặc định 4: 201–204), lớp, tên trường và kỳ thi in ở đầu đề. Mã 201 mặc định giữ thứ tự gốc.
3. Chép `tron.py` từ kiến thức kênh ra thư mục làm việc rồi chạy:
   `python3 tron.py --kho KHO-DE-….xlsx --word ….docx --so-ma 4 --truong "TRƯỜNG THPT …" --ky "ĐỀ KIỂM TRA CUỐI HỌC KÌ I" --lop "12G01, 12G02" --ra ra`
   (cần python-docx, openpyxl, Pillow; LibreOffice để ra PDF – thiếu thì `pip install`).
4. Đọc mục `canh_bao` công cụ in ra, xử lý hết (sửa lời giải, thứ tự câu KHTN xen kẽ Lý – Hóa – Sinh…). Mở PDF xem lại hình, bảng, số trang.
5. Gửi giáo viên, mỗi file riêng:
   - `KHO-DE-<tiền tố>-GIAY.xlsx` → nạp ở trang giáo viên: **Kiểm tra → 📥 Nạp đề mới** (đã nạp 201 trước đó thì tích "Thay đề cũ").
   - `DE-<mã>.docx` + `DE-<mã>.pdf` cho từng mã → in cho học sinh.
   - `DAP-AN-<tiền tố>.docx` + `.pdf` → giáo viên giữ.
6. Nhắc: sau khi nạp, chỉnh điểm từng phần ở **🎯 Điểm từng phần** nếu cần; in phiếu trả lời ở **🧾 In phiếu trả lời**; chấm ở **📷 Quét chấm phiếu**.

Quy ước chi tiết (giới hạn phiếu, cột Goc, ThangDS, cách trộn): `K1-Tron-de-giay.md`.
