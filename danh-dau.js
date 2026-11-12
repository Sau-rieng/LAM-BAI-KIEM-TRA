/* ĐÁNH DẤU ĐÚNG/SAI LÊN ẢNH PHIẾU TRẢ LỜI (đề giấy) – dùng chung cho trang giáo viên và trang học sinh xem lại.
   Kiểu riêng của Khám phá Hóa học:
   - bên lề mỗi câu: ✓ xanh lá (đúng) hoặc ✗ đỏ (sai / để trắng); câu Đúng/Sai đánh dấu từng ý
   - ô em tô sai: gạch chéo đỏ
   - ô đáp án đúng: khoanh vòng nét đứt xanh dương
   DANHDAU.ve(canvas, r, cau): r = kết quả OMR.doc trên đúng canvas đó; cau = [{loai:'TN'|'DS'|'TLN', da, chon}] theo thứ tự đề. */
(function () {
  var XANH = '#137333', DO = '#d93025', DUONG = '#1a56db';
  function chuan(s) { return String(s == null ? '' : s).toUpperCase().replace(/Đ/g, 'D').trim(); }
  function oTLN(s, col) {   // các ô cần tô để viết số s trên cột Phần III
    var a = [], t = String(s == null ? '' : s).trim().replace('.', ',');
    if (!t || /^SAI/i.test(t)) return a;
    t.split('').forEach(function (ch, j) {
      if (j > 3) return;
      if (ch === '-' || ch === '−') { if (j === 0) a.push(col.am); }
      else if (ch === ',') { if (col.phay[j - 1]) a.push(col.phay[j - 1]); }
      else if (/\d/.test(ch) && col.so[j]) a.push(col.so[j][+ch]);
    });
    return a;
  }
  function soBang(a, b) {
    var x = Number(String(a).replace(',', '.')), y = String(b).split(';').map(function (z) { return Number(String(z).trim().replace(',', '.')); });
    return String(a).trim() !== '' && !isNaN(x) && y.some(function (z) { return !isNaN(z) && Math.abs(z - x) < 1e-9; });
  }
  function ve(canvas, r, cau) {
    if (!r || !r.ok || !r.o) return;
    var g = canvas.getContext('2d'), o = r.o;
    var a0 = o.p1[0][0].p, a1 = o.p1[0][1].p, u = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]) / 7.3, R = 1.85 * u;
    g.save(); g.lineCap = 'round';
    function vongDung(p) { g.save(); g.setLineDash([0.9 * u, 0.6 * u]); g.lineWidth = 0.42 * u; g.strokeStyle = DUONG; g.beginPath(); g.arc(p[0], p[1], R * 1.42, 0, 7); g.stroke(); g.restore(); }
    function gach(p) { g.save(); g.lineWidth = 0.5 * u; g.strokeStyle = DO; var k = R * 1.05; g.beginPath(); g.moveTo(p[0] - k, p[1] - k); g.lineTo(p[0] + k, p[1] + k); g.moveTo(p[0] + k, p[1] - k); g.lineTo(p[0] - k, p[1] + k); g.stroke(); g.restore(); }
    function dau(x, y, dung, chu) {
      g.save(); g.font = '700 ' + (3.8 * u) + 'px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 0.9 * u; g.strokeStyle = 'rgba(255,255,255,.9)'; var t = chu || (dung ? '✓' : '✗');
      g.strokeText(t, x, y); g.fillStyle = dung ? XANH : DO; g.fillText(t, x, y); g.restore();
    }
    var i1 = 0, i2 = 0, i3 = 0;
    (cau || []).forEach(function (q) {
      var loai = String(q.loai || '').toUpperCase();
      if (loai === 'TN') {
        var hang = o.p1[i1++]; if (!hang) return;
        var da = chuan(q.da), ch = chuan(q.chon).replace(/[^ABCD]/g, ''), dung = ch === da && da.length === 1;
        'ABCD'.split('').forEach(function (L, j) { if (L === da) vongDung(hang[j].p); else if (ch.indexOf(L) >= 0) gach(hang[j].p); });
        if (ch.length > 1 && ch.indexOf(da) >= 0) gach(hang['ABCD'.indexOf(da)].p);
        dau(hang[0].p[0] - 9.6 * u, hang[0].p[1], dung);
      } else if (loai === 'DS') {
        var c4 = o.p2[i2++]; if (!c4) return;
        var d2 = chuan(q.da), c2 = chuan(q.chon), n = 0;
        c4.forEach(function (y, j) {
          var dj = d2[j], cj = c2[j] || '', ok = (cj === 'D' || cj === 'S') && cj === dj;
          if (ok) n++;
          vongDung(y[dj === 'S' ? 1 : 0].p);
          if (!ok) { if (cj === 'D' || cj === '*') gach(y[0].p); if (cj === 'S' || cj === '*') gach(y[1].p); }
          dau(y[1].p[0] + 3.4 * u, y[1].p[1], ok);
        });
      } else {
        var col = o.p3[i3++]; if (!col) return;
        var daT = String(q.da || '').split(';')[0], dungT = soBang(q.chon, q.da), canTo = oTLN(daT, col), daTo = oTLN(q.chon, col);
        canTo.forEach(function (p) { vongDung(p.p); });
        if (!dungT) daTo.forEach(function (p) { if (canTo.indexOf(p) < 0) gach(p.p); });
        dau(col.am.p[0] + 16 * u, col.am.p[1] - 5.6 * u, dungT);
      }
    });
    g.restore();
  }
  window.DANHDAU = { ve: ve, chuThich: '✓ câu đúng · ✗ câu sai hoặc để trắng · ô gạch chéo đỏ: em tô sai · vòng nét đứt xanh dương: đáp án đúng' };
})();
