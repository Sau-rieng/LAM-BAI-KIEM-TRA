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

const HEAD_BL = ['ThoiGianNop','MaDot','MaHS','HoTen','MaDe','Diem','SoCauDung','TongSoCau','ThoiGianLam_giay','ChiTiet','FileBaiLam','LanLam','GhiChu'];
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
// Luot choi tro khung (co chi tiet tung cau): ca nhan va nhom. ThanhVien = SBD cac em trong nhom luc choi.
// ChiTiet: JSON [[ma cau trong bo, lua chon, diem], ...] theo thu tu 11 cau cua luot.
const TAB_KQ = 'KQ TRO CHOI';
const HEAD_KQ = ['ThoiGian','MaTro','TenTro','Kieu','MaHS','HoTen','Nhom','ThanhVien','Diem','DungSai','ThoiGian_giay','MaLuot','MaBo','ChiTiet','LyDo'];
// Anh phieu giay "chup truoc – cham sau": moi anh 1 dong; TrangThai CHO (chua cham) / DA (da cham, MaHS) / BO (bo qua)
const TAB_AG = 'ANH GIAY';
const HEAD_AG = ['ThoiGian','Ca','FileId','Url','SBD_doc','MaDe_doc','TrangThai','MaHS','GhiChu'];

// ---------------------------------------------------------------------
// Cong vao
// ---------------------------------------------------------------------
function doGet(e) {
  CH_NHO = null;
  try {
    const p = (e && e.parameter) || {};
    const ma = String(p.mahs || '').trim();
    if (!ma) return json({ok: true, msg: 'So theo doi ' + lopNay() + ' dang hoat dong'});
    const hs = timHS(ma);
    if (!hs) return json({ok: false, msg: 'Khong tim thay ma HS'});
    const dot = docCauHinh().filter(function (c) { return (c.mo || c.cho) && !c.giay && hopLop(c) && !(c.ca && c.ca !== c.madot); })
      .map(function (c) { return {madot: c.madot, ten: c.ten, phut: c.phut, tt: c.tt}; });
    return json({ok: true, hoten: hs.ten, dot: dot});
  } catch (err) {
    return json({ok: false, msg: String(err.message || err)});
  }
}

function doPost(e) {
  CH_NHO = null; AN_GV = false; BM_MSG = '';
  try {
    const d = JSON.parse(e.postData.contents);
    BM_TB = (String(d.tb || '').slice(0, 40) + ' · ' + String(d.ua || '').slice(0, 160)).replace(/^ · $/, '');
    if (d.maxem !== undefined && d.mahs && bmKhoa('kx_' + String(d.mahs).trim())) return json({ok: false, khoa: true, msg: 'Em nhập sai mã quá nhiều lần. Thử lại sau 15 phút hoặc hỏi thầy/cô.'});
    if (d.loai === 'hoatdong') return json(ghiHoatDong(d));
    if (d.loai === 'nhom') return json(ghiChoiNhom(d));
    switch (d.action) {
      case 'batdau': return json(batDau(d));
      case 'gv_quenma': return json(gvQuenMa());
      case 'gv_doima_otp': return json(gvDoiMaOTP(d));
      case 'mokhoa': { const okMk = String(d.ma || '').trim() === docMa().mokhoa; if (!okMk) bmSaiMoKhoa(d, 'kiểm tra'); return json({ok: okMk}); }
      case 'nop':    return json(nopBai(d));
      case 'chobai': return json(trangThaiDot(d.madot));
      case 'vaobai': return json(ghiVaoBai(d));
      case 'xemlai': return json(xemLai(d));
      case 'hs_anhphieu': return json(hsAnhPhieu(d));
      case 'hs_anhtl': return json(hsAnhTL(d));
      case 'hs_kienthuc': return json(hsKienThuc(d));
      case 'hs_luyen': return json(hsLuyen(d));
      case 'hs_luyen_nop': return json(hsLuyenNop(d));
      case 'hs_ks_nop': return json(hsKSNop(d));
      case 'daxem':  return json(ghiDaXem(d));
      case 'xemtn':  return json(ghiXemTN(d));
      case 'tn_gui': return json(hsGuiTin(d));
      case 'tn_xem': return json(hsXemTin(d));
      case 'tc_vao': return json(tcVao(d));
      case 'tc_mokhoa': return json(tcMoKhoa(d));
      case 'tn_lay': return json(tnLay(d));
      case 'kiemthu': return json(kiemThu(d));
      case 'tc_tt': return json(tcTrangThai(d));
      case 'tc_tiendo': return json(tcTienDo(d));
      case 'gv_dot':
      case 'gv_dat':
      case 'gv_theodoi':
      case 'gv_hoso':
      case 'gv_anbai':
      case 'gv_tx':
      case 'gv_tx_vo':
      case 'gv_tx_vo_chot':
      case 'gv_baomat':
      case 'gv_baomat_xem':
      case 'gv_nhatky':
      case 'gv_nk_hoantac':
      case 'gv_dakt_luu':
      case 'gv_ks_dot':
      case 'gv_ks_luu':
      case 'gv_ks_xoa':
      case 'gv_ks_kq':
      case 'gv_ks_ai':
      case 'gv_luyen_hs':
      case 'gv_luyen':
      case 'gv_luyen_ai':
      case 'gv_luyen_duyet':
      case 'gv_tx_luu':
      case 'gv_tx_xoa':
      case 'gv_tx_ai':
      case 'gv_nhanxet':
      case 'gv_solieu':
      case 'gv_bangdiem':
      case 'gv_vang':
      case 'gv_dathi':
      case 'gv_cau':
      case 'gv_matrande':
      case 'gv_rubric':
      case 'gv_rubric_luu':
      case 'gv_rubric_ai':
      case 'gv_tl_ds':
      case 'gv_tl_luu':
      case 'gv_tl_anh':
      case 'gv_tl_layanh':
      case 'gv_tl_ai':
      case 'gv_ainx':
      case 'gv_nhanxet_nhieu':
      case 'gv_dacta':
      case 'gv_suadapan':
      case 'gv_chamlai':
      case 'gv_aide':
      case 'gv_nhom':
      case 'gv_kienthuc':
      case 'gv_ainx':
      case 'gv_trochoi':
      case 'gv_tcdat':
      case 'gv_tckq':
      case 'gv_giay_lop':
      case 'gv_giay_nop':
      case 'gv_giay_anh':
      case 'gv_giay_dsanh':
      case 'gv_giay_layanh':
      case 'gv_giay_boanh':
      case 'gv_tcvach':
      case 'gv_tcsodo':
      case 'gv_tctd':
      case 'gv_ma':
      case 'gv_madat':
      case 'gv_tainguyen':
      case 'gv_tin':
      case 'gv_tin_hs':
      case 'gv_tin_gui':
      case 'gv_tin_goiy':
      case 'gv_napde':
      case 'gv_xemde':
      case 'gv_degiay':
      case 'gv_giay_diem':
      case 'gv_hinh':
      case 'gv_hinhde':
      case 'gv_ganhinh':
      case 'gv_rahinh':
      case 'gv_sodo':
      case 'gv_sodo_luu':
      case 'gv_vipham':
      case 'gv_tn_nap':
      case 'gv_tn_dat':
      case 'gv_tn_xoa':
      case 'gv_tn_lay':
      case 'gv_bocau_nap':
      case 'gv_bocau_ds':
      case 'gv_bocau_xoa':
      case 'gv_tc_themkhung':
      case 'gv_tc_xoakhung':
        if (!kiemGV(d)) return json({ok: false, loi: 'ma', khoa: !!BM_MSG, msg: BM_MSG || 'Ma quan ly chua dung'});
        if (/^\d{6}$/.test(String(d.tt || ''))) { const P0 = PropertiesService.getScriptProperties(); if (P0.getProperty('tiento_gv') !== d.tt) { P0.setProperty('tiento_gv', d.tt); CacheService.getScriptCache().remove('tiento'); } }
        AN_GV = true;   // trang GV: an bai/diem cua tai khoan GV (SBD ...00) khoi moi thong ke
        if (d.action === 'gv_dot') return json(gvDot());
        if (d.action === 'gv_dat') return json(gvDat(d));
        if (d.action === 'gv_hoso') return json(hoSoLop());
        if (d.action === 'gv_anbai') return json(gvAnBai(d));
        if (d.action === 'gv_baomat') return json(gvBaoMat(d));
        if (d.action === 'gv_baomat_xem') return json(gvBaoMatXem(d));
        if (d.action === 'gv_nhatky') return json(gvNhatKy());
        if (d.action === 'gv_nk_hoantac') return json(gvNkHoanTac(d));
        if (d.action === 'gv_dakt_luu') return json(gvDaKTLuu(d));
        if (d.action === 'gv_ks_dot') return json(gvKSDot());
        if (d.action === 'gv_ks_luu') return json(gvKSLuu(d));
        if (d.action === 'gv_ks_xoa') return json(gvKSXoa(d));
        if (d.action === 'gv_ks_kq') return json(gvKSKQ());
        if (d.action === 'gv_ks_ai') return json(gvKSAI(d));
        if (d.action === 'gv_luyen') return json(gvLuyen());
        if (d.action === 'gv_luyen_hs') return json(gvLuyenHS(d));
        if (d.action === 'gv_luyen_ai') return json(gvLuyenAI(d));
        if (d.action === 'gv_luyen_duyet') return json(gvLuyenDuyet(d));
        if (d.action === 'gv_tx_vo') return json(gvTxVo(d));
        if (d.action === 'gv_tx_vo_chot') return json(gvTxVoChot(d));
        if (d.action === 'gv_tx') return json({ok: true, lop: lopNay(), hs: dsLopTX(), tx: docTX()});
        if (d.action === 'gv_tx_luu') return json(gvTxLuu(d));
        if (d.action === 'gv_tx_xoa') return json(gvTxXoa(d));
        if (d.action === 'gv_tx_ai') return json(gvTxAI(d));
        if (d.action === 'gv_nhanxet') return json(gvNhanXet(d));
        if (d.action === 'gv_solieu') return json(gvSoLieu(d));
        if (d.action === 'gv_bangdiem') return json(ghiBangDiem());
        if (d.action === 'gv_vang') return json(gvVang(d));
        if (d.action === 'gv_dathi') return json(gvDaThi());
        if (d.action === 'gv_cau') return json(gvCau(d));
        if (d.action === 'gv_matrande') return json(gvMaTranDe(d));
        if (d.action === 'gv_rubric') return json(gvRubric(d));
        if (d.action === 'gv_rubric_luu') return json(gvRubricLuu(d));
        if (d.action === 'gv_rubric_ai') return json(gvRubricAI(d));
        if (d.action === 'gv_tl_ds') return json(gvTLDs(d));
        if (d.action === 'gv_tl_luu') return json(gvTLLuu(d));
        if (d.action === 'gv_tl_ai') return json(gvTLAI(d));
        if (d.action === 'gv_tl_layanh') return json(gvTLLayAnh(d));
        if (d.action === 'gv_tl_anh') return json(gvTLAnh(d));
        if (d.action === 'gv_ainx') return json(gvAINX(d));
        if (d.action === 'gv_nhanxet_nhieu') return json(gvNhanXetNhieu(d));
        if (d.action === 'gv_dacta') return json(gvDacTa(d));
        if (d.action === 'gv_suadapan') return json(gvSuaDapAn(d));
        if (d.action === 'gv_chamlai') return json(gvChamLai(d));
        if (d.action === 'gv_aide') return json(gvAIDe(d));
        if (d.action === 'gv_nhom') return json(gvNhom(d));
        if (d.action === 'gv_kienthuc') return json(gvKienThuc(d));
        if (d.action === 'gv_ainx') return json(gvAINhanXet(d));
        if (d.action === 'gv_trochoi') return json(gvTroChoi());
        if (d.action === 'gv_tcdat') return json(gvTcDat(d));
        if (d.action === 'gv_tckq') return json(gvTcKetQua(d));
        if (d.action === 'gv_giay_lop') return json(gvGiayLop(d));
        if (d.action === 'gv_giay_nop') return json(gvGiayNop(d));
        if (d.action === 'gv_giay_anh') return json(gvGiayAnh(d));
        if (d.action === 'gv_giay_dsanh') return json(gvGiayDsAnh(d));
        if (d.action === 'gv_giay_layanh') return json(gvGiayLayAnh(d));
        if (d.action === 'gv_giay_boanh') return json(gvGiayBoAnh(d));
        if (d.action === 'gv_tcvach') return json(gvTcVach(d));
        if (d.action === 'gv_tcsodo') return json(gvTcSoDo(d));
        if (d.action === 'gv_tctd') return json(gvTcTienDo(d));
        if (d.action === 'gv_ma') return json(gvMa());
        if (d.action === 'gv_madat') return json(gvMaDat(d));
        if (d.action === 'gv_tainguyen') return json(gvTaiNguyen());
        if (d.action === 'gv_tin') return json(gvTin());
        if (d.action === 'gv_tin_hs') return json(gvTinHS(d));
        if (d.action === 'gv_tin_gui') return json(gvTinGui(d));
        if (d.action === 'gv_tin_goiy') return json(gvTinGoiY(d));
        if (d.action === 'gv_napde') return json(gvNapDe(d));
        if (d.action === 'gv_bocau_nap') return json(gvBoCauNap(d));
        if (d.action === 'gv_bocau_ds') return json({ok: true, ds: docDsBo()});
        if (d.action === 'gv_bocau_xoa') return json(gvBoCauXoa(d));
        if (d.action === 'gv_tc_themkhung') return json(gvTcThemKhung(d));
        if (d.action === 'gv_tc_xoakhung') return json(gvTcXoaKhung(d));
        if (d.action === 'gv_xemde') return json(gvXemDe(d));
        if (d.action === 'gv_degiay') return json(gvDeGiay(d));
        if (d.action === 'gv_giay_diem') return json(gvGiayDiem(d));
        if (d.action === 'gv_hinh') return json(gvHinh(d));
        if (d.action === 'gv_hinhde') return json(gvHinhDe(d));
        if (d.action === 'gv_ganhinh') return json(gvGanHinh(d));
        if (d.action === 'gv_rahinh') return json(gvRaHinh(d));
        if (d.action === 'gv_sodo') return json(gvSoDo(d));
        if (d.action === 'gv_sodo_luu') return json(gvSoDoLuu(d));
        if (d.action === 'gv_vipham') return json(gvViPham(d));
        if (d.action === 'gv_tn_nap') return json(gvTnNap(d));
        if (d.action === 'gv_tn_dat') return json(gvTnDat(d));
        if (d.action === 'gv_tn_xoa') return json(gvTnXoa(d));
        if (d.action === 'gv_tn_lay') return json(gvTnLay(d));
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
  const c0 = timDot(d.madot);
  if (!c0 || !(c0.mo || c0.cho) || !hopLop(c0)) return {ok: false, loi: 'dong', msg: 'Bai kiem tra nay chua mo hoac da dong'};
  const c = deTheoGhe(c0, ma);   // ca thi nhieu ma de: cap ma theo ghe tren so do
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
// M6: nhat ky thoi gian cham (ms tu luc nop/quet den luc co diem) + phieu GV sua tay
const TAB_NKC = 'NHAT KY CHAM', HEAD_NKC = ['ThoiGian', 'Loai', 'MaDot', 'MaHS', 'ms', 'SuaTay'];
function ghiNhatKyCham(loai, madot, ma, ms, sua) { try { layTab(TAB_NKC, HEAD_NKC).appendRow([new Date(), loai, madot, ma, Math.max(0, Math.round(Number(ms) || 0)), sua ? 1 : 0]); } catch (e) {} }
function nopBai(d) {
  const t0 = Date.now();
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
  const ghiChu = d.vipham || daViPham(madot, ma) ? GHI_CHU_VP : '';
  const giay = Math.max(0, Math.round(Number(d.thoigianlam) || 0));
  const now = new Date();

  const thuMuc = layThuMucDot(lopNay(), madot, c, de);
  const url = luuPDFBaiLam(thuMuc, c, ma, hs.ten, now, giay, diem, dung, tong, ct, lan, ghiChu);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cu2 = timBaiDaNop(madot, ma);
    if (cu2 && cu2.lan >= lan) return {ok: true, hoten: hs.ten, diem: cu2.diem, socaudung: cu2.socaudung, tongsocau: cu2.tongsocau, danop: true};
    layTab(TAB_BL, HEAD_BL).appendRow([now, madot, ma, hs.ten, 'XAO', diem, dung, tong, giay,
      ct.map(function (x) { return String(x.chon || '-').replace(/\|/g, '/'); }).join('|'), url, lan, ghiChu]);
  } finally {
    lock.releaseLock();
  }
  ghiNhatKyCham('IPAD', madot, ma, Date.now() - t0, false);
  return {ok: true, hoten: hs.ten, diem: diem, socaudung: dung, tongsocau: tong, lan: lan};
}

// ---------------------------------------------------------------------
// Xem lai bai: SBD + ma xem rieng; chi cac dot GV bat "ChoXemLai = CO"
// ---------------------------------------------------------------------
function xemLai(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const ketqua = [];
  const gtMap = docGiaiThich(), nxMap = docNhanXet();
  let tlMap = null;
  docCauHinh().forEach(function (c) {
    if (!c.xemlai || !hopLop(c)) return;
    const bai = timBaiDaNop(c.madot, ma);
    if (!bai) return;
    const chon = tachChiTiet(bai.chitiet);
    const de = docDe(c.madot);
    const kq = chamBai(de, function (q, i) { return chon[i]; });
    ketqua.push({
      madot: c.madot, ten: c.ten + (bai.lan > 1 && !c.giay ? ' (lần ' + bai.lan + ')' : ''), diem: bai.diem, luc: bai.luc, socaudung: bai.socaudung, tongsocau: bai.tongsocau,
      giay: !!c.giay, coAnh: !!(c.giay && idTuUrl(bai.file)), nx: ((nxMap[ma + '|' + (c.ca || c.madot)] || nxMap[ma + '|' + c.madot]) || {}).nx || '',
      tlcham: c.giay ? (function () { const ca = c.ca || c.madot, x = docTLDiem(ca)[ma]; if (!x) return null; const rb = docRubric(ca); if (!x.duyet) return null; return {tong: x.tong, coAnh: !!x.anh, cau: Object.keys(x.cau).map(function (k) { return {cau: k, diem: x.cau[k].diem, nx: x.cau[k].nx || '', buoc: ((rb[k] || {}).buoc || []).map(function (b, i) { return {nd: b.nd, diem: b.diem, dat: x.cau[k].dat.indexOf(i) >= 0, lydo: x.cau[k].lydo[i] || ''}; })}; })}; })() : null,
      tuluan: c.giay ? ((tlMap = tlMap || docTuLuan())[c.madot] || []).map(function (t) { return {cau: t.cau, hoi: t.hoi, hinh: t.hinh && t.hinh !== '-' ? anhDataUri(/^hinh\//.test(t.hinh) ? 'https://sau-rieng.github.io/LAM-BAI-KIEM-TRA/' + t.hinh : t.hinh) : '', diem: t.diem, gt: t.gt}; }) : [], tongDiem: c.giay ? de.reduce(function (a, q) { return a + (Number(q.w) || 0); }, 0) : null,
      goiy: typeof layGoiYAI === 'function' ? layGoiYAI(c.madot, ma) : null,
      cau: kq.ct.map(function (q) {
        return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: anhDataUri(q.hinh), chon: q.chon, dapan: q.dapan,
          dung: q.dung, soY: q.soY, diem: q.diemCau, toiDa: q.w, gt: gtMap[c.madot + '|' + q.cau] || ''};
      })
    });
  });
  try { baiTroHS(ma).forEach(function (b) { b.nx = ((nxMap[ma + '|' + b.dot] || {}).nx) || ''; delete b.dot; ketqua.push(b); }); } catch (e) {}
  let tx = [];
  try { const T = docTX(), dm = T.diem[ma] || {}; tx = T.cot.map(function (c) { return {ngay: c.ngay, ghichu: c.ghichu, diem: dm[c.id] === undefined ? null : dm[c.id], nop: (T.nop[ma] || {})[c.id] || '', vo: /#v$/.test(c.id)}; }); } catch (e) {}
  // Bang diem cua em: moi bai kiem tra em da lam (ke ca de chua mo xem lai: chi diem, khong cau hoi/dap an); de giay nhieu ma = 1 dong
  const bang = [], daCa = {};
  try {
    docCauHinh().forEach(function (c) {
      if (!hopLop(c)) return;
      const k = c.giay ? (c.ca || c.madot) : c.madot; if (daCa[k]) return;
      const b = timBaiDaNop(c.madot, ma); if (!b) return;
      daCa[k] = 1;
      bang.push({madot: c.madot, ten: c.ten, luc: b.luc, diem: b.diem, giay: !!c.giay, xem: !!c.xemlai});
    });
  } catch (e) {}
  return {ok: true, hoten: hs.ten, bai: ketqua, tinMoi: demTinMoi(ma, 'GV'), tn: dsTNDrive(true), tx: tx, bangdiem: bang, ks: ksChoHS(ma), cacLop: (function () { try { return (tkMap()[ma] || {}).cl || []; } catch (e) { return []; } })()};
}

// HS xem anh phieu de giay cua minh (de da bat "cho xem lai")
function hsAnhPhieu(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma), madot = String(d.madot || '').trim();
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const c = timDot(madot);
  if (!c || !c.giay || !c.xemlai) return {ok: false, msg: 'Bai nay chua mo xem lai'};
  const bai = timBaiDaNop(madot, ma), id = bai ? idTuUrl(bai.file) : '';
  if (!id) return {ok: false, msg: 'Khong co anh phieu'};
  const b = DriveApp.getFileById(id).getBlob();
  return {ok: true, anh: 'data:image/jpeg;base64,' + Utilities.base64Encode(b.getBytes())};
}
// Cac luot tro khung cua em dang bai xem lai (madot = TC#<ma luot>)
// Tro co "Cho HS xem lai" = CO moi gui cau/dap an; tro dang tat: chi gui diem
function baiTroHS(ma) {
  const layBo = boDem(), tz = Session.getScriptTimeZone(), choXem = {};
  try { docTroChoi().forEach(function (t) { if (t.xemlai) choXem[t.matro] = 1; }); } catch (e) {}
  return luotCuaHS(ma).map(function (x) {
    const ct = chamLuot(x, layBo); if (!ct) return null;
    const mo = !!choXem[String(x.matro).split(':')[0]];
    return {buoi: tenTroGon(x) + (x.kieu === 'NHOM' ? ' · ' + x.nhom : '') + '|' + Utilities.formatDate(new Date(x.t), tz, 'yyyy-MM-dd'), madot: 'TC#' + x.ml, tro: true, ten: '🎮 ' + tenTroGon(x) + (x.kieu === 'NHOM' ? ' · ' + x.nhom : '') + ' · ' + Utilities.formatDate(new Date(x.t), tz, 'dd/MM HH:mm'),
      diem: x.diem, luc: x.t ? new Date(x.t).toISOString() : '', socaudung: ct.filter(function (c) { return c.dung; }).length, tongsocau: ct.length,
      dot: x.bo && x.t && x.kieu !== 'NHOM' ? 'TC:' + x.bo + ':' + ngayKhoa(x.t) : '',
      khoa: !mo,
      cau: !mo ? [] : ct.map(function (c) {
        return {cau: c.cau, loai: c.loai, hoi: c.hoi, pa: c.pa, hinh: c.hinh, chon: c.chon, dapan: c.dapan, dung: c.dung, soY: c.soY, diem: c.diem, toiDa: c.toiDa,
          gt: c.gt, chuaLam: !c.daLam};
      })};
  }).filter(Boolean).sort(function (a, b) { return a.luc < b.luc ? -1 : 1; });
}
// HS mo xem 1 bai o trang xem lai -> ghi tab XEM LAI de GV biet em nao da xem
// Tai khoan HS mo 1 tai nguyen (mo phong 3D, thi nghiem...): ghi 1 dong / lan mo
function ghiXemTN(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false};
  const tn = String(d.matn || '').trim().slice(0, 80);
  if (!tn) return {ok: false};
  ghiDong(TAB_TN, HEAD_TN, [new Date(), tn, ma, hs.ten]);
  return {ok: true};
}
// GV: luot xem tai nguyen cua lop nay + si so
function gvTaiNguyen() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(TAB_TN), xem = [];
  if (sh && sh.getLastRow() > 1) boGV(sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues(), 2).forEach(function (r) {
    if (String(r[1]).trim()) xem.push([r[0] instanceof Date ? r[0].getTime() : 0, String(r[1]).trim(), String(r[2]).trim(), String(r[3]).trim()]);
  });
  const ds = ss.getSheetByName(TAB_DS);
  const siSo = ds && ds.getLastRow() > 1 ? ds.getRange(2, 1, ds.getLastRow() - 1, 1).getValues().filter(function (r) { return String(r[0]).trim(); }).length : 0;
  return {ok: true, lop: lopNay(), siSo: siSo, xem: xem, ds: dsTNDrive(false)};
}
// ---------------------------------------------------------------------
// Tai nguyen giao vien tu tai len (HTML luu trong Drive, thu muc TAI NGUYEN HOC TAP)
// Tab TAI NGUYEN trong kho de: Ma | Ten | Khoi | Bai | Loai | KienThuc | MoTa | FileId | Anh (anh bia nho, data URI) | An (CO) | CapNhat
// ---------------------------------------------------------------------
const TAB_TNG = 'TAI NGUYEN';
const HEAD_TNG = ['Ma', 'Ten', 'Khoi', 'Bai', 'Loai', 'KienThuc', 'MoTa', 'FileId', 'Anh', 'An', 'CapNhat'];
const THU_MUC_TN = 'TAI NGUYEN HOC TAP';
const TN_TOI_DA = 15 * 1024 * 1024;
function tabTNG() {
  const ss = kho();
  let sh = ss.getSheetByName(TAB_TNG);
  if (!sh) { sh = ss.insertSheet(TAB_TNG); sh.getRange(1, 1, 1, HEAD_TNG.length).setValues([HEAD_TNG]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}
function docTNG() {
  const sh = kho().getSheetByName(TAB_TNG);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_TNG.length).getValues().map(function (r, i) {
    return {dong: i + 2, ma: String(r[0]).trim(), ten: String(r[1]).trim(), khoi: String(r[2]).trim(), bai: String(r[3]).trim(), loai: String(r[4]).trim(),
      kienthuc: String(r[5]).trim(), mota: String(r[6]).trim(), fileId: String(r[7]).trim(), anh: String(r[8] || ''), an: khongDau(r[9]) === 'CO'};
  }).filter(function (t) { return t.ma && t.fileId; });
}
function dsTNDrive(boAn) {
  try {
    return docTNG().filter(function (t) { return !boAn || !t.an; }).map(function (t) {
      return {ma: t.ma, ten: t.ten, khoi: t.khoi, bai: t.bai, loai: t.loai, kienthuc: t.kienthuc, mota: t.mota, anh: t.anh, an: t.an, nguon: 'drive'};
    });
  } catch (e) { return []; }
}
function chuTN(x, n) { return String(x === undefined || x === null ? '' : x).trim().slice(0, n || 200); }
// ---------------------------------------------------------------------
// Tai nguyen giao vien tai len -> day thang len GitHub (repo trang web), nho dong GithubToken trong tab MA
//   file: tai-nguyen/tai-len/<ma>.html · anh bia: tai-nguyen/anh/<ma>.jpg · danh sach: tai-nguyen/tai-len.js
//   Token: fine-grained, chi repo LAM-BAI-KIEM-TRA, quyen Contents: Read and write. Doi repo: dong GithubRepo.
// ---------------------------------------------------------------------
const GH_REPO_MAC_DINH = 'Sau-rieng/LAM-BAI-KIEM-TRA';
const GH_DS = 'tai-nguyen/tai-len.js';
function ghCauHinh() {
  const m = {};
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[khongDau(r[0]).replace(/\s+/g, '')] = String(r[1]).trim(); });
  return {token: m['GITHUBTOKEN'] || '', repo: m['GITHUBREPO'] || GH_REPO_MAC_DINH, nhanh: m['GITHUBBRANCH'] || 'main'};
}
function ghGoi(gh, method, path, body) {
  const url = 'https://api.github.com/repos/' + gh.repo + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + (method === 'get' ? '?ref=' + encodeURIComponent(gh.nhanh) : '');
  const o = {method: method, muteHttpExceptions: true, headers: {Authorization: 'Bearer ' + gh.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}};
  if (body) { o.contentType = 'application/json'; o.payload = JSON.stringify(body); }
  const r = UrlFetchApp.fetch(url, o), ma = r.getResponseCode();
  if (ma === 401) throw new Error('Ma GitHub (dong GithubToken o tab MA) khong dung hoac da het han');
  if (ma === 403) throw new Error('Ma GitHub chua co quyen ghi vao repo ' + gh.repo + ' (can quyen Contents: Read and write)');
  return {ma: ma, j: (function () { try { return JSON.parse(r.getContentText()); } catch (e) { return {}; } })()};
}
function ghLay(gh, path) {
  const r = ghGoi(gh, 'get', path);
  if (r.ma === 404) return null;
  if (r.ma !== 200) throw new Error('GitHub loi ' + r.ma + ' khi doc ' + path);
  const c = r.j.content ? Utilities.newBlob(Utilities.base64Decode(String(r.j.content).replace(/\s/g, ''))).getDataAsString('UTF-8') : '';
  return {sha: r.j.sha, text: c};
}
function ghGhi(gh, path, noiDung, loiNhan, sha) {
  const content = typeof noiDung === 'string' ? Utilities.base64Encode(noiDung, Utilities.Charset.UTF_8) : Utilities.base64Encode(noiDung);
  const body = {message: loiNhan, content: content, branch: gh.nhanh};
  if (sha) body.sha = sha;
  const r = ghGoi(gh, 'put', path, body);
  if (r.ma === 404) throw new Error('Khong tim thay repo ' + gh.repo + ' hoac ma GitHub khong co quyen vao repo nay');
  if (r.ma !== 200 && r.ma !== 201) throw new Error('GitHub loi ' + r.ma + ' khi ghi ' + path + (r.j.message ? ': ' + r.j.message : ''));
  return r.j.content ? r.j.content.sha : '';
}
function ghXoa(gh, path, loiNhan) {
  const cu = ghLay(gh, path);
  if (!cu) return;
  const r = ghGoi(gh, 'delete', path, {message: loiNhan, sha: cu.sha, branch: gh.nhanh});
  if (r.ma !== 200) throw new Error('GitHub loi ' + r.ma + ' khi xoa ' + path);
}
function ghDocDs(gh) {
  const f = ghLay(gh, GH_DS);
  if (!f) return {sha: '', ds: []};
  const m = /\/\*DS\*\/([\s\S]*?)\/\*HET\*\//.exec(f.text);
  let ds = [];
  try { ds = m ? JSON.parse(m[1]) : []; } catch (e) { throw new Error('Tep ' + GH_DS + ' bi hong, khong doc duoc danh sach'); }
  return {sha: f.sha, ds: Array.isArray(ds) ? ds : []};
}
function ghGhiDs(gh, ds, sha, loiNhan) {
  const text = '/* Tai nguyen giao vien tai len tu trang giao vien. May chu tu ghi tep nay - KHONG SUA TAY.\n' +
    '   Moi muc: ma, ten, khoi, bai, loai, kienthuc, mota, file (trong tai-nguyen/), anh, an */\n' +
    'window.TAI_NGUYEN_TAILEN = /*DS*/' + JSON.stringify(ds, null, 1) + '/*HET*/;\n' +
    '(function () { var a = window.TAI_NGUYEN_TAILEN || []; a.forEach(function (t) { t.tailen = 1; }); window.TAI_NGUYEN = (window.TAI_NGUYEN || []).concat(a); })();\n';
  ghGhi(gh, GH_DS, text, loiNhan, sha);
}
function gvTnNap(d) {
  const t = d.tn || {};
  const gh = ghCauHinh();
  if (!gh.token) return {ok: false, loi: 'token', msg: 'Chua co ma GitHub: them dong GithubToken vao tab MA cua kho de'};
  const ten = chuTN(t.ten, 140), khoi = chuTN(t.khoi, 4);
  if (!ten) return {ok: false, msg: 'Thieu ten tai nguyen'};
  if (!/^\d{1,2}$/.test(khoi)) return {ok: false, msg: 'Khoi khong hop le'};
  const html = typeof t.html === 'string' ? t.html : '';
  if (html.length > TN_TOI_DA) return {ok: false, msg: 'File qua lon (toi da 15 MB)'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const dsF = ghDocDs(gh), ds = dsF.ds;
    const cu = t.ma ? ds.filter(function (x) { return x.ma === String(t.ma).trim(); })[0] : null;
    if (t.ma && !cu) return {ok: false, msg: 'Khong tim thay tai nguyen ' + t.ma};
    if (!cu && !html) return {ok: false, msg: 'Chua co noi dung HTML'};
    const ma = cu ? cu.ma : 'tl-' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMdd-HHmmss');
    const muc = cu || {ma: ma, file: 'tai-len/' + ma + '.html', anh: ''};
    if (html) {
      const f = cu ? ghLay(gh, 'tai-nguyen/' + muc.file) : null;
      ghGhi(gh, 'tai-nguyen/' + muc.file, html, (cu ? 'Cap nhat' : 'Them') + ' tai nguyen: ' + ten, f ? f.sha : '');
    }
    if (typeof t.anh === 'string') {
      const pa = 'tai-nguyen/anh/' + ma + '.jpg';
      const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(t.anh);
      if (m) {
        const f = ghLay(gh, pa);
        ghGhi(gh, pa, Utilities.base64Decode(m[2]), 'Anh bia: ' + ten, f ? f.sha : '');
        muc.anh = 'anh/' + ma + '.jpg';
      } else if (muc.anh) { ghXoa(gh, pa, 'Bo anh bia: ' + ten); muc.anh = ''; }
    }
    muc.ten = ten; muc.khoi = khoi; muc.bai = chuTN(t.bai, 140); muc.loai = chuTN(t.loai, 40);
    muc.kienthuc = chuTN(t.kienthuc, 300); muc.mota = chuTN(t.mota, 300);
    if (!cu) ds.push(muc);
    ghGhiDs(gh, ds, dsF.sha, (cu ? 'Sua' : 'Them') + ' muc tai nguyen: ' + ten);
    return {ok: true, ma: ma, tailen: ds};
  } finally {
    lock.releaseLock();
  }
}
function gvTnDat(d) {
  const matn = String(d.matn || '').trim();
  if (/^D/.test(matn)) {   // tai nguyen cu luu Drive
    const t = docTNG().filter(function (x) { return x.ma === matn; })[0];
    if (!t) return {ok: false, msg: 'Khong tim thay tai nguyen'};
    tabTNG().getRange(t.dong, 10).setValue(d.an ? 'CO' : '');
    SpreadsheetApp.flush();
    return {ok: true, ds: dsTNDrive(false)};
  }
  const gh = ghCauHinh();
  if (!gh.token) return {ok: false, loi: 'token', msg: 'Chua co ma GitHub: them dong GithubToken vao tab MA cua kho de'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const dsF = ghDocDs(gh), t = dsF.ds.filter(function (x) { return x.ma === matn; })[0];
    if (!t) return {ok: false, msg: 'Khong tim thay tai nguyen'};
    if (d.an) t.an = true; else delete t.an;
    ghGhiDs(gh, dsF.ds, dsF.sha, (d.an ? 'An' : 'Hien') + ' tai nguyen: ' + t.ten);
    return {ok: true, tailen: dsF.ds};
  } finally {
    lock.releaseLock();
  }
}
function gvTnXoa(d) {
  const matn = String(d.matn || '').trim();
  if (/^D/.test(matn)) {
    const t = docTNG().filter(function (x) { return x.ma === matn; })[0];
    if (!t) return {ok: false, msg: 'Khong tim thay tai nguyen'};
    try { DriveApp.getFileById(t.fileId).setTrashed(true); } catch (e) {}
    tabTNG().deleteRow(t.dong);
    SpreadsheetApp.flush();
    return {ok: true, ds: dsTNDrive(false)};
  }
  const gh = ghCauHinh();
  if (!gh.token) return {ok: false, loi: 'token', msg: 'Chua co ma GitHub: them dong GithubToken vao tab MA cua kho de'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const dsF = ghDocDs(gh), t = dsF.ds.filter(function (x) { return x.ma === matn; })[0];
    if (!t) return {ok: false, msg: 'Khong tim thay tai nguyen'};
    ghXoa(gh, 'tai-nguyen/' + t.file, 'Xoa tai nguyen: ' + t.ten);
    if (t.anh) ghXoa(gh, 'tai-nguyen/' + t.anh, 'Xoa anh bia: ' + t.ten);
    const ds = dsF.ds.filter(function (x) { return x.ma !== matn; });
    ghGhiDs(gh, ds, dsF.sha, 'Xoa muc tai nguyen: ' + t.ten);
    return {ok: true, tailen: ds};
  } finally {
    lock.releaseLock();
  }
}
function layHtmlTN(ma, choAn) {
  const t = docTNG().filter(function (x) { return x.ma === String(ma || '').trim(); })[0];
  if (!t || (t.an && !choAn)) return {ok: false, msg: 'Tai nguyen khong co hoac dang an'};
  return {ok: true, ten: t.ten, html: DriveApp.getFileById(t.fileId).getBlob().getDataAsString('UTF-8')};
}
function gvTnLay(d) { return layHtmlTN(d.matn, true); }
// Hoc sinh mo tai nguyen trong tai khoan: can SBD + ma xem bai; ghi luot xem
function tnLay(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const r = layHtmlTN(d.matn, false);
  if (r.ok) ghiDong(TAB_TN, HEAD_TN, [new Date(), String(d.matn).trim().slice(0, 80), ma, hs.ten]);
  return r;
}
// So lieu tong hop cua lop trong khoang ngay (d.tu, d.den: 'yyyy-mm-dd', tinh ca 2 dau) – cho ho so du thi, bao cao
function gvSoLieu(d) {
  const tz = Session.getScriptTimeZone();
  const ngayCua = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : ''; };
  const tu = String(d.tu || '0000-00-00'), den = String(d.den || '9999-99-99');
  const trong = function (v) { const n = ngayCua(v); return n && n >= tu && n <= den; };
  const ss = SpreadsheetApp.getActive();
  const cotMa = {}; cotMa[TAB_BL] = 2; cotMa[TAB_XL] = 2; cotMa[TAB_HD] = 2; cotMa[TAB_KQ] = 4; cotMa[TAB_TN] = 2; cotMa[TAB_TIN] = 1; cotMa[TAB_NKC] = 3;
  const bang = function (ten) { const sh = ss.getSheetByName(ten); if (!sh || sh.getLastRow() < 2) return []; const v = sh.getDataRange().getValues(); v.shift(); return ten in cotMa ? boGV(v, cotMa[ten]) : v; };
  const caCua = {};
  try { docCauHinh().forEach(function (c) { if (c.ca) caCua[c.madot] = c.ca; }); } catch (e) {}
  // Bai lam trong khoang: luot nop + lan nop sau cung moi em moi de
  const bl = bang(TAB_BL).filter(function (r) { return trong(r[0]) && String(r[2]).trim(); });
  const cuoi = {}, de = {}, hsNop = {};
  bl.forEach(function (r) {
    const md = String(r[1]).trim(), ma = String(r[2]).trim(), k = ma + '|' + md;
    de[md] = 1; hsNop[ma] = 1;
    if (!cuoi[k] || r[0] > cuoi[k][0]) cuoi[k] = r;
  });
  // Gom theo dot (ca thi nhieu ma de = 1 dot)
  const dot = {};
  Object.keys(cuoi).forEach(function (k) {
    const r = cuoi[k], md = String(r[1]).trim(), g = caCua[md] || md, dm = Number(String(r[5]).replace(',', '.')) || 0;
    const o = dot[g] = dot[g] || {ma: g, luc: r[0].getTime(), n: 0, tong: 0, d5: 0, d8: 0};
    o.n++; o.tong += dm; if (dm >= 5) o.d5++; if (dm >= 8) o.d8++; if (r[0].getTime() < o.luc) o.luc = r[0].getTime();
  });
  const dsDot = Object.keys(dot).map(function (k) { const o = dot[k]; return {ma: o.ma, luc: o.luc, n: o.n, tong: Math.round(o.tong * 100) / 100, d5: o.d5, d8: o.d8}; })
    .sort(function (a, b) { return a.luc - b.luc; });
  // Xem lai: em da nop bai trong khoang va co mo xem lai (bat ky luc nao) bai cua de do
  const xem = {};
  bang(TAB_XL).forEach(function (r) { const ma = String(r[2]).trim(); if (de[String(r[1]).trim()] && hsNop[ma]) xem[ma] = 1; });
  const dem = function (ten, loc) { return bang(ten).filter(function (r) { return trong(r[0]) && (!loc || loc(r)); }).length; };
  return {ok: true, lop: lopNay(), siSo: bang(TAB_DS).filter(function (r) { return String(r[0]).trim(); }).length,
    de: Object.keys(de), nop: bl.length, hsNop: Object.keys(hsNop).length, hsXem: Object.keys(xem).length, dot: dsDot,
    troCN: dem(TAB_HD, function (r) { return String(r[1]).trim(); }) + dem(TAB_KQ, function (r) { return String(r[3]).trim() !== 'NHOM'; }), troNhom: dem(TAB_CN), xemTN: dem(TAB_TN),
    hoi: dem(TAB_TIN, function (r) { return String(r[3]).trim() === 'HS'; }),
    // M6: so phieu giay, so phieu GV sua tay, thoi gian cham, luyen tap
    giay: bl.filter(function (r) { return String(r[4]).trim() === 'GIAY'; }).length,
    suaTay: bl.filter(function (r) { return String(r[4]).trim() === 'GIAY' && /GV sửa tay/.test(String(r[12] || '')); }).length,
    ms: (function () { const o = {GIAY: [], IPAD: []}; bang(TAB_NKC).forEach(function (r) { if (trong(r[0]) && o[String(r[1])] && Number(r[4]) > 0) o[String(r[1])].push(Number(r[4])); }); return o; })(),
    ks: (function () {   // khao sat HS trong khoang ngay: so phieu, tong diem dong y (thang 5), so em tu thay tien bo
      const o = {phieu: 0, tong: 0, n: 0, tien: 0, coTien: 0}, sh = SpreadsheetApp.getActive().getSheetByName(TAB_KS);
      if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
        const t = new Date(String(r[1] instanceof Date ? r[1].toISOString() : r[1]).slice(0, 10) + 'T12:00:00'); if (isNaN(t) || !trong(t)) return;
        let tl = null; try { tl = JSON.parse(r[2]); } catch (e) {} if (!tl) return;
        o.phieu++; Object.keys(tl).forEach(function (k) { if (/^d_/.test(k) && typeof tl[k] === 'number') { o.tong += tl[k]; o.n++; } });
        if (tl.tien) { o.coTien++; if (/^Tiến bộ/.test(tl.tien)) o.tien++; }
      });
      return o;
    })(),
    luyen: (function () {
      const ds = docLuyenTap().filter(function (x) { const t = new Date(x.luc); return !isNaN(t) && trong(t); }), em = {}, kt = {};
      ds.forEach(function (x) { em[x.mahs] = 1; Object.keys(x.kt).forEach(function (t) { const k = x.mahs + '|' + t, v = x.kt[t], p = v[1] ? v[0] / v[1] : 0; if (!kt[k]) kt[k] = {dau: p, cuoi: p, n: 0}; kt[k].cuoi = p; kt[k].n++; }); });
      const nhieu = Object.keys(kt).filter(function (k) { return kt[k].n >= 2; });
      return {luot: ds.length, em: Object.keys(em).length, cap: nhieu.length, dau: nhieu.reduce(function (s, k) { return s + kt[k].dau; }, 0), cuoi: nhieu.reduce(function (s, k) { return s + kt[k].cuoi; }, 0)};
    })()};
}
function ghiDaXem(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false};
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
    sh.appendRow([new Date(), String(d.matro || ''), String(d.tentro || d.matro || ''), nhom, d.diem, chuDS(d.dungsai), Number(d.thoigian) || '', ml]);
    if (Array.isArray(d.ct)) {
      const nh = docNhom(), tv = Object.keys(nh).filter(function (ma) { return nh[ma] === nhom; }).sort();
      ghiKQTro(d, 'NHOM', '', '', nhom, tv.join(','));
    }
  } finally { lock.releaseLock(); }
  return {ok: true};
}
// "4/11" ghi thang vao o se bi Google Sheets doi thanh ngay 4/11 -> ghi dang chu
function chuDS(v) { v = String(v == null ? '' : v).trim(); return /^\d+(?:[.,]\d+)?\s*\/\s*\d+$/.test(v) ? "'" + v : v; }
// Doc lai o DungSai: neu da bi doi thanh ngay (so cu) thi lay lai "ngay/thang"
function docDS(v) { return v instanceof Date ? v.getDate() + '/' + (v.getMonth() + 1) : String(v == null ? '' : v).trim(); }
function ghiKQTro(d, kieu, ma, ten, nhom, tv) {
  const ct = (d.ct || []).slice(0, 30).map(function (x) {
    return [String(x[0] || '').slice(0, 20), String(x[1] == null ? '' : x[1]).slice(0, 20), x[2] === '' || x[2] == null ? '' : Number(x[2]) || 0];
  });
  const diem = Math.round((Number(d.diem) || 0) * 100) / 100;
  layTab(TAB_KQ, HEAD_KQ).appendRow([new Date(), String(d.matro || d.mahoatdong || ''), String(d.tentro || d.cauhoi || ''), kieu, ma, ten, nhom, tv,
    diem, chuDS(d.dungsai), Number(d.thoigian) || '', String(d.maluot || ''), String(d.bo || ''), JSON.stringify(ct), String(d.lydo || '').slice(0, 40)]);
}
function coLuotKQ(ml) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_KQ);
  return !!ml && !!sh && sh.getLastRow() > 1 && sh.getRange(2, 12, sh.getLastRow() - 1, 1).getValues().some(function (r) { return String(r[0]) === ml; });
}
// Doc tab KQ TRO CHOI -> danh sach luot
function docKQTro() { return nho('kqtro', docKQTroGoc); }
function docKQTroGoc() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_KQ);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_KQ.length).getValues().map(function (r) {
    let ct = [];
    try { ct = JSON.parse(String(r[13] || '[]')); } catch (e) {}
    return {t: r[0] instanceof Date ? r[0].getTime() : 0, matro: String(r[1]).trim(), ten: String(r[2]).trim(), kieu: String(r[3]).trim(),
      mahs: String(r[4]).trim(), hoten: String(r[5]).trim(), nhom: String(r[6]).trim(), tv: String(r[7] || '').split(',').filter(String),
      diem: Number(r[8]) || 0, ds: docDS(r[9]), giay: Number(r[10]) || 0, ml: String(r[11]).trim(), bo: String(r[12]).trim(), ct: ct, lydo: String(r[14] || '')};
  }).filter(function (x) { return x.matro && !(AN_GV && laGV(x.mahs)); });
}
// ---- Tro khung: doi cau trong bo sang dang cau de (de dung chung cham diem, xem lai, danh gia kien thuc) ----
const THANG_DS_TRO = [0, 0.3, 0.7, 1.2, 2];
function chuTro(s) { return esc(String(s == null ? '' : s)); }
function cauTroMap(bo) {
  if (bo._map) return bo._map;
  const m = {};
  (bo.tn || []).forEach(function (c) {
    m[c.c] = {loai: 'TN', hoi: chuTro(c.q), pa: {A: chuTro(c.o[0]), B: chuTro(c.o[1]), C: chuTro(c.o[2]), D: chuTro(c.o[3])}, da: 'ABCD'[c.a] || '', w: 0.5,
      kt: c.kt || '', md: c.md || '', gt: c.e || '', hinh: c.h || ''};
  });
  (bo.ds || []).forEach(function (c) {
    const s = c.s || [];
    m[c.c] = {loai: 'DS', hoi: chuTro(c.q), pa: {A: chuTro((s[0] || [])[0]), B: chuTro((s[1] || [])[0]), C: chuTro((s[2] || [])[0]), D: chuTro((s[3] || [])[0])},
      da: s.map(function (y) { return y[1] ? 'D' : 'S'; }).join(''), w: 2, kt: c.kt || '', md: c.md || '', hinh: c.h || '',
      gt: c.e || s.map(function (y, k) { return y[2] ? 'abcd'[k] + ') ' + y[2] : ''; }).filter(String).join('\n')};
  });
  (bo.tln || []).forEach(function (c) {
    m[c.c] = {loai: 'TLN', hoi: chuTro(c.q), pa: {A: '', B: '', C: '', D: ''}, da: String(c.a), w: 0.5, kt: c.kt || '', md: c.md || '', gt: c.e || '', hinh: c.h || ''};
  });
  Object.defineProperty(bo, '_map', {value: m, enumerable: false});
  return m;
}
// Cham 1 luot: tra ve tung cau theo thu tu luot (ma cau I.1.. theo phan), bo qua cau khong con trong bo
function chamLuot(x, layBo) {
  const bo = x.bo ? layBo(x.bo) : null;
  if (!bo) return null;
  const m = cauTroMap(bo), dem = {TN: 0, DS: 0, TLN: 0}, phan = {TN: 'I', DS: 'II', TLN: 'III'};
  const ct = [];
  (x.ct || []).forEach(function (c) {
    const q = m[c[0]]; if (!q) return;
    dem[q.loai]++;
    const daLam = c[2] !== '' && c[2] != null;
    const r = chamCau({loai: q.loai, da: q.da}, c[1]);
    const diem = daLam ? Number(c[2]) || 0 : 0;
    ct.push({cau: phan[q.loai] + '.' + dem[q.loai], ma: c[0], loai: q.loai, hoi: q.hoi, pa: q.pa, hinh: q.hinh, chon: daLam ? r.chon : '', dapan: q.da,
      dung: daLam && r.dung, soY: daLam ? r.soY : 0, diem: diem, toiDa: q.w, gt: q.gt, kt: q.kt, md: q.md, daLam: daLam,
      v: !daLam ? null : q.loai === 'DS' ? r.soY / 4 : (r.dung ? 1 : 0)});
  });
  return ct;
}
function boDem() { const c = {}; return function (ma) { if (!(ma in c)) { try { c[ma] = docBoCau(ma); } catch (e) { c[ma] = null; } } return c[ma]; }; }
// Cac luot tro khung cua 1 em (ca nhan + nhom em la thanh vien luc choi)
function luotCuaHS(ma, ds) { return (ds || docKQTro()).filter(function (x) { return x.kieu === 'NHOM' ? x.tv.indexOf(ma) >= 0 : x.mahs === ma; }); }
function ngayKhoa(t) { return Utilities.formatDate(new Date(t), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function tenTroGon(x) { return String(x.ten || x.matro).replace(/\s*\(nhóm\)\s*$/, ''); }
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
    if (Array.isArray(d.ct) && d.maluot) { if (!coLuotKQ(String(d.maluot))) ghiKQTro(d, 'CA NHAN', ma, hs.ten, '', ''); }
    else layTab(TAB_HD, HEAD_HD).appendRow([new Date(), d.mahoatdong || '', ma, hs.ten,
      d.cauhoi || '', d.solanthu || '', chuDS(d.dungsai), d.thoigian || '']);
  } finally {
    lock.releaseLock();
  }
  return {ok: true, hoten: hs.ten};
}

