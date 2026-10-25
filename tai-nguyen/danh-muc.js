/* DANH MUC TAI NGUYEN HOC TAP (mo phong 3D, thi nghiem ao...) – hien trong Tai khoan hoc sinh -> Tai nguyen.
   Moi muc:
     ma       : ma tai nguyen, viet hoa khong dau, khong trung (vd 'H10-B3-OBITAN') – dung de dem luot xem
     ten      : ten hien tren the
     khoi     : '9' | '10' | '11' | '12'
     bai      : bai/chuong SGK Ket noi tri thuc (vd 'Bài 3: Cấu trúc lớp vỏ electron nguyên tử')
     loai     : 'Cấu trúc' | 'Thí nghiệm' | 'Hiện tượng' | 'Quy trình'
     kienthuc : kien thuc (yeu cau can dat) dung ten trong Danh-muc-kien-thuc.md
     mota     : 1 cau gioi thieu ngan
     file     : ten file HTML trong thu muc tai-nguyen/
     anh      : anh bia trong tai-nguyen/anh/ (jpg/png/svg, ngang 16:10, nho hon 80 KB); de '' thi tu ve bia
     an       : true = tam an (hoc sinh khong thay)
   Hoc sinh bam vao: may tai file ve TAM THOI (khong luu bo nho dem), dong lai la xoa khoi trang. */
window.TAI_NGUYEN = [
  { ma: 'H10-B12-LAI-HOA-CARBON', ten: 'Lai hóa sp³, sp², sp của carbon', khoi: '10', bai: 'Bài 12: Liên kết cộng hóa trị', loai: 'Cấu trúc',
    kienthuc: 'Sự lai hóa orbital sp, sp², sp³ và hình dạng phân tử', mota: 'Xoay mô hình ethane, ethylene, acetylene: xen phủ orbital tạo liên kết σ và π, góc liên kết.',
    file: 'H10-B12-LAI-HOA-CARBON.html', anh: 'anh/H10-B12-LAI-HOA-CARBON.jpg' },
  { ma: 'H10-B12-LAI-HOA-CH4', ten: 'Lai hóa sp³ – phân tử CH₄', khoi: '10', bai: 'Bài 12: Liên kết cộng hóa trị', loai: 'Quy trình',
    kienthuc: 'Sự lai hóa orbital sp, sp², sp³ và hình dạng phân tử', mota: '4 bước: AO 2s, 2p → 4 AO sp³ → H tiến lại → CH₄ tứ diện 109,5°, kèm sơ đồ ô lượng tử.',
    file: 'H10-B12-LAI-HOA-CH4.html', anh: 'anh/H10-B12-LAI-HOA-CH4.svg' },
  { ma: 'H10-B12-VSEPR-C2', ten: 'Mô hình VSEPR: C₂H₆, C₂H₄, C₂H₂', khoi: '10', bai: 'Bài 12: Liên kết cộng hóa trị', loai: 'Cấu trúc',
    kienthuc: 'Mô hình VSEPR và hình dạng phân tử', mota: 'Các vùng electron đẩy nhau: tứ diện, tam giác phẳng, đường thẳng; đo góc liên kết.',
    file: 'H10-B12-VSEPR-C2.html', anh: 'anh/H10-B12-VSEPR-C2.jpg' },
  { ma: 'H10-B12-CH3COCN-PHAN-TU', ten: 'Lai hóa trong CH₃–CO–CN (toàn phân tử)', khoi: '10', bai: 'Bài 12: Liên kết cộng hóa trị', loai: 'Cấu trúc',
    kienthuc: 'Sự lai hóa orbital sp, sp², sp³ và hình dạng phân tử', mota: 'C(1) sp³, C(2) sp², C(3) sp, O và N; chọn từng nguyên tử để xem sơ đồ ô lượng tử, σ và π.',
    file: 'H10-B12-CH3COCN-PHAN-TU.html', anh: 'anh/H10-B12-CH3COCN-PHAN-TU.svg' },
  { ma: 'H10-B12-CH3COCN-TUNG-CAP', ten: 'Từng cặp nguyên tử trong CH₃–CO–CN', khoi: '10', bai: 'Bài 12: Liên kết cộng hóa trị', loai: 'Quy trình',
    kienthuc: 'Liên kết σ và liên kết π', mota: '5 cặp nguyên tử tiến lại, obitan xen phủ trục (σ) và xen phủ bên (π); kéo thanh trượt để xem chậm.',
    file: 'H10-B12-CH3COCN-TUNG-CAP.html', anh: 'anh/H10-B12-CH3COCN-TUNG-CAP.svg' },
  { ma: 'H12-B6-IOD-TINH-BOT', ten: 'Vì sao iodine làm tinh bột hóa xanh tím?', khoi: '12', bai: 'Bài 6: Tinh bột và cellulose', loai: 'Thí nghiệm',
    kienthuc: 'Phản ứng màu của tinh bột với iodine', mota: 'Iodine chui vào lòng xoắn amylose; đun nóng mất màu, để nguội màu trở lại.',
    file: 'H12-B6-IOD-TINH-BOT.html', anh: 'anh/H12-B6-IOD-TINH-BOT.svg' },
  { ma: 'H12-B15-KEM-CUSO4', ten: 'Nhúng thanh kẽm vào dung dịch CuSO₄', khoi: '12', bai: 'Bài 15: Thế điện cực và nguồn điện hóa học', loai: 'Thí nghiệm',
    kienthuc: 'Cặp oxi hóa – khử của kim loại', mota: 'Zn nhường electron, Cu²⁺ nhận electron bám lên thanh kẽm; câu hỏi và gợi ý đáp án.',
    file: 'H12-B15-KEM-CUSO4.html', anh: 'anh/H12-B15-KEM-CUSO4.svg' },
  { ma: 'H12-B15-LOP-DIEN-KEP', ten: 'Lớp điện kép của điện cực kẽm', khoi: '12', bai: 'Bài 15: Thế điện cực và nguồn điện hóa học', loai: 'Cấu trúc',
    kienthuc: 'Thế điện cực chuẩn của kim loại', mota: 'Mô hình Hình 15.5: lớp electron dư và lớp ion Zn²⁺, cân bằng Zn²⁺ + 2e ⇌ Zn.',
    file: 'H12-B15-LOP-DIEN-KEP.html', anh: 'anh/H12-B15-LOP-DIEN-KEP.svg' },
  { ma: 'H12-B15-PIN-DANIELL', ten: 'Pin Daniell Zn – Cu hoạt động thế nào?', khoi: '12', bai: 'Bài 15: Thế điện cực và nguồn điện hóa học', loai: 'Hiện tượng',
    kienthuc: 'Cấu tạo và nguyên tắc hoạt động của pin Galvani', mota: '6 bước: cực âm, mạch ngoài, cực dương, cầu muối; thử mở khóa K, tháo cầu muối.',
    file: 'H12-B15-PIN-DANIELL.html', anh: 'anh/H12-B15-PIN-DANIELL.svg' },
  { ma: 'H12-B21-GANG-THEP', ten: 'Tinh thể gang và thép', khoi: '12', bai: 'Bài 21: Hợp kim', loai: 'Cấu trúc',
    kienthuc: 'Thành phần, tính chất và ứng dụng của gang, thép', mota: 'Mạng ferit, austenit, Fe₃C, graphit; kéo hàm lượng carbon để phân biệt gang và thép.',
    file: 'H12-B21-GANG-THEP.html', anh: 'anh/H12-B21-GANG-THEP.svg' }
];
