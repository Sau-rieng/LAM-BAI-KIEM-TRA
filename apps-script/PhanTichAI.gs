// =====================================================================
// PHAN TICH AI - Khoi 4 (thong ke + tri tue nhan tao)
// Dan file nay vao CUNG du an Apps Script voi SoTheoDoi.gs
// (Tien ich -> Apps Script -> dau + -> Tap lenh -> dat ten PhanTichAI).
//
// Mo file SO THEO DOI se thay menu "🤖 Phân tích AI":
//   1. Thống kê một đợt      -> tab "TK <MaDot>"   (khong dung AI)
//   2. AI phân tích cả lớp   -> tab "AI <MaDot>"   + de on tap "<MaDot>-OT" trong KHO DE (trang thai DONG)
//   3. AI gợi ý từng học sinh -> tab "GOI Y <MaDot>" (GV duyet, tich o ChoHSXem thi HS moi thay o trang XEM-LAI)
//   4. Làm tất cả 3 bước
//   5. Kiểm tra kết nối AI
//
// AI dung: Google Gemini (mien phi). Khoa API dat o tab MA cua KHO DE, dong "GeminiKey".
// BAO MAT: KHONG gui ho ten hoc sinh cho AI - chi gui ma HS, diem va cau sai.
// =====================================================================

// Thu lan luot cac mo hinh nay (mo hinh dau tien dung duoc se duoc dung).
// Neu Google doi ten mo hinh, them ten moi vao dau danh sach hoac dien dong "GeminiModel" o tab MA.
const AI_MO_HINH = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

let MO_HINH_DUNG_DUOC = '';   // nho mo hinh goi duoc trong lan chay nay

const MUC_DIEM = [
  {ten: 'Tốt (8–10)', tu: 8},
  {ten: 'Khá (6,5–<8)', tu: 6.5},
  {ten: 'Đạt (5–<6,5)', tu: 5},
  {ten: 'Chưa đạt (<5)', tu: -1}
];

// ---------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🤖 Phân tích AI')
    .addItem('1. Thống kê một đợt (không dùng AI)', 'menuThongKe')
    .addItem('2. AI phân tích cả lớp + đề ôn tập', 'menuAILop')
    .addItem('3. AI gợi ý ôn tập từng học sinh', 'menuAIHocSinh')
    .addSeparator()
    .addItem('⭐ Làm tất cả 3 bước', 'menuTatCa')
    .addSeparator()
    .addItem('Kiểm tra kết nối AI', 'kiemTraAI')
    .addToUi();
}

function menuThongKe()   { chayMenu(function (m) { ghiThongKe(thongKeDot(m)); return 'Đã tạo tab "TK ' + m + '".'; }); }
function menuAILop()     { chayMenu(function (m) { return aiPhanTichLop(thongKeDot(m)); }); }
function menuAIHocSinh() { chayMenu(function (m) { return aiGoiYHocSinh(thongKeDot(m)); }); }
function menuTatCa() {
  chayMenu(function (m) {
    const tk = thongKeDot(m);
    ghiThongKe(tk);
    const a = aiPhanTichLop(tk);
    const b = aiGoiYHocSinh(tk);
    return 'Đã tạo tab "TK ' + m + '".\n' + a + '\n' + b;
  });
}

function chayMenu(viec) {
  const ui = SpreadsheetApp.getUi();
  const dsDot = cacDotDaLam();
  if (!dsDot.length) { ui.alert('Tab BAI LAM chưa có bài nộp nào.'); return; }
  const mac = dotGanNhat() || dsDot[dsDot.length - 1];
  const r = ui.prompt('Chọn đợt kiểm tra',
    'Các đợt đã có bài nộp: ' + dsDot.join(', ') + '\n\nNhập mã đợt (để trống = ' + mac + '):',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const madot = String(r.getResponseText() || '').trim() || mac;
  if (dsDot.indexOf(madot) < 0) { ui.alert('Không có bài nộp nào của đợt "' + madot + '".'); return; }
  SpreadsheetApp.getActive().toast('Đang xử lý đợt ' + madot + '... (phần AI có thể mất 20–60 giây)', '🤖 Phân tích AI', 90);
  try {
    ui.alert('Xong', viec(madot), ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Có lỗi', String(err.message || err), ui.ButtonSet.OK);
  }
}

// ---------------------------------------------------------------------
// Thong ke (khong dung AI)
// ---------------------------------------------------------------------
function cacDotDaLam() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  if (!sh || sh.getLastRow() < 2) return [];
  const ds = [];
  sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().forEach(function (r) {
    const m = String(r[0]).trim();
    if (m && ds.indexOf(m) < 0) ds.push(m);
  });
  return ds;
}

// Dot cua bai nop moi nhat
function dotGanNhat() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  return sh && sh.getLastRow() >= 2 ? String(sh.getRange(sh.getLastRow(), 2).getValue()).trim() : '';
}

