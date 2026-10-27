// =====================================================================
// SO THEO DOI <LOP> - Khoi 2
// Kho de dung chung, cham diem tren Google, PDF bai lam day du noi dung,
// tu tao DE GOC.pdf cho moi dot, trang xem lai bai theo SBD + ma xem.
// Dan toan bo file nay vao Tien ich -> Apps Script cua tung file SO THEO DOI.
// CHI CAN 1 FILE NAY (da gop PhanTichAI.gs). So nao con file PhanTichAI thi XOA file do di.
// =====================================================================

// ID cua file KHO DE (dung chung moi khoi; cot Lop trong tab CAU HINH chon lop duoc lam)
const KHO_DE_ID = '1OB3ij2R_4anO5pQqrClQHLLl0dBXDZ13fSMaDpIx7m4';

const TAB_DS = 'DANHSACH';
const TAB_BL = 'BAI LAM';
const TAB_HD = 'HOAT DONG';
const THU_MUC_GOC = 'BAI LAM HOC SINH';

const HEAD_BL = ['ThoiGianNop','MaDot','MaHS','HoTen','MaDe','Diem','SoCauDung','TongSoCau','ThoiGianLam_giay','ChiTiet','FileBaiLam','LanLam'];
const HEAD_HD = ['ThoiGian','MaHoatDong','MaHS','HoTen','CauHoi','SoLanThu','DungSai','ThoiGian_giay'];
const TAB_BD = 'BAT DAU';
const HEAD_BD = ['ThoiGian','MaDot','MaHS','LanLam'];
const TAB_PC = 'PHONG CHO';
const HEAD_PC = ['ThoiGian','MaDot','MaHS'];
const TAB_XL = 'XEM LAI';
const HEAD_XL = ['ThoiGian','MaDot','MaHS','HoTen'];
const TAB_VG = 'VANG THI';
const HEAD_VG = ['ThoiGian','MaDot','MaHS','HoTen','GhiChu','TrangThai'];
const TAB_CN = 'TRO CHOI NHOM';
const HEAD_CN = ['ThoiGian','MaTro','TenTro','Nhom','Diem','DungSai','ThoiGian_giay','MaLuot'];
const TAB_TN = 'XEM TAI NGUYEN';
const HEAD_TN = ['ThoiGian','MaTN','MaHS','HoTen'];
const TAB_TIN = 'TIN NHAN';
const HEAD_TIN = ['ThoiGian','MaHS','HoTen','Tu','NoiDung','MaDot','Cau','DaDoc','MaTin'];
const TAB_NH = 'NHOM';
const HEAD_NH = ['Nhom','MaHS','HoTen','CapNhat'];

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
    const dot = docCauHinh().filter(function (c) { return (c.mo || c.cho) && hopLop(c); })
      .map(function (c) { return {madot: c.madot, ten: c.ten, phut: c.phut, tt: c.tt}; });
    return json({ok: true, hoten: hs.ten, dot: dot});
  } catch (err) {
    return json({ok: false, msg: String(err.message || err)});
  }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.loai === 'hoatdong') return json(ghiHoatDong(d));
    if (d.loai === 'nhom') return json(ghiChoiNhom(d));
    switch (d.action) {
      case 'batdau': return json(batDau(d));
      case 'mokhoa': return json({ok: String(d.ma || '').trim() === docMa().mokhoa});
      case 'nop':    return json(nopBai(d));
      case 'chobai': return json(trangThaiDot(d.madot));
      case 'vaobai': return json(ghiVaoBai(d));
      case 'xemlai': return json(xemLai(d));
      case 'daxem':  return json(ghiDaXem(d));
      case 'xemtn':  return json(ghiXemTN(d));
      case 'tn_gui': return json(hsGuiTin(d));
      case 'tn_xem': return json(hsXemTin(d));
      case 'tc_vao': return json(tcVao(d));
      case 'tc_mokhoa': return json(tcMoKhoa(d));
      case 'gv_dot':
      case 'gv_dat':
      case 'gv_theodoi':
      case 'gv_hoso':
      case 'gv_bangdiem':
      case 'gv_vang':
      case 'gv_dathi':
      case 'gv_cau':
      case 'gv_nhom':
      case 'gv_kienthuc':
      case 'gv_ainx':
      case 'gv_trochoi':
      case 'gv_tcdat':
      case 'gv_tckq':
      case 'gv_ma':
      case 'gv_madat':
      case 'gv_tainguyen':
      case 'gv_tin':
      case 'gv_tin_hs':
      case 'gv_tin_gui':
      case 'gv_tin_goiy':
      case 'gv_napde':
        if (!kiemMaQL(d.ma)) return json({ok: false, loi: 'ma', msg: 'Ma quan ly chua dung'});
        if (d.action === 'gv_dot') return json(gvDot());
        if (d.action === 'gv_dat') return json(gvDat(d));
        if (d.action === 'gv_hoso') return json(hoSoLop());
        if (d.action === 'gv_bangdiem') return json(ghiBangDiem());
        if (d.action === 'gv_vang') return json(gvVang(d));
        if (d.action === 'gv_dathi') return json(gvDaThi());
        if (d.action === 'gv_cau') return json(gvCau(d));
        if (d.action === 'gv_nhom') return json(gvNhom(d));
        if (d.action === 'gv_kienthuc') return json(gvKienThuc(d));
        if (d.action === 'gv_ainx') return json(gvAINhanXet(d));
        if (d.action === 'gv_trochoi') return json(gvTroChoi());
        if (d.action === 'gv_tcdat') return json(gvTcDat(d));
        if (d.action === 'gv_tckq') return json(gvTcKetQua(d));
        if (d.action === 'gv_ma') return json(gvMa());
        if (d.action === 'gv_madat') return json(gvMaDat(d));
        if (d.action === 'gv_tainguyen') return json(gvTaiNguyen());
        if (d.action === 'gv_tin') return json(gvTin());
        if (d.action === 'gv_tin_hs') return json(gvTinHS(d));
        if (d.action === 'gv_tin_gui') return json(gvTinGui(d));
        if (d.action === 'gv_tin_goiy') return json(gvTinGoiY(d));
        if (d.action === 'gv_napde') return json(gvNapDe(d));
        return json(gvTheoDoi(d));
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
  if (!c || !(c.mo || c.cho) || !hopLop(c)) return {ok: false, loi: 'dong', msg: 'Bai kiem tra nay chua mo hoac da dong'};
  const cu = timBaiDaNop(c.madot, ma);
  let lan = 1;
  if (cu) {
    const mll = String(d.malamlai || '').trim();
    if (!mll) return {ok: false, loi: 'danop', msg: 'Em da nop bai dot nay', lan: cu.lan};
    const dung = docMa().lamlai;
    if (!dung) return {ok: false, loi: 'malamlai', msg: 'Tab MA chua co dong MaLamLai'};
    if (mll !== dung) return {ok: false, loi: 'malamlai', msg: 'Ma cho lam lai chua dung'};
    lan = cu.lan + 1;
  }
  // Phong cho: GV chua bam "Bat dau" -> ghi nhan HS dang cho va gui truoc de DA KHOA MA.
  // Khi GV bam Bat dau, iPad chi can nhan "chia khoa" nho de mo de -> khong don tai vao Google.
  if (c.cho) {
    ghiDong(TAB_PC, HEAD_PC, [new Date(), c.madot, ma]);
    const deKhoa = docDe(c.madot).map(function (q) {
      return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh), chu: laTLNChu(q)};
    });
    return {ok: true, cho: true, hoten: hs.ten, madot: c.madot, ten: c.ten, phut: c.phut, lan: lan,
      goi: maHoa(deKhoa, khoaDot(c.madot))};
  }
  // Gio ket thuc chung = luc GV bam Bat dau + thoi gian lam bai (lan lam lai: tinh rieng)
  let hetLuc = 0;
  if (lan === 1 && c.batdauluc) {
    hetLuc = c.batdauluc + c.phut * 60000;
    if (Date.now() > hetLuc - 60000) return {ok: false, loi: 'hetgio', msg: 'Da het gio lam bai'};
  }
  const de = docDe(c.madot).map(function (q) {
    return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh), chu: laTLNChu(q)};
  });
  ghiDong(TAB_BD, HEAD_BD, [new Date(), c.madot, ma, lan]);
  return {ok: true, hoten: hs.ten, madot: c.madot, ten: c.ten, phut: c.phut, lan: lan, cau: de,
    hetLuc: hetLuc, bayGio: Date.now()};
}

// ---------------------------------------------------------------------
// Nop bai: cham diem, tao PDF, ghi Sheet. Nop lai (do mang) khong tao ban trung.
// ---------------------------------------------------------------------
function nopBai(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Ma HS khong co trong danh sach'};
  const madot = String(d.madot || '').trim();
  const lan = Math.max(1, Number(d.lan) || 1);
  const cu = timBaiDaNop(madot, ma);
  if (cu && cu.lan >= lan) return {ok: true, hoten: hs.ten, diem: cu.diem, socaudung: cu.socaudung, tongsocau: cu.tongsocau, danop: true};

  const c = timDot(madot) || {madot: madot, ten: madot};
  const de = docDe(madot);
  const chon = d.chon || {};
  const kq = chamBai(de, function (q) { return chon[q.cau]; });
  const ct = kq.ct, dung = kq.dung, tong = de.length, diem = kq.diem;
  const giay = Math.max(0, Math.round(Number(d.thoigianlam) || 0));
  const now = new Date();

  const thuMuc = layThuMucDot(lopNay(), madot, c, de);
  const url = luuPDFBaiLam(thuMuc, c, ma, hs.ten, now, giay, diem, dung, tong, ct, lan);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cu2 = timBaiDaNop(madot, ma);
    if (cu2 && cu2.lan >= lan) return {ok: true, hoten: hs.ten, diem: cu2.diem, socaudung: cu2.socaudung, tongsocau: cu2.tongsocau, danop: true};
    layTab(TAB_BL, HEAD_BL).appendRow([now, madot, ma, hs.ten, 'XAO', diem, dung, tong, giay,
      ct.map(function (x) { return String(x.chon || '-').replace(/\|/g, '/'); }).join('|'), url, lan]);
  } finally {
    lock.releaseLock();
  }
  return {ok: true, hoten: hs.ten, diem: diem, socaudung: dung, tongsocau: tong, lan: lan};
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
    const chon = tachChiTiet(bai.chitiet);
    const de = docDe(c.madot);
    const kq = chamBai(de, function (q, i) { return chon[i]; });
    ketqua.push({
      madot: c.madot, ten: c.ten + (bai.lan > 1 ? ' (lần ' + bai.lan + ')' : ''), diem: bai.diem, luc: bai.luc, socaudung: bai.socaudung, tongsocau: bai.tongsocau,
      goiy: typeof layGoiYAI === 'function' ? layGoiYAI(c.madot, ma) : null,
      cau: kq.ct.map(function (q) {
        return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh), chon: q.chon, dapan: q.dapan,
          dung: q.dung, soY: q.soY, diem: q.diemCau, toiDa: q.w};
      })
    });
  });
  return {ok: true, hoten: hs.ten, bai: ketqua, tinMoi: demTinMoi(ma, 'GV')};
}

