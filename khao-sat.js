// Phiếu khảo sát học sinh (10 câu, 4 phần). Dùng chung cho XEM-LAI.html (HS làm) và GIAO-VIEN.html (thống kê). Sửa câu hỏi ở đây.
//  loai: mot (chọn 1) · nhieu (chọn nhiều) · dong (đồng ý 1–5, id bắt đầu bằng d_) · viet (tự viết; tuy: true = không bắt buộc)
//  Lưu ý: đổi id của câu đã có người trả lời sẽ làm mất thống kê câu đó.
window.KS_DONG = ['Rất không đồng ý', 'Không đồng ý', 'Phân vân', 'Đồng ý', 'Rất đồng ý'];
window.KS_PHAN = {
  A: 'Làm bài kiểm tra và chơi trò chơi trên iPad',
  B: 'Tìm ra lỗi sai, biết phần mình còn yếu',
  C: 'Luyện tập ngay, nhớ bài lâu',
  D: 'Ứng dụng có giúp ích cho em không'
};
window.KS_CAU = [
  { id: 'd_ipad', phan: 'A', loai: 'dong', hoi: 'Làm bài trên iPad rõ ràng, dễ thao tác và được biết điểm ngay.' },
  { id: 'd_tro', phan: 'A', loai: 'dong', hoi: 'Trò chơi trên iPad giúp em nhớ bài và học Hóa vui hơn.' },

  { id: 'd_xem', phan: 'B', loai: 'dong', hoi: 'Xem lại bài (bảng màu từng câu, ảnh phiếu giấy, lời giải 💡) giúp em thấy ngay câu sai và hiểu vì sao sai.' },
  { id: 'd_yeu', phan: 'B', loai: 'dong', hoi: 'Sau mỗi bài, em biết rõ phần kiến thức nào mình còn yếu.' },

  { id: 'd_lamlai', phan: 'C', loai: 'dong', hoi: 'Làm lại câu sai nhiều lần giúp em nhớ cách làm đúng, ít mắc lại lỗi cũ.' },
  { id: 'd_hoi', phan: 'C', loai: 'dong', hoi: 'Khi lời giải chưa đủ, nút 💬 "Hỏi thầy/cô câu này" giúp em được giải đáp đúng câu mình còn thắc mắc.' },

  { id: 'tien', phan: 'D', loai: 'mot', hoi: 'Từ khi dùng ứng dụng này, kết quả môn Hóa của em:', chon: ['Tiến bộ rõ', 'Tiến bộ một chút', 'Như cũ', 'Kém đi'] },
  { id: 'onnha', phan: 'D', loai: 'mot', hoi: 'Thời gian em tự ôn Hóa ở nhà so với trước:', chon: ['Nhiều hơn', 'Như cũ', 'Ít hơn'] },
  { id: 'd_tiep', phan: 'D', loai: 'dong', hoi: 'Em muốn tiếp tục học với ứng dụng này.' },
  { id: 'y_thich', phan: 'D', loai: 'viet', hoi: 'Điều gì ở ứng dụng giúp ích cho em nhiều nhất? Em muốn thêm, sửa gì?', tuy: true }
];
