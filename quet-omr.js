/* QUÉT PHIẾU TRẢ LỜI (OMR) ngay trên trình duyệt – cần phieu-omr.js (window.PHIEU).
   OMR.doc(anh) với anh = {w, h, g: Uint8Array mức xám} → {ok, H, sbd, made, p1, p2, p3, o (độ đậm từng ô), canh}
   Các bước: tìm 4 ô vuông đen ở góc → xác định chiều phiếu (xoay 0/90/180/270) → phép chiếu phối cảnh (homography)
   → chỉnh lại theo các ô vuông nhỏ → đo độ đậm từng ô tròn so với giấy trắng xung quanh. */
(function () {
  var P = window.PHIEU;
  // ---------- Đại số: homography từ n cặp điểm (bình phương tối thiểu, n ≥ 4) ----------
  function giai(A, b) {   // Gauss
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      if (Math.abs(M[c][c]) < 1e-12) return null;
      for (r = 0; r < n; r++) if (r !== c) { var f = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (r, i) { return r[n] / r[i]; });
  }
  function homo(src, dst) {     // src (mm) -> dst (px)
    var AtA = [], Atb = [], i, j;
    for (i = 0; i < 8; i++) { AtA.push([0, 0, 0, 0, 0, 0, 0, 0]); Atb.push(0); }
    src.forEach(function (s, k) {
      var x = s[0], y = s[1], u = dst[k][0], v = dst[k][1];
      [[x, y, 1, 0, 0, 0, -u * x, -u * y, u], [0, 0, 0, x, y, 1, -v * x, -v * y, v]].forEach(function (r) {
        for (i = 0; i < 8; i++) { for (j = 0; j < 8; j++) AtA[i][j] += r[i] * r[j]; Atb[i] += r[i] * r[8]; }
      });
    });
    var h = giai(AtA, Atb); return h ? h.concat([1]) : null;
  }
  function ap(H, p) { var w = H[6] * p[0] + H[7] * p[1] + H[8]; return [(H[0] * p[0] + H[1] * p[1] + H[2]) / w, (H[3] * p[0] + H[4] * p[1] + H[5]) / w]; }
  // ---------- Ảnh ----------
  function tichPhan(a) {
    var w = a.w, h = a.h, I = new Float64Array((w + 1) * (h + 1));
    for (var y = 0; y < h; y++) { var s = 0; for (var x = 0; x < w; x++) { s += a.g[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } }
    return I;
  }
  function tbVung(a, I, x0, y0, x1, y1) {
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(a.w, x1); y1 = Math.min(a.h, y1);
    var W = a.w + 1, n = (x1 - x0) * (y1 - y0); if (n <= 0) return 255;
    return (I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0]) / n;
  }
  // Ô đen đặc (vuông) trên nền sáng: ngưỡng thích nghi + tìm vùng liên thông
  function timKhoiDen(a, I) {
    var w = a.w, h = a.h, R = Math.max(8, Math.round(Math.min(w, h) / 24)), den = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var m = tbVung(a, I, x - R, y - R, x + R + 1, y + R + 1), v = a.g[y * w + x];
      den[y * w + x] = v < m * 0.62 && v < 150 ? 1 : 0;
    }
    var nhan = new Int32Array(w * h), ds = [], st = [];
    for (var i = 0; i < w * h; i++) {
      if (!den[i] || nhan[i]) continue;
      var id = ds.length + 1, n = 0, sx = 0, sy = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      st.length = 0; st.push(i); nhan[i] = id;
      while (st.length) {
        var k = st.pop(), kx = k % w, ky = (k - kx) / w; n++; sx += kx; sy += ky;
        if (kx < x0) x0 = kx; if (kx > x1) x1 = kx; if (ky < y0) y0 = ky; if (ky > y1) y1 = ky;
        if (kx > 0 && den[k - 1] && !nhan[k - 1]) { nhan[k - 1] = id; st.push(k - 1); }
        if (kx < w - 1 && den[k + 1] && !nhan[k + 1]) { nhan[k + 1] = id; st.push(k + 1); }
        if (ky > 0 && den[k - w] && !nhan[k - w]) { nhan[k - w] = id; st.push(k - w); }
        if (ky < h - 1 && den[k + w] && !nhan[k + w]) { nhan[k + w] = id; st.push(k + w); }
      }
      var bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      ds.push({ x: sx / n, y: sy / n, n: n, bw: bw, bh: bh, dac: n / (bw * bh), canh: Math.sqrt(n) });
    }
    var nho = Math.min(w, h) * 0.006, lon = Math.min(w, h) * 0.08;
    return ds.filter(function (b) { return b.canh >= nho && b.canh <= lon && b.dac > 0.8 && b.bw / b.bh > 0.55 && b.bw / b.bh < 1.8; });
  }
  function dienTich(q) { var s = 0; for (var i = 0; i < 4; i++) { var a = q[i], b = q[(i + 1) % 4]; s += a.x * b.y - b.x * a.y; } return s / 2; }
  // Sắp 4 điểm theo vòng (quanh tâm)
  function vong(q) { var cx = 0, cy = 0; q.forEach(function (p) { cx += p.x / 4; cy += p.y / 4; }); return q.slice().sort(function (a, b) { return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx); }); }
  function do4Goc(ds) {
    if (ds.length < 4) return null;
    var maxN = Math.max.apply(null, ds.map(function (b) { return b.n; }));
    var to = ds.filter(function (b) { return b.n >= maxN * 0.35; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 12);
    var tot = null, S = 0;
    for (var a = 0; a < to.length; a++) for (var b = a + 1; b < to.length; b++) for (var c = b + 1; c < to.length; c++) for (var d = c + 1; d < to.length; d++) {
      var q = vong([to[a], to[b], to[c], to[d]]), s = Math.abs(dienTich(q));
      // 4 góc cùng cỡ
      var nn = q.map(function (p) { return p.n; }); if (Math.min.apply(null, nn) < Math.max.apply(null, nn) * 0.4) continue;
      if (s > S) { S = s; tot = q; }
    }
    return tot ? { q: tot, to: to } : null;
  }
  // Ô vuông nhỏ đã in (tọa độ mm) – dùng chọn chiều phiếu và chỉnh phối cảnh
  function cacMoc() {
    var m = [[176.6, 58], [176.6, 84]], KX = [18, 63, 108, 153], P3X = [18, 47.5, 77, 106.5, 136, 165.5];
    KX.forEach(function (x) { m.push([x + 42.5, 102.5], [x + 42.5, 160], [x + 42.5, 200]); });
    P3X.forEach(function (x) { m.push([x + 14.75, 279.5]); });
    return m;
  }
  var MOC = cacMoc();
  function doDam(a, I, p, r) { var v = tbVung(a, I, Math.round(p[0] - r), Math.round(p[1] - r), Math.round(p[0] + r + 1), Math.round(p[1] + r + 1)); return 255 - v; }
  // Tìm tâm ô vuông nhỏ gần vị trí dự đoán (trọng tâm điểm tối)
  function chinhMoc(a, p, r) {
    var x0 = Math.round(p[0] - r), y0 = Math.round(p[1] - r), x1 = Math.round(p[0] + r), y1 = Math.round(p[1] + r), sx = 0, sy = 0, n = 0, mn = 255, mx = 0, x, y;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) { if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue; var v = a.g[y * a.w + x]; if (v < mn) mn = v; if (v > mx) mx = v; }
    if (mx - mn < 60) return null;
    var T = mn + (mx - mn) * 0.4;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) { if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue; if (a.g[y * a.w + x] < T) { sx += x; sy += y; n++; } }
    return n ? [sx / n, sy / n, n] : null;
  }
  function doc(a) {
    var I = tichPhan(a), ds = timKhoiDen(a, I), g4 = do4Goc(ds);
    if (!g4) return { ok: false, loi: 'Không thấy đủ 4 ô vuông đen ở góc phiếu. Chụp lại cho thấy trọn tờ phiếu.' };
    var q = g4.q, tot = null;
    // Thử 4 cách xoay: điểm = độ đậm tại các ô vuông nhỏ đã biết
    for (var k = 0; k < 4; k++) {
      var dst = [0, 1, 2, 3].map(function (i) { var p = q[(i + k) % 4]; return [p.x, p.y]; });
      // q đi vòng theo chiều kim đồng hồ trên ảnh (y hướng xuống): TL, TR, BR, BL
      var src = [P.neo[0], P.neo[1], P.neo[3], P.neo[2]], H = homo(src, dst); if (!H) continue;
      var s0 = Math.hypot(ap(H, [10, 10])[0] - ap(H, [11, 10])[0], ap(H, [10, 10])[1] - ap(H, [11, 10])[1]);
      var diem = 0;
      MOC.concat(P.neoPhu).forEach(function (m) { diem += doDam(a, I, ap(H, m), Math.max(1, s0 * 0.8)); });
      // ô trống (giữa các ô tròn Phần I) phải sáng
      P.o.p1.slice(0, 10).forEach(function (row) { diem -= doDam(a, I, ap(H, [row[0][0] + 3.65, row[0][1]]), Math.max(1, s0 * 0.6)); });
      if (!tot || diem > tot.diem) tot = { H: H, diem: diem, s0: s0, k: k };
    }
    // Kiểm tra lại: phần lớn ô vuông nhỏ phải nằm đúng chỗ dự đoán (tránh nhầm khi phiếu ra ngoài khung hình)
    var thay = MOC.filter(function (m) { return chinhMoc(a, ap(tot.H, m), tot.s0 * 3.2); }).length;
    if (thay < MOC.length * 0.6) return { ok: false, loi: 'Chưa thấy trọn tờ phiếu. Đưa máy ra xa một chút cho đủ 4 ô vuông ở 4 góc.' };
    var H = tot.H, s0 = tot.s0, src2 = [P.neo[0], P.neo[1], P.neo[3], P.neo[2]], dst2 = [0, 1, 2, 3].map(function (i) { var p = q[(i + tot.k) % 4]; return [p.x, p.y]; });
    // Chỉnh lại: thêm 2 ô giữa cạnh + các ô vuông nhỏ tìm thấy
    P.neoPhu.concat(MOC).forEach(function (m, i) {
      var c = chinhMoc(a, ap(H, m), s0 * (i < 2 ? 6 : 3.2));
      if (c) { src2.push(m); dst2.push([c[0], c[1]]); }
    });
    var H2 = homo(src2, dst2) || H;
    // Độ lệch còn lại của các mốc (px) – lớn thì phiếu cong/nhòe
    var lech = 0; src2.forEach(function (m, i) { var p = ap(H2, m); lech = Math.max(lech, Math.hypot(p[0] - dst2[i][0], p[1] - dst2[i][1])); });
    // Chỉnh cục bộ: mỗi ô tròn dịch theo độ lệch có trọng số của các mốc gần (phiếu hơi cong)
    var du = src2.map(function (m, i) { var p = ap(H2, m); return [m, dst2[i][0] - p[0], dst2[i][1] - p[1]]; });
    function chieu(m) {
      var p = ap(H2, m), sw = 0, ex = 0, ey = 0;
      du.forEach(function (d) { var w = 1 / (Math.pow(m[0] - d[0][0], 2) + Math.pow(m[1] - d[0][1], 2) + 400); sw += w; ex += w * d[1]; ey += w * d[2]; });
      return [p[0] + ex / sw, p[1] + ey / sw];
    }
    // Đo ô tròn: độ đậm lõi so với giấy quanh ô
    var r = P.r, o = {};
    function do1(m) {
      var p = chieu(m), sc = Math.hypot(chieu([m[0] + 1, m[1]])[0] - p[0], chieu([m[0] + 1, m[1]])[1] - p[1]);
      var rl = Math.max(1, r * 0.55 * sc), loi = tbVung(a, I, Math.round(p[0] - rl), Math.round(p[1] - rl), Math.round(p[0] + rl + 1), Math.round(p[1] + rl + 1));
      // giấy: sáng nhất trong 4 điểm cách tâm 1.6r (giữa các ô)
      var giay = 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (v) { var pp = chieu([m[0] + v[0] * r * 1.45, m[1] + v[1] * r * 1.45]); giay = Math.max(giay, tbVung(a, I, Math.round(pp[0] - 1), Math.round(pp[1] - 1), Math.round(pp[0] + 2), Math.round(pp[1] + 2))); });
      return { p: p, m: m, v: Math.max(0, Math.min(1, (giay - loi) / Math.max(40, giay))) };
    }
    o.sbd = P.o.sbd.map(function (c) { return c.map(do1); });
    o.made = P.o.made.map(function (c) { return c.map(do1); });
    o.p1 = P.o.p1.map(function (c) { return c.map(do1); });
    o.p2 = P.o.p2.map(function (c) { return c.map(function (y) { return [do1(y[0]), do1(y[1])]; }); });
    o.p3 = P.o.p3.map(function (c) { return { am: do1(c.am), phay: c.phay.map(do1), so: c.so.map(function (col) { return col.map(do1); }) }; });
    // Trừ nền cục bộ (ánh sáng không đều, bóng đổ): mức 20% thấp nhất của các ô lân cận trong vòng 12 mm (không bị các ô đã tô kéo lên)
    var ds = [];
    o.sbd.concat(o.made, o.p1).forEach(function (c) { c.forEach(function (x) { ds.push(x); }); });
    o.p2.forEach(function (c) { c.forEach(function (y) { ds.push(y[0], y[1]); }); });
    o.p3.forEach(function (c) { ds.push(c.am, c.phay[0], c.phay[1]); c.so.forEach(function (col) { col.forEach(function (x) { ds.push(x); }); }); });
    var nen = ds.map(function (x) {
      var g = []; ds.forEach(function (y) { if (y !== x && Math.abs(y.m[0] - x.m[0]) < 12 && Math.abs(y.m[1] - x.m[1]) < 12) g.push(y.v); });
      g.sort(function (a, b) { return a - b; }); return g.length ? g[Math.floor(g.length * 0.2)] : 0;
    });
    ds.forEach(function (x, i) { x.v0 = x.v; x.v = Math.max(0, x.v - nen[i]); });
    return Object.assign({ ok: true, H: H2, lech: lech, soMoc: src2.length, o: o }, giaiMa(o));
  }
  // Ô được tô: xét theo từng nhóm ô (1 cột SBD, 1 câu Phần I, 1 câu Đ/S, 1 cột Phần III):
  // tô = đậm hơn cả 3 mức: 0.12 tuyệt đối · nửa ô đậm nhất nhóm · 2.5 lần nền nhóm (+0.04). Gần ngưỡng = nghi ngờ (thầy xem lại).
  function giaiMa(o) {
    function xet(nhom) {
      var v = nhom.map(function (x) { return x.v; }), mx = Math.max.apply(null, v), sx = v.slice().sort(function (a, b) { return a - b; });
      var nua = sx.slice(0, Math.max(1, Math.floor(sx.length / 2))), nen = nua.reduce(function (a, b) { return a + b; }, 0) / nua.length;
      var T = Math.max(0.12, 0.5 * mx, 2.5 * nen + 0.04);
      nhom.forEach(function (x) { x.to = x.v >= T; x.nghi = (!x.to && x.v >= Math.max(0.08, T * 0.6)) || (x.to && x.v < T * 1.2 && x.v < 0.2); });
    }
    o.sbd.forEach(xet); o.made.forEach(xet); o.p1.forEach(xet);
    o.p2.forEach(function (c) { var t = []; c.forEach(function (y) { t.push(y[0], y[1]); }); xet(t); });
    o.p3.forEach(function (c) { c.so.forEach(function (col) { xet(col); }); xet([c.am, c.phay[0], c.phay[1]].concat(c.so[0], c.so[1], c.so[2])); });
    function cotSo(col) { var c = []; col.forEach(function (x, d) { if (x.to) c.push(d); }); return c; }
    var canh = [];
    function chuoi(cols, ten) {
      var s = '', loi = false;
      cols.forEach(function (col, i) { var c = cotSo(col); if (c.length === 1) s += c[0]; else { s += c.length ? '*' : '_'; loi = true; } if (col.some(function (x) { return x.nghi; })) canh.push({ vung: ten, cot: i + 1 }); });
      return { s: s, loi: loi };
    }
    var sbd = chuoi(o.sbd, 'SBD'), made = chuoi(o.made, 'Mã đề');
    var p1 = o.p1.map(function (row) { var c = []; row.forEach(function (x, j) { if (x.to) c.push('ABCD'[j]); }); return { chon: c.join(''), mo: row.some(function (x) { return x.nghi; }) }; });
    var p2 = o.p2.map(function (cau) { return cau.map(function (y) { var d = y[0].to, s = y[1].to; return { chon: d && s ? '*' : d ? 'D' : s ? 'S' : '', mo: y[0].nghi || y[1].nghi }; }); });
    // Phần III: 4 cột = 4 kí tự (như phiếu của Bộ): dấu − chỉ ở cột 1, dấu phẩy chiếm cột 2 hoặc 3, các cột còn lại là chữ số
    var p3 = o.p3.map(function (c) {
      var cols = c.so.map(cotSo), am = c.am.to, ph = [false, c.phay[0].to, c.phay[1].to, false], kt = [], loi = '';
      for (var i = 0; i < 4; i++) {
        var dau = (i === 0 && am) ? '-' : ph[i] ? ',' : '';
        if (dau && cols[i].length) loi = 'cột ' + (i + 1) + ' vừa tô dấu vừa tô số';
        if (cols[i].length > 1) loi = 'cột ' + (i + 1) + ' tô ' + cols[i].length + ' số';
        kt.push(dau || (cols[i].length === 1 ? String(cols[i][0]) : cols[i].length ? '*' : ''));
      }
      if (ph[1] && ph[2]) loi = 'tô 2 dấu phẩy';
      var cuoi = -1; kt.forEach(function (x, i) { if (x) cuoi = i; });
      var s = kt.slice(0, cuoi + 1).join('');
      if (cuoi >= 0 && kt.slice(0, cuoi + 1).some(function (x) { return !x; })) loi = loi || (kt.indexOf('') === 0 ? 'bỏ trống cột đầu' : 'bỏ trống cột ' + (kt.indexOf('') + 1) + ' ở giữa');
      if (/^-?,|,$/.test(s)) loi = loi || 'dấu phẩy đặt sai chỗ';
      if (s === '-') loi = loi || 'chỉ tô dấu −';
      var mo = c.am.nghi || c.phay.some(function (x) { return x.nghi; }) || c.so.some(function (col) { return col.some(function (x) { return x.nghi; }); });
      return { chon: s, loi: loi, mo: mo };
    });
    return { sbd: sbd, made: made, p1: p1, p2: p2, p3: p3, canh: canh };
  }
  // Ảnh từ canvas/ảnh: thu nhỏ về cạnh dài tối đa ~1800 px, chuyển mức xám
  function tuCanvas(cv, max) {
    max = max || 1800;
    var s = Math.min(1, max / Math.max(cv.width, cv.height)), w = Math.round(cv.width * s), h = Math.round(cv.height * s);
    var c2 = document.createElement('canvas'); c2.width = w; c2.height = h; var x = c2.getContext('2d'); x.drawImage(cv, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, g = new Uint8Array(w * h);
    for (var i = 0; i < w * h; i++) g[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
    return { w: w, h: h, g: g, s: s, canvas: c2 };
  }
  // Xem nhanh khung hình camera: có đủ 4 ô vuông góc chưa (để tự chụp)
  function timGoc(a) {
    var I = tichPhan(a), g = do4Goc(timKhoiDen(a, I)); if (!g) return null; var q = g.q, S = Math.abs(dienTich(q));
    // 4 góc phiếu: cạnh dài / cạnh ngắn ≈ 188/275 → tỉ lệ 1.46 (cho phép nghiêng)
    var d = [0, 1, 2, 3].map(function (i) { var p1 = q[i], p2 = q[(i + 1) % 4]; return Math.hypot(p1.x - p2.x, p1.y - p2.y); });
    var tl = ((d[0] + d[2]) / 2) / ((d[1] + d[3]) / 2); if (tl < 1) tl = 1 / tl;
    if (tl < 1.2 || tl > 1.8) return null;
    return { q: q.map(function (p) { return [p.x, p.y]; }), tile: S / (a.w * a.h) };
  }
  window.OMR = { doc: doc, tuCanvas: tuCanvas, timGoc: timGoc, ap: ap, homo: homo };
})();