// HS mo xem 1 bai o trang xem lai -> ghi tab XEM LAI de GV biet em nao da xem
// Tai khoan HS mo 1 tai nguyen (mo phong 3D, thi nghiem...): ghi 1 dong / lan mo
function ghiXemTN(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs || !hs.maxem || String(d.maxem || '').trim() !== hs.maxem) return {ok: false};
  const tn = String(d.matn || '').trim().slice(0, 80);
  if (!tn) return {ok: false};
  ghiDong(TAB_TN, HEAD_TN, [new Date(), tn, ma, hs.ten]);
  return {ok: true};
}
// GV: luot xem tai nguyen cua lop nay + si so
function gvTaiNguyen() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(TAB_TN), xem = [];
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(function (r) {
    if (String(r[1]).trim()) xem.push([r[0] instanceof Date ? r[0].getTime() : 0, String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()]);
  });
  const ds = ss.getSheetByName(TAB_DS);
  const siSo = ds && ds.getLastRow() > 1 ? ds.getRange(2, 1, ds.getLastRow() - 1, 1).getValues().filter(function (r) { return String(r[0]).trim(); }).length : 0;
  return {ok: true, lop: lopNay(), siSo: siSo, xem: xem};
}
function ghiDaXem(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!hs || !hs.maxem || String(d.maxem || '').trim() !== hs.maxem) return {ok: false};
  ghiDong(TAB_XL, HEAD_XL, [new Date(), String(d.madot || '').trim(), ma, hs.ten]);
  return {ok: true};
}

// Tro choi nhom gui ket qua: 1 dong / luot choi (bo qua neu MaLuot da co)
function chuanNhom(s) { const m = /(\d+)/.exec(String(s || '')); return m ? 'Nhóm ' + Number(m[1]) : String(s || '').trim(); }
function ghiChoiNhom(d) {
  const nhom = chuanNhom(d.nhom);
  if (!nhom) return {ok: false, msg: 'Thieu nhom'};
  const ml = String(d.maluot || '').trim();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = layTab(TAB_CN, HEAD_CN);
    if (ml && sh.getLastRow() > 1 && sh.getRange(2, 8, sh.getLastRow() - 1, 1).getValues().some(function (r) { return String(r[0]) === ml; })) return {ok: true, trung: true};
    sh.appendRow([new Date(), String(d.matro || ''), String(d.tentro || d.matro || ''), nhom, d.diem, String(d.dungsai || ''), Number(d.thoigian) || '', ml]);
  } finally { lock.releaseLock(); }
  return {ok: true};
}
// GV luu thanh vien 1 nhom (moi em chi o 1 nhom: luu nhom nay thi em bi go khoi nhom cu)
function docNhom() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_NH);
  const m = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (String(r[1]).trim()) m[String(r[1]).trim()] = chuanNhom(r[0]);
  });
  return m;
}
function gvNhom(d) {
  const nhom = chuanNhom(d.nhom), ds = (d.ds || []).map(function (x) { return String(x).trim(); });
  if (!nhom) return {ok: false, msg: 'Thieu nhom'};
  const m = docNhom();
  Object.keys(m).forEach(function (ma) { if (m[ma] === nhom || ds.indexOf(ma) >= 0) delete m[ma]; });
  ds.forEach(function (ma) { m[ma] = nhom; });
  const ten = {};
  const dsSh = SpreadsheetApp.getActive().getSheetByName(TAB_DS);
  dsSh.getRange(2, 1, Math.max(dsSh.getLastRow() - 1, 1), 2).getValues().forEach(function (r) { ten[String(r[0]).trim()] = String(r[1]).trim(); });
  const rows = Object.keys(m).sort(function (a, b) { return (m[a] + a).localeCompare(m[b] + b); })
    .map(function (ma) { return [m[ma], ma, ten[ma] || '', new Date()]; });
  const sh = layTab(TAB_NH, HEAD_NH);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_NH.length).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, HEAD_NH.length).setValues(rows);
  return {ok: true, nhom: m};
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
// KHOI 3 - Trang giao vien (can MaQuanLy trong tab MA cua KHO DE)
// ---------------------------------------------------------------------
function kiemMaQL(m) {
  const q = docMa().quanly;
  return !!q && String(m || '').trim() === q;
}
function gvDot() {
  const v = kho().getSheetByName('CAU HINH').getDataRange().getValues();
  v.shift();
  return {ok: true, lop: lopNay(), dot: v.filter(function (r) { return String(r[0]).trim() !== ''; }).map(function (r) {
    const tt = ['MO', 'CHO'].indexOf(khongDau(r[3])) >= 0 ? khongDau(r[3]) : 'DONG';
    return {madot: String(r[0]).trim(), ten: String(r[1] || r[0]).trim(), phut: Number(r[2]) || 15,
      tt: tt, mo: tt === 'MO', xemlai: khongDau(r[4]) === 'CO', lop: String(r[5] || 'TAT CA').trim(),
      batdauluc: r[6] instanceof Date ? r[6].getTime() : 0};
  }), bayGio: Date.now()};
}
// Doi TrangThai (MO/DONG) hoac ChoXemLai (CO/KHONG) cua 1 dot trong KHO DE
function gvDat(d) {
  const sh = kho().getSheetByName('CAU HINH');
  const v = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim() === String(d.madot || '').trim()) {
      if (d.truong === 'trangthai') {
        const g = ['MO', 'CHO'].indexOf(String(d.giatri)) >= 0 ? String(d.giatri) : 'DONG';
        sh.getRange(i + 1, 4).setValue(g);
        if (g === 'MO') {
          if (!String(sh.getRange(1, 7).getValue()).trim()) sh.getRange(1, 7).setValue('BatDauLuc').setFontWeight('bold');
          sh.getRange(i + 1, 7).setValue(new Date());
        }
        // Mo phong cho cho ca moi: xoa gio bat dau cua ca truoc de khong ai nhan nham gio ket thuc cu
        if (g === 'CHO') sh.getRange(i + 1, 7).setValue('');
        try { CacheService.getScriptCache().remove('tt_' + d.madot); } catch (e) {}
      } else if (d.truong === 'mo') sh.getRange(i + 1, 4).setValue(d.giatri ? 'MO' : 'DONG');
      else if (d.truong === 'xemlai') sh.getRange(i + 1, 5).setValue(d.giatri ? 'CO' : 'KHONG');
      else if (d.truong === 'ten') {
        const ten = String(d.giatri || '').trim();
        if (!ten) return {ok: false, msg: 'Ten bai khong duoc de trong'};
        sh.getRange(i + 1, 2).setValue(ten);
      } else if (d.truong === 'phut') {
        const ph = Math.round(Number(d.giatri));
        if (!(ph >= 1 && ph <= 180)) return {ok: false, msg: 'Thoi gian phai tu 1 den 180 phut'};
        sh.getRange(i + 1, 3).setValue(ph);
      } else if (d.truong === 'lop') sh.getRange(i + 1, 6).setValue(chuanDsLop(d.giatri));
      else return {ok: false, msg: 'Truong khong hop le'};
      SpreadsheetApp.flush();
      return gvDot();
    }
  }
  return {ok: false, msg: 'Khong tim thay dot ' + d.madot};
}
// ---------------------------------------------------------------------
// Nap de tu trang giao vien (file KHO-DE-<ma dot>.xlsx doc tren trinh duyet)
// d.de = [{madot, ten, phut, lop, thay, cau: [[Cau, NoiDung, A, B, C, D, DapAn, Hinh, Loai, Diem]], kt: [[Cau, KienThuc, MucDo]]}]
// Tao tab de (thay = true: ghi de tab cu), them/sua dong CAU HINH (de moi luon DONG, KHONG cho xem lai), thay dong KIEN THUC cua dot.
// ---------------------------------------------------------------------
const HEAD_DE = ['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'Loai', 'Diem'];
const TAB_CAM = ['CAU HINH', 'MA', 'KIEN THUC', 'TRO CHOI', 'CAU HINH THEM', 'KIEN THUC THEM'];
function gvNapDe(d) {
  const ds = Array.isArray(d.de) ? d.de : [];
  if (!ds.length) return {ok: false, msg: 'Chua co de nao de nap'};
  if (ds.length > 20) return {ok: false, msg: 'Moi lan nap toi da 20 de'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = kho();
    const ch = ss.getSheetByName('CAU HINH');
    const chV = ch.getDataRange().getValues();
    const dongCH = {};
    for (let i = 1; i < chV.length; i++) { const m = String(chV[i][0]).trim(); if (m) dongCH[m] = {so: i + 1, tt: khongDau(chV[i][3])}; }
    // 1) Kiem tra het truoc khi ghi (loi o de nao thi khong ghi de nao)
    const viec = [];
    for (let k = 0; k < ds.length; k++) {
      const x = ds[k] || {};
      const madot = String(x.madot || '').trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(madot)) return {ok: false, msg: 'Ma dot khong hop le: "' + madot + '" (chi dung chu, so, dau - _ .)'};
      if (TAB_CAM.indexOf(khongDau(madot)) >= 0) return {ok: false, msg: 'Ma dot trung ten tab he thong: ' + madot};
      if (viec.some(function (v) { return v.madot === madot; })) return {ok: false, msg: 'File co 2 de cung ma ' + madot};
      const cau = (Array.isArray(x.cau) ? x.cau : []).filter(function (r) { return Array.isArray(r) && String(r[1] || '').trim() !== ''; });
      if (!cau.length) return {ok: false, msg: 'De ' + madot + ' khong co cau hoi nao'};
      if (cau.length > 200) return {ok: false, msg: 'De ' + madot + ' qua 200 cau'};
      const tab = ss.getSheetByName(madot), dong = dongCH[madot];
      if ((tab || dong) && !x.thay) return {ok: false, loi: 'trung', madot: madot, msg: 'Kho da co de ' + madot};
      if (dong && (dong.tt === 'MO' || dong.tt === 'CHO')) return {ok: false, madot: madot, msg: 'De ' + madot + ' dang mo, hay dong de truoc khi thay'};
      const ph = Math.round(Number(x.phut));
      if (!(ph >= 1 && ph <= 180)) return {ok: false, msg: 'Thoi gian de ' + madot + ' phai tu 1 den 180 phut'};
      const khoi = (/^H(\d+)-/i.exec(madot) || [])[1];
      viec.push({madot: madot, ten: String(x.ten || '').trim() || madot, phut: ph,
        lop: String(x.lop || '').trim() ? chuanDsLop(x.lop) : lopMacDinh(Number(khoi)),
        cau: cau.map(function (r) { const o = []; for (let j = 0; j < 10; j++) o.push(r[j] === undefined || r[j] === null ? '' : String(r[j])); return o; }),
        kt: (Array.isArray(x.kt) ? x.kt : []).filter(function (r) { return Array.isArray(r) && String(r[0] || '').trim() !== ''; })
          .map(function (r) { return [madot, String(r[0]).trim(), String(r[1] || '').trim(), String(r[2] || '').trim()]; }),
        tab: tab, dong: dong});
    }
    // 2) Ghi
    let kt = ss.getSheetByName('KIEN THUC');
    if (!kt) { kt = ss.insertSheet('KIEN THUC'); kt.getRange(1, 1, 1, 4).setValues([['MaDot', 'Cau', 'KienThuc', 'MucDo']]).setFontWeight('bold'); }
    viec.forEach(function (v) {
      const sh = v.tab || ss.insertSheet(v.madot);
      sh.clear();
      const bang = [HEAD_DE].concat(v.cau);
      sh.getRange(1, 1, bang.length, 10).setNumberFormat('@').setValues(bang);
      sh.getRange(1, 1, 1, 10).setFontWeight('bold');
      sh.setFrozenRows(1);
      if (v.dong) {
        ch.getRange(v.dong.so, 2, 1, 2).setValues([[v.ten, v.phut]]);
        ch.getRange(v.dong.so, 6).setValue(v.lop);
      } else {
        ch.appendRow([v.madot, v.ten, v.phut, 'DONG', 'KHONG', v.lop]);
        dongCH[v.madot] = {so: ch.getLastRow(), tt: 'DONG'};
      }
    });
    // KIEN THUC: bo dong cu cua cac dot vua nap, them dong moi
    const cacMa = viec.map(function (v) { return v.madot; });
    const ktV = kt.getLastRow() > 1 ? kt.getRange(2, 1, kt.getLastRow() - 1, 4).getValues() : [];
    const giu = ktV.filter(function (r) { return String(r[0]).trim() !== '' && cacMa.indexOf(String(r[0]).trim()) < 0; });
    const moi = giu.concat.apply(giu, viec.map(function (v) { return v.kt; }));
    if (ktV.length) kt.getRange(2, 1, ktV.length, 4).clearContent();
    if (moi.length) kt.getRange(2, 1, moi.length, 4).setNumberFormat('@').setValues(moi);
    SpreadsheetApp.flush();
    const r = gvDot();
    r.nap = viec.map(function (v) { return {madot: v.madot, ten: v.ten, socau: v.cau.length, sokt: v.kt.length, lop: v.lop, thay: !!(v.tab || v.dong)}; });
    return r;
  } finally {
    lock.releaseLock();
  }
}
// Trang thai tung HS cua lop nay trong 1 dot: da nop / dang lam / chua vao
function gvTheoDoi(d) {
  const madot = String(d.madot || '').trim();
  const ss = SpreadsheetApp.getActive();
  const dsSh = ss.getSheetByName(TAB_DS);
  const ds = dsSh.getRange(2, 1, Math.max(dsSh.getLastRow() - 1, 1), 2).getValues()
    .filter(function (r) { return String(r[0]).trim() !== ''; });
  const nop = {}, bd = {};
  const bl = ss.getSheetByName(TAB_BL);
  if (bl && bl.getLastRow() > 1) {
    bl.getRange(2, 1, bl.getLastRow() - 1, HEAD_BL.length).getValues().forEach(function (r) {
      if (String(r[1]).trim() !== madot) return;
      const ma = String(r[2]).trim(), lan = Number(r[11]) || 1;
      if (!nop[ma] || lan >= nop[ma].lan) nop[ma] = {lan: lan, luc: r[0], diem: r[5], dung: r[6], tong: r[7], giay: r[8], pdf: r[10]};
    });
  }
  const b = ss.getSheetByName(TAB_BD);
  if (b && b.getLastRow() > 1) {
    b.getRange(2, 1, b.getLastRow() - 1, 4).getValues().forEach(function (r) {
      if (String(r[1]).trim() !== madot) return;
      const ma = String(r[2]).trim(), lan = Number(r[3]) || 1;
      if (!bd[ma] || lan >= bd[ma].lan) bd[ma] = {lan: lan, luc: r[0]};
    });
  }
  const cho = {};
  const pc = ss.getSheetByName(TAB_PC);
  if (pc && pc.getLastRow() > 1) {
    pc.getRange(2, 1, pc.getLastRow() - 1, 3).getValues().forEach(function (r) {
      if (String(r[1]).trim() === madot) cho[String(r[2]).trim()] = r[0];
    });
  }
  const xem = {};
  const xl = ss.getSheetByName(TAB_XL);
  if (xl && xl.getLastRow() > 1) {
    xl.getRange(2, 1, xl.getLastRow() - 1, 3).getValues().forEach(function (r) {
      if (String(r[1]).trim() !== madot) return;
      const ma = String(r[2]).trim();
      xem[ma] = xem[ma] || {lan: 0, luc: null};
      xem[ma].lan++;
      if (r[0] instanceof Date && (!xem[ma].luc || r[0] > xem[ma].luc)) xem[ma].luc = r[0];
    });
  }
  const vang = {};
  docVang().forEach(function (v) { if (v.madot === madot) vang[v.mahs] = v; });
  const ngay = function (x) { return x instanceof Date ? x.toISOString() : ''; };
  const hs = ds.map(function (r) {
    const ma = String(r[0]).trim(), n = nop[ma], s = bd[ma];
    const o = {mahs: ma, hoten: String(r[1]).trim()};
    if (s && (!n || s.lan > n.lan)) { o.tt = 'danglam'; o.batdau = ngay(s.luc); o.lan = s.lan; }
    else if (n) { o.tt = 'danop'; o.diem = n.diem; o.dung = n.dung; o.tong = n.tong; o.luc = ngay(n.luc); o.giay = n.giay; o.lan = n.lan; o.pdf = n.pdf; }
    else if (cho[ma]) { o.tt = 'dangcho'; o.vaocho = ngay(cho[ma]); }
    else o.tt = 'chua';
    if (xem[ma]) { o.daxem = xem[ma].lan; o.xemluc = ngay(xem[ma].luc); }
    if (vang[ma]) o.vang = vang[ma].ghichu || 'Vắng';
    return o;
  });
  return {ok: true, lop: lopNay(), madot: madot, bayGio: new Date().toISOString(), hs: hs};
}