// Lay bai nop cua mot dot; moi HS chi lay LAN LAM CUOI.
function docBaiNop(madot) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues();
  const theoHS = {};
  v.forEach(function (r) {
    if (String(r[1]).trim() !== madot) return;
    const ma = String(r[2]).trim();
    const lan = Number(r[11]) || 1;
    if (!theoHS[ma] || lan >= theoHS[ma].lan) {
      theoHS[ma] = {mahs: ma, hoten: String(r[3]).trim(), diem: Number(r[5]) || 0, lan: lan,
        chon: String(r[9] || '').split(',').map(function (x) { x = String(x).trim().toUpperCase(); return x === '-' ? '' : x; })};
    }
  });
  return Object.keys(theoHS).map(function (k) { return theoHS[k]; });
}

function thongKeDot(madot) {
  const de = docDe(madot);
  const bai = docBaiNop(madot);
  const c = timDot(madot) || {madot: madot, ten: madot};
  const cau = de.map(function (q, i) {
    const dem = {A: 0, B: 0, C: 0, D: 0, bo: 0};
    bai.forEach(function (b) { const x = b.chon[i] || ''; if (dem[x] !== undefined && x) dem[x]++; else dem.bo++; });
    const n = bai.length || 1;
    let saiNhieu = '', soSaiNhieu = 0;
    ['A', 'B', 'C', 'D'].forEach(function (k) { if (k !== q.da && dem[k] > soSaiNhieu) { saiNhieu = k; soSaiNhieu = dem[k]; } });
    return {stt: i, cau: q.cau, hoi: boThe(q.hoi), pa: {A: boThe(q.pa.A), B: boThe(q.pa.B), C: boThe(q.pa.C), D: boThe(q.pa.D)},
      da: q.da, dem: dem, tiLeDung: Math.round(dem[q.da] / n * 100), saiNhieu: saiNhieu, soSaiNhieu: soSaiNhieu};
  });
  const diem = bai.map(function (b) { return b.diem; });
  const muc = MUC_DIEM.map(function (m, k) {
    const tren = k === 0 ? 1e9 : MUC_DIEM[k - 1].tu;
    return {ten: m.ten, so: diem.filter(function (d) { return d >= m.tu && d < tren; }).length};
  });
  bai.forEach(function (b) {
    b.cauSai = [];
    de.forEach(function (q, i) { if (b.chon[i] !== q.da) b.cauSai.push({cau: q.cau, chon: b.chon[i] || 'bỏ trống'}); });
  });
  return {
    lop: lopNay(), madot: madot, ten: c.ten, soCau: de.length, soBai: bai.length,
    tb: diem.length ? Math.round(diem.reduce(function (a, b) { return a + b; }, 0) / diem.length * 100) / 100 : 0,
    cao: diem.length ? Math.max.apply(null, diem) : 0, thap: diem.length ? Math.min.apply(null, diem) : 0,
    muc: muc, cau: cau, bai: bai, lichSu: lichSuCacDot()
  };
}

// Diem trung binh cac dot khac (de AI nhan xet su tien bo)
function lichSuCacDot() {
  return cacDotDaLam().map(function (m) {
    const b = docBaiNop(m);
    const tb = b.length ? b.reduce(function (a, x) { return a + x.diem; }, 0) / b.length : 0;
    return {madot: m, soBai: b.length, tb: Math.round(tb * 100) / 100};
  });
}

