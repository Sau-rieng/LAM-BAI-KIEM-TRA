// =====================================================================
// SO THEO DOI <LOP> - Khoi 2
// Kho de dung chung, cham diem tren Google, PDF bai lam day du noi dung,
// tu tao DE GOC.pdf cho moi dot, trang xem lai bai theo SBD + ma xem.
// Dan toan bo file nay vao Tien ich -> Apps Script cua tung file SO THEO DOI.
// =====================================================================

// ID cua file KHO DE HOA 10 (doan giua /d/ va /edit trong duong link)
const KHO_DE_ID = 'DAN_ID_KHO_DE_VAO_DAY';

const TAB_DS = 'DANHSACH';
const TAB_BL = 'BAI LAM';
const TAB_HD = 'HOAT DONG';
const THU_MUC_GOC = 'BAI LAM HOC SINH';

const HEAD_BL = ['ThoiGianNop','MaDot','MaHS','HoTen','MaDe','Diem','SoCauDung','TongSoCau','ThoiGianLam_giay','ChiTiet','FileBaiLam'];
const HEAD_HD = ['ThoiGian','MaHoatDong','MaHS','HoTen','CauHoi','SoLanThu','DungSai','ThoiGian_giay'];

// ---------------------------------------------------------------------
// Cong vao
// ---------------------------------------------------------------------
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const ma = String(p.mahs || '').trim();
    if (!ma) return json({ok: true, msg: 'So theo doi ' + lopNay() + ' dang hoat dong'});
    const hs = timHS(ma);
    if (!hs) return json({ok: false, msg: 'Khong tim thay ma HS'});
    const dot = docCauHinh().filter(function (c) { return c.mo && hopLop(c); })
      .map(function (c) { return {madot: c.madot, ten: c.ten, phut: c.phut}; });
    return json({ok: true, hoten: hs.ten, dot: dot});
  } catch (err) {
    return json({ok: false, msg: String(err.message || err)});
  }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.loai === 'hoatdong') return json(ghiHoatDong(d));
    switch (d.action) {
      case 'batdau': return json(batDau(d));
      case 'mokhoa': return json({ok: String(d.ma || '').trim() === docMa().mokhoa});
      case 'nop':    return json(nopBai(d));
      case 'xemlai': return json(xemLai(d));
    }
    return json({ok: false, msg: 'Yeu cau khong hop le'});
  } catch (err) {
    return json({ok: false, msg: String(err.message || err)});
  }
}

// ---------------------------------------------------------------------
// Bat dau lam bai: kiem tra ma GV, dot dang mo, chua nop; tra de KHONG co dap an
// ---------------------------------------------------------------------
function batDau(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Khong tim thay ma HS'};
  if (String(d.magv || '').trim() !== docMa().gv) return {ok: false, loi: 'magv', msg: 'Ma giao vien chua dung'};
  const c = timDot(d.madot);
  if (!c || !c.mo || !hopLop(c)) return {ok: false, msg: 'Bai kiem tra nay chua mo hoac da dong'};
  if (timBaiDaNop(c.madot, ma)) return {ok: false, loi: 'danop', msg: 'Em da nop bai dot nay'};
  const de = docDe(c.madot).map(function (q) {
    return {cau: q.cau, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh)};
  });
  return {ok: true, hoten: hs.ten, madot: c.madot, ten: c.ten, phut: c.phut, cau: de};
}

