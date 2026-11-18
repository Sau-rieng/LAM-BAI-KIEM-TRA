// Phiếu khảo sát học sinh về việc dùng Khám phá Hóa học (Tài khoản HS + làm bài/trò chơi trên iPad).
// Dùng chung cho XEM-LAI.html (HS làm) và GIAO-VIEN.html (thống kê). Sửa câu hỏi ở đây.
//  loai: mot (chọn 1) · nhieu (chọn nhiều) · dong (đồng ý 1–5, id bắt đầu bằng d_) · viet (tự viết)
//  Lưu ý: đổi id của câu đã có người trả lời sẽ làm mất thống kê câu đó.
window.KS_DONG = ['Rất không đồng ý', 'Không đồng ý', 'Phân vân', 'Đồng ý', 'Rất đồng ý'];
window.KS_PHAN = {
  A: 'Em dùng Tài khoản HS thế nào',
  B: 'Em đồng ý đến mức nào? (Tài khoản HS)',
  C: 'Làm bài kiểm tra và chơi trò chơi trên iPad',
  D: 'Tiến bộ của em',
  E: 'Em muốn nói thêm'
};
window.KS_CAU = [
  { id: 'tan', phan: 'A', loai: 'mot', hoi: 'Em vào Tài khoản HS bao lâu một lần?', chon: ['Gần như mỗi ngày', '1–2 lần mỗi tuần', 'Chỉ khi thầy/cô nhắc', 'Hầu như không vào'] },
  { id: 'may', phan: 'A', loai: 'mot', hoi: 'Em thường vào Tài khoản HS bằng máy nào?', chon: ['Điện thoại', 'iPad của trường', 'Máy tính', 'Máy tính bảng ở nhà'] },
  { id: 'muc', phan: 'A', loai: 'nhieu', hoi: 'Em hay dùng những mục nào? (chọn nhiều)', chon: ['Xem lại bài + 💡 Giải thích', 'Kiến thức cần ôn', 'Luyện lại phần yếu', 'Bảng điểm', 'Điểm TX', 'Hỏi thầy/cô', 'Tài nguyên (mô phỏng, thí nghiệm)', 'Nhãn vở'] },

  { id: 'd_de', phan: 'B', loai: 'dong', hoi: 'Trang dễ dùng, em dễ tìm thấy mục mình cần.' },
  { id: 'd_giai', phan: 'B', loai: 'dong', hoi: 'Phần lời giải 💡 giúp em hiểu vì sao mình làm sai.' },
  { id: 'd_kt', phan: 'B', loai: 'dong', hoi: 'Mục "Kiến thức cần ôn" chỉ đúng những phần em còn yếu.' },
  { id: 'd_luyen', phan: 'B', loai: 'dong', hoi: 'Luyện lại phần yếu giúp em làm tốt hơn ở bài kiểm tra sau.' },
  { id: 'd_diem', phan: 'B', loai: 'dong', hoi: 'Xem được bảng điểm và điểm TX giúp em tự theo dõi việc học của mình.' },
  { id: 'd_hoi', phan: 'B', loai: 'dong', hoi: 'Em thấy thoải mái khi hỏi thầy/cô qua mục Hỏi thầy/cô.' },

  { id: 'vao', phan: 'C', loai: 'mot', hoi: 'Vào (đăng nhập) bài kiểm tra / trò chơi trên iPad đối với em:', chon: ['Rất dễ', 'Dễ', 'Hơi khó', 'Rất khó'] },
  { id: 'suco', phan: 'C', loai: 'nhieu', hoi: 'Khi làm bài hoặc chơi trên iPad, em đã gặp sự cố nào? (chọn nhiều)', chon: ['Không vào được / phải nhập lại nhiều lần', 'Máy chậm, đứng hoặc tự thoát', 'Mất mạng giữa chừng', 'Bị khóa vì lỡ rời màn hình / chuyển tab', 'Chữ, hình, công thức nhỏ khó đọc', 'Bấm nhầm đáp án, khó sửa lại', 'Nộp xong không thấy điểm / kết quả', 'Hết giờ khi chưa làm xong', 'Không gặp sự cố nào'] },
  { id: 'd_doc', phan: 'C', loai: 'dong', hoi: 'Chữ, hình, công thức trên iPad rõ ràng, dễ đọc.' },
  { id: 'd_gio', phan: 'C', loai: 'dong', hoi: 'Thời gian làm bài kiểm tra trên iPad là đủ.' },
  { id: 'd_nhanh', phan: 'C', loai: 'dong', hoi: 'Được chấm ngay sau khi nộp giúp em biết kết quả sớm và thấy công bằng.' },
  { id: 'd_khoa', phan: 'C', loai: 'dong', hoi: 'Quy định khóa bài khi rời màn hình giúp bài làm công bằng.' },
  { id: 'd_cach', phan: 'C', loai: 'dong', hoi: 'Em hiểu cách chơi trò chơi ngay khi đọc hướng dẫn.' },
  { id: 'd_tro', phan: 'C', loai: 'dong', hoi: 'Trò chơi giúp em nhớ bài và thấy học Hóa vui hơn.' },
  { id: 'd_nhom', phan: 'C', loai: 'dong', hoi: 'Trò chơi nhóm giúp em cùng bạn thảo luận, hợp tác tốt hơn.' },
  { id: 'd_tap', phan: 'C', loai: 'dong', hoi: 'Làm bài trên iPad giúp em tập trung hơn làm trên giấy.' },
  { id: 'thich', phan: 'C', loai: 'mot', hoi: 'Em muốn làm bài kiểm tra bằng:', chon: ['iPad', 'Giấy', 'Cả hai đều được, tùy bài'] },
  { id: 'kieu', phan: 'C', loai: 'mot', hoi: 'Em thích kiểu trò chơi nào?', chon: ['Chơi cá nhân', 'Chơi nhóm', 'Cả hai'] },
  { id: 'y_ipad', phan: 'C', loai: 'viet', hoi: 'Khi làm bài hoặc chơi trên iPad, em muốn thay đổi điều gì?', tuy: true },

  { id: 'tien', phan: 'D', loai: 'mot', hoi: 'Từ khi dùng trang này, kết quả môn Hóa của em:', chon: ['Tiến bộ rõ', 'Tiến bộ một chút', 'Như cũ', 'Kém đi'] },
  { id: 'onnha', phan: 'D', loai: 'mot', hoi: 'Thời gian em tự ôn Hóa ở nhà so với trước:', chon: ['Nhiều hơn', 'Như cũ', 'Ít hơn'] },

  { id: 'y_thich', phan: 'E', loai: 'viet', hoi: 'Điều em thích nhất ở trang này là gì?' },
  { id: 'y_kho', phan: 'E', loai: 'viet', hoi: 'Điều gì làm em thấy khó, chưa thích, hoặc em đã gặp lỗi gì?', tuy: true },
  { id: 'y_them', phan: 'E', loai: 'viet', hoi: 'Em muốn thầy/cô thêm hoặc sửa gì để em học tốt hơn?', tuy: true }
];