function ghiThongKe(tk) {
  const ten = 'TK ' + tk.madot;
  const sh = tabMoi(ten);
  const dong = [
    ['THỐNG KÊ ĐỢT KIỂM TRA – LỚP ' + tk.lop, '', '', '', '', '', '', '', '', ''],
    ['Bài: ' + tk.ten + ' (' + tk.madot + ')', '', '', '', '', '', '', '', '', ''],
    ['Số bài nộp', tk.soBai, 'Điểm TB', tk.tb, 'Cao nhất', tk.cao, 'Thấp nhất', tk.thap, '', ''],
    tk.muc.map(function (m) { return m.ten + ': ' + m.so; }).concat(['', '', '', '', '', '']),
    ['', '', '', '', '', '', '', '', '', ''],
    ['Câu', 'Nội dung (rút gọn)', 'Đáp án', '% đúng', 'Chọn A', 'Chọn B', 'Chọn C', 'Chọn D', 'Bỏ trống', 'Phương án sai chọn nhiều nhất']
  ];
  tk.cau.forEach(function (q) {
    dong.push([q.cau, rutGon(q.hoi, 90), q.da, q.tiLeDung + '%', q.dem.A, q.dem.B, q.dem.C, q.dem.D, q.dem.bo,
      q.saiNhieu ? q.saiNhieu + ' (' + q.soSaiNhieu + ' HS)' : '']);
  });
  sh.getRange(1, 1, dong.length, 10).setValues(dong);
  sh.getRange('A1:A2').setFontWeight('bold');
  sh.getRange('A1').setFontSize(13);
  sh.getRange('A6:J6').setFontWeight('bold').setBackground('#e7e6e6');
  sh.setColumnWidth(2, 380); sh.setColumnWidth(10, 200);
  // Cau co duoi 50% dung: to nen xam + in dam (in den trang van thay)
  tk.cau.forEach(function (q, k) {
    if (q.tiLeDung < 50) sh.getRange(7 + k, 1, 1, 10).setBackground('#d9d9d9').setFontWeight('bold');
  });
  sh.getRange(7 + tk.cau.length + 1, 1).setValue('Dòng tô xám, in đậm: câu có dưới 50% học sinh làm đúng.').setFontStyle('italic');
  sh.setFrozenRows(6);
  return ten;
}