// ---------------------------------------------------------------------
// KHOI 3 - Trang giao vien (can MaQuanLy trong tab MA cua KHO DE)
// ---------------------------------------------------------------------
// =====================================================================
// BAO MAT: dem lan nhap sai ma (CacheService), khoa tam, ghi su viec vao tab BAO MAT (kho, chung moi lop),
// nhat ky thay doi diem (tab NHAT KY DIEM moi so) + hoan tac, kiem tra diem bi sua ngoai he thong.
// =====================================================================
const TAB_BM = 'BAO MAT', HEAD_BM = ['ThoiGian', 'Lop', 'Loai', 'MucDo', 'DoiTuong', 'ChiTiet', 'ThietBi', 'DaXem'];
const TAB_NKD = 'NHAT KY DIEM', HEAD_NKD = ['ThoiGian', 'ThaoTac', 'MaHS', 'HoTen', 'Bai', 'Truoc', 'Sau', 'ThietBi', 'Khoa', 'HoanTac'];
const TAB_KTD = 'KIEM TRA DIEM', HEAD_KTD = ['Khoa', 'Diem'];
var BM_TB = '', BM_MSG = '';
function bmGhi(loai, muc, dt, ct) {
  // Yeu cau / doi ma tu may GV da dang nhap dung truoc do: tu danh dau OK (van luu de xem lai)
  const tb = String(BM_TB || '').split(' · ')[0], tuMayGV = /^(QUEN_MA|DOI_MA_QL)$/.test(loai) && tb && mayTin().indexOf(tb) >= 0;
  try { tabKho(TAB_BM, HEAD_BM).appendRow([new Date(), lopNay(), loai, muc, String(dt || '').slice(0, 200), String(ct || '').slice(0, 800), BM_TB, tuMayGV ? 'OK (máy GV)' : '']); } catch (e) {}
}
function bmDem(k, phut) { const c = CacheService.getScriptCache(), n = (Number(c.get(k)) || 0) + 1; c.put(k, String(n), phut * 60); return n; }
function bmKhoa(k) { return !!CacheService.getScriptCache().get(k); }
function bmDatKhoa(k, phut) { CacheService.getScriptCache().put(k, '1', phut * 60); }
function dungMaXem(hs, d) {
  const nhap = String(d.maxem || '').trim();
  let ok = !!(hs && hs.maxem && nhap === hs.maxem);
  if (ok && hs.gv && mayTin().indexOf(String(d.tb || '').trim()) < 0) {
    if (bmDem('tkgv', 10) === 1) bmGhi('THU_TK_GV', 'Vừa', 'SBD ' + String(d.mahs || '').trim() + ' (tài khoản GV)', 'Có người nhập đúng mật khẩu của tài khoản GV nhưng trên máy chưa từng đăng nhập trang GV → đã chặn. Nếu không phải thầy/cô thì có thể HS đang thử vào tài khoản GV.');
    BM_MSG = 'Tài khoản GV chỉ mở được trên máy đã đăng nhập trang giáo viên (mở lớp này ở trang GV trên máy này một lần).'; return false;
  }
  if (!ok && nhap !== '') {
    const ma = String(d.mahs || '').trim(), n = bmDem('sx_' + ma, 15), tong = bmDem('sx_tat', 10);
    if (n >= 5 && !bmKhoa('kx_' + ma)) { bmDatKhoa('kx_' + ma, 15); bmGhi('KHOA_MA_XEM', 'Cao', 'SBD ' + ma + (hs ? ' · ' + hs.ten : ' (không có trong lớp)'), 'Nhập sai mã xem bài 5 lần trong 15 phút → khóa tài khoản này 15 phút. Có thể có người đang dò mã để xem/làm thay bài của em này.'); }
    if (tong === 20) bmGhi('DO_MA_HANG_LOAT', 'Cao', 'Nhiều SBD', '20 lần nhập sai mã xem bài trong 10 phút ở lớp này – dấu hiệu dò mã hàng loạt.');
  }
  return ok;
}
function bmSaiMoKhoa(d, loai) {
  const n = bmDem('smk', 10);
  if (n === 6) bmGhi('DO_MA_MO_KHOA', 'Cao', d.mahs ? 'SBD ' + String(d.mahs) : 'Mã mở khóa ' + loai, 'Nhập sai mã mở khóa (' + loai + ') 6 lần trong 10 phút – có thể học sinh đang dò mã để tự mở khóa bài.');
}
function mayTin() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('may_tin') || '[]'); } catch (e) { return []; } }
// Ma quan ly: sai 3 lan → bao; sai 8 lan/10 phut → chan moi thao tac GV 30 phut, tru may da dang nhap dung truoc do
function kiemGV(d) {
  BM_MSG = '';
  const dung = kiemMaQL(d.ma), tb = String(d.tb || '').trim();
  if (bmKhoa('kql')) {
    if (dung && tb && mayTin().indexOf(tb) >= 0) return true;
    if (!dung) bmDem('sql', 30);
    BM_MSG = 'Tạm khóa thao tác giáo viên 30 phút do có người nhập sai mã quản lý nhiều lần. Máy thầy/cô đã đăng nhập trước đó vẫn dùng được.';
    return false;
  }
  if (dung) {
    if (tb && !bmKhoa('mt_' + tb)) {
      const ds = mayTin(); if (ds.indexOf(tb) < 0) { ds.push(tb); PropertiesService.getScriptProperties().setProperty('may_tin', JSON.stringify(ds.slice(-30))); }
      bmDatKhoa('mt_' + tb, 360);
    }
    return true;
  }
  const n = bmDem('sql', 10);
  if (n === 3) bmGhi('SAI_MA_QL', 'Vừa', 'Mã quản lý (trang GV)', 'Nhập sai mã quản lý 3 lần trong 10 phút.');
  if (n >= 8) { bmDatKhoa('kql', 30); bmGhi('KHOA_GV', 'Cao', 'Mã quản lý (trang GV)', 'Nhập sai mã quản lý 8 lần trong 10 phút → chặn thao tác giáo viên 30 phút (máy thầy/cô đã đăng nhập vẫn dùng được). Nên đổi mã quản lý.'); }
  return false;
}
// Nhat ky thay doi diem
function nkGhi(dong) {   // dong: [[thaoTac, ma, hoten, bai, truoc, sau, khoa]]
  if (!dong.length) return;
  try {
    const sh = layTab(TAB_NKD, HEAD_NKD), now = new Date();
    const v = dong.map(function (x) { return [now, x[0], "'" + x[1], x[2] || '', x[3], x[4] === '' || x[4] == null ? '' : String(x[4]), x[5] === '' || x[5] == null ? '' : String(x[5]), BM_TB, x[6] || '', '']; });
    const r0 = sh.getLastRow() + 1; sh.getRange(r0, 1, v.length, 10).setNumberFormat('@'); sh.getRange(r0, 1, v.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sh.getRange(r0, 1, v.length, HEAD_NKD.length).setValues(v);
  } catch (e) {}
}
function gvNhatKy() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_NKD);
  if (!sh || sh.getLastRow() < 2) return {ok: true, lop: lopNay(), ds: []};
  const n = sh.getLastRow() - 1, tu = Math.max(1, n - 299);
  return {ok: true, lop: lopNay(), ds: sh.getRange(tu + 1, 1, n - tu + 1, HEAD_NKD.length).getValues().map(function (r, i) {
    return {dong: tu + 1 + i, luc: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), tt: String(r[1]), ma: String(r[2]).replace(/^'/, ''), ten: String(r[3]), bai: String(r[4]), truoc: String(r[5]), sau: String(r[6]), tb: String(r[7]), khoa: String(r[8]), hoan: String(r[9])};
  }).reverse()};
}
function gvNkHoanTac(d) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_NKD), dong = Number(d.dong);
  if (!sh || !(dong >= 2) || dong > sh.getLastRow()) return {ok: false, msg: 'Khong tim thay dong nhat ky'};
  const r = sh.getRange(dong, 1, 1, HEAD_NKD.length).getValues()[0], k = String(r[8]).split('|'), truoc = String(r[5]), sau = String(r[6]);
  if (String(r[9])) return {ok: false, msg: 'Đã hoàn tác rồi'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (k[0] === 'TX') {
      const tx = layTab(TAB_TX, HEAD_TX), n = tx.getLastRow(), v = n > 1 ? tx.getRange(2, 1, n - 1, 5).getValues() : [];
      let i = -1; v.forEach(function (x, j) { if (String(x[0]).trim() === k[1] && String(x[3]).trim().replace(/^'/, '') === k[2]) i = j; });
      if (i >= 0 && String(v[i][4]) !== sau) return {ok: false, msg: 'Điểm đã đổi tiếp sau lần này, không hoàn tác được'};
      if (truoc === '') { if (i >= 0) tx.deleteRow(i + 2); }
      else if (i >= 0) tx.getRange(i + 2, 5).setValue(/^[VTK]$/.test(truoc) ? truoc : Number(truoc));
      else { const ng = /^(\d{4}-\d{2}-\d{2})/.exec(k[1]); tx.appendRow([k[1], ng ? new Date(ng[1] + 'T07:00:00') : new Date(), /#v$/.test(k[1]) ? 'Nộp vở' : '', "'" + k[2], /^[VTK]$/.test(truoc) ? truoc : Number(truoc), new Date(), '']); }
    } else if (k[0] === 'BL') {
      const bl = SpreadsheetApp.getActive().getSheetByName(TAB_BL), v = bl.getRange(2, 1, bl.getLastRow() - 1, HEAD_BL.length).getValues();
      let i = -1; v.forEach(function (x, j) { if (String(x[1]).trim() === k[1] && String(x[2]).trim() === k[2] && String(Number(x[11]) || 1) === k[3]) i = j; });
      if (i < 0) return {ok: false, msg: 'Không còn bài làm này'};
      if (String(v[i][5]) !== sau) return {ok: false, msg: 'Điểm đã đổi tiếp sau lần này, không hoàn tác được'};
      bl.getRange(i + 2, 6).setValue(Number(truoc));
    } else return {ok: false, msg: 'Loại này không hoàn tác được'};
    sh.getRange(dong, 10).setValue('x · ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM HH:mm'));
    nkGhi([['HOAN_TAC', k[2], String(r[3]), String(r[4]), sau, truoc, String(r[8])]]);
  } finally { lock.releaseLock(); }
  return gvNhatKy();
}
// Kiem tra diem bi sua thang trong Google Sheet (khong qua trang GV): so voi anh chup lan truoc + nhat ky
function bmAnhDiem() {
  const m = {}, ss = SpreadsheetApp.getActive(), bl = ss.getSheetByName(TAB_BL), tx = ss.getSheetByName(TAB_TX);
  if (bl && bl.getLastRow() > 1) bl.getRange(2, 1, bl.getLastRow() - 1, 12).getValues().forEach(function (r) { const ma = String(r[2]).trim(); if (ma) m['BL|' + String(r[1]).trim() + '|' + ma + '|' + (Number(r[11]) || 1)] = String(r[5]); });
  if (tx && tx.getLastRow() > 1) tx.getRange(2, 1, tx.getLastRow() - 1, 5).getValues().forEach(function (r) { const ma = String(r[3]).trim().replace(/^'/, ''); if (ma) m['TX|' + String(r[0]).trim() + '|' + ma] = String(r[4]); });
  return m;
}
function bmKiemTraDiem(ep) {
  const P = PropertiesService.getScriptProperties(), luc = Number(P.getProperty('ktd_luc') || 0);
  if (!ep && Date.now() - luc < 3 * 3600 * 1000) return 0;
  const moi = bmAnhDiem(), sh = layTab(TAB_KTD, HEAD_KTD), cu = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { cu[String(r[0])] = String(r[1]); });
  let lech = 0;
  if (luc) {
    const nk = {}, nks = SpreadsheetApp.getActive().getSheetByName(TAB_NKD);
    if (nks && nks.getLastRow() > 1) nks.getRange(2, 1, nks.getLastRow() - 1, HEAD_NKD.length).getValues().forEach(function (r) { if (r[0] instanceof Date && r[0].getTime() >= luc - 60000) nk[String(r[8])] = 1; });
    const ds = [];
    Object.keys(cu).forEach(function (k) {
      if (nk[k]) return;
      const a = cu[k], b = moi[k];
      if (b === undefined) { if (/^BL/.test(k)) ds.push(k + ': ' + a + ' → (bài bị xóa)'); return; }
      if (String(Number(a)) === String(Number(b)) || a === b) return;
      ds.push(k + ': ' + a + ' → ' + b);
    });
    if (ds.length) { lech = ds.length; bmGhi('SUA_NGOAI_HE_THONG', 'Cao', ds.length + ' điểm', 'Điểm trong sổ bị thay đổi không qua trang giáo viên (sửa thẳng trong Google Sheet?). ' + ds.slice(0, 15).join('; ') + (ds.length > 15 ? '; …' : '')); }
  }
  const v = Object.keys(moi).map(function (k) { return [k, moi[k]]; });
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).clearContent();
  if (v.length) { sh.getRange(2, 1, v.length, 2).setNumberFormat('@'); sh.getRange(2, 1, v.length, 2).setValues(v); }
  P.setProperty('ktd_luc', String(Date.now()));
  return lech;
}
function gvBaoMat(d) {
  let lech = 0; try { lech = bmKiemTraDiem(!!d.ep); } catch (e) {}
  const q = docMa().quanly, sh = kho().getSheetByName(TAB_BM), tu = Date.now() - 60 * 864e5, su = [];
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BM.length).getValues().forEach(function (r, i) {
    const t = r[0] instanceof Date ? r[0] : new Date(r[0]); if (isNaN(t) || t.getTime() < tu) return;
    su.push({dong: i + 2, luc: t.toISOString(), lop: String(r[1]), loai: String(r[2]), muc: String(r[3]), dt: String(r[4]), ct: String(r[5]), tb: String(r[6]), xem: !!String(r[7]), ok: String(r[7])});
  });
  su.reverse();
  return {ok: true, lop: lopNay(), su: su.slice(0, 200), moi: su.filter(function (x) { return !x.xem; }).length, lech: lech,
    maYeu: !q || q.length < 8 || /^\d+$/.test(q), khoaGV: bmKhoa('kql')};
}
// GV xac nhan su viec (OK = dung la toi / da xu ly): 1 dong (d.dong) hoac tat ca
function gvBaoMatXem(d) {
  const sh = kho().getSheetByName(TAB_BM), dau = 'OK ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM HH:mm');
  if (!sh || sh.getLastRow() < 2) return {ok: true};
  const dong = Number(d && d.dong);
  if (dong >= 2 && dong <= sh.getLastRow()) { sh.getRange(dong, 8).setValue(dau); return {ok: true}; }
  const r = sh.getRange(2, 8, sh.getLastRow() - 1, 1), v = r.getValues(); v.forEach(function (x) { if (!String(x[0])) x[0] = dau; }); r.setValues(v);
  return {ok: true};
}
// Quen ma quan ly: gui ma 6 so (10 phut) ve Gmail chu so (nguoi trien khai) -> nhap ma + dat ma moi
function anEmail(e) { const p = String(e || '').split('@'); return p.length < 2 ? '' : p[0].slice(0, 2) + '***@' + p[1]; }
function gvQuenMa() {
  if (bmDem('qm_gio', 60) > 3) return {ok: false, msg: 'Đã gửi 3 lần trong 1 giờ. Thử lại sau hoặc mở file KHO DE → tab MA để xem mã.'};
  const em = Session.getEffectiveUser().getEmail();
  if (!em) return {ok: false, msg: 'Không xác định được Gmail chủ sổ.'};
  const otp = String(Math.floor(100000 + Math.random() * 900000)), c = CacheService.getScriptCache();
  c.put('qm_otp', otp, 600); c.remove('qm_sai');
  try {
    MailApp.sendEmail(em, 'Khám phá Hóa học – mã đổi mã quản lý: ' + otp,
      'Mã xác nhận để đặt lại mã quản lý trang giáo viên: ' + otp + '\n\nMã có hiệu lực 10 phút. Nếu thầy/cô KHÔNG yêu cầu, có người đang thử lấy quyền trang giáo viên – bỏ qua email này và xem Cài đặt → Bảo mật.\n\nYêu cầu từ: ' + (BM_TB || 'không rõ thiết bị') + ' · lớp ' + lopNay());
  } catch (e) { c.remove('qm_otp'); return {ok: false, quyen: true, msg: 'Sổ này chưa được cấp quyền gửi mail. Mở Apps Script của sổ, chọn hàm capQuyenMail rồi bấm ▶ Chạy một lần.'}; }
  bmGhi('QUEN_MA', 'Vừa', 'Mã quản lý', 'Có yêu cầu gửi mã đặt lại mã quản lý về Gmail ' + anEmail(em) + '. Nếu không phải thầy/cô, có người đang thử chiếm trang GV.');
  return {ok: true, gui: anEmail(em)};
}
function gvDoiMaOTP(d) {
  const c = CacheService.getScriptCache(), otp = c.get('qm_otp');
  if (!otp) return {ok: false, msg: 'Mã xác nhận đã hết hạn hoặc chưa gửi. Bấm gửi lại.'};
  if (String(d.otp || '').trim() !== otp) {
    if (bmDem('qm_sai', 10) >= 5) { c.remove('qm_otp'); bmGhi('DO_MA_OTP', 'Cao', 'Mã xác nhận Gmail', 'Nhập sai mã xác nhận đổi mã quản lý 5 lần → hủy mã.'); return {ok: false, msg: 'Sai 5 lần, mã đã bị hủy. Gửi lại mã mới.'}; }
    return {ok: false, msg: 'Mã xác nhận chưa đúng.'};
  }
  const moi = String(d.moi || '').trim();
  if (moi.length < 8 || !/[A-Za-z]/.test(moi) || !/\d/.test(moi) || /\s/.test(moi)) return {ok: false, msg: 'Mã mới cần ≥ 8 ký tự, có cả chữ và số, không dấu cách.'};
  const sh = kho().getSheetByName('MA'), v = sh.getDataRange().getValues(); let r = -1;
  v.forEach(function (x, i) { if (khongDau(x[0]).replace(/\s+/g, '') === 'MAQUANLY') r = i; });
  if (r >= 0) sh.getRange(r + 1, 2).setNumberFormat('@').setValue(moi); else sh.appendRow(['MaQuanLy', moi]);
  c.remove('qm_otp'); c.remove('kql'); c.remove('sql');
  bmGhi('DOI_MA_QL', 'Vừa', 'Mã quản lý', 'Đã đặt lại mã quản lý bằng mã xác nhận gửi về Gmail.');
  return {ok: true};
}
// Chay 1 lan trong trinh soan Apps Script de cap quyen gui mail (cho chuc nang Quen ma)
function capQuyenMail() { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Khám phá Hóa học – đã cấp quyền gửi mail', 'Sổ ' + lopNay() + ' đã gửi được mail. Chức năng "Quên mã" trên trang giáo viên đã sẵn sàng.'); }
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
      batdauluc: r[6] instanceof Date ? r[6].getTime() : 0, ca: String(r[7] || '').trim(),
      giay: khongDau(r[8]) === 'GIAY', thang: docThang(r[9])};
  }), doima: docDoiMa(), bayGio: Date.now()};
}
// Doi TrangThai (MO/DONG) hoac ChoXemLai (CO/KHONG) cua 1 dot trong KHO DE
function gvDat(d) {
  if (d.truong === 'ca') return gvDatCa(d);
  const sh = kho().getSheetByName('CAU HINH');
  const v = sh.getRange(1, 1, sh.getLastRow(), 8).getValues();
  const madot = String(d.madot || '').trim();
  let i0 = -1;
  for (let i = 1; i < v.length; i++) if (String(v[i][0]).trim() === madot) { i0 = i; break; }
  if (i0 < 0) return {ok: false, msg: 'Khong tim thay dot ' + d.madot};
  // Ca thi nhieu ma de: trang thai, xem lai, thoi gian, lop ap dung cho ca ca
  const ca = String(v[i0][7] || '').trim(), hang = [];
  for (let i = 1; i < v.length; i++) if (i === i0 || (ca && d.truong !== 'ten' && String(v[i][7] || '').trim() === ca)) hang.push(i);
  if (d.truong === 'ten' && !String(d.giatri || '').trim()) return {ok: false, msg: 'Ten bai khong duoc de trong'};
  if (d.truong === 'phut') { const ph = Math.round(Number(d.giatri)); if (!(ph >= 1 && ph <= 180)) return {ok: false, msg: 'Thoi gian phai tu 1 den 180 phut'}; }
  if (['trangthai', 'mo', 'xemlai', 'ten', 'phut', 'lop'].indexOf(d.truong) < 0) return {ok: false, msg: 'Truong khong hop le'};
  if (d.truong === 'trangthai' && ['MO', 'CHO'].indexOf(String(d.giatri)) >= 0 && khongDau(sh.getRange(i0 + 1, 9).getValue()) === 'GIAY')
    return {ok: false, msg: 'De giay khong mo tren iPad duoc'};
  hang.forEach(function (i) {
    if (d.truong === 'trangthai') {
      const g = ['MO', 'CHO'].indexOf(String(d.giatri)) >= 0 ? String(d.giatri) : 'DONG';
      sh.getRange(i + 1, 4).setValue(g);
      if (g === 'MO') {
        if (!String(sh.getRange(1, 7).getValue()).trim()) sh.getRange(1, 7).setValue('BatDauLuc').setFontWeight('bold');
        sh.getRange(i + 1, 7).setValue(new Date());
      }
      // Mo phong cho cho ca moi: xoa gio bat dau cua ca truoc de khong ai nhan nham gio ket thuc cu
      if (g === 'CHO') sh.getRange(i + 1, 7).setValue('');
      try { CacheService.getScriptCache().remove('tt_' + String(v[i][0]).trim()); } catch (e) {}
    } else if (d.truong === 'mo') sh.getRange(i + 1, 4).setValue(d.giatri ? 'MO' : 'DONG');
    else if (d.truong === 'xemlai') sh.getRange(i + 1, 5).setValue(d.giatri ? 'CO' : 'KHONG');
    else if (d.truong === 'ten') sh.getRange(i + 1, 2).setValue(String(d.giatri).trim());
    else if (d.truong === 'phut') sh.getRange(i + 1, 3).setValue(Math.round(Number(d.giatri)));
    else if (d.truong === 'lop') sh.getRange(i + 1, 6).setValue(chuanDsLop(d.giatri));
  });
  SpreadsheetApp.flush();
  return gvDot();
}
// Gop / tach ca thi: d.madot = ma de chinh, d.giatri = danh sach ma de cung ca (rong = tach)
function gvDatCa(d) {
  const sh = kho().getSheetByName('CAU HINH');
  const v = sh.getRange(1, 1, sh.getLastRow(), 8).getValues();
  const chinh = String(d.madot || '').trim();
  const ds = [chinh].concat((Array.isArray(d.giatri) ? d.giatri : []).map(function (x) { return String(x).trim(); }))
    .filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  const hang = {};
  for (let i = 1; i < v.length; i++) hang[String(v[i][0]).trim()] = i;
  if (hang[chinh] === undefined) return {ok: false, msg: 'Khong tim thay dot ' + chinh};
  for (let k = 0; k < ds.length; k++) {
    const i = hang[ds[k]];
    if (i === undefined) return {ok: false, msg: 'Khong tim thay dot ' + ds[k]};
    if (['MO', 'CHO'].indexOf(khongDau(v[i][3])) >= 0) return {ok: false, msg: 'De ' + ds[k] + ' dang mo, dong de truoc khi gop/tach ca'};
    const caCu = String(v[i][7] || '').trim();
    if (caCu && caCu !== chinh) return {ok: false, msg: 'De ' + ds[k] + ' dang thuoc ca ' + caCu};
  }
  if (!String(sh.getRange(1, 8).getValue()).trim()) sh.getRange(1, 8).setValue('CaThi').setFontWeight('bold');
  for (let i = 1; i < v.length; i++) if (String(v[i][7] || '').trim() === chinh) sh.getRange(i + 1, 8).setValue('');
  if (ds.length > 1) {
    const goc = v[hang[chinh]];
    ds.forEach(function (m) {
      const i = hang[m];
      sh.getRange(i + 1, 8).setValue(chinh);
      if (m !== chinh) { sh.getRange(i + 1, 3).setValue(goc[2]); sh.getRange(i + 1, 5).setValue(goc[4]); sh.getRange(i + 1, 6).setValue(goc[5]); }
    });
  }
  SpreadsheetApp.flush();
  return gvDot();
}
// ---------------------------------------------------------------------
// GV xem truoc de (PDF co dap an, loi giai) + kiem tra hinh truoc khi cho thi
// ---------------------------------------------------------------------
function urlAnhCua(q) {
  const ds = [];
  [q.hoi, q.pa.A, q.pa.B, q.pa.C, q.pa.D].join(' ').replace(/<img[^>]*src="(https?:\/\/[^"]+)"/gi, function (m, u) { ds.push(u); return m; });
  if (/^https?:\/\//i.test(q.hinh || '')) ds.push(q.hinh);
  return ds;
}
function gvXemDe(d) {
  const c = timDot(d.madot);
  if (!c) return {ok: false, msg: 'Khong tim thay de ' + d.madot};
  const de = docDe(c.madot), kiem = {}, thieu = [];
  function coAnh(u) {
    if (u in kiem) return kiem[u];
    let ok = false;
    try { ok = UrlFetchApp.fetch(u, {muteHttpExceptions: true, followRedirects: true}).getResponseCode() === 200; } catch (e) {}
    return (kiem[u] = ok);
  }
  de.forEach(function (q) {
    urlAnhCua(q).forEach(function (u) { if (!coAnh(u)) thieu.push({cau: q.cau, url: u}); });
    if (nhacHinh(q)) thieu.push({cau: q.cau, url: '', nhac: true});
  });
  const gt = docGiaiThich();
  // Cau nhac toi "Hinh 2", "so do"... ma cot Hinh dang trong: danh dau ngay duoi cau hoi trong PDF
  let html = htmlDeGoc(c, de.map(function (q) {
    return nhacHinh(q) ? Object.assign({}, q, {hoi: q.hoi + '<div style="border:2px dashed #000;padding:6px;margin:4px 0;font-weight:bold">⚠ CÂU NÀY NHẮC TỚI HÌNH NHƯNG CHƯA GẮN HÌNH (cột Hinh trống)</div>'}) : q;
  }));
  // Hinh khong mo duoc: thay bang khung bao loi de GV thay ngay tren PDF
  html = html.replace(/<img[^>]*src="(https?:\/\/[^"]+)"[^>]*>/gi, function (m, u) {
    return coAnh(u) ? m : '<div style="border:2px dashed #000;padding:6px;margin:4px 0;font-weight:bold">⚠ THIẾU HÌNH: ' + esc(u.replace(/^.*\/hinh\//, 'hinh/')) + '</div>';
  });
  const coGT = de.filter(function (q) { return gt[c.madot + '|' + q.cau]; });
  if (coGT.length) html = html.replace('</body>', '<h3>LỜI GIẢI CHI TIẾT</h3>' + coGT.map(function (q) {
    return '<div class="q"><b>' + nhanCau(q) + '.</b> ' + String(gt[c.madot + '|' + q.cau]).replace(/\n/g, '<br>') + '</div>';
  }).join('') + '</body>');
  const tom = '<p style="text-align:center">' + (thieu.length ? '<b>⚠ ' + thieu.length + ' chỗ thiếu hình</b>' : 'Hình: đủ') + ' · Lời giải: ' + coGT.length + '/' + de.length + ' câu</p>';
  html = html.replace('</h2>', '</h2>' + tom);
  const pdf = htmlSangPDF(html, 'XEM DE - ' + c.madot + '.pdf');
  return {ok: true, madot: c.madot, ten: c.ten, socau: de.length, thieu: thieu, sogt: coGT.length, pdf: Utilities.base64Encode(pdf.getBytes())};
}
// ---- Cham phieu giay (quet bang dien thoai tren trang GV): chay o SO LOP ----
function maCa(ca) { return docCauHinh().filter(function (c) { return c.giay && (c.ca || c.madot) === ca; }).map(function (c) { return c.madot; }); }
// Danh sach HS + em nao da co bai cua dot (ca) nay
function gvGiayLop(d) {
  const ca = String(d.ca || '').trim(), mas = maCa(ca);
  if (!mas.length) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  const dsh = SpreadsheetApp.getActive().getSheetByName(TAB_DS), hs = [];
  if (dsh && dsh.getLastRow() > 1) dsh.getRange(2, 1, dsh.getLastRow() - 1, 2).getValues().forEach(function (r) { if (String(r[0]).trim()) hs.push({mahs: String(r[0]).trim(), hoten: String(r[1]).trim()}); });
  const da = {}, sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  if (sh && sh.getLastRow() > 1) boGV(sh.getRange(2, 1, sh.getLastRow() - 1, 13).getValues(), 2).forEach(function (r) {
    if (mas.indexOf(String(r[1]).trim()) >= 0) da[String(r[2]).trim()] = {madot: String(r[1]).trim(), diem: r[5], dung: r[6], tong: r[7], ct: String(r[9] || ''), anh: String(r[10] || ''), ghi: String(r[12] || '')};
  });
  return {ok: true, lop: lopNay(), ca: ca, ma: mas, hs: hs, da: da, cho: demAnhCho(ca)};
}
// ---------------------------------------------------------------------
// M5 CHAM TU LUAN THEO RUBRIC (de giay Phan IV): rubric theo buoc (kho, tab RUBRIC), GV chup bai tu luan + tich buoc dat
//   Diem tu luan cong vao diem de giay (BAI LAM), luu chi tiet o tab TU LUAN DIEM cua so lop; HS xem lai thay buoc mat diem
// ---------------------------------------------------------------------
const TAB_RB = 'RUBRIC', HEAD_RB = ['Ca', 'Cau', 'Buoc', 'NoiDung', 'Diem', 'TrangThai', 'Nguon', 'Ngay'];
const TAB_TLD = 'TU LUAN DIEM', HEAD_TLD = ['Ca', 'MaHS', 'Cau', 'Dat', 'Diem', 'AnhId', 'ThoiGian', 'TT', 'LyDo'];   // TT: DUYET (GV da duyet, cong diem) | NHAP (AI cham nhap); Cau _ANH: chi luu anh mat sau
function tlGoc(ca) {
  const mas = maCa(ca); if (!mas.length) return null;
  const tl = docTuLuan(); const m = mas.filter(function (x) { return tl[x] && tl[x].length; }).sort()[0];
  return m ? {madot: m, cau: tl[m]} : {madot: mas[0], cau: []};
}
function docRubric(ca) {
  const sh = kho().getSheetByName(TAB_RB), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_RB.length).getValues().forEach(function (r) {
    if (String(r[0]).trim() !== ca) return;
    const c = String(r[1]).trim(); (m[c] = m[c] || {buoc: [], tt: 'DUYET'}).buoc.push({nd: String(r[3]), diem: Number(String(r[4]).replace(',', '.')) || 0});
    if (khongDau(r[5]) === 'CHO') m[c].tt = 'CHO';
  });
  return m;
}
function gvRubric(d) {
  const ca = String(d.ca || '').trim(), g = tlGoc(ca);
  if (!g) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  return {ok: true, ca: ca, madot: g.madot, cau: g.cau.map(function (t) { return {cau: t.cau, hoi: t.hoi, diem: Number(String(t.diem).replace(',', '.')) || 0, gt: t.gt}; }), rubric: docRubric(ca)};
}
// d.rubric: {cau: [{nd, diem}]} (thay rubric cac cau co trong d.rubric)
function gvRubricLuu(d) {
  const ca = String(d.ca || '').trim(), rb = d.rubric || {};
  if (!tlGoc(ca)) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  const ss = kho(); let sh = ss.getSheetByName(TAB_RB);
  if (!sh) { sh = ss.insertSheet(TAB_RB); sh.getRange(1, 1, 1, HEAD_RB.length).setValues([HEAD_RB]).setFontWeight('bold'); sh.setFrozenRows(1); }
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { rbGhi(sh, ca, rb, d.cho ? 'CHO' : 'DUYET', String(d.nguon || 'GV')); } finally { lock.releaseLock(); }
  return gvRubric({ca: ca});
}
// Ghi rubric 1 ca (thay cac cau co trong rb); goi trong lock
function rbGhi(sh, ca, rb, tt, nguon) {
  const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_RB.length).getValues() : [];
  const giu = v.filter(function (r) { return !(String(r[0]).trim() === ca && (String(r[1]).trim() in rb)); });
  const ngay = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  Object.keys(rb).forEach(function (c) { (rb[c] || []).forEach(function (b, i) { if (String(b.nd || '').trim()) giu.push([ca, c, i + 1, String(b.nd).trim(), Number(String(b.diem).replace(',', '.')) || 0, tt, nguon, ngay]); }); });
  if (v.length) sh.getRange(2, 1, v.length, HEAD_RB.length).clearContent();
  if (giu.length) sh.getRange(2, 1, giu.length, HEAD_RB.length).setValues(giu.map(function (r) { return r.map(function (x, j) { return j === 4 ? x : String(x); }); }));
}
// AI soan rubric tu loi giai + diem cau (chua luu; GV xem, sua roi bam Luu)
function gvRubricAI(d) {
  const r = gvRubric(d); if (!r.ok) return r;
  const cau = r.cau.filter(function (t) { return !d.cau || String(d.cau) === t.cau; });
  if (!cau.length) return {ok: false, msg: 'De nay khong co cau tu luan'};
  const yc = 'Bạn là giáo viên Hóa học. Từ đề và lời giải chi tiết các câu tự luận dưới đây, soạn HƯỚNG DẪN CHẤM theo bước (rubric) cho từng câu: ' +
    'mỗi bước là một ý chấm cụ thể, quan sát được trên bài làm (vd "Viết đúng PTHH ... (cân bằng)", "Tính đúng số mol CO2 = 0.15 mol", "Kết luận đúng % khối lượng"), điểm mỗi bước là bội số của 0.25, TỔNG điểm các bước đúng bằng điểm của câu. ' +
    'Có thể ghi "(sai đơn vị/thiếu cân bằng trừ 0.25)" trong nội dung bước. 2–6 bước mỗi câu.\n' +
    'Dữ liệu: ' + JSON.stringify(cau.map(function (t) { return {cau: t.cau, diem: t.diem, de: String(t.hoi).replace(/<[^>]*>/g, ' ').slice(0, 1500), loi_giai: String(t.gt || '').replace(/<[^>]*>/g, ' ').slice(0, 2500)}; })) +
    '\nTrả về JSON: {"rubric":[{"cau":"1","buoc":[{"nd":"...","diem":0.25}]}]}';
  const kq = goiAI(yc, null, 0.2, {thuLai: true});
  const ra = {};
  (kq && Array.isArray(kq.rubric) ? kq.rubric : []).forEach(function (x) { if (x && x.cau !== undefined && Array.isArray(x.buoc)) ra[String(x.cau)] = x.buoc.map(function (b) { return {nd: String(b.nd || ''), diem: Math.round((Number(b.diem) || 0) * 4) / 4}; }); });
  return {ok: true, de: ra};
}
// Diem tu luan theo em: chi bai GV da duyet (cau, tong); coNhap: kem ban AI cham nhap (o.nhap = {cau, tong}) va em chi moi co anh
function docTLDiem(ca, coNhap) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_TLD), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_TLD.length).getValues().forEach(function (r) {
    if (String(r[0]).trim() !== ca) return;
    const ma = String(r[1]).trim(), c = String(r[2]).trim(), tt = String(r[7] || '').trim() || 'DUYET';
    if (String(r[5] || '').trim()) (m[ma] = m[ma] || {cau: {}, anh: '', tong: 0, duyet: false}).anh = String(r[5]).trim();
    if (c === '_ANH' || (tt === 'NHAP' && !coNhap)) return;
    const o = m[ma] = m[ma] || {cau: {}, anh: '', tong: 0, duyet: false};
    let dat = [], ly = {}; try { dat = JSON.parse(r[3] || '[]'); } catch (e) {} try { ly = JSON.parse(r[8] || '{}'); } catch (e) {}
    const x = {dat: dat, diem: Number(r[4]) || 0, lydo: Array.isArray(ly.b) ? ly.b : [], nx: String(ly.nx || '')};
    if (tt === 'NHAP') { const n = o.nhap = o.nhap || {cau: {}, tong: 0}; n.cau[c] = x; n.tong = Math.round((n.tong + x.diem) * 100) / 100; }
    else { o.cau[c] = x; o.tong = Math.round((o.tong + x.diem) * 100) / 100; o.duyet = true; }
  });
  Object.keys(m).forEach(function (k) { if (!m[k].duyet && !m[k].nhap && !coNhap) delete m[k]; });
  return m;
}
function tongTL(ca, ma) { const x = docTLDiem(ca)[ma]; return x ? x.tong : 0; }
// So lop: danh sach em + diem trac nghiem + diem tu luan da cham
function gvTLDs(d) {
  const ca = String(d.ca || '').trim(), l = gvGiayLop({ca: ca}); if (!l.ok) return l;
  return {ok: true, lop: l.lop, hs: l.hs, da: l.da, tl: docTLDiem(ca, true)};
}
// Luu diem tu luan 1 em: d.cham {cau: [chi so buoc dat]}, d.anh (data:image/jpeg) tuy chon
function gvTLLuu(d) {
  const ca = String(d.ca || '').trim(), ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Khong co SBD ' + ma};
  const rb = docRubric(ca), cham = d.cham || {};
  const dong = [], cu = docTLDiem(ca)[ma] || {cau: {}, anh: '', tong: 0}, tat = docTLDiem(ca, true)[ma] || {}, lydo = d.lydo || {}, nxs = d.nx || {};
  let anhId = tat.anh || cu.anh;
  if (d.anh && /^data:image\/jpeg;base64,/.test(String(d.anh))) {
    try {
      const tm = layThuMuc(layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), ca), 'TU LUAN');
      anhId = tm.createFile(Utilities.newBlob(Utilities.base64Decode(String(d.anh).split(',')[1]), 'image/jpeg', 'TU LUAN - ' + ma + ' - ' + hs.ten + '.jpg')).getId();
    } catch (e) {}
  }
  let tong = 0;
  Object.keys(rb).forEach(function (c) {
    const dat = (Array.isArray(cham[c]) ? cham[c] : (cu.cau[c] || {}).dat || []).map(Number).filter(function (i) { return i >= 0 && i < rb[c].buoc.length; });
    const dm = Math.round(dat.reduce(function (s, i) { return s + rb[c].buoc[i].diem; }, 0) * 100) / 100;
    const ly = Array.isArray(lydo[c]) ? lydo[c].slice(0, rb[c].buoc.length).map(function (x) { return String(x || '').slice(0, 200); }) : ((cu.cau[c] || {}).lydo || []);
    tong += dm; dong.push([ca, ma, c, JSON.stringify(dat), dm, anhId || '', new Date(), 'DUYET', JSON.stringify({b: ly, nx: String(nxs[c] !== undefined ? nxs[c] : (cu.cau[c] || {}).nx || '').slice(0, 300)})]);
  });
  tong = Math.round(tong * 100) / 100;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_TLD, HEAD_TLD);
    const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues() : [];
    for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() === ca && String(v[i][1]).trim() === ma) sh.deleteRow(i + 2);
    if (dong.length) { const r0 = sh.getLastRow() + 1; sh.getRange(r0, 1, dong.length, 4).setNumberFormat('@'); sh.getRange(r0, 1, dong.length, HEAD_TLD.length).setValues(dong); }
    // Cong vao diem de giay: diem = diem cu - TL cu + TL moi
    const mas = maCa(ca), bl = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
    if (bl && bl.getLastRow() > 1) {
      const w = bl.getRange(2, 1, bl.getLastRow() - 1, 12).getValues();
      for (let i = w.length - 1; i >= 0; i--) if (String(w[i][2]).trim() === ma && mas.indexOf(String(w[i][1]).trim()) >= 0) {
        const mo = Math.round(((Number(w[i][5]) || 0) - cu.tong + tong) * 100) / 100;
        bl.getRange(i + 2, 6).setValue(mo);
        if (String(mo) !== String(w[i][5])) nkGhi([['TU_LUAN', ma, String(w[i][3]), String(w[i][1]).trim(), String(w[i][5]), String(mo), 'BL|' + String(w[i][1]).trim() + '|' + ma + '|' + (Number(w[i][11]) || 1)]]);
        break;
      }
    }
  } finally { lock.releaseLock(); }
  return {ok: true, mahs: ma, tong: tong, tl: docTLDiem(ca, true)[ma] || null};
}
function tlThuMuc(ca) { return layThuMuc(layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), ca), 'TU LUAN'); }
function tlXoaDong(ca, ma, loc) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_TLD); if (!sh || sh.getLastRow() < 2) return;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_TLD.length).getValues();
  for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() === ca && String(v[i][1]).trim() === ma && loc(v[i])) sh.deleteRow(i + 2);
}
// Quet phieu xong chup mat sau (tu luan): luu anh, gan vao bai em (chua cham)
function gvTLAnh(d) {
  const ca = String(d.ca || '').trim(), ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Khong co SBD ' + ma};
  if (!maCa(ca).length) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  if (!/^data:image\/jpeg;base64,/.test(String(d.anh || ''))) return {ok: false, msg: 'Thieu anh'};
  const id = tlThuMuc(ca).createFile(Utilities.newBlob(Utilities.base64Decode(String(d.anh).split(',')[1]), 'image/jpeg', 'TU LUAN - ' + ma + ' - ' + hs.ten + '.jpg')).getId();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_TLD, HEAD_TLD);
    if (sh.getLastColumn() < HEAD_TLD.length) sh.getRange(1, 1, 1, HEAD_TLD.length).setValues([HEAD_TLD]);
    tlXoaDong(ca, ma, function (r) { return String(r[2]).trim() === '_ANH'; });
    const r0 = sh.getLastRow() + 1; sh.getRange(r0, 1, 1, 4).setNumberFormat('@');
    sh.getRange(r0, 1, 1, HEAD_TLD.length).setValues([[ca, ma, '_ANH', '[]', 0, id, new Date(), 'ANH', '']]);
    // bai da cham (nhap/duyet) cung tro sang anh moi
    const n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 2).getValues() : [];
    v.forEach(function (r, i) { if (String(r[0]).trim() === ca && String(r[1]).trim() === ma) sh.getRange(i + 2, 6).setValue(id); });
  } finally { lock.releaseLock(); }
  return {ok: true, mahs: ma, hoten: hs.ten, anh: id};
}
function gvTLLayAnh(d) {
  const x = docTLDiem(String(d.ca || '').trim(), true)[String(d.mahs || '').trim()];
  if (!x || !x.anh) return {ok: false, msg: 'Chua co anh'};
  return {ok: true, anh: 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(x.anh).getBlob().getBytes())};
}
// AI cham nhap tu luan 1 em theo rubric (doc anh bai viet tay) -> dong NHAP; GV duyet moi cong diem
function gvTLAI(d) {
  const ca = String(d.ca || '').trim(), ma = String(d.mahs || '').trim();
  const r = gvRubric({ca: ca}); if (!r.ok) return r;
  const rb = r.rubric, cau = r.cau.filter(function (q) { return rb[q.cau] && rb[q.cau].buoc.length; });
  if (!cau.length || cau.length < r.cau.length) return {ok: false, msg: 'Chua du huong dan cham (rubric) cho cac cau'};
  const x = docTLDiem(ca, true)[ma];
  if (!x || !x.anh) return {ok: false, msg: 'Chua co anh bai tu luan'};
  if (x.duyet && !d.lai) return {ok: false, msg: 'Bai da duyet'};
  const b64 = Utilities.base64Encode(DriveApp.getFileById(x.anh).getBlob().getBytes());
  const yc = 'Ảnh là bài làm TỰ LUẬN viết tay môn Hóa học của một học sinh (mặt sau phiếu trả lời). Hãy đọc kỹ bài làm và chấm theo HƯỚNG DẪN CHẤM từng bước dưới đây.\n' +
    'Quy tắc: một bước chỉ ĐẠT khi trên bài có nội dung đúng tương ứng (chấp nhận cách làm khác nếu đúng bản chất, kết quả đúng). Không đọc được, bỏ trống hoặc sai → KHÔNG đạt. Không đoán thay học sinh.\n' +
    'Với mỗi bước ghi lý do rất ngắn (≤ 15 từ, tiếng Việt, nói học sinh đã viết gì / thiếu gì). Mỗi câu thêm 1 nhận xét ngắn giúp học sinh sửa (≤ 30 từ). Số thập phân dùng dấu chấm.\n' +
    'Đề và hướng dẫn chấm: ' + JSON.stringify(cau.map(function (q) { return {cau: q.cau, diem: q.diem, de: String(q.hoi).replace(/<[^>]*>/g, ' ').slice(0, 1200), buoc: rb[q.cau].buoc.map(function (b, i) { return {so: i, nd: b.nd, diem: b.diem}; })}; })) +
    '\nTrả về JSON: {"doc_duoc":true,"cau":[{"cau":"1","dat":[0,2],"lydo":["lý do bước 0","lý do bước 1",...],"nhanxet":"..."}]}';
  const kq = goiAI(yc, {b64: b64, mime: 'image/jpeg'}, 0.1, {thuLai: true, he: 'Bạn là giáo viên Hóa học chấm bài cẩn thận, công bằng. Chỉ trả về JSON hợp lệ.'});
  if (!kq || !Array.isArray(kq.cau)) return {ok: false, msg: 'AI chua cham duoc, thu lai'};
  const dong = [];
  cau.forEach(function (q) {
    const a = kq.cau.filter(function (z) { return String(z.cau).replace(/^IV\./, '') === String(q.cau).replace(/^IV\./, ''); })[0] || {};
    const n = rb[q.cau].buoc.length, dat = (Array.isArray(a.dat) ? a.dat : []).map(Number).filter(function (i, k, s) { return i >= 0 && i < n && s.indexOf(i) === k; });
    const dm = Math.round(dat.reduce(function (t, i) { return t + rb[q.cau].buoc[i].diem; }, 0) * 100) / 100;
    dong.push([ca, ma, q.cau, JSON.stringify(dat), dm, x.anh, new Date(), 'NHAP', JSON.stringify({b: (Array.isArray(a.lydo) ? a.lydo : []).slice(0, n).map(function (t) { return String(t || '').slice(0, 200); }), nx: String(a.nhanxet || '').slice(0, 300)})]);
  });
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_TLD, HEAD_TLD);
    if (sh.getLastColumn() < HEAD_TLD.length) sh.getRange(1, 1, 1, HEAD_TLD.length).setValues([HEAD_TLD]);
    tlXoaDong(ca, ma, function (r) { return String(r[7]).trim() === 'NHAP'; });
    const r0 = sh.getLastRow() + 1; sh.getRange(r0, 1, dong.length, 4).setNumberFormat('@'); sh.getRange(r0, 1, dong.length, HEAD_TLD.length).setValues(dong);
  } finally { lock.releaseLock(); }
  return {ok: true, mahs: ma, docDuoc: kq.doc_duoc !== false, tl: docTLDiem(ca, true)[ma] || null};
}
// HS xem anh bai tu luan cua minh (khi de da cho xem lai)
function hsAnhTL(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma), c = timDot(String(d.madot || '').trim());
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  if (!c || !c.giay || !c.xemlai) return {ok: false, msg: 'Bai nay chua mo xem lai'};
  const x = docTLDiem(c.ca || c.madot)[ma]; if (!x || !x.anh) return {ok: false, msg: 'Khong co anh'};
  return {ok: true, anh: 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(x.anh).getBlob().getBytes())};
}
// Luu 1 phieu: d.madot (ma de doc duoc), d.mahs, d.chon {cau: lua chon}, d.anh (data:image/jpeg;base64,... – tuy chon), d.ghichu, d.ghide
function gvGiayNop(d) {
  const ma = String(d.mahs || '').trim(), madot = String(d.madot || '').trim(), hs = timHS(ma);
  if (!hs) return {ok: false, loi: 'sbd', msg: 'SBD ' + ma + ' khong co trong danh sach lop ' + lopNay()};
  const c = timDot(madot);
  if (!c || !c.giay) return {ok: false, loi: 'made', msg: 'Khong co ma de giay ' + madot};
  const mas = maCa(c.ca || c.madot), de = docDe(madot), chon = d.chon || {};
  const kq = chamBai(de, function (q) { return chon[q.cau]; });
  const sh = layTab(TAB_BL, HEAD_BL);
  // Em da co bai cua dot nay (bat ky ma de nao): chi ghi khi GV chon ghi de
  const cu = [];
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 12).getValues().forEach(function (r, i) {
    if (String(r[2]).trim() === ma && mas.indexOf(String(r[1]).trim()) >= 0) cu.push({dong: i + 2, madot: String(r[1]).trim(), diem: r[5], lan: Number(r[11]) || 1});
  });
  if (cu.length && !d.ghide) return {ok: false, loi: 'trung', msg: 'Da cham ' + hs.ten, hoten: hs.ten, cu: cu[cu.length - 1]};
  let url = '';
  if (d.anhId) { try { url = DriveApp.getFileById(String(d.anhId)).setName('PHIEU - ' + ma + ' - ' + hs.ten + ' - ' + madot + '.jpg').getUrl(); } catch (e) {} }
  else if (d.anh && /^data:image\/jpeg;base64,/.test(String(d.anh))) {
    try {
      const tm = layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), c.ca || c.madot);
      const f = tm.createFile(Utilities.newBlob(Utilities.base64Decode(String(d.anh).split(',')[1]), 'image/jpeg', 'PHIEU - ' + ma + ' - ' + hs.ten + ' - ' + madot + '.jpg'));
      url = f.getUrl();
    } catch (e) {}
  }
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const lan = cu.length ? cu[cu.length - 1].lan + 1 : 1;
    cu.slice().reverse().forEach(function (x) { sh.deleteRow(x.dong); });
    if (cu.length) nkGhi(cu.map(function (x) { return ['QUET_LAI', ma, hs.ten, x.madot, String(x.diem), String(Math.round((kq.diem + tongTL(c.ca || c.madot, ma)) * 100) / 100) + ' (lần ' + lan + ')', 'BL|' + x.madot + '|' + ma + '|' + x.lan]; }));
    sh.appendRow([new Date(), madot, ma, hs.ten, 'GIAY', Math.round((kq.diem + tongTL(c.ca || c.madot, ma)) * 100) / 100, kq.dung, de.length, '',
      kq.ct.map(function (x) { return String(x.chon || '-').replace(/\|/g, '/'); }).join('|'), url, lan, String(d.ghichu || '').slice(0, 200)]);
  } finally { lock.releaseLock(); }
  if (d.anhId) datAnh(String(d.anhId), 'DA', ma);
  if (d.ms) ghiNhatKyCham('GIAY', madot, ma, d.ms, /GV sửa tay/.test(String(d.ghichu || '')));
  return {ok: true, hoten: hs.ten, diem: kq.diem, tongW: kq.tongW, dung: kq.dung, tong: de.length, madot: madot, url: url,
    ct: kq.ct.map(function (x) { return String(x.chon || '-').replace(/\|/g, '/'); }).join('|')};
}
// ---- Chup truoc – cham sau ----
function thuMucAnhGiay(ca) { return layThuMuc(layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), ca), 'ANH CHUP'); }
function gvGiayAnh(d) {
  const ca = String(d.ca || '').trim();
  if (!maCa(ca).length) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  if (!/^data:image\/jpeg;base64,/.test(String(d.anh || ''))) return {ok: false, msg: 'Thieu anh'};
  const sbd = String(d.sbd || '').replace(/[^0-9_*]/g, '').slice(0, 8), made = String(d.made || '').replace(/[^0-9_*]/g, '').slice(0, 4);
  const f = thuMucAnhGiay(ca).createFile(Utilities.newBlob(Utilities.base64Decode(String(d.anh).split(',')[1]), 'image/jpeg',
    'CHUP - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + ' - ' + (sbd || 'khong-ro') + '.jpg'));
  const sh = layTab(TAB_AG, HEAD_AG);
  sh.appendRow([new Date(), ca, f.getId(), f.getUrl(), "'" + sbd, "'" + made, 'CHO', '', '']);
  return {ok: true, id: f.getId(), cho: demAnhCho(ca)};
}
function docAnhGiay(ca) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_AG), ra = [];
  if (!sh || sh.getLastRow() < 2) return ra;
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_AG.length).getValues().forEach(function (r, i) {
    if (String(r[1]).trim() === ca) ra.push({dong: i + 2, t: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), id: String(r[2]), url: String(r[3]), sbd: String(r[4]).replace(/^'/, ''), made: String(r[5]).replace(/^'/, ''), tt: String(r[6]), mahs: String(r[7])});
  });
  return ra;
}
function demAnhCho(ca) { return docAnhGiay(ca).filter(function (x) { return x.tt === 'CHO'; }).length; }
function gvGiayDsAnh(d) {
  const ca = String(d.ca || '').trim();
  return {ok: true, ca: ca, anh: docAnhGiay(ca).map(function (x) { delete x.dong; return x; })};
}
function idTuUrl(u) { const m = String(u || '').match(/\/d\/([\w-]{10,})|[?&]id=([\w-]{10,})/); return m ? (m[1] || m[2]) : ''; }
function gvGiayLayAnh(d) {
  const ca = String(d.ca || '').trim();
  let id = String(d.id || '');
  if (!id && d.url) {   // anh phieu da luu cung bai lam (cot Anh cua BAI LAM)
    const u = String(d.url), sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL), mas = maCa(ca);
    const co = sh && sh.getLastRow() > 1 && sh.getRange(2, 1, sh.getLastRow() - 1, 11).getValues().some(function (r) { return String(r[10]) === u && mas.indexOf(String(r[1]).trim()) >= 0; });
    if (!co) return {ok: false, msg: 'Khong co anh nay'};
    id = idTuUrl(u); if (!id) return {ok: false, msg: 'Khong doc duoc dia chi anh'};
  } else if (!docAnhGiay(ca).some(function (x) { return x.id === id; })) return {ok: false, msg: 'Khong co anh nay'};
  const b = DriveApp.getFileById(id).getBlob();
  return {ok: true, id: id, anh: 'data:image/jpeg;base64,' + Utilities.base64Encode(b.getBytes())};
}
function datAnh(id, tt, mahs) {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_AG);
  if (!sh || sh.getLastRow() < 2) return;
  const v = sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]) === id) { sh.getRange(i + 2, 7, 1, 2).setValues([[tt, mahs || '']]); return; }
}
function gvGiayBoAnh(d) { datAnh(String(d.id || ''), d.lai ? 'CHO' : 'BO', ''); return {ok: true}; }
// De giay: tra noi dung cac ma de cung ca (de in PDF tren trinh duyet + bang dap an)
function gvDeGiay(d) {
  const ca = String(d.ca || '').trim();
  const ds = docCauHinh().filter(function (c) { return c.giay && (c.ca || c.madot) === ca; })
    .sort(function (a, b) { return a.madot < b.madot ? -1 : 1; });
  if (!ds.length) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
  const kt = docKienThuc();
  return {ok: true, ca: ca, ma: ds.map(function (c) {
    return {madot: c.madot, ten: c.ten, phut: c.phut, thang: c.thang || 'K12', lop: c.lop,
      cau: docDe(c.madot).map(function (q) {
        const k = kt[c.madot + '|' + q.cau] || {};
        return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, da: q.da, w: q.w, hinh: q.hinh, goc: q.goc, kt: k.kt || '', md: k.md || ''};
      })};
  })};
}
// GV dat diem tung phan cho ca 1 dot de giay: tn = diem/cau Phan I; ds = [dung 1 y, 2 y, 3 y, 4 y]; tln = diem/cau Phan III
// Ghi cot Diem cua moi ma de (DS: diem 4 y) va cot ThangDS cua CAU HINH (ti le = diem k y / diem 4 y)
function gvGiayDiem(d) {
  const ca = String(d.ca || '').trim(), so = function (x) { return Math.round(Number(String(x).replace(',', '.')) * 1000) / 1000; };
  const tn = so(d.tn), tln = so(d.tln), ds = (Array.isArray(d.ds) ? d.ds : []).map(so);
  if (!(tn > 0 && tn <= 10) || !(tln > 0 && tln <= 10)) return {ok: false, msg: 'Diem moi cau Phan I, Phan III phai lon hon 0'};
  if (ds.length !== 4 || !(ds[3] > 0 && ds[3] <= 10) || ds.some(function (x, i) { return !(x >= 0) || (i && x < ds[i - 1]); }))
    return {ok: false, msg: 'Diem Phan II phai tang dan: dung 1 y <= 2 y <= 3 y <= 4 y'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ch = kho().getSheetByName('CAU HINH'), v = ch.getDataRange().getValues(), thang = ds.map(function (x) { return Math.round(x / ds[3] * 10000) / 10000; }).join(';');
    let n = 0;
    for (let i = 1; i < v.length; i++) {
      const m = String(v[i][0]).trim();
      if (khongDau(v[i][8]) !== 'GIAY' || (String(v[i][7] || '').trim() || m) !== ca) continue;
      const sh = kho().getSheetByName(m); if (!sh || sh.getLastRow() < 2) continue;
      const loai = sh.getRange(2, 9, sh.getLastRow() - 1, 1).getValues();
      sh.getRange(2, 10, loai.length, 1).setNumberFormat('@').setValues(loai.map(function (r) { const l = khongDau(r[0]); return [String(l === 'DS' ? ds[3] : l === 'TLN' ? tln : tn)]; }));
      ch.getRange(i + 1, 10).setValue(thang); n++;
    }
    if (!n) return {ok: false, msg: 'Khong tim thay de giay ' + ca};
    SpreadsheetApp.flush();
    const r = gvDot(); r.so = n; return r;
  } finally { lock.releaseLock(); }
}
// Cau hoi nhac toi hinh (Hinh 2, so do, do thi, hinh ben...) nhung khong co hinh nao gan vao
function nhacHinh(q) {
  if (q.hinh || q.khongHinh || /<img|<svg/i.test([q.hoi, q.pa.A, q.pa.B, q.pa.C, q.pa.D].join(' '))) return false;
  return /(hình|sơ đồ|đồ thị|biểu đồ)\s*(\d|bên|dưới|sau|vẽ|minh họa|minh hoạ|trên)/i.test(String(q.hoi).replace(/<[^>]*>/g, ' ').replace(/(cấu|định|điển|ngoại|vô|hữu|tạo|lập|hiện|trình|đồng)\s+hình/gi, ' '));
}
// Duong dan web cua hinh de: https://<chu repo>.github.io/<ten repo>/hinh/<ma dot>/<ten file>
function urlHinhDe(gh, madot, ten) {
  const p = gh.repo.split('/');
  return 'https://' + p[0].toLowerCase() + '.github.io/' + p[1] + '/hinh/' + madot + '/' + ten;
}
// GV mo bang "Hinh cua de": danh sach cau (dang gan hinh nao) + cac file hinh dang co trong hinh/<ma dot>/
function dsHinhGH(gh, madot) {
  try {
    const url = 'https://api.github.com/repos/' + gh.repo + '/contents/hinh/' + encodeURIComponent(madot) + '?ref=' + encodeURIComponent(gh.nhanh);
    const o = {muteHttpExceptions: true, headers: {Accept: 'application/vnd.github+json'}};
    if (gh.token) o.headers.Authorization = 'Bearer ' + gh.token;
    const r = UrlFetchApp.fetch(url, o);
    if (r.getResponseCode() === 200) return JSON.parse(r.getContentText()).filter(function (f) { return f.type === 'file' && /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name); }).map(function (f) { return f.name; });
  } catch (e) {}
  return [];
}
function gvHinhDe(d) {
  const madot = String(d.madot || '').trim(), gh = ghCauHinh();
  // Luc nap de (de chua co trong kho): chi can danh sach file hinh dang co tren GitHub
  if (d.chiDs) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(madot)) return {ok: false, msg: 'Ma dot khong hop le'};
    return {ok: true, madot: madot, goc: urlHinhDe(gh, madot, ''), co: dsHinhGH(gh, madot), coToken: !!gh.token};
  }
  const c = timDot(madot);
  if (!c) return {ok: false, msg: 'Khong tim thay de ' + madot};
  const de = docDe(c.madot), co = dsHinhGH(gh, c.madot);
  return {ok: true, madot: c.madot, goc: urlHinhDe(gh, c.madot, ''), co: co, coToken: !!gh.token,
    cau: de.map(function (q) { return {cau: q.cau, hoi: String(q.hoi).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140), hinh: q.khongHinh ? '-' : q.hinh, nhac: nhacHinh(q)}; })};
}
// Ra hinh nhieu de 1 lan (cac de chua thi): cau nhac hinh ma chua gan + hinh khong mo duoc
function gvRaHinh(d) {
  const ds = (Array.isArray(d.ds) ? d.ds : []).slice(0, 80), kq = [], url = {};
  ds.forEach(function (m) {
    const c = timDot(m); if (!c) return;
    let de; try { de = docDe(c.madot); } catch (e) { kq.push({madot: c.madot, ten: c.ten, loi: [{cau: '', msg: 'Kho chua co tab de'}]}); return; }
    const x = {madot: c.madot, ten: c.ten, socau: de.length, loi: []};
    de.forEach(function (q) {
      if (nhacHinh(q)) x.loi.push({cau: q.cau, nhac: true});
      urlAnhCua(q).forEach(function (u) { (url[u] = url[u] || []).push([x, q.cau]); });
    });
    kq.push(x);
  });
  const us = Object.keys(url);
  for (let i = 0; i < us.length; i += 40) {
    const lo = us.slice(i, i + 40);
    let rs = [];
    try { rs = UrlFetchApp.fetchAll(lo.map(function (u) { return {url: u, muteHttpExceptions: true, followRedirects: true}; })); } catch (e) {}
    lo.forEach(function (u, k) {
      if (rs[k] && rs[k].getResponseCode() === 200) return;
      url[u].forEach(function (p) { p[0].loi.push({cau: p[1], url: u.replace(/^.*\/hinh\//, 'hinh/')}); });
    });
  }
  return {ok: true, ds: kq};
}
// Gan hinh vao cau: d.gan = [{cau, ten}] -> ghi cot H (Hinh) tab de; ten '' = bo hinh
function gvGanHinh(d) {
  const c = timDot(d.madot);
  if (!c) return {ok: false, msg: 'Khong tim thay de ' + d.madot};
  const gan = Array.isArray(d.gan) ? d.gan : [];
  if (!gan.length) return {ok: false, msg: 'Chua chon hinh cho cau nao'};
  const gh = ghCauHinh(), sh = kho().getSheetByName(c.madot);
  if (!sh) return {ok: false, msg: 'Kho de chua co tab ' + c.madot};
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const v = sh.getDataRange().getValues(), hang = {};
    let k = 0;
    for (let i = 1; i < v.length; i++) { if (String(v[i][1]).trim() === '') continue; k++; hang[String(v[i][0]).trim() || String(k)] = i + 1; }
    if (!String(sh.getRange(1, 8).getValue()).trim()) sh.getRange(1, 8).setValue('Hinh');
    const xong = [];
    gan.forEach(function (g) {
      const cau = String(g.cau || '').trim(), ten = String(g.ten || '').trim();
      if (!hang[cau]) throw new Error('De ' + c.madot + ' khong co cau ' + cau);
      if (ten && ten !== '__khong' && !/^[A-Za-z0-9_.\-]{1,60}\.(png|jpe?g|gif|webp|svg)$/i.test(ten)) throw new Error('Ten hinh khong hop le: ' + ten);
      sh.getRange(hang[cau], 8).setValue(ten === '__khong' ? '-' : ten ? urlHinhDe(gh, c.madot, ten) : '');
      xong.push(cau);
    });
    SpreadsheetApp.flush();
    return {ok: true, madot: c.madot, xong: xong};
  } finally { lock.releaseLock(); }
}
// GV tai hinh cua de len GitHub: hinh/<ma dot>/<ten file> (dung dong GithubToken trong tab MA)
function gvHinh(d) {
  const gh = ghCauHinh();
  if (!gh.token) return {ok: false, loi: 'token', msg: 'Chua co ma GitHub: them dong GithubToken vao tab MA cua kho de'};
  const madot = String(d.madot || '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(madot)) return {ok: false, msg: 'Ma dot khong hop le'};
  const ds = Array.isArray(d.hinh) ? d.hinh : [];
  if (!ds.length || ds.length > 40) return {ok: false, msg: 'Chon 1 den 40 hinh'};
  const xong = [];
  ds.forEach(function (h) {
    const ten = String(h.ten || '').trim();
    const m = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,(.+)$/.exec(String(h.data || ''));
    if (!/^[A-Za-z0-9_.\-]{1,60}\.(png|jpe?g|gif|webp|svg)$/i.test(ten) || !m) throw new Error('Hinh khong hop le: ' + ten);
    const path = 'hinh/' + madot + '/' + ten, cu = ghLay(gh, path);
    ghGhi(gh, path, Utilities.base64Decode(m[2]), 'Hinh de ' + madot + ': ' + ten, cu ? cu.sha : '');
    xong.push(ten);
  });
  return {ok: true, madot: madot, xong: xong};
}
// ---------------------------------------------------------------------
// Nap de tu trang giao vien (file KHO-DE-<ma dot>.xlsx doc tren trinh duyet)
// d.de = [{madot, ten, phut, lop, thay, cau: [[Cau, NoiDung, A, B, C, D, DapAn, Hinh, Loai, Diem]], kt: [[Cau, KienThuc, MucDo]]}]
// Tao tab de (thay = true: ghi de tab cu), them/sua dong CAU HINH (de moi luon DONG, KHONG cho xem lai), thay dong KIEN THUC cua dot.
// ---------------------------------------------------------------------
const HEAD_DE = ['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'Loai', 'Diem'];
const TAB_CAM = ['CAU HINH', 'MA', 'KIEN THUC', 'TRO CHOI', 'BO CAU', 'GIAI THICH', 'CAU HINH THEM', 'KIEN THUC THEM', 'GIAI THICH THEM', 'TU LUAN', 'TU LUAN THEM', 'DOI MA', 'LUYEN THEM', 'SUA DAP AN', 'RUBRIC'];
// ---- DOI MA DE luc nap (trung kho): nho "ma trong file -> ma moi" o tab DOI MA (kho), chep hinh hinh/<goc>/ -> hinh/<moi>/ ----
const TAB_DOIMA = 'DOI MA';
function docDoiMa() {
  try {
    const sh = kho().getSheetByName(TAB_DOIMA); if (!sh || sh.getLastRow() < 2) return {};
    const m = {};
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { const a = String(r[0]).trim(), b = String(r[1]).trim(); if (a && b) m[a] = b; });
    return m;
  } catch (e) { return {}; }
}
function ghiDoiMa(goc, moi) {
  const ss = kho();
  let sh = ss.getSheetByName(TAB_DOIMA);
  if (!sh) { sh = ss.insertSheet(TAB_DOIMA); sh.getRange(1, 1, 1, 3).setValues([['MaTrongFile', 'MaMoi', 'Ngay']]).setFontWeight('bold'); sh.setFrozenRows(1); }
  const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
  for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === goc) { sh.getRange(i + 2, 2, 1, 2).setNumberFormat('@').setValues([[moi, new Date().toISOString().slice(0, 10)]]); return; }
  sh.appendRow([goc, moi, new Date().toISOString().slice(0, 10)]);
}
function ghLayB64(gh, path) {
  const r = ghGoi(gh, 'get', path);
  if (r.ma !== 200 || !r.j) return null;
  if (r.j.content) return {sha: r.j.sha, b64: String(r.j.content).replace(/\s/g, '')};
  if (r.j.download_url) { const f = UrlFetchApp.fetch(r.j.download_url, {muteHttpExceptions: true}); if (f.getResponseCode() === 200) return {sha: r.j.sha, b64: Utilities.base64Encode(f.getBlob().getBytes())}; }
  return null;
}
// Chep cac hinh de dung (hinh/<goc>/f) sang hinh/<moi>/f roi doi duong dan trong de; loi thi giu duong dan cu (van xem duoc)
function chuyenHinhDoiMa(x, goc, moi) {
  const re = new RegExp('hinh/' + goc.replace(/[.\-]/g, '\\$&') + '/([A-Za-z0-9_.\\-]+\\.(?:png|jpe?g|gif|webp|svg))', 'gi');
  const tep = {};
  const quet = function (t) { String(t || '').replace(re, function (_, f) { tep[f] = 1; return _; }); };
  (x.cau || []).forEach(function (r) { (r || []).slice(0, 8).forEach(quet); });
  (x.tl || []).forEach(function (r) { (r || []).forEach(quet); });
  (x.gt || []).forEach(function (r) { (r || []).forEach(quet); });
  const ds = Object.keys(tep);
  if (!ds.length) return {so: 0};
  const gh = ghCauHinh();
  if (!gh.token) return {so: 0, loi: 'chua co GithubToken nen hinh van lay o hinh/' + goc + '/'};
  const xong = {}, hong = [];
  ds.forEach(function (f) {
    try {
      const a = ghLayB64(gh, 'hinh/' + goc + '/' + f);
      if (!a) { hong.push(f); return; }
      const dich = ghLayB64(gh, 'hinh/' + moi + '/' + f);
      if (!(dich && dich.sha === a.sha)) {
        const body = {message: 'Doi ma de ' + goc + ' -> ' + moi + ': ' + f, content: a.b64, branch: gh.nhanh};
        if (dich) body.sha = dich.sha;
        const r = ghGoi(gh, 'put', 'hinh/' + moi + '/' + f, body);
        if (r.ma !== 200 && r.ma !== 201) { hong.push(f); return; }
      }
      xong[f] = 1;
    } catch (e) { hong.push(f); }
  });
  const doi = function (t) { return typeof t !== 'string' ? t : t.replace(re, function (m0, f) { return xong[f] ? 'hinh/' + moi + '/' + f : m0; }); };
  x.cau = (x.cau || []).map(function (r) { return Array.isArray(r) ? r.map(doi) : r; });
  x.tl = (x.tl || []).map(function (r) { return Array.isArray(r) ? r.map(doi) : r; });
  x.gt = (x.gt || []).map(function (r) { return Array.isArray(r) ? r.map(doi) : r; });
  return {so: Object.keys(xong).length, loi: hong.length ? hong.length + ' hinh chua chep duoc (' + hong.slice(0, 5).join(', ') + '), van lay o hinh/' + goc + '/' : ''};
}
function gvNapDe(d) {
  const ds = Array.isArray(d.de) ? d.de : [];
  if (!ds.length) return {ok: false, msg: 'Chua co de nao de nap'};
  if (ds.length > 20) return {ok: false, msg: 'Moi lan nap toi da 20 de'};
  // Doi ma (ngoai khoa vi goi GitHub lau): chep hinh sang thu muc ma moi
  const ketHinh = {};
  ds.forEach(function (x) {
    const goc = String((x && x.goc) || '').trim(), moi = String((x && x.madot) || '').trim();
    if (!goc || goc === moi || !/^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(goc) || !/^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(moi)) return;
    try { ketHinh[moi] = chuyenHinhDoiMa(x, goc, moi); } catch (e) { ketHinh[moi] = {so: 0, loi: String(e.message || e)}; }
  });
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
      const gt = (Array.isArray(x.gt) ? x.gt : []).filter(function (r) { return Array.isArray(r) && String(r[0] || '').trim() !== '' && String(r[1] || '').trim() !== ''; })
        .map(function (r) { return [madot, String(r[0]).trim(), String(r[1]).trim()]; });
      const tl = (Array.isArray(x.tl) ? x.tl : []).filter(function (r) { return Array.isArray(r) && String(r[0] || '').trim() !== ''; })
        .map(function (r) { return [madot].concat([0, 1, 2, 3, 4].map(function (j) { return String(r[j] == null ? '' : r[j]).trim(); })); });
      // RUBRIC (huong dan cham tu luan theo buoc): [Cau, Buoc, NoiDung, Diem]
      const rb = (Array.isArray(x.rb) ? x.rb : []).filter(function (r) { return Array.isArray(r) && String(r[0] || '').trim() !== '' && String(r[2] || '').trim() !== ''; })
        .map(function (r) { return {cau: String(r[0]).trim(), buoc: Number(r[1]) || 0, nd: String(r[2]).trim(), diem: Number(String(r[3] == null ? '' : r[3]).replace(',', '.')) || 0}; });
      if (x.chiGT) {
        // Chi them/thay loi giai cho de da co trong kho (ke ca de da thi)
        if (!ss.getSheetByName(madot)) return {ok: false, msg: 'Kho chua co de ' + madot + ' de them loi giai'};
        if (!gt.length && !tl.length && !rb.length) return {ok: false, msg: 'De ' + madot + ' khong co dong loi giai nao'};
        viec.push({madot: madot, chiGT: true, gt: gt, tl: tl, rb: rb, cau: [], kt: []});
        continue;
      }
      const cau = (Array.isArray(x.cau) ? x.cau : []).filter(function (r) { return Array.isArray(r) && String(r[1] || '').trim() !== ''; });
      if (!cau.length) return {ok: false, msg: 'De ' + madot + ' khong co cau hoi nao'};
      if (cau.length > 200) return {ok: false, msg: 'De ' + madot + ' qua 200 cau'};
      const tab = ss.getSheetByName(madot), dong = dongCH[madot];
      if ((tab || dong) && !x.thay) return {ok: false, loi: 'trung', madot: madot, msg: 'Kho da co de ' + madot};
      if (dong && (dong.tt === 'MO' || dong.tt === 'CHO')) return {ok: false, madot: madot, msg: 'De ' + madot + ' dang mo, hay dong de truoc khi thay'};
      const ph = Math.round(Number(x.phut));
      if (!(ph >= 1 && ph <= 180)) return {ok: false, msg: 'Thoi gian de ' + madot + ' phai tu 1 den 180 phut'};
      const khoi = (/^H(\d+)-/i.exec(madot) || [])[1];
      const giay = khongDau(x.kieu) === 'GIAY', thang = docThang(x.thang);
      if (giay && !/^[A-Za-z0-9_.\-]*-2\d\d$/.test(madot)) return {ok: false, msg: 'De giay ' + madot + ' phai co ma de dang 2xx (vd H10-B18-201)'};
      if (x.thang && !thang) return {ok: false, msg: 'ThangDS cua de ' + madot + ' khong hop le'};
      viec.push({madot: madot, ten: String(x.ten || '').trim() || madot, phut: ph, giay: giay, thang: thang, ca: giay ? String(x.ca || madot).trim() : '',
        coGoc: (Array.isArray(x.cau) ? x.cau : []).some(function (r) { return Array.isArray(r) && String(r[10] || '').trim(); }),
        lop: String(x.lop || '').trim() ? chuanDsLop(x.lop) : lopMacDinh(Number(khoi)),
        cau: cau.map(function (r) { const o = []; for (let j = 0; j < 11; j++) o.push(r[j] === undefined || r[j] === null ? '' : String(r[j])); return o; }),
        kt: (Array.isArray(x.kt) ? x.kt : []).filter(function (r) { return Array.isArray(r) && String(r[0] || '').trim() !== ''; })
          .map(function (r) { return [madot, String(r[0]).trim(), String(r[1] || '').trim(), String(r[2] || '').trim(), String(r[3] || '').trim(), String(r[4] || '').trim()]; }),
        gt: gt, tl: tl, rb: rb, tab: tab, dong: dong});
    }
    // 2) Ghi
    let kt = ss.getSheetByName('KIEN THUC');
    if (!kt) { kt = ss.insertSheet('KIEN THUC'); kt.getRange(1, 1, 1, 4).setValues([['MaDot', 'Cau', 'KienThuc', 'MucDo']]).setFontWeight('bold'); }
    if (!String(kt.getRange(1, 5).getValue()).trim()) kt.getRange(1, 5, 1, 2).setValues([['ChuDe', 'NoiDung']]).setFontWeight('bold');
    viec.forEach(function (v) {
      if (v.chiGT) return;
      const sh = v.tab || ss.insertSheet(v.madot);
      sh.clear();
      const nc = v.coGoc ? 11 : 10;
      const bang = [HEAD_DE.concat(['Goc']).slice(0, nc)].concat(v.cau.map(function (r) { return r.slice(0, nc); }));
      sh.getRange(1, 1, bang.length, nc).setNumberFormat('@').setValues(bang);
      sh.getRange(1, 1, 1, nc).setFontWeight('bold');
      sh.setFrozenRows(1);
      if (v.dong) {
        ch.getRange(v.dong.so, 2, 1, 2).setValues([[v.ten, v.phut]]);
        ch.getRange(v.dong.so, 6).setValue(v.lop);
        if (v.giay || v.thang) ch.getRange(v.dong.so, 8, 1, 3).setValues([[v.ca, v.giay ? 'GIAY' : '', v.thang]]);
      } else {
        ch.appendRow(v.giay || v.thang ? [v.madot, v.ten, v.phut, 'DONG', 'KHONG', v.lop, '', v.ca, v.giay ? 'GIAY' : '', v.thang] : [v.madot, v.ten, v.phut, 'DONG', 'KHONG', v.lop]);
        dongCH[v.madot] = {so: ch.getLastRow(), tt: 'DONG'};
      }
      if ((v.giay || v.thang) && !String(ch.getRange(1, 9).getValue()).trim()) {
        ch.getRange(1, 7, 1, 4).setValues([[String(ch.getRange(1, 7).getValue() || 'BatDauLuc'), String(ch.getRange(1, 8).getValue() || 'CaThi'), 'Kieu', 'ThangDS']]).setFontWeight('bold');
      }
    });
    // KIEN THUC: bo dong cu cua cac dot vua nap (tru dot chi them loi giai), them dong moi
    const cacMa = viec.filter(function (v) { return !v.chiGT; }).map(function (v) { return v.madot; });
    const ktV = kt.getLastRow() > 1 ? kt.getRange(2, 1, kt.getLastRow() - 1, 6).getValues() : [];
    const giu = ktV.filter(function (r) { return String(r[0]).trim() !== '' && cacMa.indexOf(String(r[0]).trim()) < 0; });
    const moi = giu.concat.apply(giu, viec.map(function (v) { return v.kt; }));
    if (ktV.length) kt.getRange(2, 1, ktV.length, 6).clearContent();
    if (moi.length) kt.getRange(2, 1, moi.length, 6).setNumberFormat('@').setValues(moi);
    // GIAI THICH: thay dong cua moi dot vua nap
    let gtSh = ss.getSheetByName('GIAI THICH');
    if (!gtSh) { gtSh = ss.insertSheet('GIAI THICH'); gtSh.getRange(1, 1, 1, 3).setValues([['MaDot', 'Cau', 'GiaiThich']]).setFontWeight('bold'); gtSh.setFrozenRows(1); }
    const maGT = viec.filter(function (v) { return !v.chiGT || v.gt.length; }).map(function (v) { return v.madot; });
    const gtV = gtSh.getLastRow() > 1 ? gtSh.getRange(2, 1, gtSh.getLastRow() - 1, 3).getValues() : [];
    const gtGiu = gtV.filter(function (r) { return String(r[0]).trim() !== '' && maGT.indexOf(String(r[0]).trim()) < 0; });
    const gtMoi = gtGiu.concat.apply(gtGiu, viec.map(function (v) { return v.gt; }));
    if (gtV.length) gtSh.getRange(2, 1, gtV.length, 3).clearContent();
    if (gtMoi.length) gtSh.getRange(2, 1, gtMoi.length, 3).setNumberFormat('@').setValues(gtMoi);
    // TU LUAN (Phan IV de giay): thay dong cua cac dot vua nap co tu luan (hoac nap lai de)
    const maTL = viec.filter(function (v) { return !v.chiGT || v.tl.length; }).map(function (v) { return v.madot; });
    if (viec.some(function (v) { return v.tl.length; }) || ss.getSheetByName('TU LUAN')) {
      let tlSh = ss.getSheetByName('TU LUAN');
      if (!tlSh) { tlSh = ss.insertSheet('TU LUAN'); tlSh.getRange(1, 1, 1, 6).setValues([['MaDot', 'Cau', 'NoiDung', 'Hinh', 'Diem', 'LoiGiai']]).setFontWeight('bold'); tlSh.setFrozenRows(1); }
      const tlV = tlSh.getLastRow() > 1 ? tlSh.getRange(2, 1, tlSh.getLastRow() - 1, 6).getValues() : [];
      const tlGiu = tlV.filter(function (r) { return String(r[0]).trim() !== '' && maTL.indexOf(String(r[0]).trim()) < 0; });
      const tlMoi = tlGiu.concat.apply(tlGiu, viec.map(function (v) { return v.tl; }));
      if (tlV.length) tlSh.getRange(2, 1, tlV.length, 6).clearContent();
      if (tlMoi.length) tlSh.getRange(2, 1, tlMoi.length, 6).setNumberFormat('@').setValues(tlMoi);
    }
    // RUBRIC: gom theo ca (cac ma de cung ca dung chung 1 huong dan cham), nap xong dung ngay (DUYET)
    if (viec.some(function (v) { return v.rb && v.rb.length; })) {
      SpreadsheetApp.flush();
      const caMa = {}; docCauHinhGoc().forEach(function (c) { caMa[c.madot] = c.giay ? (c.ca || c.madot) : c.madot; });
      const theoCa = {};
      viec.forEach(function (v) {
        if (!v.rb || !v.rb.length) return;
        const ca = v.ca || caMa[v.madot] || v.madot, o = theoCa[ca] = theoCa[ca] || {}, moi = {};
        v.rb.forEach(function (b) { if (o[b.cau] && !moi[b.cau]) return; moi[b.cau] = 1; (o[b.cau] = o[b.cau] || []).push(b); });
      });
      let rbSh = ss.getSheetByName(TAB_RB);
      if (!rbSh) { rbSh = ss.insertSheet(TAB_RB); rbSh.getRange(1, 1, 1, HEAD_RB.length).setValues([HEAD_RB]).setFontWeight('bold'); rbSh.setFrozenRows(1); }
      Object.keys(theoCa).forEach(function (ca) {
        const o = theoCa[ca]; Object.keys(o).forEach(function (c) { o[c].sort(function (a, b) { return a.buoc - b.buoc; }); });
        rbGhi(rbSh, ca, o, 'DUYET', 'NAP');
      });
    }
    ds.forEach(function (x) { const goc = String((x && x.goc) || '').trim(), moi = String((x && x.madot) || '').trim(); if (goc && goc !== moi && /^[A-Za-z0-9][A-Za-z0-9_.\-]{1,39}$/.test(goc)) ghiDoiMa(goc, moi); });
    SpreadsheetApp.flush();
    const r = gvDot();
    r.nap = viec.map(function (v) { return {madot: v.madot, hinh: ketHinh[v.madot] || null, ten: v.ten || v.madot, socau: v.cau.length, sokt: v.kt.length, sogt: v.gt.length, sotl: (v.tl || []).length, sorb: (v.rb || []).length, lop: v.lop || '', thay: !!(v.tab || v.dong), chiGT: !!v.chiGT, giay: !!v.giay}; });
    return r;
  } finally {
    lock.releaseLock();
  }
}
// ---------------------------------------------------------------------
// SO DO LOP + CA THI NHIEU MA DE + THU BAI VI PHAM
//  Tab SO DO (so lop): o A2 = JSON {day, hang, cho, ghe: {"d-h-c": {mahs, stt}}}
//  Cot H (CaThi) tab CAU HINH: cac ma de cung ca ghi cung ma de chinh -> cap de theo ghe, 2 em canh nhau khac ma
//  Tab VI PHAM (so lop): ThoiGian | MaDot | MaHS | HoTen | TrangThai (CO/HUY)
// ---------------------------------------------------------------------
const TAB_SD = 'SO DO';
const TAB_VP = 'VI PHAM';
const HEAD_VP = ['ThoiGian', 'MaDot', 'MaHS', 'HoTen', 'TrangThai'];
const GHI_CHU_VP = 'Vi phạm quy chế thi';
function docSoDo() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_SD);
  if (!sh) return null;
  try { const o = JSON.parse(String(sh.getRange(2, 1).getValue() || '')); return o && o.ghe ? o : null; } catch (e) { return null; }
}
// So cho moi ban cua tung day: so (moi day nhu nhau) hoac mang [2, 4, 2]
function choDay(sd, d) { return Array.isArray(sd.cho) ? (Number(sd.cho[d]) || 2) : (Number(sd.cho) || 2); }
function viTriGhe(sd, mahs) {
  if (!sd) return null;
  const k = Object.keys(sd.ghe).filter(function (x) { return sd.ghe[x] && String(sd.ghe[x].mahs) === String(mahs); })[0];
  if (!k) return null;
  const p = k.split('-').map(Number);
  let x = 0;
  for (let d = 0; d < p[0]; d++) x += choDay(sd, d);
  return {x: x + p[2], h: p[1]};
}
// Chi so ma de theo ghe: 2 ma -> ban co; 3 ma -> lech 2; >=4 -> moi o 2x2 du 4 ma (canh, truoc, sau, cheo deu khac)
function chiSoDe(v, n, mahs) {
  if (n <= 1) return 0;
  if (!v) { let s = 0; String(mahs).split('').forEach(function (ch) { s = (s * 31 + ch.charCodeAt(0)) % 9973; }); return s % n; }
  if (n === 2) return (v.x + v.h) % 2;
  if (n === 3) return (v.x + 2 * v.h) % 3;
  return ((v.x % 2) + 2 * (v.h % 2) + 4 * ((Math.floor(v.x / 2) + Math.floor(v.h / 2)) % 2)) % n;
}
function thanhVienCa(c) {
  if (!c || !c.ca) return c ? [c] : [];
  return docCauHinh().filter(function (x) { return x.ca === c.ca; }).sort(function (a, b) { return a.madot < b.madot ? -1 : a.madot > b.madot ? 1 : 0; });
}
// De danh cho HS trong ca: da lam/nop de nao thi giu de do; chua thi theo ghe
function deTheoGhe(c, mahs, sd) {
  const ds = thanhVienCa(c);
  if (ds.length <= 1) return c;
  for (let i = 0; i < ds.length; i++) if (timBaiDaNop(ds[i].madot, mahs)) return ds[i];
  return ds[chiSoDe(viTriGhe(sd === undefined ? docSoDo() : sd, mahs), ds.length, mahs)];
}
function gvSoDoLuu(d) {
  const o = d.sodo || {};
  const day = Math.round(Number(o.day)), hang = Math.round(Number(o.hang));
  const cho = []; for (let k = 0; k < day; k++) cho.push(Math.round(Number(Array.isArray(o.cho) ? o.cho[k] : o.cho)));
  if (!(day >= 1 && day <= 6 && hang >= 1 && hang <= 15) || cho.some(function (n) { return !(n >= 1 && n <= 6); })) return {ok: false, msg: 'So day / hang / cho khong hop le'};
  const ghe = {}, daCo = {};
  Object.keys(o.ghe || {}).forEach(function (k) {
    const p = k.split('-').map(Number), g = o.ghe[k] || {};
    if (p.length !== 3 || p[0] >= day || p[1] >= hang || p[2] >= cho[p[0]] || p.some(function (x) { return !(x >= 0); })) return;
    const mahs = String(g.mahs || '').trim();
    if (!mahs || daCo[mahs]) return;
    daCo[mahs] = 1;
    ghe[k] = {mahs: mahs, stt: String(g.stt === undefined ? '' : g.stt).trim().slice(0, 4)};
  });
  const sh = layTab(TAB_SD, ['SoDo']);
  sh.getRange(2, 1).setValue(JSON.stringify({day: day, hang: hang, cho: cho, ghe: ghe}));
  SpreadsheetApp.flush();
  return gvSoDo({madot: d.madot});
}
function dsViPham() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_VP), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().forEach(function (r) {
    const k = String(r[1]).trim() + '|' + String(r[2]).trim();
    if (khongDau(r[4]) === 'CO') m[k] = r[0] instanceof Date ? r[0].getTime() : 1; else delete m[k];
  });
  return m;
}
function daViPham(madot, mahs) { return !!dsViPham()[String(madot).trim() + '|' + String(mahs).trim()]; }
// Trang giao vien: so do + (neu co de) trang thai tung em trong ca thi
function gvSoDo(d) {
  const ss = SpreadsheetApp.getActive();
  const dsSh = ss.getSheetByName(TAB_DS);
  const ds = dsSh.getRange(2, 1, Math.max(dsSh.getLastRow() - 1, 1), 2).getValues()
    .filter(function (r) { return String(r[0]).trim() !== ''; }).map(function (r) { return [String(r[0]).trim(), String(r[1]).trim()]; });
  const sd = docSoDo();
  const r = {ok: true, lop: lopNay(), sodo: sd, ds: ds};
  const c = d.madot ? timDot(d.madot) : null;
  if (c) {
    const tv = thanhVienCa(c), vp = dsViPham(), tt = {};
    r.ca = tv.map(function (x) { return {madot: x.madot, ten: x.ten, tt: x.tt}; });
    gvTheoDoi({madot: c.madot}).hs.forEach(function (h) {
      const md = h.made || c.madot;
      tt[h.mahs] = {madot: md, tt: h.tt, diem: h.diem, ghichu: h.ghichu || '', vipham: !!vp[md + '|' + h.mahs]};
    });
    ds.forEach(function (h) {
      const t = tt[h[0]] || (tt[h[0]] = {tt: 'chua'});
      if (t.tt === 'chua') { t.madot = deTheoGhe(c, h[0], sd).madot; t.vipham = !!vp[t.madot + '|' + h[0]]; }
    });
    r.tt = tt;
  }
  return r;
}
// GV bam "Thu bai - vi pham" (huy = bo danh dau)
function gvViPham(d) {
  const mahs = String(d.mahs || '').trim(), hs = timHS(mahs);
  if (!hs) return {ok: false, msg: 'Khong tim thay hoc sinh'};
  const c = timDot(d.madot);
  if (!c) return {ok: false, msg: 'Khong tim thay de'};
  const de = deTheoGhe(c, mahs);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ghiDong(TAB_VP, HEAD_VP, [new Date(), de.madot, mahs, hs.ten, d.huy ? 'HUY' : 'CO']);
    const cache = CacheService.getScriptCache(), key = 'vp_' + de.madot + '_' + mahs;
    if (d.huy) cache.remove(key); else cache.put(key, '1', 21600);
    // Da nop roi: ghi / xoa ghi chu o lan nop cuoi
    const bl = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
    if (bl && bl.getLastRow() > 1) {
      const v = bl.getRange(2, 2, bl.getLastRow() - 1, 2).getValues();
      for (let i = v.length - 1; i >= 0; i--) {
        if (String(v[i][0]).trim() === de.madot && String(v[i][1]).trim() === mahs) {
          layTab(TAB_BL, HEAD_BL).getRange(i + 2, 13).setValue(d.huy ? '' : GHI_CHU_VP);
          break;
        }
      }
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return gvSoDo({madot: d.madot});
}
// iPad HS hoi dinh ky trong luc lam bai: GV da thu bai chua (chi doc bo nho dem, rat nhe)
function kiemThu(d) {
  const k = 'vp_' + String(d.madot || '').trim() + '_' + String(d.mahs || '').trim();
  let thu = false;
  try { thu = CacheService.getScriptCache().get(k) === '1'; } catch (e) {}
  return {ok: true, thu: thu};
}
// Trang thai tung HS cua lop nay trong 1 dot: da nop / dang lam / chua vao
// Ca thi nhieu ma de: gop trang thai tung em tu cac ma (moi em lam 1 ma), them o.made = ma em lam
function gvTheoDoi(d) {
  const c = timDot(d.madot);
  if (!c || !c.ca) return gvTheoDoi1(d);
  const tv = thanhVienCa(c), hang = {danop: 3, danglam: 2, dangcho: 1, chua: 0};
  const kq = tv.map(function (x) { return gvTheoDoi1({madot: x.madot}); });
  const goc = kq[0];
  goc.madot = String(d.madot).trim();
  goc.ca = tv.map(function (x) { return x.madot; });
  goc.hs = goc.hs.map(function (h, i) {
    let tot = null, ma = '';
    kq.forEach(function (k, j) { const x = k.hs[i]; if (x && (!tot || hang[x.tt] > hang[tot.tt])) { tot = x; ma = tv[j].madot; } });
    tot = Object.assign({}, tot);
    if (tot.tt !== 'chua') tot.made = ma;
    if (!tot.vang && h.vang) tot.vang = h.vang;
    return tot;
  });
  return goc;
}
function gvTheoDoi1(d) {
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
      if (!nop[ma] || lan >= nop[ma].lan) nop[ma] = {lan: lan, luc: r[0], diem: r[5], dung: r[6], tong: r[7], giay: r[8], pdf: r[10], ghichu: String(r[12] || '')};
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
    else if (n) { o.tt = 'danop'; o.diem = n.diem; o.dung = n.dung; o.tong = n.tong; o.luc = ngay(n.luc); o.giay = n.giay; o.lan = n.lan; o.pdf = n.pdf; if (n.ghichu) o.ghichu = n.ghichu; }
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
  const ten = {}, caCua = {};
  try { docCauHinh().forEach(function (c) { ten[c.madot] = c.ten; if (c.ca) caCua[c.madot] = c.ca; }); } catch (e) {}
  const bai = [], dauTien = {};
  const bl = ss.getSheetByName(TAB_BL);
  if (bl && bl.getLastRow() > 1) {
    boGV(bl.getRange(2, 1, bl.getLastRow() - 1, HEAD_BL.length).getValues(), 2).forEach(function (r) {
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
    boGV(hd.getRange(2, 1, hd.getLastRow() - 1, HEAD_HD.length).getValues(), 2).forEach(function (r) {
      const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(docDS(r[6]));
      if (!m) return;
      choi.push({mahs: String(r[2]).trim(), tro: String(r[1]).trim(), ten: String(r[4] || r[1]).trim(),
        dung: Number(m[1].replace(',', '.')), tong: Number(m[2]), diem: r[5], giay: Number(r[7]) || 0,
        luc: r[0] instanceof Date ? r[0].toISOString() : ''});
    });
  }
  const kqTro = docKQTro(), tvLuot = {};
  kqTro.forEach(function (x) {
    if (x.kieu === 'NHOM') { if (x.ml) tvLuot[x.ml] = x.tv; return; }
    const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(x.ds);
    choi.push({mahs: x.mahs, tro: x.matro, ten: x.ten, dung: m ? Number(m[1].replace(',', '.')) : 0, tong: m ? Number(m[2]) : 0, diem: x.diem, giay: x.giay,
      luc: x.t ? new Date(x.t).toISOString() : '', khung: true, ml: x.ml, dot: x.bo && x.t ? 'TC:' + x.bo + ':' + ngayKhoa(x.t) : ''});
  });
  const choiNhom = [];
  const cn = ss.getSheetByName(TAB_CN);
  if (cn && cn.getLastRow() > 1) {
    cn.getRange(2, 1, cn.getLastRow() - 1, HEAD_CN.length).getValues().forEach(function (r) {
      const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(docDS(r[5]));
      const ml = String(r[7] || '');
      choiNhom.push({nhom: chuanNhom(r[3]), tro: String(r[1]), ten: String(r[2] || r[1]), diem: r[4],
        dung: m ? Number(m[1].replace(',', '.')) : 0, tong: m ? Number(m[2]) : 0, giay: Number(r[6]) || 0,
        luc: r[0] instanceof Date ? r[0].toISOString() : '', tv: tvLuot[ml] || null, khung: String(r[1]).indexOf(':') > 0});
    });
  }
  const vang = docVang();
  vang.forEach(function (v) { if (!(v.madot in dauTien)) { dauTien[v.madot] = v.luc ? new Date(v.luc).getTime() : 0; } });
  const dot2 = Object.keys(dauTien).sort(function (a, b) { return dauTien[a] - dauTien[b]; })
    .map(function (m) { return {madot: m, ten: ten[m] || m, luc: dauTien[m] ? new Date(dauTien[m]).toISOString() : '', ca: caCua[m] || ''}; });
  return {ok: true, lop: lopNay(), hs: hs, dot: dot2, bai: bai, vang: vang, choi: choi, choiNhom: choiNhom, nhom: docNhom(), an: docBaiAn(), nx: docNhanXet(), tx: docTX(), bayGio: new Date().toISOString()};
}
// ---- GV an bai loi (may hong, cham nham): chuyen dong sang tab "... AN", khong tinh vao diem/thong ke; khoi phuc = chuyen lai ----
const TAB_BL_AN = 'BAI LAM AN', TAB_KQ_AN = 'KQ TRO CHOI AN';
function chuyenDong(tu, den, head, loc, them) {
  const ss = SpreadsheetApp.getActive(), a = ss.getSheetByName(tu);
  if (!a || a.getLastRow() < 2) return 0;
  const v = a.getRange(2, 1, a.getLastRow() - 1, head.length + (them ? 0 : 1)).getValues(), dong = [];
  v.forEach(function (r, i) { if (loc(r)) dong.push(i + 2); });
  if (!dong.length) return 0;
  const b = layTab(den, them ? head.concat(['ThoiGianAn']) : head);
  dong.forEach(function (i) { const r = v[i - 2].slice(0, head.length); if (them) r.push(new Date()); b.appendRow(r.map(function (x, k) { return typeof x === 'string' && /^\d+\/\d+$/.test(x) ? "'" + x : x; })); });
  for (let k = dong.length - 1; k >= 0; k--) a.deleteRow(dong[k]);
  return dong.length;
}
function gvAnBai(d) {
  const mahs = String(d.mahs || '').trim(), kp = !!d.khoiphuc, md = String(d.madot || '').trim();
  if (!mahs || !md) return {ok: false, msg: 'Thieu ma'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let n = 0;
  try {
    if (md.indexOf('TC:') === 0) {   // dot tro choi: cac luot ca nhan cua em trong bo cau + ngay do
      const p = md.split(':'), bo = p[1], ngay = p.slice(2).join(':');
      const ml = String(d.maluot || '').trim();
      const loc = function (r) { return String(r[4]).trim() === mahs && String(r[3]).trim() !== 'NHOM' && (ml ? String(r[11]).trim() === ml : String(r[12]).trim() === bo && r[0] instanceof Date && ngayKhoa(r[0]) === ngay); };
      n = kp ? chuyenDong(TAB_KQ_AN, TAB_KQ, HEAD_KQ, loc, false) : chuyenDong(TAB_KQ, TAB_KQ_AN, HEAD_KQ, loc, true);
    } else {
      const mas = (d.mas && d.mas.length ? d.mas : [md]).map(String);
      const lan = Number(d.lan) || 0;
      const loc = function (r) { return String(r[2]).trim() === mahs && mas.indexOf(String(r[1]).trim()) >= 0 && (!lan || (Number(r[11]) || 1) === lan); };
      n = kp ? chuyenDong(TAB_BL_AN, TAB_BL, HEAD_BL, loc, false) : chuyenDong(TAB_BL, TAB_BL_AN, HEAD_BL, loc, true);
    }
  } finally { lock.releaseLock(); }
  return {ok: n > 0, n: n, msg: n ? '' : 'Khong tim thay bai'};
}
// ---- Nhan xet tung dot cho tung em (GV luu; HS thay khi xem lai) ----
const TAB_NX = 'NHAN XET', HEAD_NX = ['MaHS', 'MaDot', 'NhanXet', 'ThoiGian'];
function docNhanXet() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_NX), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(function (r) {
    const k = String(r[0]).trim() + '|' + String(r[1]).trim();
    if (String(r[2]).trim()) m[k] = {nx: String(r[2]), luc: r[3] instanceof Date ? r[3].toISOString() : ''};
  });
  return m;
}
// M4: AI viet nhan xet ca nhan (chi so lieu + so thu tu, khong ho ten); GV doc, sua roi moi luu
const LOI_DAN_NX = 'Bạn là giáo viên Hóa học THPT tận tâm. Viết NHẬN XÉT CÁ NHÂN cho từng học sinh sau một đợt kiểm tra/trò chơi, dựa ĐÚNG số liệu cho sẵn (không bịa thêm). ' +
  'Mỗi nhận xét 2–4 câu, xưng "em", giọng ấm áp, cụ thể: (1) kết quả đợt này và xu hướng so với các đợt trước; (2) kiến thức/mức độ làm tốt; (3) kiến thức cần ôn (nêu tên) và cách tự cải thiện cụ thể ' +
  '(xem lại câu sai và lời giải 💡 ở trang Xem lại, dùng nút "🔁 Luyện lại phần yếu"; nếu em đã luyện và tiến bộ thì khen). Không nhắc mã số, không so sánh với bạn khác, không phán xét năng lực.';
function gvAINX(d) {
  const ds = Array.isArray(d.ds) ? d.ds.slice(0, 50) : [];
  if (!ds.length) return {ok: false, msg: 'Chua co so lieu'};
  const yc = LOI_DAN_NX + '\nĐợt: ' + String(d.dot || '').slice(0, 200) + '\nSố liệu từng em (id = số thứ tự): ' + JSON.stringify(ds).slice(0, 80000) +
    '\nTrả về JSON: {"nx":[{"id":"03","nx":"..."}]} – đủ mọi id.';
  const kq = goiAI(yc, null, 0.5, {thuLai: true, he: 'Bạn là giáo viên viết nhận xét học sinh bằng tiếng Việt chuẩn mực. Chỉ trả về JSON hợp lệ.'});
  return {ok: true, nx: (kq && Array.isArray(kq.nx)) ? kq.nx : []};
}
function gvNhanXetNhieu(d) {
  const ds = Array.isArray(d.ds) ? d.ds.slice(0, 80) : [];
  let n = 0;
  ds.forEach(function (x) { if (x && x.mahs && x.madot) { gvNhanXet({mahs: x.mahs, madot: x.madot, nx: x.nx}); n++; } });
  return {ok: true, so: n};
}
function gvNhanXet(d) {
  const mahs = String(d.mahs || '').trim(), md = String(d.madot || '').trim(), nx = String(d.nx || '').trim().slice(0, 2000);
  if (!mahs || !md) return {ok: false, msg: 'Thieu ma'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_NX, HEAD_NX), n = sh.getLastRow();
    const v = n > 1 ? sh.getRange(2, 1, n - 1, 2).getValues() : [];
    for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === mahs && String(v[i][1]).trim() === md) {
      if (nx) sh.getRange(i + 2, 3, 1, 2).setValues([[nx, new Date()]]); else sh.deleteRow(i + 2);
      return {ok: true};
    }
    if (nx) sh.appendRow(["'" + mahs, md, nx, new Date()]);
  } finally { lock.releaseLock(); }
  return {ok: true};
}
// ---- DIEM TX (diem thuong xuyen cho tren lop): moi cot = 1 lan cho diem (ngay + so thu tu) ----
function dsLopTX() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_DS), hs = [];
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { if (String(r[0]).trim()) hs.push({mahs: String(r[0]).trim(), hoten: String(r[1]).trim()}); });
  return hs;
}
const TAB_TX = 'DIEM TX', HEAD_TX = ['Cot', 'Ngay', 'GhiChu', 'MaHS', 'Diem', 'ThoiGian', 'Anh'];
function ngayTX(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(v || '').trim().slice(0, 10); }
function docTX() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_TX), cot = {}, diem = {}, nop = {};
  if (!sh || sh.getLastRow() < 2) return {cot: [], diem: {}, nop: {}};
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_TX.length).getValues().forEach(function (r) {
    const id = String(r[0]).trim(); if (!id) return;
    if (!cot[id]) cot[id] = {id: id, ngay: ngayTX(r[1]), ghichu: String(r[2] || ''), anh: String(r[6] || '')};
    if (!cot[id].anh && r[6]) cot[id].anh = String(r[6]);
    const ma = String(r[3]).trim().replace(/^'/, ''), v = String(r[4]).replace(',', '.').trim();
    if (ma && /#v$/.test(id) && v !== '') (nop[ma] = nop[ma] || {})[id] = /^[VTK]$/i.test(v) ? v.toUpperCase() : 'V';   // nop vo: V dung han, T tre, K khong nop
    if (ma && v !== '' && !/^[VTK]$/i.test(v) && !isNaN(Number(v))) (diem[ma] = diem[ma] || {})[id] = Number(v);
  });
  const ds = Object.keys(cot).map(function (k) { return cot[k]; }).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  return {cot: ds, diem: diem, nop: nop};
}
function gvTxLuu(d) {
  const ngay = String(d.ngay || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return {ok: false, msg: 'Ngay khong hop le'};
  const ghi = String(d.ghichu || '').trim().slice(0, 80), bang = d.diem || {}, hs = {}, tenHS = {}, cuD = {};
  dsLopTX().forEach(function (h) { hs[h.mahs] = 1; tenHS[h.mahs] = h.hoten; });
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_TX, HEAD_TX);
    let id = String(d.id || '').trim(), anhCu = '';
    const nopCu = {};
    const n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, HEAD_TX.length).getValues() : [];
    if (!id) {   // cot moi: yyyy-mm-dd#so thu tu trong ngay
      let so = 0; v.forEach(function (r) { const m = String(r[0]).match(/^(\d{4}-\d{2}-\d{2})#(\d+)$/); if (m && m[1] === ngay) so = Math.max(so, Number(m[2])); });
      id = ngay + '#' + (so + 1);
    } else {
      for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() === id) {
        if (!anhCu && v[i][6]) anhCu = String(v[i][6]);
        const m0 = String(v[i][3]).trim().replace(/^'/, ''); if (m0 && String(v[i][4]).trim() !== '') cuD[m0] = String(v[i][4]).trim();
        if (/#v$/.test(id) && m0) nopCu[m0] = [/^[VTK]$/i.test(String(v[i][4]).trim()) ? String(v[i][4]).trim().toUpperCase() : 'V', v[i][5]];   // cot nop vo: giu trang thai
        sh.deleteRow(i + 2);
      }
    }
    let anh = anhCu;
    if (d.anh && /^data:(image\/jpeg|application\/pdf);base64,/.test(String(d.anh))) {
      try {
        const loai = /pdf/.test(String(d.anh).slice(0, 30)) ? 'application/pdf' : 'image/jpeg';
        const f = layThuMuc(layThuMuc(layThuMuc(DriveApp.getRootFolder(), THU_MUC_GOC), lopNay()), 'DIEM TX')
          .createFile(Utilities.newBlob(Utilities.base64Decode(String(d.anh).split(',')[1]), loai, 'DIEM TX - ' + lopNay() + ' - ' + id.replace('#', ' lan ') + (loai === 'application/pdf' ? '.pdf' : '.jpg')));
        anh = f.getUrl();
      } catch (e) {}
    }
    const moi = [], bay = new Date(), ngD = new Date(ngay + 'T07:00:00');
    Object.keys(bang).forEach(function (ma) {
      const x = String(bang[ma] == null ? '' : bang[ma]).replace(',', '.').trim();
      if (hs[ma] && /#v$/.test(id) && /^[VTK]$/i.test(x)) { const cu = nopCu[ma]; moi.push([id, ngD, ghi, "'" + ma, x.toUpperCase(), cu && cu[0] === x.toUpperCase() ? cu[1] : bay, anh]); return; }
      if (!hs[ma] || x === '' || isNaN(Number(x)) || Number(x) < 0 || Number(x) > 10) return;
      moi.push([id, ngD, ghi, "'" + ma, Number(x), bay, anh]);
    });
    Object.keys(nopCu).forEach(function (ma) { if (!(ma in bang) && !moi.some(function (r) { return r[3] === "'" + ma; })) moi.push([id, ngD, ghi, "'" + ma, nopCu[ma][0], nopCu[ma][1] || bay, anh]); });
    if (!moi.length) moi.push([id, ngD, ghi, '', '', bay, anh]);   // cot rong van giu (de GV nhap sau)
    sh.getRange(sh.getLastRow() + 1, 1, moi.length, HEAD_TX.length).setValues(moi);
    if (String(d.id || '').trim()) {   // sua cot cu: ghi nhat ky tung em doi diem
      const moiD = {}; moi.forEach(function (r) { if (r[3]) moiD[String(r[3]).replace(/^'/, '')] = String(r[4]); });
      const nk = [];
      Object.keys(cuD).concat(Object.keys(moiD)).filter(function (m, i, a) { return a.indexOf(m) === i; }).forEach(function (m) {
        const a = cuD[m] === undefined ? '' : cuD[m], b = moiD[m] === undefined ? '' : moiD[m];
        if (a !== b && String(Number(a)) !== String(Number(b)) || (a === '') !== (b === '')) nk.push(['SUA_TX', m, tenHS[m] || '', 'TX ' + id + (ghi ? ' · ' + ghi : ''), a, b, 'TX|' + id + '|' + m]);
      });
      nkGhi(nk);
    }
    return {ok: true, id: id, so: moi.filter(function (r) { return r[3]; }).length, anh: anh};
  } finally { lock.releaseLock(); }
}
// Quet QR nhan vo: ghi V (dung han) / T (tre) vao cot "Nop vo <ngay>" (id yyyy-mm-dd#v); quet trung thi bo qua (tru o dang K: ghi de)
function gvTxVo(d) {
  const ma = String(d.mahs || '').replace(/\D/g, ''), ngay = String(d.ngay || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return {ok: false, msg: 'Ngay khong hop le'};
  const hs = timHS(ma); if (!hs || hs.gv) return {ok: false, msg: 'SBD ' + ma + ' khong co trong lop ' + lopNay()};
  const id = ngay + '#v';
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const tt = d.tre ? 'T' : 'V';
    const sh = layTab(TAB_TX, HEAD_TX), n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 5).getValues() : [];
    for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === id && String(v[i][3]).trim().replace(/^'/, '') === ma) {
      const cu = String(v[i][4]).trim().toUpperCase();
      if (cu !== 'K') return {ok: true, trung: true, tt: /^[VT]$/.test(cu) ? cu : 'V', mahs: ma, hoten: hs.ten, lop: lopNay()};
      sh.getRange(i + 2, 5, 1, 2).setValues([[tt, new Date()]]);   // truoc da chot "khong nop", nay mang vo toi
      nkGhi([['NOP_VO', ma, hs.ten, 'TX ' + id, 'K', tt, 'TX|' + id + '|' + ma]]);
      return {ok: true, tt: tt, doi: true, mahs: ma, hoten: hs.ten, lop: lopNay(), siso: dsLopTX().length};
    }
    sh.appendRow([id, new Date(ngay + 'T07:00:00'), 'Nộp vở', "'" + ma, tt, new Date(), '']);
    const so = v.filter(function (r) { return String(r[0]).trim() === id && String(r[3]).trim(); }).length + 1;
    return {ok: true, tt: tt, mahs: ma, hoten: hs.ten, lop: lopNay(), so: so, siso: dsLopTX().length};
  } finally { lock.releaseLock(); }
}
// Chot cuoi buoi: cac em GV chon (chua quet) -> K (khong nop)
function gvTxVoChot(d) {
  const ngay = String(d.ngay || '').trim(), ds = Array.isArray(d.ds) ? d.ds : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return {ok: false, msg: 'Ngay khong hop le'};
  const id = ngay + '#v', hs = {}; dsLopTX().forEach(function (h) { hs[h.mahs] = 1; });
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = layTab(TAB_TX, HEAD_TX), n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 4).getValues() : [], co = {};
    v.forEach(function (r) { if (String(r[0]).trim() === id) co[String(r[3]).trim().replace(/^'/, '')] = 1; });
    const moi = [], bay = new Date(), ngD = new Date(ngay + 'T07:00:00');
    ds.forEach(function (m) { const ma = String(m).replace(/\D/g, ''); if (hs[ma] && !co[ma]) { co[ma] = 1; moi.push([id, ngD, 'Nộp vở', "'" + ma, 'K', bay, '']); } });
    if (moi.length) sh.getRange(sh.getLastRow() + 1, 1, moi.length, HEAD_TX.length).setValues(moi);
    return {ok: true, so: moi.length};
  } finally { lock.releaseLock(); }
}
function gvTxXoa(d) {
  const id = String(d.id || '').trim(), sh = SpreadsheetApp.getActive().getSheetByName(TAB_TX);
  if (!id || !sh || sh.getLastRow() < 2) return {ok: false, msg: 'Khong co cot nay'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const v = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues(); let n = 0; const nk = [];
    for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() === id) {
      const m = String(v[i][3]).trim().replace(/^'/, ''); if (m && String(v[i][4]) !== '') nk.push(['XOA_COT_TX', m, '', 'TX ' + id, String(v[i][4]), '', 'TX|' + id + '|' + m]);
      sh.deleteRow(i + 2); n++;
    }
    nkGhi(nk);
    return {ok: n > 0, n: n};
  } finally { lock.releaseLock(); }
}
// AI doc anh/PDF diem: tra ve tung dong {stt, sbd, ten, diem, chac}
function gvTxAI(d) {
  const m = String(d.anh || '').match(/^data:(image\/jpeg|image\/png|application\/pdf);base64,(.+)$/);
  if (!m) return {ok: false, msg: 'Thieu anh'};
  const ds = dsLopTX().map(function (h, i) { return (i + 1) + '. ' + h.mahs + ' ' + h.hoten; }).join('\n');
  const yc = 'Ảnh/tài liệu đính kèm là danh sách điểm học sinh do giáo viên ghi (bảng lớp, sổ tay, giấy hoặc bảng in). ' +
    'Đọc TỪNG học sinh có điểm: số thứ tự (nếu có), số báo danh (nếu có), họ tên hoặc tên (như viết trong ảnh), điểm (số từ 0 đến 10, dấu chấm thập phân). ' +
    'Giáo viên thường ghi mỗi em một dòng dạng "STT Tên Điểm" (vd: "12 Trân 8", "5. Bình 7,5"); STT là số thứ tự trong danh sách lớp bên dưới. Nếu một người có nhiều điểm thì lấy điểm cuối cùng ghi cạnh tên. Không đoán người không có trong ảnh. ' +
    'Đặt "chac": false nếu chữ hoặc số khó đọc. Danh sách lớp để đối chiếu cách viết tên (STT. SBD Họ tên):\n' + ds + '\n' +
    'Trả về JSON: {"dong":[{"stt":số hoặc null,"sbd":"chuỗi hoặc rỗng","ten":"tên như trong ảnh","diem":số,"chac":true/false}],"ghichu":"ghi chú ngắn nếu ảnh có tiêu đề/ngày"}';
  try {
    const kq = goiAI(yc, {mime: m[1], b64: m[2]}, 0.1, {thuLai: true,
      he: 'Bạn là trợ lý nhập điểm của giáo viên. Việc của bạn chỉ là chép lại chính xác số thứ tự, tên và điểm số mà giáo viên tự tay ghi trong ảnh để đưa vào sổ điểm của trường. Đây là dữ liệu giáo viên sở hữu và được phép xử lý. Luôn trả lời, không từ chối; chỗ nào mờ thì vẫn ghi giá trị đoán được và đặt "chac": false. Chỉ trả về JSON hợp lệ.'});
    return {ok: true, dong: Array.isArray(kq.dong) ? kq.dong : [], ghichu: String(kq.ghichu || ''), moHinh: kq._moHinh};
  } catch (e) { return {ok: false, msg: e.message}; }
}
function docBaiAn() {
  const ss = SpreadsheetApp.getActive(), ra = [], caCua = {};
  try { docCauHinh().forEach(function (c) { if (c.ca) caCua[c.madot] = c.ca; }); } catch (e) {}
  const a = ss.getSheetByName(TAB_BL_AN);
  if (a && a.getLastRow() > 1) a.getRange(2, 1, a.getLastRow() - 1, HEAD_BL.length + 1).getValues().forEach(function (r) {
    ra.push({mahs: String(r[2]).trim(), madot: String(r[1]).trim(), ca: caCua[String(r[1]).trim()] || '', lan: Number(r[11]) || 1, diem: Number(String(r[5]).replace(',', '.')) || 0, luc: r[0] instanceof Date ? r[0].toISOString() : '', an: r[HEAD_BL.length] instanceof Date ? r[HEAD_BL.length].toISOString() : ''});
  });
  const b = ss.getSheetByName(TAB_KQ_AN);
  if (b && b.getLastRow() > 1) b.getRange(2, 1, b.getLastRow() - 1, HEAD_KQ.length + 1).getValues().forEach(function (r) {
    if (!(r[0] instanceof Date)) return;
    ra.push({mahs: String(r[4]).trim(), madot: 'TC:' + String(r[12]).trim() + ':' + ngayKhoa(r[0]), diem: Number(r[8]) || 0, luc: r[0].toISOString(), an: r[HEAD_KQ.length] instanceof Date ? r[HEAD_KQ.length].toISOString() : '', tro: true, ml: String(r[11]).trim(), ten: String(r[2]).trim()});
  });
  return ra;
}
// Lop nay da thi nhung dot nao, bao nhieu em da nop (de trang GV ghi "Da thi: 12G01 (38)")
function gvDaThi() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const m = {};
  if (sh && sh.getLastRow() > 1) {
    boGV(sh.getRange(2, 2, sh.getLastRow() - 1, 2).getValues(), 1).forEach(function (r) {
      const d = String(r[0]).trim(), ma = String(r[1]).trim();
      if (!d || !ma) return;
      (m[d] = m[d] || {})[ma] = 1;
    });
  }
  const dathi = {};
  Object.keys(m).forEach(function (d) { dathi[d] = Object.keys(m[d]).length; });
  let siso = 0, dakt = {}; try { siso = dsLopTX().length; dakt = docDaKT(); } catch (e) {}
  try { dongBoTK(); } catch (e) {}
  return {ok: true, lop: lopNay(), dathi: dathi, siso: siso, dakt: dakt};
}
// De giay "da kiem tra" theo lop: mac dinh tu tich khi co bai quet; GV tich/bo tich tay luu o kho (tab DA KIEM TRA)
const TAB_DAKT = 'DA KIEM TRA', HEAD_DAKT = ['Ca', 'Lop', 'TrangThai', 'Luc'];
function docDaKT() {
  const sh = kho().getSheetByName(TAB_DAKT), o = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) { const ca = String(r[0]).trim(), l = String(r[1]).trim(); if (ca && l && String(r[2]).trim()) (o[ca] = o[ca] || {})[l] = String(r[2]).trim(); });
  return o;
}
function gvDaKTLuu(d) {
  const ca = String(d.ca || '').trim(), l = String(d.lop || '').trim(), tt = String(d.tt || '').trim();
  if (!ca || !l || ['CO', 'KHONG', ''].indexOf(tt) < 0) return {ok: false, msg: 'Thieu thong tin'};
  const sh = tabKho(TAB_DAKT, HEAD_DAKT), n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 2).getValues() : [];
  let i = -1; v.forEach(function (r, j) { if (String(r[0]).trim() === ca && String(r[1]).trim() === l) i = j; });
  if (i >= 0) sh.getRange(i + 2, 3, 1, 2).setValues([[tt, new Date()]]); else sh.appendRow([ca, l, tt, new Date()]);
  return {ok: true, dakt: docDaKT()};
}
// Thong ke tung cau cua 1 dot trong lop nay (lan lam sau cung moi em): % sai, cac lua chon
// ---------------------------------------------------------------------
// PHAN TICH DE (M1): tra ve ma tran diem tung cau cua moi bai (quy ve cau goc khi de giay tron nhieu ma)
//   Trang GV gop cac lop roi tinh do kho p, do phan biet D (27%), phuong an nhieu, KR-20 / Cronbach alpha.
// ---------------------------------------------------------------------
function chuPA(t) { return String(t || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); }
function khoaGoc(q) { return String(q.goc || q.cau).split(':')[0]; }
// Ban do 1 ma -> cau goc: {goc, tn: {chuMa: chuGoc}, ds: [vi tri goc cua y j]}
function banDoGoc(de, ref) {
  const R = {}; ref.forEach(function (q) { R[khoaGoc(q)] = q; });
  return de.map(function (q) {
    const k = khoaGoc(q), g = R[k] || q, o = {goc: k, tn: null, ds: null};
    if (q.loai === 'TN') {
      o.tn = {};
      ['A', 'B', 'C', 'D'].forEach(function (L) {
        const t = chuPA(q.pa[L]); let m = '';
        ['A', 'B', 'C', 'D'].some(function (G) { if (t && chuPA(g.pa[G]) === t) { m = G; return true; } return false; });
        o.tn[L] = m || L;
      });
    } else if (q.loai === 'DS') {
      const p = String(q.goc || '').split(':')[1];
      o.ds = p && /^[abcd]{4}$/.test(p) ? p.split('').map(function (c) { return 'abcd'.indexOf(c); }) : [0, 1, 2, 3];
    }
    return o;
  });
}
function gvMaTranDe(d) {
  const mas = (Array.isArray(d.madots) ? d.madots : [d.madot]).map(function (x) { return String(x || '').trim(); }).filter(Boolean).slice(0, 12);
  if (!mas.length) return {ok: false, msg: 'Chua chon de'};
  const de = {};
  mas.forEach(function (m) { try { de[m] = docDe(m); } catch (e) {} });
  const co = mas.filter(function (m) { return de[m]; });
  if (!co.length) return {ok: false, msg: 'Kho chua co de ' + mas.join(', ')};
  // De goc: ma co cau khong tron (Goc trong hoac trung Cau, khong co hoan vi), uu tien ma nho nhat
  const laGoc = function (m) { return de[m].every(function (q) { return !q.goc || (q.goc === q.cau); }); };
  const refMa = co.filter(laGoc)[0] || co.slice().sort()[0], ref = de[refMa];
  const bd = {}; co.forEach(function (m) { bd[m] = banDoGoc(de[m], ref); });
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL), bai = {};
  if (sh && sh.getLastRow() > 1) {
    boGV(sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(), 2).forEach(function (r) {
      const md = String(r[1]).trim(); if (!de[md]) return;
      const ma = String(r[2]).trim(), lan = Number(r[11]) || 1, k = ma + '|' + (co.length > 1 && de[md].giay ? 'ca' : md);
      if (!bai[k] || lan >= bai[k].lan) bai[k] = {ma: ma, md: md, made: String(r[4] || ''), lan: lan, ct: r[9]};
    });
  }
  const viTri = {}; ref.forEach(function (q, i) { viTri[khoaGoc(q)] = i; });
  const ds = Object.keys(bai).map(function (k) {
    const b = bai[k], dd = de[b.md], chon = tachChiTiet(b.ct), kq = chamBai(dd, function (q, i) { return chon[i]; });
    const v = ref.map(function () { return null; }), c = ref.map(function () { return ''; });
    kq.ct.forEach(function (r, i) {
      const m = bd[b.md][i], j = viTri[m.goc]; if (j === undefined) return;
      v[j] = r.w ? Math.round(r.diemCau / r.w * 1000) / 1000 : (r.dung ? 1 : 0);
      let x = r.chon || '';
      if (m.tn && x) x = x.split('').map(function (L) { return m.tn[L] || L; }).join('');
      if (m.ds && x) { const y = ['-', '-', '-', '-']; m.ds.forEach(function (g, t) { y[g] = x[t] || '-'; }); x = y.join(''); }
      c[j] = x;
    });
    return {ma: b.ma, md: b.md, diem: kq.diem, v: v, c: c};
  });
  const ktM = docKienThuc();
  return {ok: true, lop: lopNay(), goc: refMa, mas: co,
    cau: ref.map(function (q) { const x = ktM[refMa + '|' + q.cau] || {}; return {cau: q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, da: q.da, w: q.w, hinh: q.hinh, kt: x.kt || '', md: x.md || ''}; }),
    bai: ds, sua: docSuaDapAn(co)};
}
// ---- Sua dap an sau khi thi (cau nghi sai dap an): ghi kho, luu lich su; trang GV goi gv_chamlai tung lop ----
const TAB_SDA = 'SUA DAP AN';
function docSuaDapAn(mas) {
  const sh = kho().getSheetByName(TAB_SDA); if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().filter(function (r) { return !mas || mas.indexOf(String(r[1]).trim()) >= 0; })
    .map(function (r) { return {ngay: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), madot: String(r[1]), cau: String(r[2]), cu: String(r[3]), moi: String(r[4]), lydo: String(r[5])}; });
}
// d.madots (cac ma cung ca), d.goc (cau goc, vd I.3), d.moi: dap an moi theo DE GOC: TN "C" | "B;C" (nhan ca hai) | "*" (tang diem ca lop); DS "DSSD" | "*"; TLN "12.5;12,5" | "*"
function gvSuaDapAn(d) {
  const mas = (Array.isArray(d.madots) ? d.madots : [d.madot]).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
  const gocCau = String(d.goc || '').trim(), moi = String(d.moi || '').trim().toUpperCase(), lydo = String(d.lydo || '').slice(0, 300);
  if (!mas.length || !gocCau || !moi) return {ok: false, msg: 'Thieu thong tin'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const de = {}; mas.forEach(function (m) { de[m] = docDe(m); });
    const laGoc = function (m) { return de[m].every(function (q) { return !q.goc || q.goc === q.cau; }); };
    const refMa = mas.filter(laGoc)[0] || mas.slice().sort()[0];
    const cu = {}, ss = kho();
    mas.forEach(function (m) {
      const bd = banDoGoc(de[m], de[refMa]);
      de[m].forEach(function (q, i) {
        if (khoaGoc(q) !== gocCau) return;
        let da = moi;
        if (moi !== '*' && q.loai === 'TN') { const nguoc = {}; Object.keys(bd[i].tn).forEach(function (L) { nguoc[bd[i].tn[L]] = L; }); da = moi.split(/[;\/,]/).map(function (G) { return nguoc[G.trim()] || G.trim(); }).filter(Boolean).join(';'); }
        if (moi !== '*' && q.loai === 'DS') { const g = chuanDS(moi); da = bd[i].ds.map(function (p) { return g[p]; }).join(''); if (!/^[DS]{4}$/.test(da)) throw new Error('Dap an dung/sai can 4 chu D/S'); }
        if (q.loai === 'TN' && moi !== '*' && !/^[ABCD](;[ABCD])*$/.test(da)) throw new Error('Dap an trac nghiem chi gom A-D');
        const sh = ss.getSheetByName(m), v = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
        for (let r = 0; r < v.length; r++) if (String(v[r][0]).trim() === q.cau) {
          sh.getRange(r + 2, 7).setNumberFormat('@').setValue(da);
          cu[m + '|' + q.cau] = q.da;
          let lg = ss.getSheetByName(TAB_SDA);
          if (!lg) { lg = ss.insertSheet(TAB_SDA); lg.getRange(1, 1, 1, 6).setValues([['Ngay', 'MaDot', 'Cau', 'DapAnCu', 'DapAnMoi', 'LyDo']]).setFontWeight('bold'); lg.setFrozenRows(1); }
          lg.appendRow([new Date(), m, q.cau, "'" + q.da, "'" + da, lydo]);
          break;
        }
      });
    });
    if (!Object.keys(cu).length) return {ok: false, msg: 'Khong tim thay cau ' + gocCau};
    SpreadsheetApp.flush();
    if (MEMO) MEMO = {};
    return {ok: true, cu: cu};
  } finally { lock.releaseLock(); }
}
// Cham lai bai cua lop nay cho cac ma vua sua: diem moi = diem cu - phan trac nghiem cham bang dap an cu + phan cham bang dap an moi
// (giu nguyen diem tu luan / diem GV cong them neu co). d.cu: {madot|cau: dap an cu}
function gvChamLai(d) {
  const cu = d.cu || {}, mas = {};
  Object.keys(cu).forEach(function (k) { mas[k.split('|')[0]] = 1; });
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  if (!sh || sh.getLastRow() < 2) return {ok: true, doi: 0};
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(), deMoi = {}, deCu = {};
  Object.keys(mas).forEach(function (m) {
    deMoi[m] = docDe(m);
    deCu[m] = deMoi[m].map(function (q) { const o = Object.assign({}, q), k = m + '|' + q.cau; if (k in cu) o.da = q.loai === 'DS' && cu[k] !== '*' ? chuanDS(cu[k]) : String(cu[k]).toUpperCase(); return o; });
    deCu[m].giay = deMoi[m].giay;
  });
  let doi = 0; const nk = [];
  v.forEach(function (r, i) {
    const m = String(r[1]).trim(); if (!deMoi[m]) return;
    const chon = tachChiTiet(r[9]), lay = function (q, j) { return chon[j]; };
    const a = chamBai(deCu[m], lay), b = chamBai(deMoi[m], lay);
    if (a.diem === b.diem && a.dung === b.dung) return;
    const moi = Math.round(((Number(r[5]) || 0) - a.diem + b.diem) * 100) / 100;
    sh.getRange(i + 2, 6, 1, 2).setValues([[moi, b.dung]]);
    nk.push(['CHAM_LAI', String(r[2]).trim(), String(r[3]), m, String(r[5]), String(moi), 'BL|' + m + '|' + String(r[2]).trim() + '|' + (Number(r[11]) || 1)]);
    doi++;
  });
  nkGhi(nk);
  return {ok: true, doi: doi, lop: lopNay()};
}
// AI nhan xet de: chi gui noi dung cau + so lieu tong hop (khong ten, khong ma HS)
function gvAIDe(d) {
  const cau = Array.isArray(d.cau) ? d.cau.slice(0, 60) : [];
  if (!cau.length) return {ok: false, msg: 'Chua co so lieu'};
  const yc = 'Bạn là chuyên gia đo lường – đánh giá trong giáo dục (môn Hóa học/KHTN, chương trình GDPT 2018). Dưới đây là số liệu phân tích một đề kiểm tra sau khi học sinh làm' +
    ' (n = ' + Number(d.n || 0) + ' bài, độ tin cậy ' + String(d.tincay || '') + ', điểm TB ' + String(d.tb || '') + ', độ lệch chuẩn ' + String(d.sd || '') + ').' +
    ' Mỗi câu có: nội dung, phương án, đáp án, độ khó p (tỉ lệ làm đúng), độ phân biệt D (nhóm 27% cao trừ nhóm 27% thấp), tỉ lệ chọn từng phương án ở nhóm cao/thấp, yêu cầu cần đạt và mức độ.\n' +
    'Hãy viết nhận xét ngắn gọn, khách quan bằng tiếng Việt cho giáo viên:\n' +
    '1) Nhận xét chung về đề (độ khó, phân hóa, độ tin cậy, cân đối mức độ).\n' +
    '2) Các câu cần xem lại (D thấp/âm, nhiễu không ai chọn, nhiễu hút nhóm giỏi, nghi sai đáp án): mỗi câu nêu lý do dựa trên số liệu và gợi ý sửa cụ thể (sửa lời dẫn, thay phương án nhiễu...).\n' +
    '3) Lỗi sai phổ biến của học sinh rút ra từ phương án nhiễu được chọn nhiều, và gợi ý dạy lại.\n' +
    'Không bịa số liệu ngoài dữ liệu. Trả về JSON: {"chung":"...","cau":[{"cau":"I.3","van_de":"...","goi_y":"..."}],"loi_hs":["..."],"day_lai":["..."]}\n' +
    'DỮ LIỆU: ' + JSON.stringify(cau).slice(0, 60000);
  const kq = goiAI(yc, null, 0.3, {thuLai: true});
  return {ok: true, ai: kq};
}
// Ma tran – dac ta (M2): cau cua de goc + nhan kien thuc/muc do/chu de + tu luan
function gvDacTa(d) {
  const mas = (Array.isArray(d.madots) ? d.madots : [d.madot]).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
  const de = {}; mas.forEach(function (m) { try { de[m] = docDe(m); } catch (e) {} });
  const co = mas.filter(function (m) { return de[m]; });
  if (!co.length) return {ok: false, msg: 'Kho chua co de'};
  const laGoc = function (m) { return de[m].every(function (q) { return !q.goc || q.goc === q.cau; }); };
  const goc = co.filter(laGoc)[0] || co.slice().sort()[0], ktM = docKienThuc(), c = timDot(goc) || {};
  return {ok: true, madot: goc, ten: c.ten || goc, giay: !!c.giay,
    cau: de[goc].map(function (q) { const x = ktM[goc + '|' + q.cau] || {}; return {cau: q.cau, loai: q.loai, w: q.w, kt: x.kt || '', md: x.md || '', cd: x.cd || '', nd: x.nd || ''}; }),
    tl: (docTuLuan()[goc] || []).map(function (t) { const x = ktM[goc + '|' + t.cau] || {}; return {cau: t.cau, loai: 'TL', w: Number(String(t.diem).replace(',', '.')) || 0, kt: x.kt || '', md: x.md || '', cd: x.cd || '', nd: x.nd || ''}; })};
}
function gvCau(d) {
  const madot = String(d.madot || '').trim();
  const de = docDe(madot);
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const bai = {};
  if (sh && sh.getLastRow() > 1) {
    boGV(sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(), 2).forEach(function (r) {
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
// Loi giai chi tiet: tab GIAI THICH trong kho de (MaDot | Cau | GiaiThich). HS chi thay khi dot dang "Cho xem lai".
function docTuLuan() {
  const sh = kho().getSheetByName('TU LUAN'), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(function (r) {
    const md = String(r[0]).trim(); if (!md || !String(r[1]).trim()) return;
    (m[md] = m[md] || []).push({cau: String(r[1]).trim(), hoi: String(r[2]), hinh: String(r[3]).trim(), diem: String(r[4]).trim(), gt: String(r[5])});
  });
  return m;
}
function docGiaiThich() {
  const sh = kho().getSheetByName('GIAI THICH'), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
    const md = String(r[0]).trim(), cau = String(r[1]).trim(), nd = String(r[2] || '').trim();
    if (md && cau && nd) m[md + '|' + cau] = nd;
  });
  return m;
}
// ---------------------------------------------------------------------
// Danh gia kien thuc: tab KIEN THUC trong kho de (MaDot | Cau | KienThuc | MucDo)
// gvKienThuc: ket qua tung em tung cau (0..1; cau dung/sai chia theo so y dung/4) cua 1 dot hoac tat ca dot lop da lam
// ---------------------------------------------------------------------
function docKienThuc() { return nho('kt', docKienThucGoc); }
function docKienThucGoc() {
  const sh = kho().getSheetByName('KIEN THUC'), m = {};
  if (!sh || sh.getLastRow() < 2) return m;
  sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(4, Math.min(6, sh.getLastColumn()))).getValues().forEach(function (r) {
    if (String(r[0]).trim() === '') return;
    m[String(r[0]).trim() + '|' + String(r[1]).trim()] = {kt: String(r[2] || '').trim(), md: String(r[3] || '').trim(), cd: String(r[4] || '').trim(), nd: String(r[5] || '').trim()};
  });
  return m;
}
function gvKienThuc(d) {
  const madot = String(d.madot || '').trim();
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL);
  const bai = {}, thuTu = [], dau = {};
  if (sh && sh.getLastRow() > 1) {
    boGV(sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(), 2).forEach(function (r) {
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
  if (!madot || madot.indexOf('TC:') === 0) dotTroKT(madot).forEach(function (x) { dot.push(x); });
  if (madot.indexOf('TC:') === 0) { for (let i = dot.length - 1; i >= 0; i--) if (dot[i].madot !== madot) dot.splice(i, 1); }
  const dsh = SpreadsheetApp.getActive().getSheetByName(TAB_DS), hs = [];
  if (dsh && dsh.getLastRow() > 1) dsh.getRange(2, 1, dsh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (String(r[0]).trim()) hs.push({mahs: String(r[0]).trim(), hoten: String(r[1]).trim()});
  });
  return {ok: true, lop: lopNay(), hs: hs, dot: dot, coNhan: Object.keys(kt).length > 0 || dot.some(function (x) { return x.tro; })};
}
// Tro khung -> "dot" danh gia kien thuc: moi bo cau x ngay = 1 dot; thanh vien nhom nhan ket qua cua nhom.
// kq[ma][i] = trung binh cac luot cua em o cau i (bo qua cau chua lam); diem[ma] = diem TB cac luot.
function dotTroKT(chiMa) {
  const layBo = boDem(), nhom = {}, thu = [];
  docKQTro().forEach(function (x) {
    if (!x.bo || !x.ct.length) return;
    const key = 'TC:' + x.bo + ':' + ngayKhoa(x.t);
    if (chiMa && key !== chiMa) return;
    const ct = chamLuot(x, layBo); if (!ct) return;
    let g = nhom[key];
    if (!g) { g = nhom[key] = {madot: key, ten: '🎮 ' + tenTroGon(x), luc: x.t, tro: true, cauI: {}, cau: [], cong: {}, diem: {}}; thu.push(g); }
    if (x.t && x.t < g.luc) g.luc = x.t;
    const ai = x.kieu === 'NHOM' ? x.tv : [x.mahs];
    ct.forEach(function (c) {
      if (c.v === null) return;
      if (!(c.ma in g.cauI)) { g.cauI[c.ma] = g.cau.length; g.cau.push({cau: c.ma, loai: c.loai, kt: c.kt, md: c.md}); }
      const i = g.cauI[c.ma];
      ai.forEach(function (ma) { const o = (g.cong[ma] = g.cong[ma] || {}); const y = (o[i] = o[i] || [0, 0]); y[0] += c.v; y[1]++; });
    });
    ai.forEach(function (ma) { const o = (g.diem[ma] = g.diem[ma] || [0, 0, null, false, 0]); o[0] += x.diem; o[1]++; if (o[2] === null || x.diem > o[2]) o[2] = x.diem; if (x.kieu !== 'NHOM') o[3] = true; if (x.t > o[4]) o[4] = x.t; });
  });
  return thu.map(function (g) {
    const kq = {}, diem = {}, luot = {};
    Object.keys(g.cong).forEach(function (ma) { kq[ma] = g.cau.map(function (_, i) { const y = g.cong[ma][i]; return y ? Math.round(y[0] / y[1] * 1000) / 1000 : null; }); });
    Object.keys(g.diem).forEach(function (ma) { const o = g.diem[ma]; diem[ma] = Math.round(o[0] / o[1] * 100) / 100; luot[ma] = {n: o[1], max: o[2], cn: o[3], t: o[4] ? new Date(o[4]).toISOString() : ''}; });
    return {madot: g.madot, ten: g.ten, luc: g.luc ? new Date(g.luc).toISOString() : '', tro: true, kq: kq, cau: g.cau, diem: diem, luot: luot};
  });
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
  // Gop cac ma de cung ca thi thanh 1 cot; tieu de = ngay thi; diem ma de so lon in nghieng
  const nhom = [], theo = {};
  h.dot.forEach(function (d) {
    const k = d.ca || d.madot;
    if (!theo[k]) { theo[k] = {ma: [], luc: d.luc}; nhom.push(theo[k]); }
    theo[k].ma.push(d.madot);
    if (d.luc && (!theo[k].luc || d.luc < theo[k].luc)) theo[k].luc = d.luc;
  });
  nhom.forEach(function (g) { g.ma.sort(); });
  nhom.sort(function (a, b) { return (a.luc || '') < (b.luc || '') ? -1 : 1; });
  const dem = {};
  nhom.forEach(function (g) {
    const n = g.luc ? Utilities.formatDate(new Date(g.luc), Session.getScriptTimeZone(), 'dd/MM/yyyy') : g.ma[0];
    dem[n] = (dem[n] || 0) + 1; g.nhan = n + (dem[n] > 1 ? ' (' + dem[n] + ')' : '');
  });
  const tim = function (mahs, g) { for (let i = 0; i < g.ma.length; i++) { const b = m[mahs + '|' + g.ma[i]]; if (b) return {b: b, i: i}; } return null; };
  const head = ['STT', 'MaHS', 'Ho ten'].concat(nhom.map(function (g) { return g.nhan; })).concat(['So bai', 'Diem TB']);
  const nghieng = [];
  const rows = h.hs.map(function (x, i) {
    let tong = 0, n = 0;
    const o = [i + 1, x.mahs, x.hoten].concat(nhom.map(function (g, j) {
      const t = tim(x.mahs, g);
      if (!t) return g.ma.some(function (md) { return vg[x.mahs + '|' + md]; }) ? 'V' : '';
      if (t.i > 0) nghieng.push([i + 2, j + 4]);
      tong += t.b.diem; n++;
      return t.b.diem;
    }));
    return o.concat([n, n ? Math.round(tong / n * 100) / 100 : '']);
  });
  const tbLop = ['', '', 'TB lop'].concat(nhom.map(function (g) {
    let t = 0, n = 0;
    h.hs.forEach(function (x) { const r = tim(x.mahs, g); if (r) { t += r.b.diem; n++; } });
    return n ? Math.round(t / n * 100) / 100 : '';
  })).concat(['', '']);
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('BANG DIEM') || ss.insertSheet('BANG DIEM');
  sh.clear();
  const all = [head].concat(rows).concat([tbLop]);
  sh.getRange(1, 1, all.length, head.length).setValues(all);
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setWrap(true);
  sh.getRange(all.length, 1, 1, head.length).setFontWeight('bold');
  nghieng.forEach(function (o) { sh.getRange(o[0], o[1]).setFontStyle('italic'); });
  sh.getRange(1, 4, 1, 1).setNote('Diem moi bai = lan lam sau cung; V = vang thi (xem tab VANG THI). Ca thi nhieu ma de gop 1 cot, diem in nghieng = lam ma de so lon hon. ' + nhom.map(function (g) { return g.nhan + ': ' + g.ma.join(', '); }).join('; '));
  sh.setFrozenRows(1); sh.setFrozenColumns(3);
  SpreadsheetApp.flush();
  return {ok: true, lop: h.lop, soHS: h.hs.length, soBai: nhom.length};
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
// MaTro | TenTro | Kieu (CA NHAN/NHOM) | Khoi | File | TrangThai (MO/CHO/DONG) | ThoiGian_phut | Lop | XuatPhatLuc
// CHO: hoc sinh dang nhap xong dung o vach xuat phat; giao vien bam Xuat phat -> XuatPhatLuc = luc bam + 12 giay,
//      moi may dem nguoc va chay cung luc, ket thuc o XuatPhatLuc + ThoiGian_phut. Het gio thi lai cho luot moi.
// Tro choi dang nhap / mo khoa qua so lop; ket qua ghi vao HOAT DONG / TRO CHOI NHOM cua so lop.
// =====================================================================
const TAB_TC = 'TRO CHOI';
const HEAD_TC = ['MaTro', 'TenTro', 'Kieu', 'Khoi', 'File', 'TrangThai', 'ThoiGian_phut', 'Lop', 'XuatPhatLuc', 'BoCau', 'ChoXemLai'];
const XP_TRE = 12000;   // ms tu luc bam Xuat phat den luc den xanh (du de moi may nhan lenh)
const TC_MAC_DINH = [
  ['DAINOI-HOA10', 'Đại Nội Huế – Hóa 10', 'CA NHAN', 10, 'HOA10-DAINOI.html', 5],
  ['CHIMDUATHU-HOA10', 'Chim đưa thư – Hóa 10', 'CA NHAN', 10, 'HOA10-CHIMDUATHU.html', 5],
  ['DUAXEF1-HOA10', 'Đua xe F1 – Hóa 10', 'CA NHAN', 10, 'HOA10-DUAXEF1-CANHAN.html', 5],
  ['LANGBIANG-HOA10', 'Leo Langbiang – Hóa 10', 'CA NHAN', 10, 'HOA10-LANGBIANG.html', 5],
  ['CHIMDUATHU-HOA10-NHOM', 'Chim đưa thư – Hóa 10 (nhóm)', 'NHOM', 10, 'HOA10-CHIMDUATHU-NHOM.html', 5],
  ['DUAXEF1-HOA10-NHOM', 'Đua xe F1 – Hóa 10 (nhóm)', 'NHOM', 10, 'HOA10-DUAXEF1-NHOM.html', 5],
  ['RUONGLUA-CHUKI-NHOM', 'Ruộng lúa Chu kì (nhóm)', 'NHOM', 10, 'HOA10-RUONGLUA-CHUKI-NHOM.html', 5],
  ['DUAXEF1-POLYMER-H12', 'Đua xe F1 Polymer – Hóa 12', 'CA NHAN', 12, 'HOA12-DUAXEF1-POLYMER-CANHAN.html', 5],
  ['POLYMER-F1', 'Polymer F1 – Hóa 12', 'CA NHAN', 12, 'HOA12-POLYMER-F1.html', 5],
  ['DUAXEF1-POLYMER-H12-NHOM', 'Đua xe F1 Polymer – Hóa 12 (nhóm)', 'NHOM', 12, 'HOA12-DUAXEF1-POLYMER-NHOM.html', 5],
  ['DAINOI-KHTN9', 'Đại Nội Huế – KHTN 9', 'CA NHAN', 9, 'KHTN9-DAINOI.html', 5],
  ['PIN-F1-H12-NHOM', 'Grand Prix Điện hoá – Hóa 12 (nhóm)', 'NHOM', 12, 'HOA12-PIN-F1-NHOM.html', 7],
  ['CHUONG123-H12', 'Escape the Cartoon Forest – Hóa 12 Chương 1-2-3', 'CA NHAN', 12, 'HOA12-CHUONG123.html', 7],
  ['CHUONG123-H12-NHOM', 'Escape the Cartoon Forest – Hóa 12 Chương 1-2-3 (nhóm)', 'NHOM', 12, 'HOA12-CHUONG123-NHOM.html', 7],
  ['HANGDONG-H12', 'Khám phá hang động – Ester (Hóa 12)', 'CA NHAN', 12, 'HOA12-HANGDONG.html', 5],
  // Khung tro choi: noi dung = bo cau GV nap (tab BO CAU), GV chon bo cau + ca nhan/nhom + so phut moi buoi
  ['F1-K9', 'Đua xe F1 – KHTN 9', 'CA NHAN', 9, 'KHUNG-F1.html', 5],
  ['F1-K10', 'Đua xe F1 – Hóa 10', 'CA NHAN', 10, 'KHUNG-F1.html', 5],
  ['F1-K11', 'Đua xe F1 – Hóa 11', 'CA NHAN', 11, 'KHUNG-F1.html', 5],
  ['F1-K12', 'Đua xe F1 – Hóa 12', 'CA NHAN', 12, 'KHUNG-F1.html', 5]
];
function lopMacDinh(khoi) {
  if (/DEMO/.test(khongDau(lopNay()))) return 'TAT CA';
  return {9: '9D01, 9D03', 10: '10E01', 11: 'TAT CA', 12: '12G01, 12G02'}[khoi] || 'TAT CA';
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
  if (!String(sh.getRange(1, 9).getValue()).trim()) sh.getRange(1, 9).setValue('XuatPhatLuc').setFontWeight('bold');
  if (!String(sh.getRange(1, 10).getValue()).trim()) sh.getRange(1, 10).setValue('BoCau').setFontWeight('bold');
  if (!String(sh.getRange(1, 11).getValue()).trim()) sh.getRange(1, 11).setValue('ChoXemLai').setFontWeight('bold');
  // Them tro moi trong danh sach mac dinh neu tab chua co (khong dong cham dong cu)
  const co = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { co[String(r[0]).trim()] = 1; });
  const them = TC_MAC_DINH.filter(function (t) { return !co[t[0]]; })
    .map(function (t) { return [t[0], t[1], t[2], t[3], t[4], /^KHUNG-/.test(t[4]) ? 'DONG' : 'MO', t[5], lopMacDinh(t[3]), '', '', 'KHONG']; });
  if (them.length) sh.getRange(sh.getLastRow() + 1, 1, them.length, HEAD_TC.length).setValues(them);
  return sh;
}
function docTroChoi() {
  const sh = tabTroChoi();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const bay = Date.now();
  return sh.getRange(2, 1, n, HEAD_TC.length).getValues().map(function (r, i) {
    const tt = khongDau(r[5]) === 'DONG' ? 'DONG' : khongDau(r[5]) === 'CHO' ? 'CHO' : 'MO';
    const phut = Number(r[6]) || 5;
    let xp = r[8] instanceof Date ? r[8].getTime() : Number(r[8]) || 0;
    if (tt !== 'CHO' || bay >= xp + phut * 60000) xp = 0;   // chi giu gio xuat phat cua luot dang dien ra
    return {dong: i + 2, matro: String(r[0]).trim(), ten: String(r[1] || r[0]).trim(), kieu: khongDau(r[2]) === 'NHOM' ? 'NHOM' : 'CA NHAN',
      khoi: String(r[3]).trim(), file: String(r[4]).trim(), tt: tt, mo: tt !== 'DONG', cho: tt === 'CHO', xp: xp, phut: phut,
      lop: khongDau(r[7]) || 'TAT CA', bo: String(r[9] || '').trim(), khung: /^KHUNG-/i.test(String(r[4]).trim()), xemlai: khongDau(r[10]) === 'CO'};
  }).filter(function (t) { return t.matro; });
}
// Ban doc nhanh cho luc ca lop cung dang nhap / hoi trang thai: giu trong cache cua so lop vai giay
// (mo KHO DE moi lan mat 1-2 giay; 40 may cung goi la qua tai)
function docNhanh(khoa, giay, ham) {
  const cache = CacheService.getScriptCache();
  try { const c = cache.get(khoa); if (c) return JSON.parse(c); } catch (e) {}
  const v = ham();
  try { cache.put(khoa, JSON.stringify(v), giay); } catch (e) {}
  return v;
}
function docTroChoiNhanh() { return docNhanh('tcds', 5, docTroChoi); }
function docMaNhanh() { return docNhanh('ma_nhanh', 60, docMa); }
function docDsBoNhanh() { return docNhanh('dsbo', 60, docDsBo); }
// Khung tro choi (d.khung = 'F1'...): tim dong cua khoi lop nay (F1-K10...); lop DEMO: dong khung dang mo
function timTro(d) {
  const ds = docTroChoiNhanh(), ma = String(d.matro || '').trim(), kh = String(d.khung || '').trim().toUpperCase();
  if (!kh) return ds.filter(function (x) { return x.matro === ma; })[0];
  const cac = ds.filter(function (x) { return x.khung && x.matro.toUpperCase().indexOf(kh + '-') === 0; });
  const so = (/^(\d+)/.exec(lopNay()) || [])[1];
  if (so) return cac.filter(function (x) { return String(x.khoi) === so; })[0];
  return cac.filter(function (x) { return x.tt === 'CHO'; })[0] || cac.filter(function (x) { return x.mo; })[0] || cac[0];
}
function thongTinKhung(t) {
  if (!t || !t.khung) return {};
  const b = t.bo ? docDsBoNhanh().filter(function (x) { return x.ma === t.bo; })[0] : null;
  return {khung: true, matro: t.matro, kieu: t.kieu, bo: b ? b.ma : '', tenBo: b ? b.ten : '',
    maKQ: b ? t.matro + ':' + b.ma : t.matro, tenKQ: b ? String(t.ten).split(' – ')[0] + ' – ' + b.ten + (t.kieu === 'NHOM' ? ' (nhóm)' : '') : t.ten};
}
function tcVao(d) {
  const t = timTro(d);
  if (!t) return {ok: false, loi: 'khongco', msg: 'Trò chơi này chưa có trong danh sách quản lý của giáo viên.'};
  if (!t.mo) return {ok: false, loi: 'dong', msg: 'Trò chơi đang đóng. Em chờ giáo viên mở nhé.'};
  if (!hopLop(t)) return {ok: false, loi: 'lop', msg: 'Trò chơi này chưa mở cho lớp ' + lopNay() + '.'};
  if (String(d.ma || '').trim() !== docMaNhanh().tcvao) return {ok: false, loi: 'ma', msg: 'Mã vào chơi không đúng.'};
  const k = thongTinKhung(t);
  let bo = null;
  if (t.khung) {
    if (!k.bo) return {ok: false, loi: 'bo', msg: 'Giáo viên chưa chọn bộ câu hỏi cho trò chơi này.'};
    bo = docBoCau(k.bo);
    if (!bo) return {ok: false, loi: 'bo', msg: 'Không đọc được bộ câu ' + k.bo + '.'};
  }
  if (t.tt === 'CHO' && !t.xp) ghiVach(t.matro, d);
  ghiCaNhan(t.matro, d.mahs, {vao: Date.now()});
  return Object.assign({ok: true, phut: t.phut, ten: t.ten, tt: t.tt, xp: t.xp, bayGio: Date.now(), boCau: bo}, k);
}
// =====================================================================
// BO CAU tro choi (khung): tab BO CAU = danh sach; moi bo 1 tab ten = ma bo (TC-H10-...)
// Moi bo: Phan I trac nghiem 4 PA, Phan II dung/sai 4 y, Phan III tra loi ngan (so). Moi luot boc 6 + 3 + 2.
// =====================================================================
const TAB_BO = 'BO CAU';
const HEAD_BO = ['MaBo', 'TenBo', 'Khoi', 'SoTN', 'SoDS', 'SoTLN', 'NgayNap'];
const HEAD_BOC = ['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'KienThuc', 'MucDo', 'GiaiThich'];
const RE_MABO = /^TC-(H10|H11|H12|K9)-[A-Za-z0-9][A-Za-z0-9_.\-]{0,30}$/i;
function khoiBo(ma) { const m = /^TC-(?:H|K)(\d+)-/i.exec(ma); return m ? Number(m[1]) : 0; }
function docDsBo() {
  const sh = kho().getSheetByName(TAB_BO);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BO.length).getValues().map(function (r) {
    return {ma: String(r[0]).trim(), ten: String(r[1]).trim(), khoi: Number(r[2]) || khoiBo(String(r[0])), tn: Number(r[3]) || 0, ds: Number(r[4]) || 0, tln: Number(r[5]) || 0,
      ngay: r[6] instanceof Date ? r[6].toISOString() : String(r[6] || '')};
  }).filter(function (x) { return x.ma; });
}
// Doc 1 bo cau thanh du lieu cho tro choi (cache 6 gio, xoa khi nap lai)
function docBoCau(ma) {
  const cache = CacheService.getScriptCache(), k = 'bo_' + ma;
  try { const c = cache.get(k); if (c) return JSON.parse(c); } catch (e) {}
  const sh = kho().getSheetByName(ma);
  if (!sh || sh.getLastRow() < 2) return null;
  const b = docDsBo().filter(function (x) { return x.ma === ma; })[0] || {ten: ma};
  const o = {ma: ma, ten: b.ten, tn: [], ds: [], tln: []};
  sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BOC.length).getValues().forEach(function (r) {
    const cau = String(r[0]).trim(), nd = String(r[1]).trim(); if (!nd) return;
    const phan = (/^(I{1,3})\./i.exec(cau) || [])[1], da = String(r[6]).trim(), hinh = chuanHinh(r[7], ma);
    const chung = {c: cau, q: nd, h: hinh, kt: String(r[8]).trim(), md: String(r[9]).trim()}, gt = String(r[10]).trim();
    if (/^III$/i.test(phan || '')) o.tln.push(Object.assign(chung, {a: Number(da.replace(',', '.')), e: gt}));
    else if (/^II$/i.test(phan || '')) {
      const y = chuanDS(da), e = gt.split('|');
      o.ds.push(Object.assign(chung, {s: [2, 3, 4, 5].map(function (j, i) { return [String(r[j]).trim(), y[i] === 'D', e.length === 4 ? e[i].trim() : '']; }), e: e.length === 4 ? '' : gt}));
    } else o.tn.push(Object.assign(chung, {o: [2, 3, 4, 5].map(function (j) { return String(r[j]).trim(); }), a: 'ABCD'.indexOf(da.toUpperCase()), e: gt}));
  });
  try { cache.put(k, JSON.stringify(o), 21600); } catch (e) {}
  return o;
}
function gvBoCauNap(d) {
  const ds = Array.isArray(d.bo) ? d.bo : [];
  if (!ds.length) return {ok: false, msg: 'Chua co bo cau nao de nap'};
  if (ds.length > 10) return {ok: false, msg: 'Moi lan nap toi da 10 bo'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = kho(), co = docDsBo(), viec = [];
    ds.forEach(function (x) {
      const ma = String(x.ma || '').trim();
      if (!RE_MABO.test(ma)) throw new Error('Ma bo khong hop le: "' + ma + '" (vd TC-H10-C3)');
      if (TAB_CAM.indexOf(khongDau(ma)) >= 0) throw new Error('Ma bo trung ten tab he thong');
      const cu = co.filter(function (b) { return b.ma === ma; })[0];
      if (cu && !x.thay) throw new Error('TRUNG:' + ma);
      if (!cu && ss.getSheetByName(ma)) throw new Error('Kho da co tab ' + ma + ' (khong phai bo cau)');
      const cau = (Array.isArray(x.cau) ? x.cau : []).filter(function (r) { return Array.isArray(r) && String(r[1] || '').trim() !== ''; })
        .map(function (r) { const o = []; for (let j = 0; j < 11; j++) o.push(r[j] === undefined || r[j] === null ? '' : String(r[j])); return o; });
      const dem = {I: 0, II: 0, III: 0};
      cau.forEach(function (r) { const p = (/^(I{1,3})\./i.exec(r[0]) || [])[1]; if (p) dem[p.toUpperCase()]++; });
      if (dem.I < 6 || dem.II < 3 || dem.III < 2) throw new Error('Bo ' + ma + ' chua du so cau toi thieu (6 TN, 3 DS, 2 TLN)');
      if (cau.length > 300) throw new Error('Bo ' + ma + ' qua 300 cau');
      viec.push({ma: ma, ten: String(x.ten || '').trim() || ma, cau: cau, dem: dem, cu: cu});
    });
    let ls = ss.getSheetByName(TAB_BO);
    if (!ls) { ls = ss.insertSheet(TAB_BO); ls.getRange(1, 1, 1, HEAD_BO.length).setValues([HEAD_BO]).setFontWeight('bold'); ls.setFrozenRows(1); }
    viec.forEach(function (v) {
      const sh = ss.getSheetByName(v.ma) || ss.insertSheet(v.ma);
      sh.clear();
      const bang = [HEAD_BOC].concat(v.cau);
      sh.getRange(1, 1, bang.length, HEAD_BOC.length).setNumberFormat('@').setValues(bang);
      sh.getRange(1, 1, 1, HEAD_BOC.length).setFontWeight('bold');
      sh.setFrozenRows(1);
      const hang = [v.ma, v.ten, khoiBo(v.ma), v.dem.I, v.dem.II, v.dem.III, new Date()];
      const vl = ls.getDataRange().getValues();
      let dong = 0;
      for (let i = 1; i < vl.length; i++) if (String(vl[i][0]).trim() === v.ma) { dong = i + 1; break; }
      if (dong) ls.getRange(dong, 1, 1, hang.length).setValues([hang]); else ls.appendRow(hang);
      try { CacheService.getScriptCache().removeAll(['bo_' + v.ma, 'dsbo']); } catch (e) {}
    });
    SpreadsheetApp.flush();
    return {ok: true, xong: viec.map(function (v) { return {ma: v.ma, ten: v.ten, tn: v.dem.I, ds: v.dem.II, tln: v.dem.III}; }), ds: docDsBo()};
  } catch (e) {
    const m = String(e.message || e);
    if (m.indexOf('TRUNG:') === 0) return {ok: false, loi: 'trung', ma: m.slice(6), msg: 'Kho da co bo ' + m.slice(6)};
    return {ok: false, msg: m};
  } finally { lock.releaseLock(); }
}
// GV them mot tro dang khung (file KHUNG-<TEN>.html da co tren GitHub) -> 1 dong moi khoi: <TEN>-K9..K12
const KHOI_KHUNG = [[9, 'KHTN 9'], [10, 'Hóa 10'], [11, 'Hóa 11'], [12, 'Hóa 12']];
function gvTcThemKhung(d) {
  const file = String(d.file || '').trim(), m = /^KHUNG-([A-Z0-9]{2,12})\.html$/.exec(file);
  if (!m) return {ok: false, msg: 'Ten file phai dang KHUNG-TEN.html (chu in hoa, so; vd KHUNG-CHIM.html)'};
  const ten = String(d.ten || '').trim().replace(/\s+–\s+/g, ' - ').slice(0, 60);
  if (!ten) return {ok: false, msg: 'Chua co ten tro choi'};
  const sh = tabTroChoi(), co = docTroChoi(), them = [];
  KHOI_KHUNG.forEach(function (k) {
    const ma = m[1] + '-K' + k[0];
    if (co.some(function (t) { return t.matro === ma; })) return;
    them.push([ma, ten + ' – ' + k[1], 'CA NHAN', k[0], file, 'DONG', 5, lopMacDinh(k[0]), '', '', 'KHONG']);
  });
  if (!them.length) return {ok: false, msg: 'Tro khung ' + file + ' da co'};
  sh.getRange(sh.getLastRow() + 1, 1, them.length, HEAD_TC.length).setValues(them);
  try { CacheService.getScriptCache().remove('tc_ds'); } catch (e) {}
  return {ok: true, them: them.length, tro: docTroChoi()};
}
function gvTcXoaKhung(d) {
  const file = String(d.file || '').trim();
  if (!/^KHUNG-[A-Z0-9]{2,12}\.html$/.test(file)) return {ok: false, msg: 'Ten file khong hop le'};
  if (file === 'KHUNG-F1.html') return {ok: false, msg: 'Khong go khung F1 mac dinh'};
  const ds = docTroChoi().filter(function (t) { return t.khung && t.file === file; });
  if (ds.some(function (t) { return t.mo; })) return {ok: false, msg: 'Dong tat ca cac dong cua tro nay truoc khi go'};
  const sh = tabTroChoi();
  ds.map(function (t) { return t.dong; }).sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
  return {ok: true, tro: docTroChoi()};
}
function gvBoCauXoa(d) {
  const ma = String(d.ma_bo || '').trim();
  if (!RE_MABO.test(ma)) return {ok: false, msg: 'Ma bo khong hop le'};
  if (docTroChoi().some(function (t) { return t.bo === ma && t.mo; })) return {ok: false, msg: 'Bo cau dang duoc dung trong tro choi dang mo'};
  const ss = kho(), ls = ss.getSheetByName(TAB_BO);
  if (ls) { const v = ls.getDataRange().getValues(); for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]).trim() === ma) ls.deleteRow(i + 1); }
  const sh = ss.getSheetByName(ma); if (sh) ss.deleteSheet(sh);
  try { CacheService.getScriptCache().removeAll(['bo_' + ma, 'dsbo']); } catch (e) {}
  return {ok: true, ds: docDsBo()};
}
// Danh sach may dang dung o vach xuat phat (cache cua so lop nay, moi may gui ten nhom/hoc sinh khi hoi trang thai)
const VACH_HAN = 15000;   // may khong hoi trong 15 giay thi coi nhu da roi vach
// Moi may 1 o cache rieng (khong khoa) + 1 danh sach may (chi khoa khi may moi vao lan dau)
function ghiVach(matro, d) {
  const may = String(d.may || '').trim().slice(0, 40);
  if (!may) return;
  const cache = CacheService.getScriptCache(), bay = Date.now();
  cache.put('vach_' + matro + '|' + may, JSON.stringify({ten: String(d.ten || '').trim().slice(0, 60) || 'Không tên', lop: String(d.lop || '').trim().slice(0, 12), t: bay, mahs: String(d.mahs || '').trim().slice(0, 8)}), 3600);
  let ds = [];
  try { ds = JSON.parse(cache.get('vachds_' + matro) || '[]'); } catch (e) {}
  if (ds.indexOf(may) >= 0) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    try { ds = JSON.parse(cache.get('vachds_' + matro) || '[]'); } catch (e) { ds = []; }
    if (ds.indexOf(may) < 0) { ds.push(may); if (ds.length > 200) ds = ds.slice(-200); cache.put('vachds_' + matro, JSON.stringify(ds), 3600); }
  } finally { lock.releaseLock(); }
}
function docVach(matro) {
  const cache = CacheService.getScriptCache(), kq = {};
  let ds = [];
  try { ds = JSON.parse(cache.get('vachds_' + matro) || '[]'); } catch (e) {}
  if (ds.length) {
    const v = cache.getAll(ds.map(function (m) { return 'vach_' + matro + '|' + m; }));
    ds.forEach(function (m) { const x = v['vach_' + matro + '|' + m]; if (x) try { kq[m] = JSON.parse(x); } catch (e) {} });
  }
  return kq;
}
function xoaVach(matro) { try { CacheService.getScriptCache().remove('vachds_' + matro); } catch (e) {} }
// Trang thai tung hoc sinh trong tro ca nhan (so do lop): moi em 1 o cache rieng, khong khoa
function ghiCaNhan(matro, mahs, them) {
  mahs = String(mahs || '').trim();
  if (!matro || !/^\d{8}$/.test(mahs)) return;
  const cache = CacheService.getScriptCache(), k = 'tdcn_' + matro + '|' + mahs;
  let o = {};
  try { o = JSON.parse(cache.get(k) || '{}'); } catch (e) {}
  cache.put(k, JSON.stringify(Object.assign(o, them, {t: Date.now()})), 21600);
}
function docCaNhan(matro, dsMa) {
  const cache = CacheService.getScriptCache(), kq = {};
  for (let i = 0; i < dsMa.length; i += 100) {
    const v = cache.getAll(dsMa.slice(i, i + 100).map(function (m) { return 'tdcn_' + matro + '|' + m; }));
    Object.keys(v).forEach(function (k) { try { kq[k.split('|')[1]] = JSON.parse(v[k]); } catch (e) {} });
  }
  return kq;
}
function tcTienDo(d) {
  if (!d.nhom && d.mahs) {   // tro ca nhan
    ghiCaNhan(String(d.matro || '').trim(), d.mahs, {diem: Math.max(0, Math.min(100, Number(d.diem) || 0)), xong: Number(d.xong) || 0, ket: d.ket === true, maluot: String(d.maluot || '').slice(0, 40)});
    return {ok: true};
  }
  const ma = String(d.matro || '').trim(), nhom = chuanNhom(d.nhom);
  if (!ma || !nhom) return {ok: false, msg: 'Thieu tro hoac nhom'};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return {ok: false, msg: 'Ban'};
  try {
    const cache = CacheService.getScriptCache(), k = 'td_' + ma;
    let ds = {};
    try { ds = JSON.parse(cache.get(k) || '{}'); } catch (e) {}
    ds[nhom] = {nhom: nhom, maluot: String(d.maluot || '').slice(0, 40), diem: Math.max(0, Math.min(100, Number(d.diem) || 0)),
      xong: Number(d.xong) || 0, ket: d.ket === true, t: Date.now()};
    cache.put(k, JSON.stringify(ds), 21600);
  } finally { lock.releaseLock(); }
  return {ok: true};
}
function gvTcTienDo(d) {
  let ds = {};
  try { ds = JSON.parse(CacheService.getScriptCache().get('td_' + String(d.matro || '').trim()) || '{}'); } catch (e) {}
  return {ok: true, lop: lopNay(), ds: Object.keys(ds).map(function (k) { return ds[k]; }), bayGio: Date.now()};
}
// So do lop cho tro ca nhan: tung em chua vao / da vao (o vach) / dang choi (cau, diem) / xong (diem cao nhat hom nay)
function gvTcSoDo(d) {
  const ma = String(d.matro || '').trim(), bay = Date.now(), cache = CacheService.getScriptCache();
  const r = gvSoDo({});
  if (!r.ok) return r;
  const cn = docCaNhan(ma, r.ds.map(function (h) { return String(h[0]); })), vach = docVach(ma);
  const tz = Session.getScriptTimeZone(), homNay = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'), tt = {}, kq = {};
  gvTcKetQua({matro: ma}).canhan.forEach(function (x) {
    if (!x[0] || Utilities.formatDate(new Date(x[0]), tz, 'yyyy-MM-dd') !== homNay) return;
    const m = x[2], dm = x[6] !== null && x[6] !== undefined ? Number(x[6]) : null, o = kq[m] || (kq[m] = {n: 0, diem: null, t: 0});
    o.n++; if (dm !== null && (o.diem === null || dm > o.diem)) o.diem = dm; if (x[0] > o.t) o.t = x[0];
  });
  r.ds.forEach(function (h) {
    const m = h[0], c = cn[m], k = kq[m];
    let o = {tt: 'chua'};
    if (c && c.vao && bay - c.t < 3 * 3600 * 1000) o = {tt: 'vao'};
    if (c && !c.ket && c.xong > 0 && bay - c.t < 120000) o = {tt: 'choi', cau: c.xong, diem: c.diem};
    if (k && (!c || c.ket || !(c.xong > 0) || k.t >= c.t - 5000 || bay - c.t >= 120000)) o = {tt: 'xong', diem: k.diem, luot: k.n};
    if (k && o.tt === 'choi') o.luot = k.n, o.diemCu = k.diem;
    tt[m] = o;
  });
  Object.keys(vach).forEach(function (may) { const v = vach[may]; if (v.mahs && bay - v.t <= VACH_HAN && tt[v.mahs] && tt[v.mahs].tt !== 'choi') tt[v.mahs] = Object.assign(tt[v.mahs], {vach: true}); });
  r.tt = tt; r.bayGio = bay;
  return r;
}
function gvTcVach(d) {
  const ma = String(d.matro || '').trim(), bay = Date.now();
  const ds = docVach(ma);
  return {ok: true, lop: lopNay(), ds: Object.keys(ds).map(function (m) { return ds[m]; })
    .filter(function (x) { return bay - x.t <= VACH_HAN; }).map(function (x) { return {ten: x.ten, lop: x.lop}; })};
}
// May o vach xuat phat hoi trang thai (cache 2 giay de do tai khi ca lop cung hoi)
function tcTrangThai(d) {
  const ma = String(d.matro || '').trim() || 'khung_' + String(d.khung || '').trim();
  const cache = CacheService.getScriptCache();
  let r = null;
  const daCo = cache.get('tctt_' + ma);
  if (daCo) r = JSON.parse(daCo);
  else {
    const t = timTro(d);
    r = t ? Object.assign({ok: true, tt: t.tt, xp: t.xp, phut: t.phut}, thongTinKhung(t)) : {ok: true, tt: 'DONG', xp: 0, phut: 5};
    try { cache.put('tctt_' + ma, JSON.stringify(r), 2); } catch (e) {}
  }
  if (r.tt === 'CHO' && !r.xp) ghiVach(r.matro || ma, d);
  r.bayGio = Date.now();
  return r;
}
function tcMoKhoa(d) {
  const ok = String(d.ma || '').trim() !== '' && String(d.ma || '').trim() === docMaNhanh().tcmokhoa;
  if (!ok) bmSaiMoKhoa(d, 'trò chơi');
  return {ok: ok};
}
function gvTroChoi() {
  const m = docMa();
  return {ok: true, lop: lopNay(), tro: docTroChoi(), boCau: docDsBo(), coMaTc: m.coTc, coMaTcMk: m.coTcMk, bayGio: Date.now()};
}
function gvTcDat(d) {
  const sh = tabTroChoi();
  const t = docTroChoi().filter(function (x) { return x.matro === String(d.matro || '').trim(); })[0];
  if (!t) return {ok: false, msg: 'Khong tim thay tro ' + d.matro};
  if (d.truong === 'tt') {
    const g = d.giatri === true ? 'MO' : ['MO', 'CHO', 'DONG'].indexOf(String(d.giatri)) >= 0 ? String(d.giatri) : 'DONG';
    if (t.khung && g !== 'DONG' && !t.bo) return {ok: false, msg: 'Chon bo cau hoi truoc khi mo tro choi'};
    sh.getRange(t.dong, 6).setValue(g);
    sh.getRange(t.dong, 9).setValue('');            // doi trang thai = bat dau luot moi, xoa gio xuat phat cu
    xoaVach(t.matro);
  } else if (d.truong === 'xuatphat') {
    if (t.tt !== 'CHO') return {ok: false, msg: 'Chuyen tro sang Cho xuat phat truoc'};
    if (t.xp) return {ok: false, msg: 'Cuoc dua dang dien ra'};
    sh.getRange(t.dong, 9).setValue(Date.now() + XP_TRE);
  } else if (d.truong === 'phut') {
    const ph = Math.round(Number(d.giatri));
    if (!(ph >= 1 && ph <= 60)) return {ok: false, msg: 'Thoi gian phai tu 1 den 60 phut'};
    sh.getRange(t.dong, 7).setValue(ph);
  } else if (d.truong === 'lop') sh.getRange(t.dong, 8).setValue(chuanDsLop(d.giatri));
  else if (d.truong === 'xemlai') sh.getRange(t.dong, 11).setValue(d.giatri ? 'CO' : 'KHONG');
  else if (d.truong === 'bo') {
    if (!t.khung) return {ok: false, msg: 'Tro nay khong dung bo cau'};
    const ma = String(d.giatri || '').trim(), b = docDsBo().filter(function (x) { return x.ma === ma; })[0];
    if (ma && !b) return {ok: false, msg: 'Khong co bo cau ' + ma};
    if (b && String(b.khoi) !== String(t.khoi) && !/DEMO/.test(khongDau(lopNay()))) return {ok: false, msg: 'Bo cau ' + ma + ' khong thuoc khoi ' + t.khoi};
    if (t.xp) return {ok: false, msg: 'Cuoc dua dang dien ra'};
    sh.getRange(t.dong, 10).setValue(ma);
  } else if (d.truong === 'kieu') {
    if (!t.khung) return {ok: false, msg: 'Tro nay co kieu choi co dinh'};
    if (t.mo) return {ok: false, msg: 'Dong tro truoc khi doi ca nhan / nhom'};
    sh.getRange(t.dong, 3).setValue(d.giatri === 'NHOM' ? 'NHOM' : 'CA NHAN');
  }
  else return {ok: false, msg: 'Truong khong hop le'};
  SpreadsheetApp.flush();
  try { CacheService.getScriptCache().removeAll(['tctt_' + t.matro, 'tcds']); } catch (e) {}
  return gvTroChoi();
}
// Ket qua tro choi cua lop nay: ca nhan (HOAT DONG) va nhom (TRO CHOI NHOM)
function gvTcKetQua(d) {
  const ss = SpreadsheetApp.getActive();
  const loc = String(d.matro || '').trim();
  function tg(v) { return v instanceof Date ? v.getTime() : (v ? new Date(v).getTime() || 0 : 0); }
  const canhan = [], nhom = [];
  const hd = ss.getSheetByName(TAB_HD);
  if (hd && hd.getLastRow() > 1) boGV(hd.getRange(2, 1, hd.getLastRow() - 1, HEAD_HD.length).getValues(), 2).forEach(function (r) {
    const mt = String(r[1]).trim();
    if (!mt || (loc && mt !== loc && mt.indexOf(loc + ':') !== 0)) return;
    canhan.push([tg(r[0]), mt, String(r[2]).trim(), String(r[3]).trim(), docDS(r[6]), Number(r[7]) || 0, mt.indexOf(':') > 0 && r[5] !== '' ? Number(String(r[5]).replace(',', '.')) : null, '']);
  });
  // Luot tro khung co chi tiet (tab KQ TRO CHOI): ca nhan them vao canhan; nhom da co o TRO CHOI NHOM, chi gui chi tiet
  const luot = {}, boCan = {};
  docKQTro().forEach(function (x) {
    if (loc && x.matro !== loc && x.matro.indexOf(loc + ':') !== 0) return;
    if (x.kieu !== 'NHOM') canhan.push([x.t, x.matro, x.mahs, x.hoten, x.ds, x.giay, x.diem, x.ml]);
    if (x.ml) luot[x.ml] = {ct: x.ct, tv: x.tv, bo: x.bo, lydo: x.lydo};
    if (x.bo) boCan[x.bo] = 1;
  });
  const cn = ss.getSheetByName(TAB_CN);
  if (cn && cn.getLastRow() > 1) cn.getRange(2, 1, cn.getLastRow() - 1, HEAD_CN.length).getValues().forEach(function (r) {
    const mt = String(r[1]).trim();
    if (!mt || (loc && mt !== loc && mt.indexOf(loc + ':') !== 0)) return;
    nhom.push([tg(r[0]), mt, String(r[3]).trim(), docDS(r[5]), Number(r[6]) || 0, Number(String(r[4]).replace(',', '.')) || 0, String(r[7] || '')]);   // + diem, ma luot
  });
  // Thanh vien tung nhom (ten hoc sinh) + si so lop
  const ten = {}, tv = {}, m = docNhom();
  const ds = ss.getSheetByName(TAB_DS);
  let siSo = 0;
  if (ds && ds.getLastRow() > 1) ds.getRange(2, 1, ds.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (String(r[0]).trim()) { siSo++; ten[String(r[0]).trim()] = String(r[1]).trim(); }
  });
  Object.keys(m).forEach(function (ma) { (tv[m[ma]] = tv[m[ma]] || []).push(ten[ma] || ma); });
  const bo = {};
  if (d.chitiet) Object.keys(boCan).forEach(function (m) { try { const b = docBoCau(m); if (b) bo[m] = b; } catch (e) {} });
  return {ok: true, lop: lopNay(), siSo: siSo, canhan: canhan, nhom: nhom, thanhvien: tv, luot: d.chitiet ? luot : {}, bo: bo, ten: ten};
}
// Cac ma trong tab MA (chi giao vien da dang nhap bang ma quan ly moi doc / doi duoc)
const MA_TEN = ['MaGV', 'MaMoKhoa', 'MaLamLai', 'MaQuanLy', 'MaTroChoi', 'MaMoKhoaTroChoi', 'MaXemGV'];
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
    try { CacheService.getScriptCache().remove('ma_nhanh'); } catch (e) {}
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
  if (!dungMaXem(hs, d)) return null;
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
      if (madot.indexOf('TC#') === 0) {
        const b = baiTroHS(ma).filter(function (y) { return y.madot === madot; })[0], q2 = b && b.cau.filter(function (c) { return c.cau === cau; })[0];
        if (q2) out[k] = {ten: b.ten, cau: cau, loai: q2.loai, hoi: boThe(q2.hoi), pa: ['A', 'B', 'C', 'D'].map(function (x) { return q2.pa[x] ? x + '. ' + boThe(q2.pa[x]) : ''; }).filter(String),
          dapan: String(q2.dapan), chon: String(q2.chon || ''), dung: !!q2.dung};
        return;
      }
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
function docCauHinh() { return nho('ch', docCauHinhGoc); }
function docCauHinhGoc() {
  const v = kho().getSheetByName('CAU HINH').getDataRange().getValues();
  v.shift();
  return v.filter(function (r) { return String(r[0]).trim() !== ''; }).map(function (r) {
    return {
      madot: String(r[0]).trim(), ten: String(r[1] || r[0]).trim(), phut: Number(r[2]) || 15,
      tt: ['MO', 'CHO'].indexOf(khongDau(r[3])) >= 0 ? khongDau(r[3]) : 'DONG',
      mo: khongDau(r[3]) === 'MO', cho: khongDau(r[3]) === 'CHO', xemlai: khongDau(r[4]) === 'CO',
      lop: khongDau(r[5]) || 'TAT CA',
      batdauluc: r[6] instanceof Date ? r[6].getTime() : 0,
      ca: String(r[7] || '').trim(),
      // Cot I Kieu = GIAY: de in giay (khong lam tren iPad); cot J ThangDS: thang cau dung/sai rieng cua de
      giay: khongDau(r[8]) === 'GIAY', thang: docThang(r[9])
    };
  });
}
function timDot(madot) {
  return docCauHinh().filter(function (c) { return c.madot === String(madot || '').trim(); })[0] || null;
}
// So khop ten lop: khong phan biet dau, chu "Lop", dau cach, so 0 thua (10E1 = 10E01); ngan cach , ; /
function maLop(s) { return khongDau(s).replace(/\s+/g, '').replace(/^LOP/, '').replace(/([A-Z])0+(\d)/g, '$1$2'); }
function hopLop(c) {
  const ds = String(c.lop || '').split(/[,;/]+/).map(maLop).filter(String);
  if (!ds.length || ds.indexOf('TATCA') >= 0) return true;
  return ds.indexOf(maLop(lopNay())) >= 0;
}
// Tab MA: cot A ten ma, cot B gia tri (MaGV, MaMoKhoa, MaLamLai)
function docMa() {
  const m = {};
  // ten ma khong phan biet hoa/thuong, dau cach (MaQuanLy = maquanly = Ma Quan Ly)
  kho().getSheetByName('MA').getDataRange().getValues().forEach(function (r) { m[khongDau(r[0]).replace(/\s+/g, '')] = String(r[1]).trim(); });
  return {gv: m['MAGV'] || '', mokhoa: m['MAMOKHOA'] || '', lamlai: m['MALAMLAI'] || '', quanly: m['MAQUANLY'] || '',
    // Ma rieng cho tro choi; chua dat thi tam dung ma kiem tra
    tcvao: m['MATROCHOI'] || m['MAGV'] || '', tcmokhoa: m['MAMOKHOATROCHOI'] || m['MAMOKHOA'] || '',
    coTc: !!m['MATROCHOI'], coTcMk: !!m['MAMOKHOATROCHOI'], xemgv: m['MAXEMGV'] || ''};
}
// Tab <MaDot>: Cau | NoiDung | A | B | C | D | DapAn | Hinh | Loai (TN/DS/TLN) | Diem
//   TN : trac nghiem 4 phuong an, DapAn = A/B/C/D
//   DS : dung/sai, A-D la 4 y a)-d), DapAn = 4 chu D/S (vd DDSD)
//   TLN: tra loi ngan, DapAn = so/chu (18,36 = 18.36); nhieu cach dung ngan bang ; (phi kim; la phi kim)
//   Diem: diem toi da cua cau (de trong: TN 0,25 · DS 1 · TLN 0,25). Tong diem duoc quy ve thang 10.
// Cot Hinh chi ghi ten file ("image2.png" hoac "hinh/<ma>/image2.png") -> doi thanh duong dan web day du
function chuanHinh(h, madot) {
  h = String(h || '').trim();
  if (h === '-' || !h || /^https?:\/\//i.test(h) || /^<svg/i.test(h)) return h === '-' ? '' : h;
  const m = /^(?:\.?\/)?(?:hinh\/([A-Za-z0-9_.\-]+)\/)?([A-Za-z0-9_.\-]+\.(?:png|jpe?g|gif|webp|svg))$/i.exec(h);
  if (!m) return h;
  return urlHinhDe({repo: GH_REPO_MAC_DINH}, m[1] || String(madot).trim(), m[2]);
}
let CH_NHO = null;   // CAU HINH doc 1 lan moi luot chay
function chNho(madot) { if (!CH_NHO) { CH_NHO = {}; try { docCauHinh().forEach(function (c) { CH_NHO[c.madot] = c; }); } catch (e) {} } return CH_NHO[String(madot || '').trim()] || null; }
// Ghi nho trong 1 lan chay (hsLuyen/gvLuyen goi hsKienThuc nhieu lan): MEMO = {} thi doc 1 lan
let MEMO = null;
function nho(k, f) { if (!MEMO) return f(); if (!(k in MEMO)) MEMO[k] = f(); return MEMO[k]; }
function docDe(madot) { return nho('de|' + madot, function () { return docDeGoc(madot); }); }
function docDeGoc(madot) {
  const sh = kho().getSheetByName(String(madot || '').trim());
  if (!sh) throw new Error('Kho de chua co tab ' + madot);
  const v = sh.getDataRange().getValues();
  v.shift();
  // De giay: thang Dung/Sai rieng cua de, diem giu nguyen (khong quy ve 10)
  const c = chNho(madot), thang = c && c.thang ? mangThang(c.thang) : null;
  const de = docDe0(v, madot, thang);
  if (c && c.giay) de.giay = true;
  return de;
}
function docDe0(v, madot, thang) {
  return v.filter(function (r) { return String(r[1]).trim() !== ''; }).map(function (r, i) {
    const loai = ['DS', 'TLN'].indexOf(khongDau(r[8])) >= 0 ? khongDau(r[8]) : 'TN';
    let da = String(r[6]).trim();
    if (loai === 'TN') da = da.toUpperCase();
    if (loai === 'DS' && da !== '*') da = chuanDS(da);
    return {
      cau: String(r[0]).trim() || String(i + 1), hoi: String(r[1]), loai: loai,
      pa: {A: String(r[2]), B: String(r[3]), C: String(r[4]), D: String(r[5])},
      da: da, hinh: chuanHinh(r[7], madot), khongHinh: String(r[7] || '').trim() === '-',
      w: Number(String(r[9]).replace(',', '.')) || (loai === 'DS' ? 1 : 0.25),
      goc: String(r[10] === undefined ? '' : r[10]).trim(), thang: loai === 'DS' && thang ? thang : undefined
    };
  });
}
// ---------------------------------------------------------------------
// Cham diem theo loai cau (thang diem cua Bo: DS dung 1/2/3/4 y = 0,1/0,25/0,5/1)
// ---------------------------------------------------------------------
const THANG_DS = [0, 0.1, 0.25, 0.5, 1];
// Thang cau dung/sai theo tung de (cot ThangDS cua CAU HINH): K12 = thang Bo; K10 = 0.2/0.4/0.7/1; hoac 4 so "0.2;0.4;0.7;1" (ti le cua diem cau)
const THANG_MAU = {K12: [0, 0.1, 0.25, 0.5, 1], K10: [0, 0.2, 0.4, 0.7, 1]};
function docThang(v) {
  const s = khongDau(v).replace(/\s+/g, '');
  if (!s) return '';
  if (THANG_MAU[s]) return s;
  const so = String(v).split(/[;\/|]+/).map(function (x) { return Number(String(x).trim().replace(',', '.')); });
  return so.length === 4 && so.every(function (x) { return x >= 0 && x <= 1; }) ? so.join(';') : '';
}
function mangThang(t) { return !t ? THANG_DS : THANG_MAU[t] || [0].concat(String(t).split(';').map(Number)); }
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
  if (q.da === '*') return {chon: q.loai === 'DS' && x ? chuanDS(x) : x.toUpperCase(), dung: true, soY: q.loai === 'DS' ? 4 : 1, diemCau: q.w};
  if (q.loai === 'DS') {
    x = x ? chuanDS(x) : '';
    let soY = 0;
    for (let k = 0; k < 4; k++) if (x[k] && x[k] === q.da[k]) soY++;
    return {chon: x.replace(/-+$/, '') ? x : '', dung: soY === 4, soY: soY, diemCau: (q.thang || THANG_DS)[soY] * q.w};
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
  const ok = x !== '' && (x === q.da || (q.da.length > 1 && q.da.split(/[;\/]/).indexOf(x) >= 0));
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
  // De giay: giu nguyen tong diem cac cau (thay cong diem tu luan sau); de iPad: quy ve thang 10
  if (de.giay) return {ct: ct, dung: dung, diem: Math.round(tongDiem * 100) / 100, tongW: Math.round(tongW * 100) / 100};
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
    if (String(rows[i][0]).trim() === ma) {
      let mx = String(rows[i][3]).trim(), ten = String(rows[i][1]).trim();
      if (ma.slice(0, 6) !== tienToLop()) { const t = tkMap()[ma]; if (t && t.mx) mx = t.mx; if (t && !ten && t.ten) ten = t.ten; }   // em hoc lop phu: mat khau (+ ten) theo lop chinh
      return {ten: ten, maxem: mx};
    }
  }
  if (laGV(ma) && ma.slice(0, 6) === tienToLop()) return {ten: 'GV', maxem: mxGV(), gv: true};   // tai khoan GV dong vai HS (khong nam trong DANHSACH)
  return null;
}
// ---------------------------------------------------------------------
// TAI KHOAN GV DONG VAI HS: moi lop co SBD <tien to lop>00, ten GV, ma xem 0000 – chi mo duoc tren may da dang nhap trang GV.
// Khong co trong DANHSACH (khong vao si so); bai/diem/tro choi/luyen tap cua SBD nay bi an khoi moi thong ke tren trang GV (AN_GV).
// ---------------------------------------------------------------------
var AN_GV = false;
function mxGV() { let m = ''; try { m = docMaNhanh().xemgv; } catch (e) {} return m || '0000'; }   // kho tab MA dong MaXemGV (dat o Cai dat → Ma); chua dat = 0000
function laGV(ma) { return /^\d{6}00$/.test(String(ma == null ? '' : ma).replace(/^'/, '').trim()); }
function boGV(v, c) { return AN_GV ? v.filter(function (r) { return !laGV(r[c]); }) : v; }
// ---------------------------------------------------------------------
// TAI KHOAN CHUNG: 1 SBD + 1 mat khau cho em hoc nhieu lop (VD 12G01 + 12CLB + 12AFTER).
// Lop chinh = lop co tien to SBD trung voi SBD cua em; cac lop phu ghi cung SBD do trong DANHSACH.
// Kho tab TAI KHOAN: MaHS | MaXem (cua lop chinh) | LopChinh | CacLop | CapNhat — moi so dong bo khi GV mo trang (toi da 30 phut/lan).
// ---------------------------------------------------------------------
const TAB_TK = 'TAI KHOAN', HEAD_TK = ['MaHS', 'MaXem', 'LopChinh', 'CacLop', 'CapNhat', 'HoTen'];
function tienToLop() {
  const c = CacheService.getScriptCache(); let t = c.get('tiento'); if (t !== null) return t;
  // Trang GV gui kem tien to cua lop (cau-hinh-lop.js) → chinh xac ca khi lop phu toan HS lop khac (VD 12AFTER)
  t = PropertiesService.getScriptProperties().getProperty('tiento_gv') || '';
  if (t) { c.put('tiento', t, 21600); return t; }
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_DS), dem = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { const m = String(r[0]).trim(); if (/^\d{8}$/.test(m)) dem[m.slice(0, 6)] = (dem[m.slice(0, 6)] || 0) + 1; });
  t = Object.keys(dem).sort(function (a, b) { return dem[b] - dem[a]; })[0] || '';
  c.put('tiento', t, 21600); return t;
}
var TK_NHO = null;
function tkMap() {
  if (TK_NHO) return TK_NHO;
  const c = CacheService.getScriptCache(), s = c.get('tk_map');
  if (s) { try { return TK_NHO = JSON.parse(s); } catch (e) {} }
  const m = {}, sh = kho().getSheetByName(TAB_TK);
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(function (r) { const ma = String(r[0]).trim(); if (ma) m[ma] = {mx: String(r[1]).trim(), lc: String(r[2]).trim(), cl: String(r[3]).split(',').map(function (x) { return x.trim(); }).filter(String), ten: String(r[5] || '').trim()}; });
  try { c.put('tk_map', JSON.stringify(m), 300); } catch (e) {}
  return TK_NHO = m;
}
function dongBoTK(ep) {
  const P = PropertiesService.getScriptProperties();
  if (P.getProperty('tk_ver') !== '2') { P.setProperty('tk_ver', '2'); ep = true; }   // ban moi (them HoTen): dong bo ngay
  if (!ep && Date.now() - Number(P.getProperty(P.getProperty('tk_thieu') ? 'tk_luc_thieu' : 'tk_luc') || 0) < (P.getProperty('tk_thieu') ? 3 : 30) * 60000) return 0;
  P.setProperty('tk_luc', String(Date.now())); P.setProperty('tk_luc_thieu', String(Date.now()));
  const ss = SpreadsheetApp.getActive(), ds = ss.getSheetByName(TAB_DS); if (!ds || ds.getLastRow() < 2) return 0;
  const lop = lopNay(), tt = tienToLop(), sh = tabKho(TAB_TK, HEAD_TK);
  if (sh.getRange(1, 6).getValue() !== 'HoTen') sh.getRange(1, 6).setValue('HoTen').setFontWeight('bold');
  const n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 6).getValues() : [], vt = {};
  v.forEach(function (r, i) { vt[String(r[0]).trim()] = i; });
  const dsR = ds.getRange(2, 1, ds.getLastRow() - 1, 4), dsV = dsR.getValues(), them = [];
  let doiDS = false, doiTen = false, doiKho = false, thieu = 0;
  dsV.forEach(function (r) {
    const ma = String(r[0]).trim(); if (!/^\d{8}$/.test(ma) || laGV(ma)) return;
    const mx = String(r[3]).trim(), ten = String(r[1]).trim(), chinh = !!tt && ma.slice(0, 6) === tt;
    let i = vt[ma];
    if (i === undefined) { them.push([ma, mx, chinh ? lop : '', lop, new Date(), chinh ? ten : '']); vt[ma] = -1; if (!chinh && (!ten || !mx)) thieu++; return; }
    if (i < 0) return;
    const x = v[i], cl = String(x[3]).split(',').map(function (z) { return z.trim(); }).filter(String);
    if (cl.indexOf(lop) < 0) { cl.push(lop); x[3] = cl.join(','); doiKho = true; }
    if (chinh) {
      if ((mx && String(x[1]).trim() !== mx) || String(x[2]).trim() !== lop || (ten && String(x[5] || '').trim() !== ten)) { if (mx) x[1] = mx; x[2] = lop; if (ten) x[5] = ten; doiKho = true; }
      if (!mx && String(x[1]).trim()) { r[3] = String(x[1]).trim(); doiDS = true; }
    } else {
      // lop phu: chep mat khau + ho ten cua lop chinh sang DANHSACH
      if (String(x[1]).trim() && String(x[1]).trim() !== mx) { r[3] = String(x[1]).trim(); doiDS = true; }
      else if (!String(x[1]).trim() && mx && !String(x[2]).trim()) { x[1] = mx; doiKho = true; }
      if (!ten && String(x[5] || '').trim()) { r[1] = String(x[5]).trim(); doiTen = true; }
      if (!String(r[1]).trim() || !String(r[3]).trim()) thieu++;
    }
  });
  if (doiKho) sh.getRange(2, 1, v.length, 6).setNumberFormat('@').setValues(v);
  if (them.length) { const r0 = sh.getLastRow() + 1; sh.getRange(r0, 1, them.length, 6).setNumberFormat('@'); sh.getRange(r0, 1, them.length, 6).setValues(them); }
  if (doiDS) ds.getRange(2, 4, dsV.length, 1).setNumberFormat('@').setValues(dsV.map(function (r) { return [r[3]]; }));
  if (doiTen) ds.getRange(2, 2, dsV.length, 1).setValues(dsV.map(function (r) { return [r[1]]; }));
  if (thieu) P.setProperty('tk_thieu', '1'); else P.deleteProperty('tk_thieu');   // con em chua co ten/mat khau: thu lai sau 3 phut
  CacheService.getScriptCache().remove('tk_map'); TK_NHO = null;
  return them.length + (doiKho ? 1 : 0);
}
// Hoc sinh xem danh gia kien thuc cua minh: moi dot da lam (khong can GV mo xem lai, khong lo dap an).
// Ca thi nhieu ma de gop 1 dot. Tra ve tung kien thuc: so diem dung/so cau, cac cau sai.
function hsKienThuc(d) {
  const ma = String(d.mahs || '').trim();
  const hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const kt = docKienThuc(), theo = {}, dot = [];
  docCauHinh().forEach(function (c) {
    if (!hopLop(c)) return;
    const bai = timBaiDaNop(c.madot, ma);
    if (!bai) return;
    let de; try { de = docDe(c.madot); } catch (e) { return; }
    const chon = tachChiTiet(bai.chitiet), kq = chamBai(de, function (q, i) { return chon[i]; });
    const k = c.ca || c.madot;
    let g = theo[k];
    if (!g) { g = theo[k] = {madot: k, ma: [], ten: c.ten, luc: bai.luc, diem: bai.diem, xem: {}, kt: {}}; dot.push(g); }
    g.ma.push(c.madot);
    if (c.xemlai) g.xem[c.madot] = 1;
    if (bai.luc && (!g.luc || bai.luc < g.luc)) g.luc = bai.luc;
    kq.ct.forEach(function (r) {
      const x = kt[c.madot + '|' + r.cau]; if (!x || !x.kt) return;
      const v = r.loai === 'DS' ? r.soY / 4 : (r.dung ? 1 : 0);
      const o = g.kt[x.kt] = g.kt[x.kt] || {d: 0, n: 0, md: x.md || '', sai: []};
      o.d += v; o.n++;
      if (v < 1) o.sai.push({madot: c.madot, cau: r.cau});
    });
  });
  const layBo = boDem();
  let choXemTro = null;
  luotCuaHS(ma).forEach(function (x) {
    const ct = chamLuot(x, layBo); if (!ct) return;
    const k = 'TC:' + x.bo + ':' + ngayKhoa(x.t), luc = x.t ? new Date(x.t).toISOString() : '';
    let g = theo[k];
    if (!g) { g = theo[k] = {madot: k, ma: [], ten: '🎮 ' + tenTroGon(x), luc: luc, diem: x.diem, xem: {}, kt: {}, tro: true, _d: [0, 0]}; dot.push(g); }
    const id = 'TC#' + x.ml;
    if (choXemTro === null) { choXemTro = {}; try { docTroChoi().forEach(function (t) { if (t.xemlai) choXemTro[t.matro] = 1; }); } catch (e) {} }
    g.ma.push(id); if (choXemTro[String(x.matro).split(':')[0]]) g.xem[id] = 1; g._d[0] += x.diem; g._d[1]++; g.diem = Math.round(g._d[0] / g._d[1] * 100) / 100;
    if (luc && (!g.luc || luc < g.luc)) g.luc = luc;
    ct.forEach(function (c) {
      if (c.v === null || !c.kt) return;
      const o = g.kt[c.kt] = g.kt[c.kt] || {d: 0, n: 0, md: c.md || '', sai: []};
      o.d += c.v; o.n++;
      if (c.v < 1) o.sai.push({madot: id, cau: c.cau, ma: c.ma});
    });
  });
  dot.forEach(function (g) {
    delete g._d;
    g.ten = String(g.ten).replace(/\s*[–-]\s*Mã\s*[\w-]+\s*$/i, '');
    g.kt = Object.keys(g.kt).map(function (t) { const o = g.kt[t]; return {kt: t, d: Math.round(o.d * 100) / 100, n: o.n, md: o.md, sai: o.sai}; });
  });
  dot.sort(function (a, b) { return (a.luc || '') < (b.luc || '') ? -1 : 1; });
  return {ok: true, dot: dot};
}
// ---------------------------------------------------------------------
// LUYEN LAI PHAN YEU (M3): HS tao bai luyen 10 cau theo kien thuc em lam dung < 65%
//  Nguon cau (khong lo de dang mo): (1) cau em da sai (tron lai phuong an), (2) cau cung kien thuc o de cung khoi
//  dang DONG/da cho xem lai, (3) bo cau tro choi cung khoi, (4) cau bo sung GV da duyet (tab LUYEN THEM trong kho, AI soan)
//  Khong tinh diem; moi luot ghi tab LUYEN TAP (so lop) de GV xem tien bo truoc -> sau.
// ---------------------------------------------------------------------
const TAB_LT = 'LUYEN TAP';
const HEAD_LT = ['ThoiGian', 'MaHS', 'PhamVi', 'SoCau', 'SoDung', 'KienThuc', 'ChiTiet'];
const TAB_LTT = 'LUYEN THEM';
const HEAD_LTT = ['Khoi', 'KienThuc', 'MucDo', 'Loai', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'LoiGiai', 'TrangThai', 'Nguon', 'Ngay', 'Ma'];
const LUYEN_SO_CAU = 10, LUYEN_NGUONG = 0.65;
function khoiMaDe(madot) { const m = /^[A-Za-z]*?(\d+)-/.exec(String(madot)); return m ? Number(m[1]) : 0; }
function khoiLop() { const m = /^(\d+)/.exec(lopNay()); return m ? Number(m[1]) : 0; }
function chuKT(s) { return khongDau(s).replace(/[^A-Z0-9]+/g, ' ').trim(); }
function tron(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Doi chu cai phuong an trong loi giai theo thu tu moi (vd "Chọn B" -> "Chọn D")
function doiChuGT(gt, map) {
  if (!gt) return gt;
  return String(gt)
    .replace(/(chọn|đáp án|phương án|phuong an|dap an|chon)(\s*:?\s*)([ABCD])\b/gi, function (m, a, b, c) { return a + b + (map[c.toUpperCase()] || c); })
    .replace(/(^|\n|<br\s*\/?>|\.\s)\s*([ABCD])(\s*[.:)]|\s+(?:đúng|sai|Đúng|Sai|là))/g, function (m, a, c, d) { return a + (map[c] || c) + d; });
}
// Cau luyen thong nhat: {nguon, loai, hoi, pa, da, hinh, gt, kt, md}
function cauLuyenTuDe(q, madot, kt, gtM) {
  const k = kt[madot + '|' + q.cau] || {};
  return {nguon: madot + '|' + q.cau, loai: q.loai, hoi: q.hoi, pa: q.pa, da: q.da, hinh: q.hinh || '', gt: gtM[madot + '|' + q.cau] || '', kt: k.kt || '', md: k.md || ''};
}
function cauLuyenTuBo(ma, id, q) {
  return {nguon: 'TC:' + ma + '|' + id, loai: q.loai, hoi: q.hoi, pa: q.pa, da: q.da, hinh: q.hinh || '', gt: q.gt || '', kt: q.kt || '', md: q.md || ''};
}
function docLuyenThem(khoi, chiDuyet) {
  const sh = kho().getSheetByName(TAB_LTT);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_LTT.length).getValues().map(function (r, i) {
    return {dong: i + 2, khoi: Number(r[0]) || 0, kt: String(r[1]).trim(), md: String(r[2]).trim(), loai: ['DS', 'TLN'].indexOf(khongDau(r[3])) >= 0 ? khongDau(r[3]) : 'TN',
      hoi: String(r[4]), pa: {A: String(r[5]), B: String(r[6]), C: String(r[7]), D: String(r[8])}, da: String(r[9]).trim(), hinh: String(r[10] || '').trim(), gt: String(r[11] || ''),
      tt: khongDau(r[12]) || 'CHO', nguon: String(r[13] || ''), ngay: r[14] instanceof Date ? r[14].toISOString().slice(0, 10) : String(r[14] || ''), ma: String(r[15] || '').trim() || 'LT' + (i + 2)};
  }).filter(function (x) { return x.hoi.trim() && (!khoi || x.khoi === khoi) && (!chiDuyet || x.tt === 'DUYET'); });
}
function hsLuyen(d) {
  MEMO = {};
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const kq = hsKienThuc(d); if (!kq.ok) return kq;
  const pham = String(d.pham || 'tat');
  const dot = pham === 'tat' ? kq.dot : kq.dot.filter(function (g) { return g.madot === pham; });
  // 1) Kien thuc yeu (gop cac dot), cau em da sai
  const K = {};
  dot.forEach(function (g) {
    g.kt.forEach(function (k) {
      const x = K[k.kt] = K[k.kt] || {kt: k.kt, md: k.md, d: 0, n: 0, sai: []};
      x.d += k.d; x.n += k.n;
      k.sai.forEach(function (c) { x.sai.push({madot: c.madot, cau: c.cau, ma: c.ma || '', bo: g.tro ? String(g.madot).split(':')[1] : ''}); });
    });
  });
  // Chon kien thuc: theo yeu cau HS (d.kt) hoac cac kien thuc duoi 65%, yeu nhat truoc
  let yeu = Object.keys(K).map(function (t) { const x = K[t]; x.p = x.n ? x.d / x.n : 1; return x; });
  const muon = Array.isArray(d.kt) ? d.kt.map(String) : [];
  yeu = muon.length ? yeu.filter(function (x) { return muon.indexOf(x.kt) >= 0; }) : yeu.filter(function (x) { return x.p < LUYEN_NGUONG; });
  yeu.sort(function (a, b) { return a.p - b.p; });
  yeu = yeu.slice(0, 4);
  if (!yeu.length) return {ok: true, cau: [], kt: [], msg: 'Em không có kiến thức nào dưới 65% ở phạm vi này.'};
  const canKT = {}; yeu.forEach(function (x) { canKT[chuKT(x.kt)] = x.kt; });
  // 2) Kho cau theo kien thuc (chi de khong mo/cho)
  const khoi = khoiLop(), ch = docCauHinh(), ktM = docKienThuc(), gtM = docGiaiThich(), cacDe = {};
  ch.forEach(function (c) { if (!c.mo && !c.cho && (!khoi || khoiMaDe(c.madot) === khoi)) cacDe[c.madot] = c; });
  const deCan = {};
  Object.keys(ktM).forEach(function (k) { const md = k.split('|')[0]; if (cacDe[md] && canKT[chuKT(ktM[k].kt)]) deCan[md] = 1; });
  const theoKT = {}, daCo = {};
  const them = function (q, cu) {
    const t = canKT[chuKT(q.kt)]; if (!t) return;
    const khoa = String(q.hoi).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (daCo[khoa]) { if (cu) daCo[khoa].cu = true; return; }
    q.kt = t; q.cu = !!cu; daCo[khoa] = q;
    (theoKT[t] = theoKT[t] || []).push(q);
  };
  const deDoc = {};
  const layDe = function (md) { if (!(md in deDoc)) { try { deDoc[md] = docDe(md); } catch (e) { deDoc[md] = null; } } return deDoc[md]; };
  // cau em da sai truoc (danh dau cu)
  const layBo = boDem();
  yeu.forEach(function (x) {
    x.sai.forEach(function (s) {
      if (s.bo) { const b = layBo(s.bo); if (!b) return; const m = cauTroMap(b); if (s.ma && m[s.ma]) them(cauLuyenTuBo(s.bo, s.ma, m[s.ma]), true); return; }
      if (!cacDe[s.madot]) return;
      const de = layDe(s.madot); if (!de) return;
      const q = de.filter(function (z) { return String(z.cau) === String(s.cau); })[0];
      if (q) them(cauLuyenTuDe(q, s.madot, ktM, gtM), true);
    });
  });
  Object.keys(deCan).forEach(function (md) { const de = layDe(md); if (de) de.forEach(function (q) { them(cauLuyenTuDe(q, md, ktM, gtM), false); }); });
  docDsBo().forEach(function (b) {
    if (khoi && b.khoi !== khoi) return;
    const bo = layBo(b.ma); if (!bo) return;
    const m = cauTroMap(bo);
    Object.keys(m).forEach(function (id) { if (canKT[chuKT(m[id].kt)]) them(cauLuyenTuBo(b.ma, id, m[id]), false); });
  });
  docLuyenThem(khoi, true).forEach(function (x) { them({nguon: 'LT:' + x.ma, loai: x.loai, hoi: x.hoi, pa: x.pa, da: x.loai === 'DS' ? chuanDS(x.da) : x.loai === 'TN' ? x.da.toUpperCase() : x.da, hinh: x.hinh, gt: x.gt, kt: x.kt, md: x.md}, false); });
  // 3) Chon 10 cau: xoay vong kien thuc yeu, moi kien thuc cau em da sai truoc, roi cau khac ngau nhien
  const hang = yeu.map(function (x) { const ds = theoKT[x.kt] || []; return tron(ds.filter(function (q) { return q.cu; })).concat(tron(ds.filter(function (q) { return !q.cu; }))); });
  const chon = [];
  for (let vong = 0; chon.length < LUYEN_SO_CAU && hang.some(function (h) { return h.length; }); vong++) {
    hang.forEach(function (h) { if (h.length && chon.length < LUYEN_SO_CAU) chon.push(h.shift()); });
  }
  // 4) Tron phuong an TN (doi chu trong loi giai theo)
  const cau = chon.map(function (q, i) {
    let pa = q.pa, da = q.da, gt = q.gt;
    if (q.loai === 'TN' && 'ABCD'.indexOf(da) >= 0) {
      const co = ['A', 'B', 'C', 'D'].filter(function (k) { return String(q.pa[k]).trim() !== ''; });
      if (co.length > 1) {
        const moi = tron(co.slice()), map = {}, pa2 = {A: '', B: '', C: '', D: ''};
        moi.forEach(function (cu, j) { pa2[co[j]] = q.pa[cu]; map[cu] = co[j]; });
        pa = pa2; da = map[q.da]; gt = doiChuGT(gt, map);
      }
    }
    return {i: i + 1, nguon: q.nguon, loai: q.loai, hoi: q.hoi, pa: pa, da: da, hinh: q.hinh, gt: gt, kt: q.kt, md: q.md, cu: q.cu};
  });
  const id = Utilities.getUuid().slice(0, 12);
  try { CacheService.getScriptCache().put('lt_' + id, JSON.stringify({ma: ma, pham: pham, cau: cau.map(function (q) { return {nguon: q.nguon, loai: q.loai, da: q.da, kt: q.kt}; })}), 21600); } catch (e) {}
  const thieu = yeu.filter(function (x) { return (theoKT[x.kt] || []).length < 3; }).map(function (x) { return x.kt; });
  if (thieu.length) ghiCanThem(khoi, thieu);
  return {ok: true, id: id, pham: pham, kt: yeu.map(function (x) { return {kt: x.kt, md: x.md, p: Math.round(x.p * 100) / 100, co: (theoKT[x.kt] || []).length}; }), cau: cau, thieu: thieu};
}
// Kien thuc thieu cau luyen: ghi vao cache chung de GV thay va nho AI soan (khong chan HS)
function ghiCanThem(khoi, ds) {
  try {
    const c = CacheService.getScriptCache(), k = 'lt_can';
    let m = {}; try { m = JSON.parse(c.get(k) || '{}'); } catch (e) {}
    ds.forEach(function (t) { const key = khoi + '|' + t; m[key] = (m[key] || 0) + 1; });
    c.put(k, JSON.stringify(m), 21600);
  } catch (e) {}
}
function hsLuyenNop(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  let p = null; try { p = JSON.parse(CacheService.getScriptCache().get('lt_' + String(d.id || '')) || 'null'); } catch (e) {}
  if (!p || p.ma !== ma) return {ok: false, msg: 'Bai luyen da het han, em tao bai moi nhe'};
  const chon = Array.isArray(d.chon) ? d.chon : [];
  const kt = {}, ct = [];
  let dung = 0, lam = 0;
  p.cau.forEach(function (q, i) {
    const x = chon[i] == null ? '' : String(chon[i]).slice(0, 30);
    if (x === '') { ct.push([q.nguon, q.kt, '', '']); return; }
    const r = chamCau({loai: q.loai, da: q.da, w: 1}, x), v = q.loai === 'DS' ? r.soY / 4 : (r.dung ? 1 : 0);
    lam++; if (r.dung) dung++;
    const o = kt[q.kt] = kt[q.kt] || [0, 0]; o[0] += v; o[1]++;
    ct.push([q.nguon, q.kt, r.chon, v]);
  });
  if (!lam) return {ok: false, msg: 'Em chua lam cau nao'};
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(TAB_LT);
  if (!sh) { sh = ss.insertSheet(TAB_LT); sh.getRange(1, 1, 1, HEAD_LT.length).setValues([HEAD_LT]).setFontWeight('bold'); sh.setFrozenRows(1); }
  sh.appendRow([new Date(), ma, p.pham, lam, dung, JSON.stringify(kt), JSON.stringify(ct)]);
  try { CacheService.getScriptCache().remove('lt_' + d.id); } catch (e) {}
  return {ok: true, lam: lam, dung: dung, kt: kt, lich: docLuyenHS(ma)};
}
function docLuyenTap() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_LT);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_LT.length).getValues().map(function (r) {
    let kt = {}; try { kt = JSON.parse(r[5] || '{}'); } catch (e) {}
    return {luc: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), mahs: String(r[1]).trim(), pham: String(r[2]), lam: Number(r[3]) || 0, dung: Number(r[4]) || 0, kt: kt};
  }).filter(function (x) { return x.mahs && !(AN_GV && laGV(x.mahs)); });
}
function docLuyenHS(ma) { return docLuyenTap().filter(function (x) { return x.mahs === ma; }).map(function (x) { return {luc: x.luc, lam: x.lam, dung: x.dung, kt: x.kt}; }); }
// GV: tien bo luyen tap cua lop: moi em so lan, % dung theo kien thuc o bai kiem tra (truoc) -> o cac lan luyen (sau)
function gvLuyen() {
  MEMO = {};
  const lt = docLuyenTap(), ds = dsLopTX(), theoHS = {};
  lt.forEach(function (x) { (theoHS[x.mahs] = theoHS[x.mahs] || []).push(x); });
  const hs = ds.map(function (h) {
    const l = theoHS[h.mahs] || [];
    if (!l.length) return {mahs: h.mahs, hoten: h.hoten, lan: 0};
    const kt = {};
    let truoc = null;
    try { truoc = hsKienThuc({mahs: h.mahs, maxem: (timHS(h.mahs) || {}).maxem}); } catch (e) {}
    l.forEach(function (x, i) {
      Object.keys(x.kt).forEach(function (t) {
        const o = kt[t] = kt[t] || {kt: t, dau: null, cuoi: null, lan: 0, d: 0, n: 0};
        const v = x.kt[t]; const p = v[1] ? v[0] / v[1] : 0;
        if (o.dau === null) o.dau = p; o.cuoi = p; o.lan++; o.d += v[0]; o.n += v[1];
      });
    });
    if (truoc && truoc.ok) {
      const T = {};
      truoc.dot.forEach(function (g) { g.kt.forEach(function (k) { const o = T[k.kt] = T[k.kt] || [0, 0]; o[0] += k.d; o[1] += k.n; }); });
      Object.keys(kt).forEach(function (t) { if (T[t] && T[t][1]) kt[t].kiemtra = Math.round(T[t][0] / T[t][1] * 100) / 100; });
    }
    return {mahs: h.mahs, hoten: h.hoten, lan: l.length, cau: l.reduce(function (s, x) { return s + x.lam; }, 0), dung: l.reduce(function (s, x) { return s + x.dung; }, 0),
      cuoi: l[l.length - 1].luc, kt: Object.keys(kt).map(function (t) { const o = kt[t]; return {kt: t, kiemtra: o.kiemtra, dau: Math.round(o.dau * 100) / 100, cuoi: Math.round(o.cuoi * 100) / 100, lan: o.lan, p: o.n ? Math.round(o.d / o.n * 100) / 100 : 0}; })};
  });
  let can = {}; try { can = JSON.parse(CacheService.getScriptCache().get('lt_can') || '{}'); } catch (e) {}
  return {ok: true, lop: lopNay(), hs: hs, can: can, them: docLuyenThem(khoiLop(), false)};
}
// GV xem 1 em: kien thuc yeu da/chua ren luyen; da luyen thi: % kiem tra truoc luyen -> cac luot luyen -> kiem tra sau luyen, cau van sai
function gvLuyenHS(d) {
  MEMO = {};
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!hs) return {ok: false, msg: 'Khong tim thay hoc sinh'};
  const kq = hsKienThuc({mahs: ma, maxem: hs.maxem}); if (!kq.ok) return kq;
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_LT), luyen = [];
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_LT.length).getValues().forEach(function (r) {
    if (String(r[1]).trim() !== ma) return;
    let kt = {}, ct = []; try { kt = JSON.parse(r[5] || '{}'); } catch (e) {} try { ct = JSON.parse(r[6] || '[]'); } catch (e) {}
    luyen.push({luc: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), kt: kt, ct: ct});
  });
  luyen.sort(function (a, b) { return a.luc < b.luc ? -1 : 1; });
  const K = {}, lay = function (t, md) { return K[t] = K[t] || {kt: t, md: md || '', d: 0, n: 0, luot: [], dot: [], cuoiCt: null}; };
  kq.dot.forEach(function (g) { g.kt.forEach(function (k) { const o = lay(k.kt, k.md); o.d += k.d; o.n += k.n; o.dot.push({luc: g.luc || '', ten: g.ten, d: k.d, n: k.n}); }); });
  luyen.forEach(function (x) {
    Object.keys(x.kt).forEach(function (t) { const v = x.kt[t], o = lay(t); o.luot.push({luc: x.luc, d: Math.round(v[0] * 100) / 100, n: v[1]}); o.cuoiCt = x.ct; });
  });
  const layBo = boDem(), deDoc = {}; let them = null;
  const layCau = function (ng) {
    try {
      let q = null;
      if (/^TC:/.test(ng)) { const p = ng.slice(3).split('|'), b = layBo(p[0]); q = b && cauTroMap(b)[p[1]]; }
      else if (/^LT:/.test(ng)) { if (!them) them = docLuyenThem(0, false); q = them.filter(function (x) { return x.ma === ng.slice(3); })[0]; }
      else { const p = ng.split('|'); if (!(p[0] in deDoc)) { try { deDoc[p[0]] = docDe(p[0]); } catch (e) { deDoc[p[0]] = null; } } q = deDoc[p[0]] && deDoc[p[0]].filter(function (z) { return String(z.cau) === p[1]; })[0]; }
      if (!q) return null;
      const da = String(q.da || ''), pa = q.pa || {};
      return {loai: q.loai, hoi: boThe(q.hoi).slice(0, 400), dapan: q.loai === 'TN' && pa[da] ? boThe(pa[da]) : q.loai === 'DS' ? ['A', 'B', 'C', 'D'].map(function (k, i) { return k.toLowerCase() + ') ' + boThe(pa[k] || '').slice(0, 120) + ' → ' + (da[i] === 'D' ? 'Đúng' : 'Sai'); }).join(' · ') : da};
    } catch (e) { return null; }
  };
  const pt = function (d, n) { return n ? Math.round(d / n * 100) / 100 : null; };
  const da = [], chua = [];
  Object.keys(K).forEach(function (t) {
    const o = K[t], p = pt(o.d, o.n);
    if (!o.luot.length) { if (p !== null && p < LUYEN_NGUONG) chua.push({kt: t, md: o.md, p: p}); return; }
    const dau = o.luot[0].luc, tr = [0, 0], sa = [0, 0], sauDot = [];
    o.dot.forEach(function (g) { if (g.luc && g.luc > dau) { sa[0] += g.d; sa[1] += g.n; sauDot.push({luc: g.luc, ten: g.ten, p: pt(g.d, g.n)}); } else { tr[0] += g.d; tr[1] += g.n; } });
    const sai = [];
    (o.cuoiCt || []).forEach(function (c) { if (c[1] === t && c[2] !== '' && Number(c[3]) < 1 && sai.length < 6) { const q = layCau(String(c[0])); if (q) sai.push(q); } });
    da.push({kt: t, md: o.md, truoc: pt(tr[0], tr[1]), sau: pt(sa[0], sa[1]), sauDot: sauDot, luot: o.luot, sai: sai});
  });
  chua.sort(function (a, b) { return a.p - b.p; });
  return {ok: true, mahs: ma, hoten: hs.ten, soLuot: luyen.length, da: da, chua: chua};
}
// ---------------------------------------------------------------------
// KHAO SAT HS: GV mo dot (kho, tab KHAO SAT DOT: dung chung moi lop) co gio mo/dong + lop; HS lam trong Tai khoan.
//  Phieu an danh: tab KHAO SAT (so lop) chi luu dot + ngay + tra loi; tab KHAO SAT DA LAM luu ai da lam (de GV biet em nao chua lam).
// ---------------------------------------------------------------------
const TAB_KSD = 'KHAO SAT DOT', HEAD_KSD = ['Ma', 'Ten', 'Mo', 'Dong', 'Lop', 'Tao'];
const TAB_KS = 'KHAO SAT', HEAD_KS = ['Dot', 'Ngay', 'TraLoi'];
const TAB_KSL = 'KHAO SAT DA LAM', HEAD_KSL = ['Dot', 'MaHS', 'ThoiGian'];
function tabKho(ten, head) {
  const ss = kho(); let sh = ss.getSheetByName(ten);
  if (!sh) { sh = ss.insertSheet(ten); sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}
function docKSDot() {
  const sh = kho().getSheetByName(TAB_KSD);
  if (!sh || sh.getLastRow() < 2) return [];
  const iso = function (v) { return v instanceof Date ? v.toISOString() : String(v || ''); };
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_KSD.length).getValues().map(function (r) {
    return {ma: String(r[0]).trim(), ten: String(r[1]).trim(), mo: iso(r[2]), dong: iso(r[3]), lop: String(r[4] || 'TAT').split(',').map(function (x) { return x.trim(); }).filter(String)};
  }).filter(function (x) { return x.ma; });
}
function ksCuaLop(x) { const l = khongDau(lopNay()); return x.lop.indexOf('TAT') >= 0 || x.lop.some(function (t) { return khongDau(t) === l; }); }
function ksDangMo(x) { const n = new Date(); return (!x.mo || new Date(x.mo) <= n) && (!x.dong || new Date(x.dong) >= n); }
function docKSDaLam() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_KSL), o = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { const d = String(r[0]).trim(), m = String(r[1]).trim().replace(/^'/, ''); if (AN_GV && laGV(m)) return; (o[d] = o[d] || {})[m] = 1; });
  return o;
}
// Cho xemLai: cac dot dang mo cua lop + em da lam chua
function ksChoHS(ma) {
  try {
    const mo = docKSDot().filter(function (x) { return ksCuaLop(x) && ksDangMo(x); }); if (!mo.length) return [];
    const da = docKSDaLam();
    return mo.map(function (x) { return {ma: x.ma, ten: x.ten, dong: x.dong, da: !!(da[x.ma] || {})[ma]}; });
  } catch (e) { return []; }
}
function hsKSNop(d) {
  const ma = String(d.mahs || '').trim(), hs = timHS(ma);
  if (!dungMaXem(hs, d)) return {ok: false, msg: BM_MSG || 'SBD hoac ma xem bai chua dung'};
  const dot = docKSDot().filter(function (x) { return x.ma === String(d.dot || ''); })[0];
  if (!dot || !ksCuaLop(dot)) return {ok: false, msg: 'Không có đợt khảo sát này.'};
  if (!ksDangMo(dot)) return {ok: false, msg: 'Đợt khảo sát đã đóng.'};
  const tl = {}, vao = d.tl && typeof d.tl === 'object' ? d.tl : {};
  Object.keys(vao).slice(0, 60).forEach(function (k) {
    if (!/^[a-z_]{1,20}$/.test(k)) return;
    const v = vao[k];
    if (Array.isArray(v)) tl[k] = v.slice(0, 20).map(function (x) { return String(x).slice(0, 120); });
    else if (typeof v === 'number') tl[k] = Math.max(1, Math.min(5, Math.round(v)));
    else if (v != null && String(v).trim()) tl[k] = String(v).trim().slice(0, 1000);
  });
  if (!Object.keys(tl).length) return {ok: false, msg: 'Em chưa trả lời câu nào.'};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if ((docKSDaLam()[dot.ma] || {})[ma]) return {ok: true, trung: true};
    if (!hs.gv) layTab(TAB_KS, HEAD_KS).appendRow([dot.ma, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), JSON.stringify(tl)]);
    layTab(TAB_KSL, HEAD_KSL).appendRow([dot.ma, "'" + ma, new Date()]);
  } finally { lock.releaseLock(); }
  return {ok: true};
}
function gvKSDot() { return {ok: true, dot: docKSDot()}; }
function gvKSLuu(d) {
  const ten = String(d.ten || '').trim().slice(0, 120); if (!ten) return {ok: false, msg: 'Chưa có tên đợt'};
  const mo = new Date(d.mo), dong = new Date(d.dong);
  if (isNaN(mo) || isNaN(dong) || dong <= mo) return {ok: false, msg: 'Giờ mở/đóng chưa hợp lệ'};
  const lop = (Array.isArray(d.lop) && d.lop.length ? d.lop : ['TAT']).map(String).join(',');
  const sh = tabKho(TAB_KSD, HEAD_KSD), n = sh.getLastRow(), v = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues() : [];
  let ma = String(d.maDot || '').trim();
  for (let i = 0; ma && i < v.length; i++) if (String(v[i][0]).trim() === ma) { sh.getRange(i + 2, 2, 1, 4).setValues([[ten, mo, dong, lop]]); return gvKSDot(); }
  ma = 'KS' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMddHHmmss');
  sh.appendRow([ma, ten, mo, dong, lop, new Date()]);
  return gvKSDot();
}
function gvKSXoa(d) {
  const sh = kho().getSheetByName(TAB_KSD); if (!sh) return gvKSDot();
  const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
  for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() === String(d.maDot || '')) sh.deleteRow(i + 2);
  return gvKSDot();
}
// Ket qua lop nay: moi dot -> danh sach phieu (an danh, tron thu tu) + em da lam
function gvKSKQ() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB_KS), dot = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
    const d = String(r[0]).trim(); if (!d) return; let tl = null; try { tl = JSON.parse(r[2]); } catch (e) {}
    if (tl) (dot[d] = dot[d] || {tl: [], da: []}).tl.push(tl);
  });
  const da = docKSDaLam();
  Object.keys(da).forEach(function (d) { (dot[d] = dot[d] || {tl: [], da: []}).da = Object.keys(da[d]); });
  Object.keys(dot).forEach(function (d) { tron(dot[d].tl); });
  return {ok: true, lop: lopNay(), hs: dsLopTX(), dot: dot};
}
// AI tom tat y kien tu viet (khong co ten HS)
function gvKSAI(d) {
  const yk = d.ykien && typeof d.ykien === 'object' ? d.ykien : {};
  const yc = 'Dưới đây là ý kiến tự viết (ẩn danh) của học sinh trong phiếu khảo sát về việc dùng trang học tập "Khám phá Hóa học" (Tài khoản học sinh: xem lại bài, lời giải, kiến thức cần ôn, luyện lại phần yếu, bảng điểm, hỏi thầy cô) và làm bài kiểm tra, chơi trò chơi trên iPad. Phạm vi: ' + String(d.ten || '').slice(0, 200) + '.\n' +
    'Hãy tóm tắt cho giáo viên, tiếng Việt, ngắn gọn, gộp ý trùng, ghi số lượng học sinh nêu (ước lượng) trong ngoặc, KHÔNG bịa ý không có:\n' +
    '- uu: ưu điểm học sinh thích; - nhuoc: nhược điểm, khó khăn, lỗi gặp phải; - ipad: vấn đề riêng khi làm bài / chơi trên iPad; - dexuat: đề xuất của học sinh; - viec: 3–5 việc giáo viên nên làm trước tiên để giúp học sinh học tốt hơn.\n' +
    'Ý kiến: ' + JSON.stringify(yk).slice(0, 60000) + '\nTrả về JSON: {"uu":["..."],"nhuoc":["..."],"ipad":["..."],"dexuat":["..."],"viec":["..."]}';
  const kq = goiAI(yc, null, 0.3, {thuLai: true, he: 'Bạn là chuyên gia giáo dục phân tích phản hồi học sinh. Chỉ trả về JSON hợp lệ.'});
  if (!kq || typeof kq !== 'object') return {ok: false, msg: 'AI chưa trả lời được, thử lại'};
  return {ok: true, uu: kq.uu || [], nhuoc: kq.nhuoc || [], ipad: kq.ipad || [], dexuat: kq.dexuat || [], viec: kq.viec || []};
}
// GV nho AI soan cau luyen cho 1 kien thuc (vao tab LUYEN THEM trang thai CHO, GV duyet moi dung)
function gvLuyenAI(d) {
  const kt = String(d.kt || '').trim().slice(0, 300), khoi = Number(d.khoi) || khoiLop(), so = Math.min(Math.max(Number(d.so) || 5, 1), 10);
  if (!kt) return {ok: false, msg: 'Chua chon kien thuc'};
  // Cau mau cung kien thuc (de AI theo dung muc do, cach hoi)
  const ktM = docKienThuc(), mau = [];
  Object.keys(ktM).some(function (k) {
    if (chuKT(ktM[k].kt) !== chuKT(kt) || khoiMaDe(k.split('|')[0]) !== khoi) return false;
    try { const md = k.split('|')[0], q = docDe(md).filter(function (z) { return String(z.cau) === k.split('|')[1]; })[0];
      if (q) mau.push({loai: q.loai, hoi: String(q.hoi).replace(/<[^>]*>/g, ' ').slice(0, 300), pa: q.loai === 'TLN' ? undefined : q.pa, da: q.da, md: ktM[k].md}); } catch (e) {}
    return mau.length >= 3;
  });
  const md = String(d.md || (mau[0] || {}).md || '').trim();
  const yc = 'Soạn ' + so + ' câu hỏi LUYỆN TẬP môn Hóa học (KHTN) lớp ' + khoi + ' theo chương trình GDPT 2018 (sách Kết nối tri thức), cho học sinh ôn đúng yêu cầu cần đạt sau:\n"' + kt + '"' + (md ? ' (mức độ chính: ' + md + ')' : '') + '.\n' +
    'Yêu cầu: khoảng ' + Math.max(so - 1, 1) + ' câu trắc nghiệm 4 phương án (loai "TN", đúng 1 đáp án) và 1 câu đúng/sai 4 ý (loai "DS", da là chuỗi 4 chữ D/S, ví dụ "DSSD", A–D là 4 mệnh đề). ' +
    'Nội dung chính xác khoa học, tiếng Việt chuẩn, không dùng hình; công thức hóa học viết chỉ số bằng thẻ <sub>, điện tích bằng <sup>. Phương án nhiễu hợp lý, không lặp. ' +
    'Mỗi câu có lời giải ngắn gọn (gt) giải thích vì sao đúng và vì sao các phương án khác sai; KHÔNG nhắc chữ cái phương án trong lời giải (vì phương án sẽ được trộn), hãy nhắc nội dung.' +
    (mau.length ? '\nCâu mẫu trong đề của giáo viên (để bám mức độ, KHÔNG chép lại): ' + JSON.stringify(mau) : '') +
    '\nTrả về JSON: {"cau":[{"loai":"TN","hoi":"...","A":"...","B":"...","C":"...","D":"...","da":"B","md":"Biết|Hiểu|Vận dụng","gt":"..."}]}';
  const kq = goiAI(yc, null, 0.6, {thuLai: true});
  const ds = (kq && Array.isArray(kq.cau) ? kq.cau : []).filter(function (c) { return c && String(c.hoi || '').trim(); }).slice(0, so);
  if (!ds.length) return {ok: false, msg: 'AI chua soan duoc cau nao, thu lai'};
  const ss = kho();
  let sh = ss.getSheetByName(TAB_LTT);
  if (!sh) { sh = ss.insertSheet(TAB_LTT); sh.getRange(1, 1, 1, HEAD_LTT.length).setValues([HEAD_LTT]).setFontWeight('bold'); sh.setFrozenRows(1); }
  const ngay = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), goc = Date.now().toString(36).toUpperCase();
  const dong = ds.map(function (c, i) {
    const loai = khongDau(c.loai) === 'DS' ? 'DS' : 'TN';
    const da = loai === 'DS' ? chuanDS(c.da) : String(c.da || '').trim().toUpperCase().slice(0, 1);
    return [khoi, kt, String(c.md || md || '').trim(), loai, String(c.hoi).trim(), String(c.A || ''), String(c.B || ''), String(c.C || ''), String(c.D || ''), da, '', String(c.gt || '').trim(), 'CHO', 'AI ' + (kq._moHinh || ''), ngay, 'LT' + goc + (i + 1)];
  }).filter(function (r) { return r[3] === 'DS' ? /^[DS]{4}$/.test(r[9]) : 'ABCD'.indexOf(r[9]) >= 0 && r[9] !== '' && r[5] && r[6]; });
  if (!dong.length) return {ok: false, msg: 'Cau AI soan sai dinh dang, thu lai'};
  sh.getRange(sh.getLastRow() + 1, 1, dong.length, HEAD_LTT.length).setNumberFormat('@').setValues(dong.map(function (r) { return r.map(String); }));
  return gvLuyen();
}
// GV duyet / sua / bo cau luyen bo sung
function gvLuyenDuyet(d) {
  const sh = kho().getSheetByName(TAB_LTT);
  if (!sh || sh.getLastRow() < 2) return {ok: false, msg: 'Chua co cau luyen bo sung'};
  const ma = String(d.malt || '').trim(), v = sh.getRange(2, 16, sh.getLastRow() - 1, 1).getValues();
  let so = -1;
  for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === ma || (!String(v[i][0]).trim() && 'LT' + (i + 2) === ma)) { so = i + 2; break; }
  if (so < 0) return {ok: false, msg: 'Khong tim thay cau ' + ma};
  if (d.xoa) sh.deleteRow(so);
  else {
    const s = d.sua || {};
    if (s.hoi !== undefined) sh.getRange(so, 5, 1, 5).setValues([[String(s.hoi), String(s.A || ''), String(s.B || ''), String(s.C || ''), String(s.D || '')]]);
    if (s.da !== undefined) sh.getRange(so, 10).setNumberFormat('@').setValue(String(s.da).trim().toUpperCase());
    if (s.gt !== undefined) sh.getRange(so, 12).setValue(String(s.gt));
    if (d.tt) sh.getRange(so, 13).setValue(khongDau(d.tt) === 'DUYET' ? 'DUYET' : 'CHO');
  }
  return gvLuyen();
}
function timBaiDaNop(madot, ma) {
  const v = nho('bl', function () { const sh = SpreadsheetApp.getActive().getSheetByName(TAB_BL); return !sh || sh.getLastRow() < 2 ? [] : sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(); });
  if (!v.length) return null;
  for (let i = v.length - 1; i >= 0; i--) {
    if (String(v[i][1]).trim() === madot && String(v[i][2]).trim() === ma) {
      return {diem: v[i][5], socaudung: v[i][6], tongsocau: v[i][7], chitiet: v[i][9], lan: Number(v[i][11]) || 1, file: String(v[i][10] || ''),
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
function luuPDFBaiLam(thuMuc, c, ma, ten, now, giay, diem, dung, tong, ct, lan, ghiChu) {
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
    (ghiChu ? '<tr><td colspan="2" style="border:2px solid #000;padding:4px 8px"><b>GHI CHÚ: ' + esc(ghiChu.toUpperCase()) + '</b> – giáo viên thu bài khi đang làm.</td></tr>' : '') +
    '</table>' + theoPhan(ct, function (q) { return htmlCau(q, true); }) + '</body></html>';
  const tenFile = c.madot + '_' + ma + '_' + ten + (lan > 1 ? '_lan' + lan : '') + '_' + Utilities.formatDate(now, tz, 'HHmmss') + '.pdf';
  return thuMuc.createFile(htmlSangPDF(html, tenFile)).getUrl();
}

// ---------------------------------------------------------------------
// Tien ich
// ---------------------------------------------------------------------
// Ten lop lay tu ten file so: chap nhan "SO THEO DOI 12CLB", "SOTHEODOI-12CLB", "Sổ theo dõi_12CLB", "Bản sao của ..."
function lopNay() {
  const t = khongDau(SpreadsheetApp.getActive().getName()).replace(/^(BAN SAO CUA|COPY OF)\s+/, '');
  return t.replace(/^SO\s*THEO\s*DOI[\s\-_:.]*/, '').replace(/\s+/g, ' ').trim() || 'LOP';
}
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
const MO_HINH_AI = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];

let MO_HINH_AI_DUNG = '';   // nho mo hinh goi duoc trong lan chay nay

const MUC_DIEM_AI = [
  {ten: 'Tốt (8–10)', tu: 8},
  {ten: 'Khá (6.5–<8)', tu: 6.5},
  {ten: 'Đạt (5–<6.5)', tu: 5},
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
  boGV(sh.getRange(2, 2, sh.getLastRow() - 1, 2).getValues(), 1).forEach(function (r) {
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
  const v = boGV(sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_BL.length).getValues(), 2);
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

// tuy (khong bat buoc): {he: 'loi dan he thong rieng', thuLai: true -> mo hinh tu choi/tra rong thi thu mo hinh khac}
function goiAI(yeuCau, tep, nhietDo, tuy) {
  tuy = tuy || {};
  const k = khoaAI();
  const phan = [{text: yeuCau}];
  if (tep && tep.b64) phan.push({inline_data: {mime_type: tep.mime || 'image/jpeg', data: tep.b64}});
  const than = {
    systemInstruction: {parts: [{text: tuy.he || 'Bạn là chuyên gia sư phạm Hóa học bậc phổ thông ở Việt Nam. Chỉ trả về JSON hợp lệ, không thêm chữ nào ngoài JSON.'}]},
    contents: [{role: 'user', parts: phan}],
    generationConfig: {temperature: nhietDo === undefined ? 0.4 : nhietDo, responseMimeType: 'application/json'},
    safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'].map(function (c) { return {category: c, threshold: 'BLOCK_NONE'}; })
  };
  const loiTung = [];
  let ds = MO_HINH_AI_DUNG ? [MO_HINH_AI_DUNG] : k.moHinh;
  if (tuy.thuLai) ds = ds.concat(k.moHinh.filter(function (m) { return ds.indexOf(m) < 0; }));
  for (let i = 0; i < ds.length; i++) {
    const moHinh = ds[i];
    const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + moHinh + ':generateContent', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-goog-api-key': k.khoa}, payload: JSON.stringify(than)
    });
    const ma = res.getResponseCode();
    const txt = res.getContentText();
    if (ma === 404) { loiTung.push(moHinh + ': không có'); continue; }
    if (ma === 429) { if (tuy.thuLai && i < ds.length - 1) { loiTung.push(moHinh + ': hết lượt'); continue; } throw new Error('Đã hết lượt dùng AI miễn phí trong lúc này. Đợi vài phút (hoặc sang ngày mai) rồi chạy lại.'); }
    if (ma === 401 || (ma === 400 && /API_KEY|api key/i.test(txt))) throw new Error('Khóa AI không dùng được (mã ' + ma + '). Kiểm tra dòng GeminiKey ở tab MA, hoặc tạo khóa mới ở aistudio.google.com/apikey.\n' + rutGon(txt, 300));
    if (ma !== 200) { loiTung.push(moHinh + ': lỗi ' + ma + ' ' + rutGon(txt, 160)); continue; }
    const j = JSON.parse(txt);
    const ung = (j.candidates || [])[0] || {};
    const parts = (ung.content || {}).parts || [];
    const chu = parts.map(function (p) { return p.thought ? '' : (p.text || ''); }).join('');
    let kq = null;
    try { kq = docJSON(chu); } catch (e) {
      const lyDo = (j.promptFeedback && j.promptFeedback.blockReason) || ung.finishReason || 'trả về rỗng';
      loiTung.push(moHinh + ': từ chối/không trả lời (' + lyDo + ')');
      if (tuy.thuLai) continue;
      throw e;
    }
    kq._moHinh = moHinh;
    MO_HINH_AI_DUNG = moHinh;
    return kq;
  }
  throw new Error('Không gọi được AI. Đã thử: ' + loiTung.join(' | ') + (tuy.thuLai ? '' : '. Thêm dòng GeminiModel ở tab MA với tên mô hình mới (xem ai.google.dev/models).'));
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
