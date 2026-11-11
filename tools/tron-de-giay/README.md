# Trộn đề giấy

Dùng ở kênh làm bài kiểm tra. Đầu vào: đề gốc 1 mã do kênh ra đề giao (`KHO-DE-…-201.xlsx` + đề Word). Đầu ra trong thư mục `--ra`:

- `KHO-DE-<tiền tố>-GIAY.xlsx`: các mã 2xx để nạp trên trang giáo viên.
- `DE-<mã>.docx` / `.pdf`: mỗi mã một đề in (Phần I–III đã trộn + Phần IV tự luận chép từ đề Word).
- `DAP-AN-<tiền tố>.docx` / `.pdf`: đáp án mọi mã + bảng đối chiếu câu gốc.

```
python3 tools/tron-de-giay/tron.py --kho KHO-DE-H12-HK1-201.xlsx --word H12-HK1-201.docx --so-ma 4 \
  --truong "TRƯỜNG THPT …" --lop "12G01, 12G02" --ra ra/
```

Cần: python-docx, openpyxl, Pillow, LibreOffice (`soffice`) để ra PDF. Quy ước: `tai-lieu-kenh/K1-Tron-de-giay.md`.