// ---------------------------------------------------------------------
// AI phan tich ca lop + tao de on tap
// ---------------------------------------------------------------------
function aiPhanTichLop(tk) {
  const duLieu = {
    lop: tk.lop, bai: tk.ten, so_bai_nop: tk.soBai, diem_tb: tk.tb, cao_nhat: tk.cao, thap_nhat: tk.thap,
    phan_bo_muc: tk.muc, lich_su_cac_dot: tk.lichSu,
    cau_hoi: tk.cau.map(function (q) {
      return {cau: q.cau, noi_dung: q.hoi, A: q.pa.A, B: q.pa.B, C: q.pa.C, D: q.pa.D, dap_an: q.da,
        ti_le_dung: q.tiLeDung + '%', so_hs_chon: q.dem, phuong_an_sai_chon_nhieu: q.saiNhieu};
    })
  };
  const yeuCau =
    'Dưới đây là kết quả một bài kiểm tra trắc nghiệm của lớp ' + tk.lop + ' (chương trình Kết nối tri thức với cuộc sống). ' +
    'Hãy phân tích như một giáo viên Hóa học giàu kinh nghiệm. Chú ý: phương án sai được nhiều học sinh chọn thường cho thấy một quan niệm sai cụ thể – hãy chỉ ra quan niệm sai đó.\n\n' +
    'DỮ LIỆU:\n' + JSON.stringify(duLieu) + '\n\n' +
    'Trả về JSON đúng cấu trúc sau (viết tiếng Việt, ngắn gọn, cụ thể):\n' +
    '{"tong_quan":"2-3 câu nhận xét chung, có so sánh với các đợt trước nếu có",' +
    '"diem_manh":["nội dung lớp nắm tốt"],' +
    '"lo_hong":[{"noi_dung":"kiến thức còn hổng","cau":[số câu],"sai_lam_thuong_gap":"quan niệm sai suy ra từ phương án sai","cach_khac_phuc":"hoạt động dạy cụ thể"}],' +
    '"ke_hoach_on_tap":["các bước ôn tập trong 1 tiết, mỗi bước kèm thời lượng"],' +
    '"cau_hoi_on_tap":[{"noi_dung":"câu hỏi mới","A":"","B":"","C":"","D":"","dap_an":"A|B|C|D","giai_thich":"vì sao"}]}\n' +
    'Tạo 5 đến 8 câu hỏi ôn tập MỚI (không chép lại câu cũ), nhắm đúng các lỗ hổng, mức độ nhận biết – thông hiểu. ' +
    'Kiểm tra kỹ tính đúng đắn khoa học của từng câu và đáp án. Viết công thức hóa học bằng chữ số thường (H2O, CO2).';
  const kq = goiAI(yeuCau);

  // Ghi tab AI <MaDot>
  const ten = 'AI ' + tk.madot;
  const sh = tabMoi(ten);
  const d = [];
  const them = function (a, b) { d.push([a || '', b || '']); };
  them('AI PHÂN TÍCH KẾT QUẢ – LỚP ' + tk.lop + ' – ' + tk.ten);
  them('Tạo lúc ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') + ' · Mô hình: ' + kq._moHinh + ' · Giáo viên cần đọc và kiểm duyệt trước khi sử dụng.');
  them('');
  them('Tổng quan', kq.tong_quan);
  them('');
  them('Điểm mạnh', (kq.diem_manh || []).map(function (x) { return '• ' + x; }).join('\n'));
  them('');
  them('LỖ HỔNG KIẾN THỨC');
  (kq.lo_hong || []).forEach(function (l, i) {
    them((i + 1) + '. ' + l.noi_dung, 'Câu: ' + (l.cau || []).join(', ') +
      '\nSai lầm thường gặp: ' + (l.sai_lam_thuong_gap || '') + '\nCách khắc phục: ' + (l.cach_khac_phuc || ''));
  });
  them('');
  them('KẾ HOẠCH ÔN TẬP (1 tiết)', (kq.ke_hoach_on_tap || []).map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n'));
  them('');
  them('CÂU HỎI ÔN TẬP DO AI ĐỀ XUẤT');
  const ch = (kq.cau_hoi_on_tap || []).filter(function (q) { return q && q.noi_dung && /^[ABCD]$/.test(String(q.dap_an).trim().toUpperCase()); });
  ch.forEach(function (q, i) {
    them('Câu ' + (i + 1) + '. ' + q.noi_dung, 'A. ' + q.A + '\nB. ' + q.B + '\nC. ' + q.C + '\nD. ' + q.D +
      '\nĐáp án: ' + String(q.dap_an).trim().toUpperCase() + '\nGiải thích: ' + (q.giai_thich || ''));
  });
  sh.getRange(1, 1, d.length, 2).setValues(d).setWrap(true).setVerticalAlignment('top');
  sh.setColumnWidth(1, 300); sh.setColumnWidth(2, 620);
  sh.getRange('A1').setFontWeight('bold').setFontSize(13);
  sh.getRange(1, 1, d.length, 1).setFontWeight('bold');
  sh.getRange('A2').setFontWeight('normal').setFontStyle('italic');

  // Dua cau on tap vao KHO DE thanh dot moi, TRANG THAI DONG (GV duyet roi moi mo)
  let ghiChu = '';
  if (ch.length) {
    const maOT = taoDeOnTap(tk, ch);
    ghiChu = '\nĐã thêm ' + ch.length + ' câu ôn tập vào KHO ĐỀ, tab "' + maOT + '" (đang ĐÓNG). ' +
      'Thầy/cô kiểm tra lại câu hỏi, rồi đổi TrangThai thành MO ở tab CAU HINH để học sinh luyện tập.';
  }
  return 'Đã tạo tab "' + ten + '".' + ghiChu;
}