// ---------------------------------------------------------------------
// KHOI 5 - Ho so hoc sinh: lich su diem + link PDF tung bai, bang diem
// ---------------------------------------------------------------------
// Tra ve toan bo bai da nop cua lop (moi lan lam la 1 dong) de trang GV ve bang diem/ho so
function hoSoLop() {
  const ss = SpreadsheetApp.getActive();
  const dsSh = ss.getSheetByName(TAB_DS);
  const hs = dsSh.getRange(2, 1, Math.max(dsSh.getLastRow() - 1, 1), 2).getValues()
    .filter(function (r) { return String(r[0]).trim() !== ''; })
    .map(function (r) { return {mahs: String(r[0]).trim(), hoten: String(r[1]).trim()}; });
  const ten = {};
  try { docCauHinh().forEach(function (c) { ten[c.madot] = c.ten; }); } catch (e) {}
  const bai = [], dauTien = {};
  const bl = ss.getSheetByName(TAB_BL);
  if (bl && bl.getLastRow() > 1) {
    bl.getRange(2, 1, bl.getLastRow() - 1, HEAD_BL.length).getValues().forEach(function (r) {
      const madot = String(r[1]).trim(), ma = String(r[2]).trim();
      if (!madot || !ma) return;
      const luc = r[0] instanceof Date ? r[0].getTime() : 0;
      if (!(madot in dauTien) || (luc && luc < dauTien[madot])) dauTien[madot] = luc;
      bai.push({mahs: ma, madot: madot, diem: Number(String(r[5]).replace(',', '.')) || 0, dung: r[6], tong: r[7],
        giay: Number(r[8]) || 0, luc: luc ? new Date(luc).toISOString() : '', pdf: String(r[10] || ''), lan: Number(r[11]) || 1});
    });
  }
  // Luot choi tro choi (cac tro choi gui ket qua "dung/tong" vao tab HOAT DONG)
  const choi = [];
  const hd = ss.getSheetByName(TAB_HD);
  if (hd && hd.getLastRow() > 1) {
    hd.getRange(2, 1, hd.getLastRow() - 1, HEAD_HD.length).getValues().forEach(function (r) {
      const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(String(r[6]).trim());
      if (!m) return;
      choi.push({mahs: String(r[2]).trim(), tro: String(r[1]).trim(), ten: String(r[4] || r[1]).trim(),
        dung: Number(m[1].replace(',', '.')), tong: Number(m[2]), diem: r[5], giay: Number(r[7]) || 0,
        luc: r[0] instanceof Date ? r[0].toISOString() : ''});
    });
  }
  const choiNhom = [];
  const cn = ss.getSheetByName(TAB_CN);
  if (cn && cn.getLastRow() > 1) {
    cn.getRange(2, 1, cn.getLastRow() - 1, HEAD_CN.length).getValues().forEach(function (r) {
      const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(String(r[5]).trim());
      choiNhom.push({nhom: chuanNhom(r[3]), tro: String(r[1]), ten: String(r[2] || r[1]), diem: r[4],
        dung: m ? Number(m[1].replace(',', '.')) : 0, tong: m ? Number(m[2]) : 0, giay: Number(r[6]) || 0,
        luc: r[0] instanceof Date ? r[0].toISOString() : ''});
    });
  }
  const vang = docVang();
  vang.forEach(function (v) { if (!(v.madot in dauTien)) { dauTien[v.madot] = v.luc ? new Date(v.luc).getTime() : 0; } });
  const dot2 = Object.keys(dauTien).sort(function (a, b) { return dauTien[a] - dauTien[b]; })
    .map(function (m) { return {madot: m, ten: ten[m] || m, luc: dauTien[m] ? new Date(dauTien[m]).toISOString() : ''}; });
  return {ok: true, lop: lopNay(), hs: hs, dot: dot2, bai: bai, vang: vang, choi: choi, choiNhom: choiNhom, nhom: docNhom(), bayGio: new Date().toISOString()};
}
// Lop nay da thi nhung dot nao, bao nhieu em da nop (de trang GV ghi "Da thi: 12G01 (38)")
function gvDaThi() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const m = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 2, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
      const d = String(r[0]).trim(), ma = String(r[1]).trim();
      if (!d || !ma) return;
      (m[d] = m[d] || {})[ma] = 1;
    });
  }
  const dathi = {};
  Object.keys(m).forEach(function (d) { dathi[d] = Object.keys(m[d]).length; });
  return {ok: true, lop: lopNay(), dathi: dathi};
}
// Thong ke tung cau cua 1 dot trong lop nay (lan lam sau cung moi em): % sai, cac lua chon
function gvCau(d) {
  const madot = String(d.madot || '').trim();
  const de = docDe(madot);
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const bai = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues().forEach(function (r) {
      if (String(r[1]).trim() !== madot) return;
      const ma = String(r[2]).trim(), lan = Number(r[11]) || 1;
      if (!bai[ma] || lan >= bai[ma].lan) bai[ma] = {lan: lan, ct: r[9]};
    });
  }
  const ds = Object.keys(bai), n = ds.length;
  const tk = de.map(function (q) {
    return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, dapan: q.da, sai: 0, bo: 0, dem: {}, saiY: [0, 0, 0, 0]};
  });
  ds.forEach(function (ma) {
    const chon = tachChiTiet(bai[ma].ct);
    chamBai(de, function (q, i) { return chon[i]; }).ct.forEach(function (r, i) {
      const t = tk[i];
      if (!r.chon) t.bo++;
      if (!r.dung) t.sai++;
      if (t.loai === 'DS') { for (let k = 0; k < 4; k++) if ((r.chon || '')[k] !== t.dapan[k]) t.saiY[k]++; }
      else { const c = r.chon ? String(r.chon) : '(bỏ trống)'; t.dem[c] = (t.dem[c] || 0) + 1; }
    });
  });
  return {ok: true, lop: lopNay(), madot: madot, soBai: n, cau: tk};
}
// ---------------------------------------------------------------------
// Danh gia kien thuc: tab KIEN THUC trong kho de (MaDot | Cau | KienThuc | MucDo)
// gvKienThuc: ket qua tung em tung cau (0..1; cau dung/sai chia theo so y dung/4) cua 1 dot hoac tat ca dot lop da lam
// ---------------------------------------------------------------------
function docKienThuc() {
  const sh = kho().getSheetByName('KIEN THUC'), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(function (r) {
    if (String(r[0]).trim() === '') return;
    m[String(r[0]).trim() + '|' + String(r[1]).trim()] = {kt: String(r[2] || '').trim(), md: String(r[3] || '').trim()};
  });
  return m;
}
function gvKienThuc(d) {
  const madot = String(d.madot || '').trim();
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const bai = {}, thuTu = [], dau = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues().forEach(function (r) {
      const md = String(r[1]).trim(), ma = String(r[2]).trim(), lan = Number(r[11]) || 1;
      if (!md || !ma || (madot && md !== madot)) return;
      if (!bai[md]) { bai[md] = {}; thuTu.push(md); }
      const luc = r[0] instanceof Date ? r[0].getTime() : 0;
      if (!(md in dau) || (luc && luc < dau[md])) dau[md] = luc;
      if (!bai[md][ma] || lan >= bai[md][ma].lan) bai[md][ma] = {lan: lan, ct: r[9]};
    });
  }
  if (madot && !bai[madot]) { bai[madot] = {}; thuTu.push(madot); }
  const kt = docKienThuc(), ten = {};
  try { docCauHinh().forEach(function (c) { ten[c.madot] = c.ten; }); } catch (e) {}
  const dot = [];
  thuTu.forEach(function (md) {
    let de;
    try { de = docDe(md); } catch (e) { return; }
    const kq = {};
    Object.keys(bai[md]).forEach(function (ma) {
      const chon = tachChiTiet(bai[md][ma].ct);
      kq[ma] = chamBai(de, function (q, i) { return chon[i]; }).ct.map(function (r) { return r.loai === 'DS' ? r.soY / 4 : (r.dung ? 1 : 0); });
    });
    dot.push({madot: md, ten: ten[md] || md, luc: dau[md] ? new Date(dau[md]).toISOString() : '', kq: kq,
      cau: de.map(function (q) { const x = kt[md + '|' + q.cau] || {}; return {cau: q.cau, loai: q.loai, kt: x.kt || '', md: x.md || ''}; })});
  });
  const dsh = SpreadsheetApp.getActive().getSheetByName(TAB_DS), hs = [];
  if (dsh && dsh.getLastRow() > 1) dsh.getRange(2, 1, dsh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (String(r[0]).trim()) hs.push({mahs: String(r[0]).trim(), hoten: String(r[1]).trim()});
  });
  return {ok: true, lop: lopNay(), hs: hs, dot: dot, coNhan: Object.keys(kt).length > 0};
}
// AI nhan xet: nhan so lieu tong hop (khong co ten hoc sinh), tra loi nhan xet + goi y day lai
function gvAINhanXet(d) {
  const t = d.tk || {};
  const dong = (t.kt || []).slice(0, 15).map(function (k) {
    return '- ' + k.kt + ' [' + (k.md || '?') + ']: ' + k.sai + '% sai, ' + k.cau + ' câu, ' + k.yeu + ' em yếu';
  }).join('\n');
  const yeuCau = 'Lớp ' + (t.lop || lopNay()) + ', bài: ' + (t.ten || '') + '. Số bài nộp: ' + (t.soBai || 0) + ', điểm trung bình ' + (t.tb || '?') + '/10.\n' +
    'Tỉ lệ làm sai theo từng kiến thức (yêu cầu cần đạt, mức độ Biết/Hiểu/Vận dụng), xếp từ sai nhiều đến ít:\n' + dong + '\n' +
    (t.mucDo ? 'Tỉ lệ sai theo mức độ: ' + t.mucDo + '.\n' : '') +
    'Số em cần hỗ trợ (đúng dưới 65% ở ít nhất một kiến thức): ' + (t.soYeu || 0) + '.\n' +
    'Viết nhận xét ngắn gọn, cụ thể cho giáo viên Hóa học bằng tiếng Việt. Trả về JSON đúng dạng: ' +
    '{"tong_quan": "3-4 câu nhận xét chung", "kien_thuc": [{"ten": "tên kiến thức yếu", "vi_sao": "nguyên nhân học sinh hay sai", "day_lai": "gợi ý cách dạy lại, 1-2 hoạt động cụ thể"}], "nhom_yeu": "gợi ý hỗ trợ nhóm học sinh yếu", "on_tap": "gợi ý 3-5 dạng câu hỏi ôn tập"}. ' +
    'Chỉ đưa 3-5 kiến thức yếu nhất vào kien_thuc.';
  const kq = goiAI(yeuCau);
  return {ok: true, nx: kq};
}
// GV ghi HS vang thi 1 dot (kem ghi chu: co phep / khong phep / thi bu ngay...). Dong sau cung thang.
function gvVang(d) {
  const ma = String(d.mahs || '').trim(), madot = String(d.madot || '').trim();
  const hs = timHS(ma);
  if (!hs || !madot) return {ok: false, msg: 'Thieu ma HS hoac ma dot'};
  ghiDong(TAB_VG, HEAD_VG, [new Date(), madot, ma, hs.ten, String(d.ghichu || '').slice(0, 200), d.xoa ? 'XOA' : 'VANG']);
  return {ok: true, vang: docVang()};
}
// {mahs|madot: {ghichu, luc}} - chi cac em dang bi ghi vang
function docVang() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_VG);
  const m = {};
  if (!sh || sh.getLastRow() < 2) return [];
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_VG.length).getValues().forEach(function (r) {
    const k = String(r[2]).trim() + '|' + String(r[1]).trim();
    if (String(r[5]).trim() === 'XOA') delete m[k];
    else m[k] = {mahs: String(r[2]).trim(), madot: String(r[1]).trim(), ghichu: String(r[4] || ''),
      luc: r[0] instanceof Date ? r[0].toISOString() : ''};
  });
  return Object.keys(m).map(function (k) { return m[k]; });
}
// Diem tinh vao bang diem = lan lam sau cung (lan lam lai do GV cho phep)
function diemSauCung(bai) {
  const m = {};
  bai.forEach(function (b) {
    const k = b.mahs + '|' + b.madot;
    if (!m[k] || b.lan > m[k].lan || (b.lan === m[k].lan && b.luc > m[k].luc)) m[k] = b;
  });
  return m;
}
// Ghi tab BANG DIEM trong file SO THEO DOI nay (ghi de moi lan cap nhat)
function ghiBangDiem() {
  const h = hoSoLop();
  const m = diemSauCung(h.bai);
  const vg = {};
  (h.vang || []).forEach(function (v) { vg[v.mahs + '|' + v.madot] = 1; });
  const head = ['STT', 'MaHS', 'Ho ten'].concat(h.dot.map(function (d) { return d.ten; })).concat(['So bai', 'Diem TB']);
  const rows = h.hs.map(function (x, i) {
    let tong = 0, n = 0;
    const o = [i + 1, x.mahs, x.hoten].concat(h.dot.map(function (d) {
      const b = m[x.mahs + '|' + d.madot];
      if (!b) return vg[x.mahs + '|' + d.madot] ? 'V' : '';
      tong += b.diem; n++;
      return b.diem;
    }));
    return o.concat([n, n ? Math.round(tong / n * 100) / 100 : '']);
  });
  const tbLop = ['', '', 'TB lop'].concat(h.dot.map(function (d) {
    let t = 0, n = 0;
    h.hs.forEach(function (x) { const b = m[x.mahs + '|' + d.madot]; if (b) { t += b.diem; n++; } });
    return n ? Math.round(t / n * 100) / 100 : '';
  })).concat(['', '']);
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('BANG DIEM') || ss.insertSheet('BANG DIEM');
  sh.clear();
  const all = [head].concat(rows).concat([tbLop]);
  sh.getRange(1, 1, all.length, head.length).setValues(all);
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setWrap(true);
  sh.getRange(all.length, 1, 1, head.length).setFontWeight('bold');
  sh.getRange(1, 4, 1, 1).setNote('Diem moi bai = lan lam sau cung; V = vang thi (xem tab VANG THI). Ma dot: ' + h.dot.map(function (d) { return d.madot; }).join(', '));
  sh.setFrozenRows(1); sh.setFrozenColumns(3);
  SpreadsheetApp.flush();
  return {ok: true, lop: h.lop, soHS: h.hs.length, soBai: h.dot.length};
}
function menuBangDiem() {
  const r = ghiBangDiem();
  SpreadsheetApp.getUi().alert('Đã cập nhật tab BANG DIEM: ' + r.soHS + ' học sinh, ' + r.soBai + ' bài kiểm tra.');
}

