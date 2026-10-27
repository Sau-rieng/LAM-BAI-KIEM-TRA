/* Doc file Excel (.xls BIFF8 va .xlsx) ngay trong trinh duyet, khong can thu vien.
   docExcel(ArrayBuffer) -> Promise<{ten, o: [[gia tri o]]}> (sheet dau tien; chi so dong/cot tu 0) */
(function (goc) {
  function u16(b, i) { return b[i] | (b[i + 1] << 8); }
  function u32(b, i) { return (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16)) + b[i + 3] * 16777216; }
  function ganO(o, r, c, v) { (o[r] = o[r] || [])[c] = v; }

  // ---------- .xls: Compound File (OLE2) ----------
  function docCFB(b) {
    var ss = 1 << u16(b, 30), mss = 1 << u16(b, 32), soFat = u32(b, 44), dir0 = u32(b, 48), cat = u32(b, 56);
    var mfat0 = u32(b, 60), difat0 = u32(b, 68), soDifat = u32(b, 72);
    function sec(i) { return 512 + i * ss; }
    var fatSec = [];
    for (var i = 0; i < 109 && fatSec.length < soFat; i++) fatSec.push(u32(b, 76 + i * 4));
    var d = difat0;
    for (var k = 0; k < soDifat && d < 0xFFFFFFFA; k++) {
      for (var j = 0; j < ss / 4 - 1 && fatSec.length < soFat; j++) fatSec.push(u32(b, sec(d) + j * 4));
      d = u32(b, sec(d) + ss - 4);
    }
    var fat = [];
    fatSec.forEach(function (s) { for (var j = 0; j < ss / 4; j++) fat.push(u32(b, sec(s) + j * 4)); });
    function chuoi(s, tab) { var r = [], n = 0; while (s < 0xFFFFFFFA && n++ < 1e6) { r.push(s); s = tab[s]; } return r; }
    function docLuong(s, co) {
      var ds = chuoi(s, fat), out = new Uint8Array(ds.length * ss);
      ds.forEach(function (x, k) { out.set(b.subarray(sec(x), sec(x) + ss), k * ss); });
      return co === undefined ? out : out.subarray(0, co);
    }
    var dir = docLuong(dir0), muc = [];
    for (var p = 0; p + 128 <= dir.length; p += 128) {
      var dl = u16(dir, p + 64), ten = '';
      for (var q = 0; q + 2 < dl; q += 2) ten += String.fromCharCode(u16(dir, p + q));
      muc.push({ ten: ten, loai: dir[p + 66], dau: u32(dir, p + 116), co: u32(dir, p + 120) });
    }
    var goc0 = muc[0], mini = null, mfat = null;
    function lay(m) {
      if (m.co >= cat || m.loai === 5) return docLuong(m.dau, m.co);
      if (!mini) { mini = docLuong(goc0.dau, goc0.co); mfat = []; var mm = docLuong(mfat0); for (var j = 0; j + 4 <= mm.length; j += 4) mfat.push(u32(mm, j)); }
      var ds = chuoi(m.dau, mfat), out = new Uint8Array(ds.length * mss);
      ds.forEach(function (x, k) { out.set(mini.subarray(x * mss, x * mss + mss), k * mss); });
      return out.subarray(0, m.co);
    }
    var wb = muc.filter(function (m) { return m.loai === 2 && /^(Workbook|Book)$/i.test(m.ten); })[0];
    if (!wb) throw new Error('File không có dữ liệu bảng tính.');
    return lay(wb);
  }
  function rk(v) {
    var x;
    if (v & 2) x = (v >> 2); // so nguyen co dau 30 bit
    else { var dv = new DataView(new ArrayBuffer(8)); dv.setUint32(4, v & 0xFFFFFFFC, true); dv.setUint32(0, 0, true); x = dv.getFloat64(0, true); }
    return v & 1 ? x / 100 : x;
  }
  function docBIFF(w) {
    // gom cac ban ghi; ghi lai ranh gioi CONTINUE cho SST
    var rec = [], p = 0;
    while (p + 4 <= w.length) { var t = u16(w, p), l = u16(w, p + 2); rec.push({ t: t, p: p + 4, l: l, at: p }); p += 4 + l; }
    var sst = [], sheets = [], dv = new DataView(w.buffer, w.byteOffset, w.byteLength);
    function chuoiUni(buf, i, cch, hi) { var s = ''; for (var k = 0; k < cch; k++) s += String.fromCharCode(hi ? u16(buf, i + 2 * k) : buf[i + k]); return s; }
    for (var r = 0; r < rec.length; r++) {
      var R = rec[r];
      if (R.t === 0x85) {
        var pos = u32(w, R.p), cch = w[R.p + 6], f = w[R.p + 7];
        sheets.push({ pos: pos, an: w[R.p + 4], ten: chuoiUni(w, R.p + 8, cch, f & 1) });
      } else if (R.t === 0xFC) {
        var phan = [w.subarray(R.p, R.p + R.l)];
        while (r + 1 < rec.length && rec[r + 1].t === 0x3C) { r++; phan.push(w.subarray(rec[r].p, rec[r].p + rec[r].l)); }
        var tong = u32(phan[0], 4), bi = 0, i = 8;
        function can(n) { while (i >= phan[bi].length) { bi++; i = 0; } }
        function b1() { can(); return phan[bi][i++]; }
        function b2() { var a = b1(); return a | (b1() << 8); }
        function b4() { var a = b2(); return a + b2() * 65536; }
        function bo(n) { while (n > 0) { can(); var c = Math.min(n, phan[bi].length - i); i += c; n -= c; } }
        for (var s = 0; s < tong && bi < phan.length; s++) {
          var n = b2(), fl = b1(), chay = fl & 8 ? b2() : 0, ext = fl & 4 ? b4() : 0, hi = fl & 1, st = '';
          while (n > 0) {
            if (i >= phan[bi].length) { bi++; i = 0; hi = phan[bi][i++] & 1; }
            var con = phan[bi].length - i, lay = Math.min(n, hi ? con >> 1 : con);
            st += chuoiUni(phan[bi], i, lay, hi); i += lay * (hi ? 2 : 1); n -= lay;
          }
          bo(chay * 4); bo(ext);
          sst.push(st);
        }
      }
    }
    var sh = sheets.filter(function (x) { return !x.an; })[0] || sheets[0];
    if (!sh) throw new Error('Không thấy trang tính.');
    var o = [], dau = 0;
    for (var k = 0; k < rec.length; k++) if (rec[k].at === sh.pos) { dau = k; break; }
    var chuoiCho = null;
    for (var k2 = dau + 1; k2 < rec.length; k2++) {
      var X = rec[k2], q = X.p;
      if (X.t === 0x0A) break;
      if (X.t === 0xFD) ganO(o, u16(w, q), u16(w, q + 2), sst[u32(w, q + 6)]);
      else if (X.t === 0x204) { var cc = u16(w, q + 6); ganO(o, u16(w, q), u16(w, q + 2), chuoiUni(w, q + 9, cc, w[q + 8] & 1)); }
      else if (X.t === 0x203) ganO(o, u16(w, q), u16(w, q + 2), dv.getFloat64(q + 6, true));
      else if (X.t === 0x27E) ganO(o, u16(w, q), u16(w, q + 2), rk(u32(w, q + 6)));
      else if (X.t === 0xBD) { var rr = u16(w, q), c0 = u16(w, q + 2), sl = (X.l - 6) / 6; for (var m = 0; m < sl; m++) ganO(o, rr, c0 + m, rk(u32(w, q + 4 + m * 6 + 2))); }
      else if (X.t === 0x06) {
        var rr2 = u16(w, q), c2 = u16(w, q + 2);
        if (u16(w, q + 12) === 0xFFFF) { if (w[q + 6] === 0) chuoiCho = [rr2, c2]; else if (w[q + 6] === 1) ganO(o, rr2, c2, !!w[q + 8]); }
        else ganO(o, rr2, c2, dv.getFloat64(q + 6, true));
      } else if (X.t === 0x207 && chuoiCho) { var c3 = u16(w, q); ganO(o, chuoiCho[0], chuoiCho[1], chuoiUni(w, q + 3, c3, w[q + 2] & 1)); chuoiCho = null; }
    }
    return { ten: sh.ten, o: o };
  }

  // ---------- .xlsx: zip + XML ----------
  function giaiNen(d) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('Trình duyệt quá cũ để đọc .xlsx; hãy dùng file .xls hoặc Chrome mới.'));
    var ds = new DecompressionStream('deflate-raw'), wr = ds.writable.getWriter(); wr.write(d); wr.close();
    return new Response(ds.readable).arrayBuffer().then(function (a) { return new Uint8Array(a); });
  }
  function docZip(b) {
    var e = b.length - 22; while (e >= 0 && u32(b, e) !== 0x06054b50) e--;
    if (e < 0) throw new Error('File .xlsx bị hỏng.');
    var n = u16(b, e + 10), p = u32(b, e + 16), tep = {};
    for (var k = 0; k < n; k++) {
      var cach = u16(b, p + 10), nen = u32(b, p + 20), dl = u16(b, p + 28), ex = u16(b, p + 30), cm = u16(b, p + 32), off = u32(b, p + 42);
      var ten = new TextDecoder().decode(b.subarray(p + 46, p + 46 + dl));
      var dau = off + 30 + u16(b, off + 26) + u16(b, off + 28);
      tep[ten] = { cach: cach, d: b.subarray(dau, dau + nen) };
      p += 46 + dl + ex + cm;
    }
    return tep;
  }
  function chu(t) { return t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (_, x) { return String.fromCharCode(+x); }).replace(/&amp;/g, '&'); }
  function docXLSX(b) {
    var tep = docZip(b), td = new TextDecoder();
    function lay(ten) { var f = tep[ten]; if (!f) return Promise.resolve(''); return (f.cach === 8 ? giaiNen(f.d) : Promise.resolve(f.d)).then(function (x) { return td.decode(x); }); }
    var tenSh = Object.keys(tep).filter(function (k) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(k); }).sort()[0];
    return Promise.all([lay('xl/sharedStrings.xml'), lay(tenSh)]).then(function (x) {
      var sst = [];
      (x[0].match(/<si>[\s\S]*?<\/si>/g) || []).forEach(function (si) { sst.push(chu((si.match(/<t[^>]*>[\s\S]*?<\/t>/g) || []).map(function (t) { return t.replace(/<[^>]+>/g, ''); }).join(''))); });
      var o = [];
      (x[1].match(/<c [^>]*?(\/>|>[\s\S]*?<\/c>)/g) || []).forEach(function (c) {
        var ref = /r="([A-Z]+)(\d+)"/.exec(c); if (!ref) return;
        var col = 0; for (var i = 0; i < ref[1].length; i++) col = col * 26 + ref[1].charCodeAt(i) - 64;
        var t = (/ t="(\w+)"/.exec(c) || [])[1], v = (/<v>([\s\S]*?)<\/v>/.exec(c) || [])[1], val;
        if (t === 's') val = sst[+v]; else if (t === 'inlineStr') val = chu(((/<t[^>]*>([\s\S]*?)<\/t>/.exec(c)) || [])[1] || ''); else if (t === 'str') val = v === undefined ? '' : chu(v); else if (t === 'b') val = v === '1'; else if (v !== undefined) val = Number(v);
        if (val !== undefined && val !== '') ganO(o, +ref[2] - 1, col - 1, val);
      });
      return { ten: tenSh, o: o };
    });
  }
  // Doc moi trang tinh cua .xlsx kem ten tab that (dung cho Nap de): -> Promise<[{ten, o}]>
  function docXLSXTatCa(b) {
    var tep = docZip(b), td = new TextDecoder();
    function lay(ten) { var f = tep[ten]; if (!f) return Promise.resolve(''); return (f.cach === 8 ? giaiNen(f.d) : Promise.resolve(f.d)).then(function (x) { return td.decode(x); }); }
    return Promise.all([lay('xl/workbook.xml'), lay('xl/_rels/workbook.xml.rels'), lay('xl/sharedStrings.xml')]).then(function (x) {
      var rel = {};
      (x[1].match(/<Relationship\b[^>]*>/g) || []).forEach(function (r) {
        var id = (/\bId="([^"]+)"/.exec(r) || [])[1], dich = (/\bTarget="([^"]+)"/.exec(r) || [])[1];
        if (id && dich) rel[id] = dich.replace(/^\/?xl\//, '').replace(/^\//, '');
      });
      var ds = [];
      (x[0].match(/<sheet\b[^>]*>/g) || []).forEach(function (s) {
        var ten = chu((/\bname="([^"]*)"/.exec(s) || [])[1] || ''), rid = (/\br:id="([^"]+)"/.exec(s) || /\bid="([^"]+)"/.exec(s) || [])[1];
        if (rel[rid]) ds.push({ ten: ten, tep: 'xl/' + rel[rid] });
      });
      var sst = [];
      (x[2].match(/<si>[\s\S]*?<\/si>/g) || []).forEach(function (si) { sst.push(chu((si.match(/<t[^>]*>[\s\S]*?<\/t>/g) || []).map(function (t) { return t.replace(/<[^>]+>/g, ''); }).join(''))); });
      return Promise.all(ds.map(function (s) {
        return lay(s.tep).then(function (xml) { return { ten: s.ten, o: oTuXML(xml, sst) }; });
      }));
    });
  }
  function oTuXML(xml, sst) {
    var o = [];
    (xml.match(/<c [^>]*?(\/>|>[\s\S]*?<\/c>)/g) || []).forEach(function (c) {
      var ref = /r="([A-Z]+)(\d+)"/.exec(c); if (!ref) return;
      var col = 0; for (var i = 0; i < ref[1].length; i++) col = col * 26 + ref[1].charCodeAt(i) - 64;
      var t = (/ t="(\w+)"/.exec(c) || [])[1], v = (/<v>([\s\S]*?)<\/v>/.exec(c) || [])[1], val;
      if (t === 's') val = sst[+v];
      else if (t === 'inlineStr') val = chu(((c.match(/<t[^>]*>[\s\S]*?<\/t>/g) || []).map(function (x) { return x.replace(/<[^>]+>/g, ''); })).join(''));
      else if (t === 'str') val = v === undefined ? '' : chu(v);
      else if (t === 'b') val = v === '1';
      else if (v !== undefined) val = Number(v);
      if (val !== undefined && val !== '') ganO(o, +ref[2] - 1, col - 1, val);
    });
    return o;
  }
  goc.docExcelTatCa = function (buf) {
    var b = new Uint8Array(buf);
    try { if (u32(b, 0) === 0x04034b50) return docXLSXTatCa(b); } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error('Cần file .xlsx (file KHO-DE-<mã đợt>.xlsx Claude gửi).'));
  };
  goc.docExcel = function (buf) {
    var b = new Uint8Array(buf);
    try {
      if (u32(b, 0) === 0xE011CFD0) return Promise.resolve(docBIFF(docCFB(b)));
      if (u32(b, 0) === 0x04034b50) return docXLSX(b);
    } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error('Không phải file Excel (.xls hoặc .xlsx).'));
  };
})(typeof window !== 'undefined' ? window : globalThis);