function taoDeOnTap(tk, ch) {
  const ss = kho();
  const ma = tk.madot + '-OT';
  const sh = ss.getSheetByName(ma) || ss.insertSheet(ma);
  sh.clear();
  const v = [['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh']];
  ch.forEach(function (q, i) { v.push([i + 1, q.noi_dung, q.A, q.B, q.C, q.D, String(q.dap_an).trim().toUpperCase(), '']); });
  sh.getRange(1, 1, v.length, 8).setNumberFormat('@').setValues(v);
  sh.getRange('A1:H1').setFontWeight('bold');
  const cfg = ss.getSheetByName('CAU HINH');
  const daCo = cfg.getDataRange().getValues().some(function (r) { return String(r[0]).trim() === ma; });
  if (!daCo) cfg.appendRow([ma, 'Ôn tập (AI) – ' + tk.ten, 15, 'DONG', 'CO', tk.lop]);
  return ma;
}

// ---------------------------------------------------------------------
// AI goi y on tap tung hoc sinh (KHONG gui ho ten)
// ---------------------------------------------------------------------
function aiGoiYHocSinh(tk) {
  const deTomTat = tk.cau.map(function (q) {
    return {cau: q.cau, noi_dung: rutGon(q.hoi, 160), dap_an: q.da + '. ' + rutGon(q.pa[q.da], 60)};
  });
  const hs = tk.bai.map(function (b) {
    return {ma: b.mahs, diem: b.diem, cau_sai: b.cauSai.map(function (s) { return s.cau + '(chọn ' + s.chon + ')'; }).join(', ')};
  });
  const goiY = {};
  // Chia nho de moi lan goi AI khong qua dai
  for (let k = 0; k < hs.length; k += 25) {
    const nhom = hs.slice(k, k + 25);
    const yeuCau =
      'Đề kiểm tra Hóa học lớp ' + tk.lop + ' – "' + tk.ten + '":\n' + JSON.stringify(deTomTat) + '\n\n' +
      'Kết quả từng học sinh (ma = mã học sinh, cau_sai = các câu sai kèm phương án đã chọn):\n' + JSON.stringify(nhom) + '\n\n' +
      'Với MỖI học sinh, viết lời nhận xét và gợi ý ôn tập gửi trực tiếp cho em (xưng "em", giọng khích lệ, cụ thể, 2–3 câu), ' +
      'và liệt kê 1–3 nội dung kiến thức cần ôn. Học sinh không sai câu nào thì khen và gợi ý thử thách nâng cao.\n' +
      'Trả về JSON: {"hoc_sinh":[{"ma":"mã học sinh","nhan_xet":"...","can_on":["..."]}]}';
    const kq = goiAI(yeuCau);
    (kq.hoc_sinh || []).forEach(function (x) { goiY[String(x.ma).trim()] = x; });
  }

  const ten = tabGoiY(tk.madot);
  const sh = tabMoi(ten);
  const v = [['MaHS', 'HoTen', 'Diem', 'CauSai', 'NhanXet', 'CanOn', 'ChoHSXem']];
  tk.bai.forEach(function (b) {
    const g = goiY[b.mahs] || {};
    v.push([b.mahs, b.hoten, b.diem, b.cauSai.map(function (s) { return s.cau; }).join(', '),
      g.nhan_xet || '', (g.can_on || []).join('; '), false]);
  });
  sh.getRange(1, 1, v.length, 7).setValues(v);
  sh.getRange(2, 1, v.length - 1, 1).setNumberFormat('@');
  sh.getRange('A1:G1').setFontWeight('bold').setBackground('#e7e6e6');
  if (v.length > 1) sh.getRange(2, 7, v.length - 1, 1).insertCheckboxes();
  sh.getRange(2, 5, Math.max(v.length - 1, 1), 2).setWrap(true);
  sh.setColumnWidth(2, 170); sh.setColumnWidth(5, 420); sh.setColumnWidth(6, 260);
  sh.setFrozenRows(1);
  const thieu = tk.bai.filter(function (b) { return !goiY[b.mahs]; }).length;
  return 'Đã tạo tab "' + ten + '" cho ' + (tk.bai.length - thieu) + '/' + tk.bai.length + ' học sinh. ' +
    'Thầy/cô đọc, sửa nếu cần, rồi TÍCH cột ChoHSXem (chọn cả cột G rồi bấm phím cách để tích hết) – ' +
    'khi đó học sinh mới thấy gợi ý ở trang Xem lại bài.';
}

function tabGoiY(madot) { return 'GOI Y ' + madot; }