// HS o phong cho hoi trang thai (cache 5 giay de do tai)
function trangThaiDot(madot) {
  madot = String(madot || '').trim();
  const cache = CacheService.getScriptCache();
  let r = null;
  const daCo = cache.get('tt_' + madot);
  if (daCo) r = JSON.parse(daCo);
  else {
    const c = timDot(madot);
    r = {ok: true, tt: c ? c.tt : 'DONG', hetLuc: c && c.batdauluc ? c.batdauluc + c.phut * 60000 : 0};
    try { cache.put('tt_' + madot, JSON.stringify(r), 3); } catch (e) {}
  }
  if (r.tt === 'MO') r.khoa = khoaDot(madot);
  r.bayGio = Date.now();
  return r;
}
// HS da mo de tu phong cho -> ghi "dang lam" cho trang giao vien
function ghiVaoBai(d) {
  const ma = String(d.mahs || '').trim();
  if (!timHS(ma)) return {ok: false};
  ghiDong(TAB_BD, HEAD_BD, [new Date(), String(d.madot || '').trim(), ma, Math.max(1, Number(d.lan) || 1)]);
  return {ok: true};
}
// Chia khoa rieng cho moi dot (luu trong Script Properties cua so theo doi)
function khoaDot(madot) {
  const p = PropertiesService.getScriptProperties();
  let k = p.getProperty('khoa_' + madot);
  if (!k) { k = Utilities.getUuid().replace(/-/g, ''); p.setProperty('khoa_' + madot, k); }
  return k;
}
// Ma hoa XOR don gian: chi de HS khong doc duoc de truoc gio bat dau
function maHoa(obj, khoa) {
  const b = Utilities.newBlob(JSON.stringify(obj)).getBytes();
  const k = [];
  for (let i = 0; i < khoa.length; i += 2) k.push(parseInt(khoa.substr(i, 2), 16));
  const out = b.map(function (x, i) { let v = ((x & 255) ^ k[i % k.length]) & 255; return v > 127 ? v - 256 : v; });
  return Utilities.base64Encode(out);
}

