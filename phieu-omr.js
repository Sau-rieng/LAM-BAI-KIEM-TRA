/* PHIẾU TRẢ LỜI TRẮC NGHIỆM (đề giấy) – bố cục theo mẫu phiếu 2025, khổ A4, đơn vị mm.
   Một nguồn duy nhất cho cả IN PHIẾU (PHIEU.ve()) và QUÉT PHIẾU (PHIEU.o: tâm từng ô tô).
   KHÔNG đổi tọa độ khi đã in phiếu phát cho học sinh: phiếu cũ sẽ quét sai. Đổi bố cục thì tăng PHIEU.phienBan. */
(function () {
  var P = { phienBan: 1, w: 210, h: 297, r: 1.85 };
  // 4 ô vuông đen ở góc (căn ảnh khi quét) + 2 ô giữa cạnh: tâm, cạnh 6 mm
  P.neo = [[11, 11], [199, 11], [11, 286], [199, 286]];
  P.neoPhu = [[11, 148], [199, 148]];
  P.canhNeo = 6;
  // ---- Số báo danh (8 cột) và mã đề (4 cột): hàng chữ số 0..9 ----
  var SO_Y0 = 33, SO_DY = 5.5;
  P.sbd = { x0: 139.4, dx: 4.6, cot: 8 };
  P.made = { x0: 180.4, dx: 4.6, cot: 4 };
  // ---- Phần I: 4 khối × 10 câu ----
  var KX = [18, 63, 108, 153];
  // ---- Tâm từng ô tô ----
  var o = { sbd: [], made: [], p1: [], p2: [], p3: [] };
  for (var c = 0; c < 8; c++) { o.sbd.push([]); for (var d = 0; d < 10; d++) o.sbd[c].push([P.sbd.x0 + c * P.sbd.dx, SO_Y0 + d * SO_DY]); }
  for (c = 0; c < 4; c++) { o.made.push([]); for (d = 0; d < 10; d++) o.made[c].push([P.made.x0 + c * P.made.dx, SO_Y0 + d * SO_DY]); }
  for (var q = 0; q < 40; q++) {
    var k = Math.floor(q / 10), i = q % 10, y = 111 + i * 5.1;
    o.p1.push([0, 1, 2, 3].map(function (j) { return [KX[k] + 11.5 + j * 7.3, y]; }));
  }
  for (q = 0; q < 8; q++) {
    var k2 = Math.floor(q / 2), nua = q % 2, x = KX[k2] + (nua ? 25.5 : 8.5);
    o.p2.push([0, 1, 2, 3].map(function (j) { return [[x, 184 + j * 4.4], [x + 7.5, 184 + j * 4.4]]; }));   // [Đúng, Sai]
  }
  var P3X = [18, 47.5, 77, 106.5, 136, 165.5];
  for (q = 0; q < 6; q++) {
    var x0 = P3X[q], cols = [0, 1, 2, 3].map(function (j) { return x0 + 9 + j * 5.2; });
    o.p3.push({ am: [cols[0], 221], phay: [[cols[1], 226], [cols[2], 226]],
      so: cols.map(function (cx) { var a = []; for (var dd = 0; dd < 10; dd++) a.push([cx, 231.5 + dd * 4.4]); return a; }) });
  }
  P.o = o;
  P.ve = function (opt) {
    opt = opt || {};
    var s = [], r = P.r;
    function T(x, y, t, a) { a = a || {}; s.push('<text x="' + x + '" y="' + y + '" font-size="' + (a.c || 3) + '"' + (a.b ? ' font-weight="700"' : '') + (a.i ? ' font-style="italic"' : '') + ' text-anchor="' + (a.n || 'start') + '">' + t + '</text>'); }
    function R(x, y, w, h, a) { a = a || {}; s.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (a.f || 'none') + '" stroke="' + (a.k || '#000') + '" stroke-width="' + (a.sw === undefined ? 0.3 : a.sw) + '"/>'); }
    function O(p) { s.push('<circle cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="' + r + '" fill="#fff" stroke="#000" stroke-width="0.25"/>'); }
    function V(p, c2) { c2 = c2 || P.canhNeo; s.push('<rect x="' + (p[0] - c2 / 2) + '" y="' + (p[1] - c2 / 2) + '" width="' + c2 + '" height="' + c2 + '" fill="#000"/>'); }
    function L(x1, y1, x2, y2, w) { s.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#000" stroke-width="' + (w || 0.3) + '"/>'); }
    P.neo.concat(P.neoPhu).forEach(function (p) { V(p); });
    // ---- Đầu phiếu ----
    T(72, 21, 'PHIẾU TRẢ LỜI TRẮC NGHIỆM', { c: 5.2, b: 1, n: 'middle' });
    T(72, 28, 'Kỳ thi: ' + (opt.ky || '................................................'), { c: 3.4, n: 'middle' });
    T(17, 34.5, 'Bài thi: ' + (opt.bai || '..........................................') + '  Ngày thi: ....../....../20.....', { c: 3.4 });
    R(17, 39, 45, 49); L(17, 46, 62, 46); L(17, 62, 62, 62); L(17, 75, 62, 75);
    T(39.5, 44, 'Điểm', { c: 3.3, n: 'middle' });
    T(39.5, 67.5, 'Họ tên, chữ ký', { c: 3, n: 'middle' }); T(39.5, 71.5, 'của cán bộ coi thi 1', { c: 3, n: 'middle' });
    T(39.5, 80.5, 'Họ tên, chữ ký', { c: 3, n: 'middle' }); T(39.5, 84.5, 'của cán bộ coi thi 2', { c: 3, n: 'middle' });
    R(65, 39, 63, 49);
    ['1. Hội đồng thi: ......................................', '2. Điểm thi: .............................................', '3. Phòng thi số: .......................................',
     '4. Họ và tên thí sinh: ..............................', '5. Ngày sinh: ......./......./............. (Nam/Nữ)', '6. Chữ ký của thí sinh: ...........................'].forEach(function (t, i) { T(67, 45.5 + i * 7.6, t, { c: 3 }); });
    // ---- SBD + mã đề ----
    T(P.sbd.x0 + 3.5 * P.sbd.dx, 18, '7. Số báo danh', { c: 3.3, n: 'middle' });
    T(P.made.x0 + 1.5 * P.made.dx, 18, '8. Mã đề thi', { c: 3.3, n: 'middle' });
    [[P.sbd, o.sbd], [P.made, o.made]].forEach(function (g) {
      var a = g[0], x1 = a.x0 - a.dx / 2, w = a.cot * a.dx;
      for (var c3 = 0; c3 < a.cot; c3++) R(x1 + c3 * a.dx, 20.5, a.dx, 6, { sw: 0.25 });
      R(x1 - 0.8, SO_Y0 - 3.4, w + 1.6, 9 * SO_DY + 6.8, { sw: 0.3 });
      g[1].forEach(function (col) { col.forEach(O); });
    });
    for (var d2 = 0; d2 < 10; d2++) { T(P.sbd.x0 - P.sbd.dx / 2 - 3.2, SO_Y0 + d2 * SO_DY + 1.1, String(d2), { c: 3.1, b: 1, n: 'middle' }); T(P.made.x0 + 3.5 * P.made.dx + 3.6, SO_Y0 + d2 * SO_DY + 1.1, String(d2), { c: 3.1, b: 1, n: 'middle' }); }
    V([176.6, 58], 2.6); V([176.6, 84], 2.6);
    // ---- Nền xám vùng trả lời ----
    R(14.5, 93, 181, 186, { f: '#ececec', k: 'none', sw: 0 });
    // ---- Phần I ----
    T(17, 99.5, 'PHẦN I', { c: 3.6, b: 1 });
    KX.forEach(function (x, k) {
      R(x, 102, 40, 58.5, { f: '#fff' });
      ['A', 'B', 'C', 'D'].forEach(function (L2, j) { T(x + 11.5 + j * 7.3, 106.3, L2, { c: 2.6, n: 'middle' }); });
      for (var i2 = 0; i2 < 10; i2++) T(x + 6.8, 111 + i2 * 5.1 + 1.1, String(k * 10 + i2 + 1), { c: 3.1, b: 1, n: 'end' });
      V([x + 42.5, 102.5], 2.6); V([x + 42.5, 160], 2.6);
    });
    o.p1.forEach(function (row) { row.forEach(O); });
    // ---- Phần II ----
    T(17, 166, 'PHẦN II', { c: 3.6, b: 1 });
    KX.forEach(function (x, k) {
      R(x, 168.5, 40, 32, { f: '#fff' }); L(x + 20, 168.5, x + 20, 200.5);
      [0, 1].forEach(function (n) { var cx = x + (n ? 25.5 : 8.5); T(cx + 3.75, 173.5, 'Câu ' + (k * 2 + n + 1), { c: 3.1, b: 1, n: 'middle' }); T(cx, 178.8, 'Đúng', { c: 2.6, n: 'middle' }); T(cx + 7.5, 178.8, 'Sai', { c: 2.6, n: 'middle' }); });
      ['a)', 'b)', 'c)', 'd)'].forEach(function (t, j) { T(x + 1.5, 184 + j * 4.4 + 1, t, { c: 2.9 }); });
      V([x + 42.5, 200], 2.6);
    });
    o.p2.forEach(function (c4) { c4.forEach(function (y) { O(y[0]); O(y[1]); }); });
    // ---- Phần III ----
    T(17, 207, 'PHẦN III', { c: 3.6, b: 1 });
    P3X.forEach(function (x, q2) {
      R(x, 209.5, 29.5, 66, { f: '#fff' });
      T(x + 3, 215, 'Câu ' + (q2 + 1), { c: 3.1, b: 1 });
      T(x + 3.6, 222.2, '−', { c: 3.6, b: 1, n: 'middle' }); T(x + 3.6, 227.2, ',', { c: 3.8, b: 1, n: 'middle' });
      for (var d3 = 0; d3 < 10; d3++) T(x + 3.6, 231.5 + d3 * 4.4 + 1.1, String(d3), { c: 3, b: 1, n: 'middle' });
      var c5 = o.p3[q2]; O(c5.am); c5.phay.forEach(O); c5.so.forEach(function (col) { col.forEach(O); });
      V([x + 14.75, 279.5], 2.6);
    });
    T(105, 293, 'Phiếu trả lời đề giấy · Khám phá Hóa học · mẫu ' + P.phienBan + ' · Tô kín ô bằng bút chì đen hoặc bút bi đen', { c: 2.4, i: 1, n: 'middle' });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm" font-family="Times New Roman, Times, serif">' + s.join('') + '</svg>';
  };
  window.PHIEU = P;
})();