// ---------------------------------------------------------------------
// Nop bai: cham diem, tao PDF, ghi Sheet. Nop lai (do mang) khong tao ban trung.
// ---------------------------------------------------------------------
function nopBai(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Ma HS khong co trong danh sach'};
  const madot = String(d.madot || '').trim();
  const cu = timBaiDaNop(madot, ma);
  if (cu) return {ok: true, hoten: hs.ten, diem: cu.diem, socaudung: cu.socaudung, tongsocau: cu.tongsocau, danop: true};

  const c = timDot(madot) || {madot: madot, ten: madot};
  const de = docDe(madot);
  const chon = d.chon || {};
  let dung = 0;
  const ct = de.map(function (q) {
    const x = String(chon[q.cau] || '').toUpperCase();
    const ok = x !== '' && x === q.da;
    if (ok) dung++;
    return {cau: q.cau, hoi: q.hoi, pa: q.pa, hinh: q.hinh, chon: x, dapan: q.da, dung: ok};
  });
  const tong = de.length;
  const diem = Math.round(dung / tong * 1000) / 100;
  const giay = Math.max(0, Math.round(Number(d.thoigianlam) || 0));
  const now = new Date();

  const thuMuc = layThuMucDot(lopNay(), madot, c, de);
  const url = luuPDFBaiLam(thuMuc, c, ma, hs.ten, now, giay, diem, dung, tong, ct);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cu2 = timBaiDaNop(madot, ma);
    if (cu2) return {ok: true, hoten: hs.ten, diem: cu2.diem, socaudung: cu2.socaudung, tongsocau: cu2.tongsocau, danop: true};
    layTab(TAB_BL, HEAD_BL).appendRow([now, madot, ma, hs.ten, 'XAO', diem, dung, tong, giay,
      ct.map(function (x) { return x.chon || '-'; }).join(','), url]);
  } finally {
    lock.releaseLock();
  }
  return {ok: true, hoten: hs.ten, diem: diem, socaudung: dung, tongsocau: tong};
}

// ---------------------------------------------------------------------
// Xem lai bai: SBD + ma xem rieng; chi cac dot GV bat "ChoXemLai = CO"
// ---------------------------------------------------------------------
function xemLai(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs || !hs.maxem || String(d.maxem || '').trim() !== hs.maxem) return {ok: false, msg: 'SBD hoac ma xem bai chua dung'};
  const ketqua = [];
  docCauHinh().forEach(function (c) {
    if (!c.xemlai || !hopLop(c)) return;
    const bai = timBaiDaNop(c.madot, ma);
    if (!bai) return;
    const chon = String(bai.chitiet || '').split(',');
    const de = docDe(c.madot);
    ketqua.push({
      madot: c.madot, ten: c.ten, diem: bai.diem, socaudung: bai.socaudung, tongsocau: bai.tongsocau,
      cau: de.map(function (q, i) {
        const x = chon[i] && chon[i] !== '-' ? chon[i] : '';
        return {cau: q.cau, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh), chon: x, dapan: q.da, dung: x !== '' && x === q.da};
      })
    });
  });
  return {ok: true, hoten: hs.ten, bai: ketqua};
}

function ghiHoatDong(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Ma HS khong co trong danh sach'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    layTab(TAB_HD, HEAD_HD).appendRow([new Date(), d.mahoatdong || '', ma, hs.ten,
      d.cauhoi || '', d.solanthu || '', d.dungsai || '', d.thoigian || '']);
  } finally {
    lock.releaseLock();
  }
  return {ok: true, hoten: hs.ten};
}

// ---------------------------------------------------------------------
// Doc KHO DE
// ---------------------------------------------------------------------
function kho() { return SpreadsheetApp.openById(KHO_DE_ID); }

// Tab CAU HINH: MaDot | TenBai | ThoiGian_phut | TrangThai (MO/DONG) | ChoXemLai (CO/KHONG) | Lop
function docCauHinh() {
  const v = kho().getSheetByName('CAU HINH').getDataRange().getValues();
  v.shift();
  return v.filter(function (r) { return String(r[0]).trim() !== ''; }).map(function (r) {
    return {
      madot: String(r[0]).trim(), ten: String(r[1] || r[0]).trim(), phut: Number(r[2]) || 15,
      mo: khongDau(r[3]) === 'MO', xemlai: khongDau(r[4]) === 'CO',
      lop: khongDau(r[5]) || 'TAT CA'
    };
  });
}
function timDot(madot) {
  return docCauHinh().filter(function (c) { return c.madot === String(madot || '').trim(); })[0] || null;
}
function hopLop(c) {
  if (c.lop === 'TAT CA') return true;
  const l = khongDau(lopNay());
  return c.lop.split(',').map(function (s) { return s.trim(); }).indexOf(l) >= 0;
}
// Tab MA: cot A ten ma, cot B gia tri (MaGV, MaMoKhoa)
function docMa() {
  const m = {};
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[String(r[0]).trim()] = String(r[1]).trim(); });
  return {gv: m['MaGV'] || '', mokhoa: m['MaMoKhoa'] || ''};
}
// Tab <MaDot>: Cau | NoiDung | A | B | C | D | DapAn | Hinh
function docDe(madot) {
  const sh = kho().getSheetByName(String(madot || '').trim());
  if (!sh) throw new Error('Kho de chua co tab ' + madot);
  const v = sh.getDataRange().getValues();
  v.shift();
  return v.filter(function (r) { return String(r[1]).trim() !== ''; }).map(function (r, i) {
    return {
      cau: Number(r[0]) || i + 1, hoi: String(r[1]),
      pa: {A: String(r[2]), B: String(r[3]), C: String(r[4]), D: String(r[5])},
      da: String(r[6]).trim().toUpperCase(), hinh: String(r[7] || '').trim()
    };
  });
}
// Cot Hinh: link/ID file anh tren Drive, hoac ma <svg>. Tra ve data URI.
function anhDataUri(h) {
  if (!h) return '';
  const key = 'img_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, h));
  const cache = CacheService.getScriptCache();
  const daCo = cache.get(key);
  if (daCo) return daCo;
  let uri = '';
  if (/^<svg/i.test(h)) {
    uri = 'data:image/svg+xml;base64,' + Utilities.base64Encode(h, Utilities.Charset.UTF_8);
  } else {
    const m = h.match(/[-\w]{25,}/);
    if (!m) return '';
    const b = DriveApp.getFileById(m[0]).getBlob();
    uri = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
  }
  try { cache.put(key, uri, 21600); } catch (e) {}
  return uri;
}