function ghiDong(tab, head, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    layTab(tab, head).appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

// =====================================================================
// TRO CHOI - quan ly chung trong KHO DE (tab TRO CHOI, tu tao khi chua co)
// MaTro | TenTro | Kieu (CA NHAN/NHOM) | Khoi | File | TrangThai (MO/DONG) | ThoiGian_phut | Lop
// Tro choi dang nhap / mo khoa qua so lop; ket qua ghi vao HOAT DONG / TRO CHOI NHOM cua so lop.
// =====================================================================
const TAB_TC = 'TRO CHOI';
const HEAD_TC = ['MaTro', 'TenTro', 'Kieu', 'Khoi', 'File', 'TrangThai', 'ThoiGian_phut', 'Lop'];
const TC_MAC_DINH = [
  ['DAINOI-HOA10', 'Đại Nội Huế – Hóa 10', 'CA NHAN', 10, 'DAINOI-HOA10.html', 5],
  ['CHIMDUATHU-HOA10', 'Chim đưa thư – Hóa 10', 'CA NHAN', 10, 'HOA10-CHIMDUATHU.html', 5],
  ['DUAXEF1-HOA10', 'Đua xe F1 – Hóa 10', 'CA NHAN', 10, 'HOA10-DUAXEF1-CANHAN.html', 5],
  ['LANGBIANG-HOA10', 'Leo Langbiang – Hóa 10', 'CA NHAN', 10, 'LANGBIANG-HOA10.html', 5],
  ['CHIMDUATHU-HOA10-NHOM', 'Chim đưa thư – Hóa 10 (nhóm)', 'NHOM', 10, 'HOA10-CHIMDUATHU-NHOM.html', 5],
  ['DUAXEF1-HOA10-NHOM', 'Đua xe F1 – Hóa 10 (nhóm)', 'NHOM', 10, 'HOA10-DUAXEF1-NHOM.html', 5],
  ['RUONGLUA-CHUKI-NHOM', 'Ruộng lúa Chu kì (nhóm)', 'NHOM', 10, 'RUONGLUA-CHUKI-NHOM.html', 5],
  ['DUAXEF1-POLYMER-H12', 'Đua xe F1 Polymer – Hóa 12', 'CA NHAN', 12, 'HOA12-DUAXEF1-POLYMER-CANHAN.html', 5],
  ['POLYMER-F1', 'Polymer F1 – Hóa 12', 'CA NHAN', 12, 'POLYMER-F1.html', 5],
  ['DUAXEF1-POLYMER-H12-NHOM', 'Đua xe F1 Polymer – Hóa 12 (nhóm)', 'NHOM', 12, 'HOA12-DUAXEF1-POLYMER.html', 5],
  ['DAINOI-KHTN9', 'Đại Nội Huế – KHTN 9', 'CA NHAN', 9, 'DAINOI-KHTN9.html', 5]
];
function lopMacDinh(khoi) {
  if (/DEMO/.test(khongDau(lopNay()))) return 'TAT CA';
  return {9: '9D01, 9D03', 10: '10E01', 12: '12G01, 12G02'}[khoi] || 'TAT CA';
}
function chuanDsLop(v) {
  const ds = (Array.isArray(v) ? v : String(v || '').split(',')).map(function (x) { return khongDau(x).replace(/\s+/g, ''); })
    .filter(function (x) { return x && x !== 'TATCA'; });
  return ds.length ? ds.join(', ') : 'TAT CA';
}
function tabTroChoi() {
  const ss = kho();
  let sh = ss.getSheetByName(TAB_TC);
  if (!sh) {
    sh = ss.insertSheet(TAB_TC);
    sh.getRange(1, 1, 1, HEAD_TC.length).setValues([HEAD_TC]).setFontWeight('bold');
  }
  // Them tro moi trong danh sach mac dinh neu tab chua co (khong dong cham dong cu)
  const co = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { co[String(r[0]).trim()] = 1; });
  const them = TC_MAC_DINH.filter(function (t) { return !co[t[0]]; })
    .map(function (t) { return [t[0], t[1], t[2], t[3], t[4], 'MO', t[5], lopMacDinh(t[3])]; });
  if (them.length) sh.getRange(sh.getLastRow() + 1, 1, them.length, HEAD_TC.length).setValues(them);
  return sh;
}
function docTroChoi() {
  const sh = tabTroChoi();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, HEAD_TC.length).getValues().map(function (r, i) {
    return {dong: i + 2, matro: String(r[0]).trim(), ten: String(r[1] || r[0]).trim(), kieu: khongDau(r[2]) === 'NHOM' ? 'NHOM' : 'CA NHAN',
      khoi: String(r[3]).trim(), file: String(r[4]).trim(), mo: khongDau(r[5]) !== 'DONG', phut: Number(r[6]) || 5,
      lop: khongDau(r[7]) || 'TAT CA'};
  }).filter(function (t) { return t.matro; });
}
function tcVao(d) {
  const t = docTroChoi().filter(function (x) { return x.matro === String(d.matro || '').trim(); })[0];
  if (!t) return {ok: false, loi: 'khongco', msg: 'Trò chơi này chưa có trong danh sách quản lý của giáo viên.'};
  if (!t.mo) return {ok: false, loi: 'dong', msg: 'Trò chơi đang đóng. Em chờ giáo viên mở nhé.'};
  if (!hopLop(t)) return {ok: false, loi: 'lop', msg: 'Trò chơi này chưa mở cho lớp ' + lopNay() + '.'};
  if (String(d.ma || '').trim() !== docMa().tcvao) return {ok: false, loi: 'ma', msg: 'Mã vào chơi không đúng.'};
  return {ok: true, phut: t.phut, ten: t.ten};
}
function tcMoKhoa(d) {
  return {ok: String(d.ma || '').trim() !== '' && String(d.ma || '').trim() === docMa().tcmokhoa};
}
function gvTroChoi() {
  const m = docMa();
  return {ok: true, lop: lopNay(), tro: docTroChoi(), coMaTc: m.coTc, coMaTcMk: m.coTcMk};
}
function gvTcDat(d) {
  const sh = tabTroChoi();
  const t = docTroChoi().filter(function (x) { return x.matro === String(d.matro || '').trim(); })[0];
  if (!t) return {ok: false, msg: 'Khong tim thay tro ' + d.matro};
  if (d.truong === 'tt') sh.getRange(t.dong, 6).setValue(d.giatri === true || d.giatri === 'MO' ? 'MO' : 'DONG');
  else if (d.truong === 'phut') {
    const ph = Math.round(Number(d.giatri));
    if (!(ph >= 1 && ph <= 60)) return {ok: false, msg: 'Thoi gian phai tu 1 den 60 phut'};
    sh.getRange(t.dong, 7).setValue(ph);
  } else if (d.truong === 'lop') sh.getRange(t.dong, 8).setValue(chuanDsLop(d.giatri));
  else return {ok: false, msg: 'Truong khong hop le'};
  SpreadsheetApp.flush();
  return gvTroChoi();
}
// Ket qua tro choi cua lop nay: ca nhan (HOAT DONG) va nhom (TRO CHOI NHOM)
function gvTcKetQua(d) {
  const ss = SpreadsheetApp.getActive();
  const loc = String(d.matro || '').trim();
  function tg(v) { return v instanceof Date ? v.getTime() : (v ? new Date(v).getTime() || 0 : 0); }
  const canhan = [], nhom = [];
  const hd = ss.getSheetByName(TAB_HD);
  if (hd && hd.getLastRow() > 1) hd.getRange(2, 1, hd.getLastRow() - 1, HEAD_HD.length).getValues().forEach(function (r) {
    const mt = String(r[1]).trim();
    if (!mt || (loc && mt !== loc)) return;
    canhan.push([tg(r[0]), mt, String(r[2]).trim(), String(r[3]).trim(), String(r[6]), Number(r[7]) || 0]);
  });
  const cn = ss.getSheetByName(TAB_CN);
  if (cn && cn.getLastRow() > 1) cn.getRange(2, 1, cn.getLastRow() - 1, HEAD_CN.length).getValues().forEach(function (r) {
    const mt = String(r[1]).trim();
    if (!mt || (loc && mt !== loc)) return;
    nhom.push([tg(r[0]), mt, String(r[3]).trim(), String(r[5]), Number(r[6]) || 0]);
  });
  // Thanh vien tung nhom (ten hoc sinh) + si so lop
  const ten = {}, tv = {}, m = docNhom();
  const ds = ss.getSheetByName(TAB_DS);
  let siSo = 0;
  if (ds && ds.getLastRow() > 1) ds.getRange(2, 1, ds.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (String(r[0]).trim()) { siSo++; ten[String(r[0]).trim()] = String(r[1]).trim(); }
  });
  Object.keys(m).forEach(function (ma) { (tv[m[ma]] = tv[m[ma]] || []).push(ten[ma] || ma); });
  return {ok: true, lop: lopNay(), siSo: siSo, canhan: canhan, nhom: nhom, thanhvien: tv};
}
// Cac ma trong tab MA (chi giao vien da dang nhap bang ma quan ly moi doc / doi duoc)
const MA_TEN = ['MaGV', 'MaMoKhoa', 'MaLamLai', 'MaQuanLy', 'MaTroChoi', 'MaMoKhoaTroChoi'];
function gvMa() {
  const m = {};
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[khongDau(r[0]).replace(/\s+/g, '')] = String(r[1]).trim(); });
  return {ok: true, demo: /DEMO/.test(khongDau(lopNay())), ma: MA_TEN.map(function (t) { return {ten: t, gt: m[t.toUpperCase()] || ''}; })};
}
function gvMaDat(d) {
  if (/DEMO/.test(khongDau(lopNay()))) return {ok: false, msg: 'Bản dùng thử không đổi được mã.'};
  const ten = MA_TEN.filter(function (t) { return t === d.ten; })[0];
  if (!ten) return {ok: false, msg: 'Ten ma khong hop le'};
  const gt = String(d.giatri || '').trim();
  if (!/^[A-Za-z0-9]{2,12}$/.test(gt)) return {ok: false, msg: 'Mã gồm 2–12 chữ số hoặc chữ cái, không dấu, không khoảng trắng.'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = kho().getSheetByName('MA');
    const v = sh.getDataRange().getValues();
    let dong = 0;
    for (let i = 0; i < v.length; i++) if (khongDau(v[i][0]).replace(/\s+/g, '') === ten.toUpperCase()) { dong = i + 1; break; }
    if (!dong) { dong = v.length + 1; sh.getRange(dong, 1).setValue(ten); }
    sh.getRange(dong, 2).setNumberFormat('@').setValue(gt);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return gvMa();
}

// =====================================================================
// TIN NHAN hoc sinh <-> giao vien (moi em mot cuoc tro chuyen, tab TIN NHAN cua so lop)
// Tu: HS | GV. DaDoc: nguoi nhan da doc (CO / trong).
// =====================================================================
function docTin() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_TIN);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_TIN.length).getValues().map(function (r, i) {
    return {dong: i + 2, t: r[0] instanceof Date ? r[0].getTime() : 0, mahs: String(r[1]).trim(), ten: String(r[2]).trim(), tu: String(r[3]).trim(),
      nd: String(r[4]), madot: String(r[5]).trim(), cau: String(r[6]).trim(), doc: khongDau(r[7]) === 'CO', ma: String(r[8])};
  }).filter(function (x) { return x.mahs && x.nd; });
}
function demTinMoi(mahs, tu) {
  return docTin().filter(function (x) { return x.mahs === mahs && x.tu === tu && !x.doc; }).length;
}
function danhDauDoc(mahs, tu) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_TIN);
  if (!sh) return;
  docTin().forEach(function (x) { if (x.mahs === mahs && x.tu === tu && !x.doc) sh.getRange(x.dong, 8).setValue('CO'); });
}
function tinGon(x) { return {t: x.t, tu: x.tu, nd: x.nd, madot: x.madot, cau: x.cau, doc: x.doc}; }
function kiemHS(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!hs || !hs.maxem || String(d.maxem || '').trim() !== hs.maxem) return null;
  hs.ma = ma; return hs;
}
function hsGuiTin(d) {
  const hs = kiemHS(d);
  if (!hs) return {ok: false, msg: 'SBD hoac ma xem bai chua dung'};
  const nd = String(d.noidung || '').trim().slice(0, 1500);
  if (!nd) return {ok: false, msg: 'Tin nhắn trống'};
  ghiDong(TAB_TIN, HEAD_TIN, [new Date(), hs.ma, hs.ten, 'HS', nd, String(d.madot || '').slice(0, 60), String(d.cau || '').slice(0, 20), '', Utilities.getUuid()]);
  return hsXemTin(d);
}
function hsXemTin(d) {
  const hs = kiemHS(d);
  if (!hs) return {ok: false, msg: 'SBD hoac ma xem bai chua dung'};
  const ds = docTin().filter(function (x) { return x.mahs === hs.ma; });
  danhDauDoc(hs.ma, 'GV');
  return {ok: true, tin: ds.map(tinGon)};
}
// GV: danh sach cuoc tro chuyen cua lop nay
function gvTin() {
  const m = {};
  docTin().forEach(function (x) {
    const c = m[x.mahs] = m[x.mahs] || {mahs: x.mahs, ten: x.ten, chuaDoc: 0, so: 0, cuoi: null};
    c.so++; if (x.tu === 'HS' && !x.doc) c.chuaDoc++;
    if (x.tu === 'HS' && x.ten) c.ten = x.ten;
    c.cuoi = tinGon(x);
  });
  const ds = Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.cuoi.t - a.cuoi.t; });
  return {ok: true, lop: lopNay(), chuaDoc: ds.reduce(function (s, c) { return s + c.chuaDoc; }, 0), ds: ds};
}
function gvTinHS(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  const ds = docTin().filter(function (x) { return x.mahs === ma; });
  if (d.danhdau !== false) danhDauDoc(ma, 'HS');
  return {ok: true, mahs: ma, ten: hs ? hs.ten : '', tin: ds.map(tinGon), cau: ngucanhCau(ma, ds)};
}
function gvTinGui(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Khong tim thay hoc sinh'};
  const nd = String(d.noidung || '').trim().slice(0, 3000);
  if (!nd) return {ok: false, msg: 'Tin nhắn trống'};
  ghiDong(TAB_TIN, HEAD_TIN, [new Date(), ma, hs.ten, 'GV', nd, String(d.madot || ''), String(d.cau || ''), '', Utilities.getUuid()]);
  danhDauDoc(ma, 'HS');
  return gvTinHS({mahs: ma, danhdau: false});
}
function boThe(h) { return String(h || '').replace(/<sup>(.*?)<\/sup>/gi, '^$1').replace(/<sub>(.*?)<\/sub>/gi, '_$1').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
// Noi dung cac cau HS dang hoi (de bai, dap an, em chon) – de GV xem va AI goi y
function ngucanhCau(ma, ds) {
  const can = {};
  ds.forEach(function (x) { if (x.madot && x.cau) can[x.madot + '|' + x.cau] = 1; });
  const out = {};
  Object.keys(can).slice(-8).forEach(function (k) {
    const p = k.split('|'), madot = p[0], cau = p[1];
    try {
      const bai = timBaiDaNop(madot, ma), de = docDe(madot);
      const chon = bai ? tachChiTiet(bai.chitiet) : {};
      const kq = chamBai(de, function (q, i) { return chon[i]; });
      const q = kq.ct.filter(function (c) { return String(c.cau) === cau; })[0];
      const c = timDot(madot);
      if (q) out[k] = {ten: c ? c.ten : madot, cau: cau, loai: q.loai, hoi: boThe(q.hoi),
        pa: q.pa ? ['A', 'B', 'C', 'D'].map(function (x) { return q.pa[x] ? x + '. ' + boThe(q.pa[x]) : ''; }).filter(String) : [],
        dapan: String(q.dapan), chon: String(q.chon || ''), dung: !!q.dung};
    } catch (e) {}
  });
  return out;
}
function gvTinGoiY(d) {
  if (typeof goiAI !== 'function') return {ok: false, msg: 'Sổ lớp này chưa dán bản SoTheoDoi.gs mới (có phần AI) nên chưa gợi ý được.'};
  const ma = String(d.mahs || '').trim();
  const ds = docTin().filter(function (x) { return x.mahs === ma; }).slice(-8);
  if (!ds.length) return {ok: false, msg: 'Chưa có tin nhắn'};
  const nc = ngucanhCau(ma, ds);
  const ctx = Object.keys(nc).map(function (k) { const q = nc[k];
    return 'Câu ' + q.cau + ' (' + q.ten + ', loại ' + q.loai + '): ' + q.hoi + (q.pa.length ? '\n' + q.pa.join('\n') : '') + '\nĐáp án đúng: ' + q.dapan + '. Học sinh đã chọn: ' + (q.chon || 'bỏ trống') + (q.dung ? ' (đúng)' : ' (sai)'); }).join('\n\n');
  const hoi = ds.map(function (x) { return (x.tu === 'HS' ? 'Học sinh' : 'Giáo viên') + ': ' + x.nd; }).join('\n');
  const yeuCau = (ctx ? 'Nội dung câu hỏi trong bài kiểm tra học sinh đang hỏi:\n' + ctx + '\n\n' : '') +
    'Cuộc trò chuyện (mới nhất ở cuối):\n' + hoi + '\n\n' +
    'Soạn câu trả lời của giáo viên Hóa học gửi học sinh: tiếng Việt, xưng "thầy/cô" và gọi "em", thân thiện, ngắn gọn (tối đa 120 chữ), ' +
    'giải thích đúng bản chất, chỉ ra chỗ em hay nhầm, gợi ý cách tự kiểm tra; không chỉ đưa đáp án. Dùng tên chất theo IUPAC như sách Kết nối tri thức. Số thập phân dùng dấu chấm. ' +
    'Trả về JSON đúng dạng: {"tra_loi": "nội dung"}.';
  const kq = goiAI(yeuCau);
  return {ok: true, goiy: String(kq.tra_loi || kq.traLoi || '')};
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
      tt: ['MO', 'CHO'].indexOf(khongDau(r[3])) >= 0 ? khongDau(r[3]) : 'DONG',
      mo: khongDau(r[3]) === 'MO', cho: khongDau(r[3]) === 'CHO', xemlai: khongDau(r[4]) === 'CO',
      lop: khongDau(r[5]) || 'TAT CA',
      batdauluc: r[6] instanceof Date ? r[6].getTime() : 0
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
// Tab MA: cot A ten ma, cot B gia tri (MaGV, MaMoKhoa, MaLamLai)
function docMa() {
  const m = {};
  // ten ma khong phan biet hoa/thuong, dau cach (MaQuanLy = maquanly = Ma Quan Ly)
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[khongDau(r[0]).replace(/\s+/g, '')] = String(r[1]).trim(); });
  return {gv: m['MAGV'] || '', mokhoa: m['MAMOKHOA'] || '', lamlai: m['MALAMLAI'] || '', quanly: m['MAQUANLY'] || '',
    // Ma rieng cho tro choi; chua dat thi tam dung ma kiem tra
    tcvao: m['MATROCHOI'] || m['MAGV'] || '', tcmokhoa: m['MAMOKHOATROCHOI'] || m['MAMOKHOA'] || '',
    coTc: !!m['MATROCHOI'], coTcMk: !!m['MAMOKHOATROCHOI']};
}
// Tab <MaDot>: Cau | NoiDung | A | B | C | D | DapAn | Hinh | Loai (TN/DS/TLN) | Diem
//   TN : trac nghiem 4 phuong an, DapAn = A/B/C/D
//   DS : dung/sai, A-D la 4 y a)-d), DapAn = 4 chu D/S (vd DDSD)
//   TLN: tra loi ngan, DapAn = so/chu (18,36 = 18.36); nhieu cach dung ngan bang ; (phi kim; la phi kim)
//   Diem: diem toi da cua cau (de trong: TN 0,25 · DS 1 · TLN 0,25). Tong diem duoc quy ve thang 10.
function docDe(madot) {
  const sh = kho().getSheetByName(String(madot || '').trim());
  if (!sh) throw new Error('Kho de chua co tab ' + madot);
  const v = sh.getDataRange().getValues();
  v.shift();
  return v.filter(function (r) { return String(r[1]).trim() !== ''; }).map(function (r, i) {
    const loai = ['DS', 'TLN'].indexOf(khongDau(r[8])) >= 0 ? khongDau(r[8]) : 'TN';
    let da = String(r[6]).trim();
    if (loai === 'TN') da = da.toUpperCase();
    if (loai === 'DS') da = chuanDS(da);
    return {
      cau: String(r[0]).trim() || String(i + 1), hoi: String(r[1]), loai: loai,
      pa: {A: String(r[2]), B: String(r[3]), C: String(r[4]), D: String(r[5])},
      da: da, hinh: String(r[7] || '').trim(),
      w: Number(String(r[9]).replace(',', '.')) || (loai === 'DS' ? 1 : 0.25)
    };
  });
}
// ---------------------------------------------------------------------
// Cham diem theo loai cau (thang diem cua Bo: DS dung 1/2/3/4 y = 0,1/0,25/0,5/1)
// ---------------------------------------------------------------------
const THANG_DS = [0, 0.1, 0.25, 0.5, 1];
function chuanDS(s) {
  s = khongDau(s).replace(/[^DS-]/g, '');
  return (s + '----').slice(0, 4);
}
function chuanTLN(s) {
  // bo dau, khong phan biet hoa/thuong, bo khoang trang va dau cham cuoi; 18,36 = 18.36
  s = khongDau(String(s === undefined || s === null ? '' : s)).replace(/\s+/g, '').replace(/,/g, '.').replace(/\.+$/, '');
  return s;
}
// DapAn TLN co the ghi nhieu cach chap nhan, ngan bang dau ; (vd: phi kim; la phi kim)
function cacDapAnTLN(da) { return String(da).split(';').map(function (t) { return t.trim(); }).filter(String); }
function laTLNChu(q) {
  return q.loai === 'TLN' && cacDapAnTLN(q.da).some(function (t) { return isNaN(Number(chuanTLN(t))); });
}
function chamCau(q, x) {
  x = x === undefined || x === null ? '' : String(x).trim();
  if (x === '-') x = '';
  if (q.loai === 'DS') {
    x = x ? chuanDS(x) : '';
    let soY = 0;
    for (let k = 0; k < 4; k++) if (x[k] && x[k] === q.da[k]) soY++;
    return {chon: x.replace(/-+$/, '') ? x : '', dung: soY === 4, soY: soY, diemCau: THANG_DS[soY] * q.w};
  }
  if (q.loai === 'TLN') {
    x = x.replace(/\|/g, '/').slice(0, 30);
    const a = chuanTLN(x);
    const ok = a !== '' && cacDapAnTLN(q.da).some(function (t) {
      const b = chuanTLN(t);
      return a === b || (!isNaN(Number(a)) && !isNaN(Number(b)) && Number(a) === Number(b));
    });
    return {chon: x, dung: ok, soY: ok ? 1 : 0, diemCau: ok ? q.w : 0};
  }
  x = x.toUpperCase();
  const ok = x !== '' && x === q.da;
  return {chon: x, dung: ok, soY: ok ? 1 : 0, diemCau: ok ? q.w : 0};
}
// layChon(q, i) -> lua chon cua HS cho cau q
function chamBai(de, layChon) {
  let tongW = 0, tongDiem = 0, dung = 0;
  const ct = de.map(function (q, i) {
    const r = chamCau(q, layChon(q, i));
    tongW += q.w; tongDiem += r.diemCau;
    if (r.dung) dung++;
    return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: q.hinh, w: q.w,
      chon: r.chon, dapan: q.da, dung: r.dung, soY: r.soY, diemCau: Math.round(r.diemCau * 100) / 100};
  });
  return {ct: ct, dung: dung, diem: tongW ? Math.round(tongDiem / tongW * 1000) / 100 : 0};
}
// Cot ChiTiet: ban moi ngan cach bang |, ban cu bang dau phay
function tachChiTiet(s) {
  s = String(s || '');
  return (s.indexOf('|') >= 0 ? s.split('|') : s.split(',')).map(function (x) { x = String(x).trim(); return x === '-' ? '' : x; });
}
function nhanCau(q) {
  const m = String(q.cau).match(/^(I{1,3})\.(\d+)$/);
  return m ? 'Câu ' + m[2] : 'Câu ' + q.cau;
}
function phanCua(q) {
  const m = String(q.cau).match(/^(I{1,3})\./);
  return m ? m[1] : '';
}
const TEN_PHAN = {I: 'PHẦN I. Trắc nghiệm nhiều phương án lựa chọn', II: 'PHẦN II. Trắc nghiệm đúng sai', III: 'PHẦN III. Trắc nghiệm trả lời ngắn'};