// Goi tu xemLai() trong SoTheoDoi.gs: tra loi goi y da duyet cho 1 HS, hoac null
function layGoiYAI(madot, ma) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tabGoiY(madot));
  if (!sh || sh.getLastRow() < 2) return null;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
  for (let i = 0; i < v.length; i++) {
    if (String(v[i][0]).trim() === ma && v[i][6] === true && String(v[i][4]).trim()) {
      return {nhanxet: String(v[i][4]).trim(), canon: String(v[i][5] || '').split(';').map(function (s) { return s.trim(); }).filter(String)};
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// Ket noi Gemini
// ---------------------------------------------------------------------
function khoaAI() {
  const m = {};
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[String(r[0]).trim()] = String(r[1]).trim(); });
  const khoa = m['GeminiKey'] || PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') || '';
  if (!khoa) throw new Error('Chưa có khóa AI. Vào KHO ĐỀ, tab MA, thêm dòng: GeminiKey | <khóa lấy ở aistudio.google.com>');
  return {khoa: khoa, moHinh: m['GeminiModel'] ? [m['GeminiModel']].concat(AI_MO_HINH) : AI_MO_HINH};
}

function goiAI(yeuCau) {
  const k = khoaAI();
  const than = {
    systemInstruction: {parts: [{text: 'Bạn là chuyên gia sư phạm Hóa học bậc phổ thông ở Việt Nam. Chỉ trả về JSON hợp lệ, không thêm chữ nào ngoài JSON.'}]},
    contents: [{role: 'user', parts: [{text: yeuCau}]}],
    generationConfig: {temperature: 0.4, responseMimeType: 'application/json'}
  };
  let loiCuoi = '';
  const ds = MO_HINH_DUNG_DUOC ? [MO_HINH_DUNG_DUOC] : k.moHinh;
  for (let i = 0; i < ds.length; i++) {
    const moHinh = ds[i];
    const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + moHinh + ':generateContent', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-goog-api-key': k.khoa}, payload: JSON.stringify(than)
    });
    const ma = res.getResponseCode();
    const txt = res.getContentText();
    if (ma === 404) { loiCuoi = 'Không tìm thấy mô hình ' + moHinh; continue; }
    if (ma === 429) throw new Error('Đã hết lượt dùng AI miễn phí trong lúc này. Đợi vài phút (hoặc sang ngày mai) rồi chạy lại.');
    if (ma === 400 || ma === 403) throw new Error('Khóa AI không hợp lệ hoặc chưa được phép (mã ' + ma + '). Kiểm tra dòng GeminiKey ở tab MA.\n' + rutGon(txt, 300));
    if (ma !== 200) { loiCuoi = 'Lỗi ' + ma + ': ' + rutGon(txt, 300); continue; }
    const j = JSON.parse(txt);
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const chu = parts.map(function (p) { return p.text || ''; }).join('');
    const kq = docJSON(chu);
    kq._moHinh = moHinh;
    MO_HINH_DUNG_DUOC = moHinh;
    return kq;
  }
  throw new Error('Không gọi được AI. ' + loiCuoi);
}

function docJSON(chu) {
  let s = String(chu || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(s); } catch (e) {}
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) {} }
  throw new Error('AI trả về dữ liệu không đọc được. Hãy chạy lại.');
}

function kiemTraAI() {
  const ui = SpreadsheetApp.getUi();
  try {
    const kq = goiAI('Trả về JSON {"tra_loi":"<công thức hóa học của nước>"}');
    ui.alert('Kết nối AI tốt', 'Mô hình: ' + kq._moHinh + '\nAI trả lời: ' + kq.tra_loi, ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Chưa kết nối được AI', String(err.message || err), ui.ButtonSet.OK);
  }
}

// ---------------------------------------------------------------------
// Tien ich
// ---------------------------------------------------------------------
function tabMoi(ten) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(ten) || ss.insertSheet(ten);
  sh.clear();
  try { sh.getDataRange().clearDataValidations(); } catch (e) {}
  return sh;
}
function boThe(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/<sub>(.*?)<\/sub>/gi, '$1').replace(/<sup>(.*?)<\/sup>/gi, '^$1')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function rutGon(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