// ---------------------------------------------------------------------
// Danh sach HS: A MAHS | B HO TEN | C GHI CHU | D MAXEM
// ---------------------------------------------------------------------
function timHS(ma) {
  if (!ma) return null;
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_DS);
  const n = Math.max(sh.getLastRow() - 1, 1);
  const rows = sh.getRange(2, 1, n, 4).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === ma) return {ten: String(rows[i][1]).trim(), maxem: String(rows[i][3]).trim()};
  }
  return null;
}
function timBaiDaNop(madot, ma) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  if (!sh || sh.getLastRow() < 2) return null;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues();
  for (let i = v.length - 1; i >= 0; i--) {
    if (String(v[i][1]).trim() === madot && String(v[i][2]).trim() === ma) {
      return {diem: v[i][5], socaudung: v[i][6], tongsocau: v[i][7], chitiet: v[i][9]};
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// Thu muc + PDF
// ---------------------------------------------------------------------
function layThuMucDot(lop, madot, c, de) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const tm = layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lop), madot);
    const tenDe = 'DE GOC - ' + madot + '.pdf';
    if (!tm.getFilesByName(tenDe).hasNext()) tm.createFile(htmlSangPDF(htmlDeGoc(c, de), tenDe));
    return tm;
  } finally {
    lock.releaseLock();
  }
}
function layThuMuc(cha, ten) {
  const it = cha.getFoldersByName(ten);
  return it.hasNext() ? it.next() : cha.createFolder(ten);
}
function htmlSangPDF(html, ten) {
  return Utilities.newBlob(html, 'text/html', 'tam.html').getAs('application/pdf').setName(ten);
}

const CSS_PDF = 'body{font-family:Arial,sans-serif;font-size:11.5pt;color:#000}' +
  'h2{text-align:center;margin:0 0 8px}' +
  '.tt{width:100%;border-collapse:collapse;margin-bottom:10px}.tt td{padding:2px 4px}' +
  '.q{border:1px solid #000;padding:6px 10px;margin:8px 0;page-break-inside:avoid}' +
  '.kq{font-weight:bold}.pa{margin:2px 0 2px 14px}.dung{font-weight:bold}' +
  'img{max-width:260px;max-height:200px;display:block;margin:4px 0}';