// Anh trong noi dung (<img src="https://...">) -> nhung vao PDF
function nhungAnh(html) {
  return String(html).replace(/(<img[^>]*src=")(https?:\/\/[^"]+)(")/gi, function (m, a, url, c) {
    try {
      const cache = CacheService.getScriptCache();
      const key = 'u_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url));
      let uri = cache.get(key);
      if (!uri) {
        const b = UrlFetchApp.fetch(url).getBlob();
        uri = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
        try { cache.put(key, uri, 21600); } catch (e) {}
      }
      return a + uri + c;
    } catch (e) {
      return a + url + c;
    }
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
  if (/^https?:\/\//i.test(h)) return h;
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
      return {diem: v[i][5], socaudung: v[i][6], tongsocau: v[i][7], chitiet: v[i][9], lan: Number(v[i][11]) || 1,
        luc: v[i][0] instanceof Date ? v[i][0].toISOString() : ''};
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
  return Utilities.newBlob(nhungAnh(html), 'text/html', 'tam.html').getAs('application/pdf').setName(ten);
}

const CSS_PDF = 'body{font-family:Arial,sans-serif;font-size:11.5pt;color:#000}' +
  'h2{text-align:center;margin:0 0 8px}' +
  '.tt{width:100%;border-collapse:collapse;margin-bottom:10px}.tt td{padding:2px 4px}' +
  '.q{border:1px solid #000;padding:6px 10px;margin:8px 0;page-break-inside:avoid}' +
  '.kq{font-weight:bold}.pa{margin:2px 0 2px 14px}.dung{font-weight:bold}' +
  'img{max-width:330px;max-height:220px;margin:4px 0;vertical-align:middle}.pa img{max-width:150px;max-height:110px}' +
  'h3{font-size:12pt;margin:12px 0 4px}';

function htmlCau(q, coBaiLam) {
  const hinh = q.hinh ? anhDataUri(q.hinh) : '';
  const da = q.dapan || q.da;
  let s = '<div class="q"><div><b>' + nhanCau(q) + '.</b> ';
  if (coBaiLam) {
    let kq = q.chon === '' ? '[ Bỏ trống ]' : (q.dung ? '[ ✓ Đúng ]' : '[ ✗ Sai ]');
    if (q.loai === 'DS' && q.chon !== '') kq = '[ ' + (q.dung ? '✓ ' : '') + 'Đúng ' + q.soY + '/4 ý ]';
    s += '<span class="kq">' + kq + '</span> ';
  }
  s += q.hoi + '</div>';
  if (hinh) s += '<img src="' + hinh + '">';
  if (q.loai === 'DS') {
    ['A', 'B', 'C', 'D'].forEach(function (k, j) {
      const dd = da[j] === 'D' ? 'Đúng' : 'Sai';
      let nhan = ' &nbsp;← Đáp án: <b>' + dd + '</b>';
      if (coBaiLam) {
        const x = (q.chon || '')[j];
        nhan += x === 'D' || x === 'S' ? ' · Em chọn: ' + (x === 'D' ? 'Đúng' : 'Sai') + (x === da[j] ? ' ✓' : ' ✗') : ' · Em bỏ trống';
      }
      s += '<div class="pa">' + 'abcd'[j] + ') ' + q.pa[k] + nhan + '</div>';
    });
    return s + '</div>';
  }
  if (q.loai === 'TLN') {
    s += '<div class="pa dung">Đáp án: ' + esc(cacDapAnTLN(da)[0] || '') + '</div>';
    if (coBaiLam) s += '<div class="pa">Em trả lời: ' + (q.chon ? esc(q.chon) + (q.dung ? ' ✓' : ' ✗') : 'bỏ trống') + '</div>';
    return s + '</div>';
  }
  ['A', 'B', 'C', 'D'].forEach(function (k) {
    if (String(q.pa[k]).trim() === '') return;
    const laDung = k === da;
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
    theoPhan(de, function (q) { return htmlCau(q, false); }) + '</body></html>';
}
function theoPhan(ds, ve) {
  let truoc = null, s = '';
  ds.forEach(function (q) {
    const p = phanCua(q);
    if (p && p !== truoc) s += '<h3>' + TEN_PHAN[p] + '</h3>';
    truoc = p;
    s += ve(q);
  });
  return s;
}
function luuPDFBaiLam(thuMuc, c, ma, ten, now, giay, diem, dung, tong, ct, lan) {
  lan = lan || 1;
  const tz = Session.getScriptTimeZone();
  const html = '<html><head><meta charset="utf-8"><style>' + CSS_PDF + '</style></head><body>' +
    '<h2>BÀI LÀM KIỂM TRA</h2><table class="tt">' +
    '<tr><td><b>Lớp:</b> ' + esc(lopNay()) + '</td><td><b>Bài:</b> ' + esc(c.ten) + ' (' + esc(c.madot) + ')</td></tr>' +
    '<tr><td><b>Học sinh:</b> ' + esc(ten) + (lan > 1 ? ' (làm lần ' + lan + ')' : '') + '</td><td><b>Mã HS:</b> ' + esc(ma) + '</td></tr>' +
    '<tr><td><b>Nộp lúc:</b> ' + Utilities.formatDate(now, tz, 'dd/MM/yyyy HH:mm:ss') + '</td>' +
    '<td><b>Thời gian làm:</b> ' + Math.floor(giay / 60) + ' phút ' + (giay % 60) + ' giây</td></tr>' +
    '<tr><td colspan="2"><b>Điểm: ' + esc(diem) + '</b> (' + dung + '/' + tong + ' câu đúng). ' +
    'Câu chưa đúng: ' + (ct.filter(function (x) { return !x.dung; }).map(function (x) { return x.cau; }).join(', ') || 'không có') + '</td></tr>' +
    '</table>' + theoPhan(ct, function (q) { return htmlCau(q, true); }) + '</body></html>';
  const tenFile = c.madot + '_' + ma + '_' + ten + (lan > 1 ? '_lan' + lan : '') + '_' + Utilities.formatDate(now, tz, 'HHmmss') + '.pdf';
  return thuMuc.createFile(htmlSangPDF(html, tenFile)).getUrl();
}

// ---------------------------------------------------------------------
// Tien ich
// ---------------------------------------------------------------------
function lopNay() { return SpreadsheetApp.getActive().getName().replace('SO THEO DOI', '').trim() || 'LOP'; }
function khongDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').trim().toUpperCase();
}
function layTab(ten, head) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(ten) || ss.insertSheet(ten);
  if (sh.getLastRow() <= 1 || String(sh.getRange(1, head.length).getValue()) !== head[head.length - 1]) {
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  }
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
// Chi dung cho file "SO THEO DOI DEMO": tao 10 tai khoan dung thu, SBD 26999901..10, ma xem 1101..1110
function taoHocSinhThu() {
  if (lopNay().toUpperCase() !== 'DEMO') throw new Error('Chi chay ham nay trong file ten "SO THEO DOI DEMO" (de khong xoa danh sach lop that).');
  const sh = layTab(TAB_DS, ['MAHS', 'HO TEN', 'GHI CHU', 'MAXEM']);
  sh.clear();
  const v = [['MAHS', 'HO TEN', 'GHI CHU', 'MAXEM']];
  for (let i = 1; i <= 10; i++) {
    const so = ('0' + i).slice(-2);
    v.push(['269999' + so, 'Học sinh thử ' + so, 'Tài khoản dùng thử', '11' + so]);
  }
  sh.getRange(1, 1, v.length, 4).setNumberFormat('@').setValues(v);
  sh.getRange(1, 1, 1, 4).setFontWeight('bold');
  Logger.log('Da tao 10 tai khoan dung thu: SBD 01-10, ma xem 1101-1110.');
}
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
    ma.getRange(1, 1, 5, 2).setNumberFormat('@').setValues([['Ten', 'Ma'], ['MaGV', '7070'], ['MaMoKhoa', '7979'], ['MaLamLai', '8080'], ['MaQuanLy', '']]);
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

// 3) Kiem tra ket noi: ten kho de, cac dot, ma GV; tao 1 PDF bai lam thu (co hinh) trong thu muc THU
function kiemTra() {
  const ss = kho();
  Logger.log('Kho de dang dung: ' + ss.getName());
  const ds = docCauHinh();
  Logger.log('CAU HINH co ' + ds.length + ' dot: ' + ds.map(function (c) { return c.madot; }).join(', '));
  Logger.log('Ma GV: ' + (docMa().gv ? 'co' : 'CHUA CO') + ' · Ma cho lam lai: ' + (docMa().lamlai ? 'co' : 'CHUA CO') +
    ' · Ma quan ly (trang giao vien): ' + (docMa().quanly ? 'co' : 'CHUA CO - them dong MaQuanLy vao tab MA'));
  const coTab = ds.filter(function (c) { return ss.getSheetByName(c.madot); });
  const thieu = ds.filter(function (c) { return !ss.getSheetByName(c.madot); });
  if (thieu.length) Logger.log('CANH BAO - chua co tab de cho: ' + thieu.map(function (c) { return c.madot; }).join(', '));
  if (!coTab.length) throw new Error('Kho de chua co tab de nao khop voi CAU HINH');
  const c = coTab.filter(function (c) { return /<img/i.test(JSON.stringify(ss.getSheetByName(c.madot).getDataRange().getValues())); })[0] || coTab[0];
  const de = docDe(c.madot);
  Logger.log('De thu: ' + c.madot + ' (' + de.length + ' cau)');
  const kq = chamBai(de, function (q) { return q.loai === 'TN' ? q.da : q.loai === 'DS' ? 'DSDS' : '1'; });
  const tm = layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), 'THU');
  Logger.log('PDF thu (mo de xem hinh): ' + luuPDFBaiLam(tm, c, 'THU', 'Bai thu', new Date(), 75, kq.diem, kq.dung, de.length, kq.ct, 1));
}

const HINH_MAU = '<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="100" cy="100" r="42" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/>' +
  '<circle cx="100" cy="100" r="78" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/>' +
  '<circle cx="100" cy="100" r="18" fill="#fff" stroke="#000" stroke-width="2"/>' +
  '<line x1="88" y1="88" x2="112" y2="112" stroke="#000"/><line x1="112" y1="88" x2="88" y2="112" stroke="#000"/>' +
  '<g fill="#000"><circle cx="142" cy="100" r="6"/><circle cx="58" cy="100" r="6"/>' +
  '<circle cx="167.5" cy="61" r="6"/><circle cx="100" cy="22" r="6"/><circle cx="32.5" cy="61" r="6"/>' +
  '<circle cx="32.5" cy="139" r="6"/><circle cx="100" cy="178" r="6"/><circle cx="167.5" cy="139" r="6"/></g></svg>';

// =====================================================================
// KHOI 4 - PHAN TICH AI (truoc day la file rieng PhanTichAI.gs, nay da gop vao day)
// Menu "🤖 Phân tích AI" trong file SO THEO DOI:
//   1. Thống kê một đợt      -> tab "TK <MaDot>"   (khong dung AI)
//   2. AI phân tích cả lớp   -> tab "AI <MaDot>"   + de on tap "<MaDot>-OT" trong KHO DE (trang thai DONG)
//   3. AI gợi ý từng học sinh -> tab "GOI Y <MaDot>" (GV duyet, tich o ChoHSXem thi HS moi thay o trang XEM-LAI)
//   4. Làm tất cả 3 bước     5. Kiểm tra kết nối AI
// Trang giao vien: ✨ Gợi ý AI tra loi tin nhan, AI nhan xet danh gia kien thuc (ham goiAI).
// AI dung: Google Gemini (mien phi). Khoa API dat o tab MA cua KHO DE, dong "GeminiKey".
// BAO MAT: KHONG gui ho ten hoc sinh cho AI - chi gui ma HS, diem va cau sai.
// Ten hang so co hau to _AI de khong loi neu so con sot file PhanTichAI cu (nen xoa file do).
// =====================================================================

// Thu lan luot cac mo hinh nay (mo hinh dau tien dung duoc se duoc dung).
// Neu Google doi ten mo hinh, them ten moi vao dau danh sach hoac dien dong "GeminiModel" o tab MA.
const MO_HINH_AI = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

let MO_HINH_AI_DUNG = '';   // nho mo hinh goi duoc trong lan chay nay

const MUC_DIEM_AI = [
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
    .addSeparator()
    .addItem('📋 Cập nhật bảng điểm (tab BANG DIEM)', 'menuBangDiem')
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
        chon: tachChiTiet(r[9])};
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
    const n = bai.length || 1;
    let soDung = 0, saiNhieu = '', soSaiNhieu = 0;
    if (q.loai === 'TN') {
      bai.forEach(function (b) { const x = (b.chon[i] || '').toUpperCase(); if (dem[x] !== undefined && x) dem[x]++; else dem.bo++; });
      soDung = dem[q.da] || 0;
      ['A', 'B', 'C', 'D'].forEach(function (k) { if (k !== q.da && dem[k] > soSaiNhieu) { saiNhieu = k; soSaiNhieu = dem[k]; } });
    } else {
      // DS: dem so HS sai tung y a-d; TLN: dem dap an sai pho bien nhat
      const saiY = [0, 0, 0, 0], saiTLN = {};
      bai.forEach(function (b) {
        const r = chamCau(q, b.chon[i]);
        if (r.chon === '') { dem.bo++; return; }
        if (r.dung) soDung++;
        if (q.loai === 'DS') for (let k = 0; k < 4; k++) { if (r.chon[k] !== q.da[k]) saiY[k]++; }
        else if (!r.dung) saiTLN[r.chon] = (saiTLN[r.chon] || 0) + 1;
      });
      if (q.loai === 'DS') saiY.forEach(function (v, k) { if (v > soSaiNhieu) { soSaiNhieu = v; saiNhieu = 'ý ' + 'abcd'[k]; } });
      else Object.keys(saiTLN).forEach(function (k) { if (saiTLN[k] > soSaiNhieu) { soSaiNhieu = saiTLN[k]; saiNhieu = '"' + k + '"'; } });
    }
    return {stt: i, cau: q.cau, loai: q.loai, hoi: boTheAI(q.hoi), pa: {A: boTheAI(q.pa.A), B: boTheAI(q.pa.B), C: boTheAI(q.pa.C), D: boTheAI(q.pa.D)},
      da: q.da, dem: dem, tiLeDung: Math.round(soDung / n * 100), saiNhieu: saiNhieu, soSaiNhieu: soSaiNhieu};
  });
  const diem = bai.map(function (b) { return b.diem; });
  const muc = MUC_DIEM_AI.map(function (m, k) {
    const tren = k === 0 ? 1e9 : MUC_DIEM_AI[k - 1].tu;
    return {ten: m.ten, so: diem.filter(function (d) { return d >= m.tu && d < tren; }).length};
  });
  bai.forEach(function (b) {
    b.cauSai = [];
    de.forEach(function (q, i) { if (!chamCau(q, b.chon[i]).dung) b.cauSai.push({cau: q.cau, chon: b.chon[i] || 'bỏ trống'}); });
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
      return {cau: q.cau, loai: q.loai === 'DS' ? 'đúng/sai (A-D là ý a-d, đáp án D=đúng S=sai)' : q.loai === 'TLN' ? 'trả lời ngắn' : 'trắc nghiệm',
        noi_dung: q.hoi, A: q.pa.A, B: q.pa.B, C: q.pa.C, D: q.pa.D, dap_an: q.da,
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
  const v = [['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'Loai', 'Diem']];
  ch.forEach(function (q, i) { v.push([i + 1, q.noi_dung, q.A, q.B, q.C, q.D, String(q.dap_an).trim().toUpperCase(), '', 'TN', '']); });
  sh.getRange(1, 1, v.length, 10).setNumberFormat('@').setValues(v);
  sh.getRange('A1:J1').setFontWeight('bold');
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
    return {cau: q.cau, noi_dung: rutGon(q.hoi, 160), dap_an: q.loai === 'TN' ? q.da + '. ' + rutGon(q.pa[q.da], 60) : q.da};
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
  return {khoa: khoa, moHinh: m['GeminiModel'] ? [m['GeminiModel']].concat(MO_HINH_AI) : MO_HINH_AI};
}

function goiAI(yeuCau) {
  const k = khoaAI();
  const than = {
    systemInstruction: {parts: [{text: 'Bạn là chuyên gia sư phạm Hóa học bậc phổ thông ở Việt Nam. Chỉ trả về JSON hợp lệ, không thêm chữ nào ngoài JSON.'}]},
    contents: [{role: 'user', parts: [{text: yeuCau}]}],
    generationConfig: {temperature: 0.4, responseMimeType: 'application/json'}
  };
  let loiCuoi = '';
  const ds = MO_HINH_AI_DUNG ? [MO_HINH_AI_DUNG] : k.moHinh;
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
    MO_HINH_AI_DUNG = moHinh;
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
function boTheAI(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/<sub>(.*?)<\/sub>/gi, '$1').replace(/<sup>(.*?)<\/sup>/gi, '^$1')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function rutGon(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
