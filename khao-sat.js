// Phiếu khảo sát học sinh (15 câu, 3 phần). Dùng chung cho XEM-LAI.html (HS làm) và GIAO-VIEN.html (thống kê). Sửa câu hỏi ở đây.
//  loai: mot (chọn 1) · nhieu (chọn nhiều) · dong (đồng ý 1–5, id bắt đầu bằng d_) · viet (tự viết; tuy: true = không bắt buộc)
//  Lưu ý: đổi id của câu đã có người trả lời sẽ làm mất thống kê câu đó.
window.KS_DONG = ['Rất không đồng ý', 'Không đồng ý', 'Phân vân', 'Đồng ý', 'Rất đồng ý'];
window.KS_PHAN = {
  A: 'Dùng iPad trên lớp (kiểm tra, trò chơi)',
  B: 'Tài khoản học sinh',
  C: 'Ứng dụng có giúp ích cho em không'
};
window.KS_CAU = [
  { id: 'vao', phan: 'A', loai: 'mot', hoi: 'Vào (đăng nhập) bài kiểm tra / trò chơi trên iPad đối với em:', chon: ['Rất dễ', 'Dễ', 'Hơi khó', 'Rất khó'] },
  { id: 'suco', phan: 'A', loai: 'nhieu', hoi: 'Khi làm bài hoặc chơi trên iPad, em đã gặp sự cố nào? (chọn nhiều)', chon: ['Không vào được / phải nhập lại nhiều lần', 'Máy chậm, đứng hoặc mất mạng', 'Bị khóa vì lỡ rời màn hình', 'Chữ, hình nhỏ khó đọc', 'Hết giờ khi chưa làm xong', 'Không gặp sự cố nào'] },
  { id: 'd_ipad', phan: 'A', loai: 'dong', hoi: 'Làm bài trên iPad rõ ràng, dễ thao tác và được biết điểm ngay.' },
  { id: 'd_tro', phan: 'A', loai: 'dong', hoi: 'Trò chơi trên iPad giúp em nhớ bài và học Hóa vui hơn.' },
  { id: 'thich', phan: 'A', loai: 'mot', hoi: 'Em muốn làm bài kiểm tra bằng:', chon: ['iPad', 'Giấy', 'Cả hai đều được, tùy bài'] },

  { id: 'tan', phan: 'B', loai: 'mot', hoi: 'Em vào Tài khoản học sinh bao lâu một lần?', chon: ['Gần như mỗi ngày', '1–2 lần mỗi tuần', 'Chỉ khi thầy/cô nhắc', 'Hầu như không vào'] },
  { id: 'muc', phan: 'B', loai: 'nhieu', hoi: 'Em hay dùng những mục nào? (chọn nhiều)', chon: ['Xem lại bài + 💡 Giải thích', 'Kiến thức cần ôn + Luyện lại phần yếu', 'Bảng điểm, điểm TX', 'Tài nguyên (kho mô phỏng, thí nghiệm)', 'Hỏi thầy/cô'] },
  { id: 'd_xem', phan: 'B', loai: 'dong', hoi: 'Xem lại bài làm và lời giải 💡 giúp em hiểu vì sao mình sai.' },
  { id: 'd_luyen', phan: 'B', loai: 'dong', hoi: '"Kiến thức cần ôn" và "Luyện lại phần yếu" giúp em ôn đúng chỗ em còn yếu.' },
  { id: 'd_tt', phan: 'B', loai: 'dong', hoi: 'Bảng điểm, điểm TX và kho tài nguyên giúp em tự theo dõi và tự học.' },

  { id: 'tien', phan: 'C', loai: 'mot', hoi: 'Từ khi dùng ứng dụng này, kết quả môn Hóa của em:', chon: ['Tiến bộ rõ', 'Tiến bộ một chút', 'Như cũ', 'Kém đi'] },
  { id: 'onnha', phan: 'C', loai: 'mot', hoi: 'Thời gian em tự ôn Hóa ở nhà so với trước:', chon: ['Nhiều hơn', 'Như cũ', 'Ít hơn'] },
  { id: 'd_tiep', phan: 'C', loai: 'dong', hoi: 'Em muốn tiếp tục học với ứng dụng này.' },
  { id: 'y_thich', phan: 'C', loai: 'viet', hoi: 'Điều gì ở ứng dụng giúp ích cho em nhiều nhất?' },
  { id: 'y_them', phan: 'C', loai: 'viet', hoi: 'Điều gì làm em thấy khó, hoặc em muốn thầy/cô thêm, sửa gì?', tuy: true }
];