function htmlCau(q, coBaiLam) {
  const hinh = q.hinh ? anhDataUri(q.hinh) : '';
  let s = '<div class="q"><div><b>Câu ' + esc(q.cau) + '.</b> ' + q.hoi;
  if (coBaiLam) s += ' &nbsp; <span class="kq">' + (q.chon === '' ? '[ Bỏ trống ]' : (q.dung ? '[ ✓ Đúng ]' : '[ ✗ Sai ]')) + '</span>';
  s += '</div>';
  if (hinh) s += '<img src="' + hinh + '">';
  ['A', 'B', 'C', 'D'].forEach(function (k) {
    if (String(q.pa[k]).trim() === '') return;
    const laDung = k === (q.dapan || q.da);
    let nhan = '';
    if (laDung) nhan += ' &nbsp;← Đáp án';
    if (coBaiLam && q.chon === k) nhan += ' &nbsp;← Em chọn';
    s += '<div class="pa' + (laDung ? ' dung' : '') + '">' + k + '. ' + q.pa[k] + nhan + '</div>';
  });
  return s + '</div>';
}
function htmlDeGoc(c, de) {
  return '<html><head><meta charset="utf-8"><style>' + CSS_PDF + '</style></head><body>' +
    '<h2>ĐỀ GỐC – ' + esc(c.ten) + '</h2><p style="text-align:center">Mã đợt: ' + esc(c.madot) + ' · ' + de.length + ' câu</p>' +
    de.map(function (q) { return htmlCau(q, false); }).join('') + '</body></html>';
}
function luuPDFBaiLam(thuMuc, c, ma, ten, now, giay, diem, dung, tong, ct) {
  const tz = Session.getScriptTimeZone();
  const html = '<html><head><meta charset="utf-8"><style>' + CSS_PDF + '</style></head><body>' +
    '<h2>BÀI LÀM KIỂM TRA</h2><table class="tt">' +
    '<tr><td><b>Lớp:</b> ' + esc(lopNay()) + '</td><td><b>Bài:</b> ' + esc(c.ten) + ' (' + esc(c.madot) + ')</td></tr>' +
    '<tr><td><b>Học sinh:</b> ' + esc(ten) + '</td><td><b>Mã HS:</b> ' + esc(ma) + '</td></tr>' +
    '<tr><td><b>Nộp lúc:</b> ' + Utilities.formatDate(now, tz, 'dd/MM/yyyy HH:mm:ss') + '</td>' +
    '<td><b>Thời gian làm:</b> ' + Math.floor(giay / 60) + ' phút ' + (giay % 60) + ' giây</td></tr>' +
    '<tr><td colspan="2"><b>Điểm: ' + esc(diem) + '</b> (' + dung + '/' + tong + ' câu đúng). ' +
    'Câu sai: ' + (ct.filter(function (x) { return !x.dung; }).map(function (x) { return x.cau; }).join(', ') || 'không có') + '</td></tr>' +
    '</table>' + ct.map(function (q) { return htmlCau(q, true); }).join('') + '</body></html>';
  const tenFile = c.madot + '_' + ma + '_' + ten + '_' + Utilities.formatDate(now, tz, 'HHmmss') + '.pdf';
  return thuMuc.createFile(htmlSangPDF(html, tenFile)).getUrl();
}

// ---------------------------------------------------------------------
// Tien ich
// ---------------------------------------------------------------------
function lopNay() { return SpreadsheetApp.getActive().getName().replace('SO THEO DOI', '').trim() || 'LOP'; }
function khongDau(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').trim().toUpperCase();
}
function layTab(ten, head) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(ten) || ss.insertSheet(ten);
  if (sh.getLastRow() <= 1) sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  return sh;
}
function esc(s) {
  return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// =====================================================================
// CHAY 1 LAN (chon ten ham o thanh tren roi bam Chay)
// =====================================================================

// 1) Tao cot MAXEM (cot D) va ma xem bai 4 so ngau nhien cho HS chua co ma
function taoMaXem() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_DS);
  sh.getRange('D1').setValue('MAXEM').setFontWeight('bold');
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const r = sh.getRange(2, 1, n, 4);
  const v = r.getValues();
  v.forEach(function (row) {
    if (String(row[0]).trim() !== '' && String(row[3]).trim() === '') row[3] = String(Math.floor(1000 + Math.random() * 9000));
  });
  sh.getRange(2, 4, n, 1).setNumberFormat('@').setValues(v.map(function (row) { return [row[3]]; }));
}

// 2) Chi chay O FILE 10E01, mot lan: tao khung cho file KHO DE (CAU HINH, MA, de thu THU-02)
function taoKhoDeMau() {
  const ss = kho();
  function tab(ten) { return ss.getSheetByName(ten) || ss.insertSheet(ten); }
  const ch = tab('CAU HINH');
  if (ch.getLastRow() < 1) {
    ch.getRange(1, 1, 2, 6).setValues([
      ['MaDot', 'TenBai', 'ThoiGian_phut', 'TrangThai', 'ChoXemLai', 'Lop'],
      ['THU-02', 'Kiểm tra thử – Nguyên tử', 10, 'MO', 'CO', 'TAT CA']
    ]);
    ch.getRange('A1:F1').setFontWeight('bold');
    ch.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['MO', 'DONG']).build());
    ch.getRange('E2:E').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['CO', 'KHONG']).build());
  }
  const ma = tab('MA');
  if (ma.getLastRow() < 1) {
    ma.getRange(1, 1, 3, 2).setNumberFormat('@').setValues([['Ten', 'Ma'], ['MaGV', '7070'], ['MaMoKhoa', '7979']]);
    ma.getRange('A1:B1').setFontWeight('bold');
  }
  const de = tab('THU-02');
  if (de.getLastRow() < 1) {
    de.getRange(1, 1, 7, 8).setValues([
      ['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh'],
      [1, 'Hạt mang điện tích dương trong hạt nhân nguyên tử là', 'electron', 'proton', 'neutron', 'ion', 'B', ''],
      [2, 'Nguyên tử X có 11 proton và 12 neutron. Số khối của X là', '11', '12', '23', '34', 'C', ''],
      [3, 'Cấu hình electron của nguyên tử Na (Z = 11) là', '1s²2s²2p⁶3s¹', '1s²2s²2p⁶', '1s²2s²2p⁶3s²', '1s²2s²2p⁵3s²', 'A', ''],
      [4, 'Nguyên tố có Z = 17 thuộc vị trí nào trong bảng tuần hoàn?', 'Chu kì 3, nhóm VIIA', 'Chu kì 2, nhóm VIIA', 'Chu kì 3, nhóm VIIB', 'Chu kì 4, nhóm IA', 'A', ''],
      [5, 'Số electron tối đa trên một phân lớp p là', '2', '6', '10', '14', 'B', ''],
      [6, 'Hình bên mô tả sự phân bố electron trên các lớp của một nguyên tử (chấm đen là electron). Đó là nguyên tử của nguyên tố nào?',
        'Carbon (Z = 6)', 'Nitrogen (Z = 7)', 'Oxygen (Z = 8)', 'Fluorine (Z = 9)', 'C', HINH_MAU]
    ]);
    de.getRange('A1:H1').setFontWeight('bold');
    de.getRange('C2:F').setNumberFormat('@');
  }
  const thua = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
  if (thua && ss.getSheets().length > 1 && thua.getLastRow() === 0) ss.deleteSheet(thua);
}

// 3) Thu: doc de, tao 1 PDF bai lam thu (khong ghi vao Sheet)
function kiemTra() {
  const de = docDe('THU-02');
  Logger.log('Doc duoc ' + de.length + ' cau. Ma GV: ' + (docMa().gv ? 'co' : 'CHUA CO'));
  const c = timDot('THU-02');
  const ct = de.map(function (q, i) {
    const x = i % 2 ? q.da : 'A';
    return {cau: q.cau, hoi: q.hoi, pa: q.pa, hinh: q.hinh, chon: x, dapan: q.da, dung: x === q.da};
  });
  const tm = layThuMucDot(lopNay(), 'THU-02', c, de);
  Logger.log(luuPDFBaiLam(tm, c, 'THU', 'Bai thu', new Date(), 75, 0, 0, de.length, ct));
}

const HINH_MAU = '<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="100" cy="100" r="42" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/>' +
  '<circle cx="100" cy="100" r="78" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/>' +
  '<circle cx="100" cy="100" r="18" fill="#fff" stroke="#000" stroke-width="2"/>' +
  '<line x1="88" y1="88" x2="112" y2="112" stroke="#000"/><line x1="112" y1="88" x2="88" y2="112" stroke="#000"/>' +
  '<g fill="#000"><circle cx="142" cy="100" r="6"/><circle cx="58" cy="100" r="6"/>' +
  '<circle cx="167.5" cy="61" r="6"/><circle cx="100" cy="22" r="6"/><circle cx="32.5" cy="61" r="6"/>' +
  '<circle cx="32.5" cy="139" r="6"/><circle cx="100" cy="178" r="6"/><circle cx="167.5" cy="139" r="6"/></g></svg>';
