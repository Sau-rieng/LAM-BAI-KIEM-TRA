#!/usr/bin/env python3
"""TRỘN ĐỀ GIẤY – từ đề gốc do kênh ra đề giao (KHO-DE-<mã>.xlsx + đề Word) tạo:
  - KHO-DE-<tiền tố>-GIAY.xlsx : các mã 2xx (cột Goc, Kieu GIAY, ThangDS) để nạp trên trang giáo viên
  - DE-<tiền tố>-2xx.docx / .pdf : mỗi mã một file để in (đủ Phần I–III đã trộn + phần tự luận lấy từ đề Word)
  - DAP-AN-<tiền tố>.docx / .pdf : đáp án mọi mã + bảng đối chiếu về câu gốc
Cách chạy (ở kênh TRỘN ĐỀ, hoặc trong repo LAM-BAI-KIEM-TRA):
  python3 tools/tron-de-giay/tron.py --kho KHO-DE-H12-HK1-201.xlsx --word H12-HK1-201.docx --so-ma 4 --ra ra/
Tùy chọn: --tron-ca-goc (mã 201 cũng trộn; mặc định 201 giữ nguyên thứ tự gốc) · --truong "TRƯỜNG THPT ..." · --ky "ĐỀ KIỂM TRA CUỐI HỌC KÌ I"
          --nam "2026 – 2027" · --thang K10|K12|"0.2;0.4;0.7;1" · --lop "12G01, 12G02" · --seed 1 · --khong-pdf
Quy ước: tai-lieu-kenh/K1-Tron-de-giay.md"""
import argparse, copy, html, json, os, random, re, subprocess, sys
from html.parser import HTMLParser
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font
from docx import Document
from docx.shared import Pt, Cm, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DIEM_MAC = {'TN': '0.25', 'DS': '1', 'TLN': '0.25'}
PHAN = {'TN': 'I', 'DS': 'II', 'TLN': 'III'}
KHOA_PA = re.compile(r'(cả\s+[ABCD]\b|[ABCD]\s+(và|hoặc)\s+[ABCD]\b|tất cả|cả hai|cả ba|đều đúng|đều sai|không có (phương án|đáp án))', re.I)

def chu(v): return '' if v is None else str(v).strip()
def boDau(s):
    import unicodedata
    s = unicodedata.normalize('NFD', chu(s)).replace('đ', 'd').replace('Đ', 'D')
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').upper().replace(' ', '')

# ---------------- Đọc đề gốc ----------------
def docKho(duong):
    wb = load_workbook(duong, data_only=True)
    tabDe = [ws for ws in wb.worksheets if boDau(ws.cell(1, 1).value) == 'CAU' and boDau(ws.cell(1, 2).value) == 'NOIDUNG']
    if len(tabDe) != 1: sys.exit('File kho phải có đúng 1 tab đề gốc, đang có %d: %s' % (len(tabDe), [w.title for w in tabDe]))
    ws = tabDe[0]; ma = ws.title.strip()
    dau = [boDau(c.value) for c in ws[1]]
    def o(r, ten): return chu(r[dau.index(ten)]) if ten in dau and dau.index(ten) < len(r) else ''
    cau = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        if not chu(r[0]): continue
        loai = boDau(o(r, 'LOAI'))
        cau.append({'cau': chu(r[0]), 'hoi': o(r, 'NOIDUNG'), 'pa': [o(r, k) for k in 'ABCD'], 'da': o(r, 'DAPAN'), 'hinh': o(r, 'HINH'),
                    'loai': loai, 'w': o(r, 'DIEM') or DIEM_MAC.get(loai, '0.25'), 'nhom': o(r, 'NHOM')})
    def bang(ten):
        if ten not in wb.sheetnames: return []
        w = wb[ten]; d = [boDau(c.value) for c in w[1]]
        return [{d[i]: chu(v) for i, v in enumerate(r) if i < len(d)} for r in w.iter_rows(min_row=2, values_only=True) if r and chu(r[0])]
    ch = (bang('CAU HINH THEM') or [{}])[0]
    kt = {x.get('CAU'): (x.get('KIENTHUC', ''), x.get('MUCDO', '')) for x in bang('KIEN THUC THEM') if x.get('MADOT', ma) == ma}
    gt = {x.get('CAU'): x.get('GIAITHICH', '') for x in bang('GIAI THICH THEM') if x.get('MADOT', ma) == ma}
    for c in cau:
        c['kt'], c['md'] = kt.get(c['cau'], ('', '')); c['gt'] = gt.get(c['cau'], '')
        if c['loai'] == 'DS': c['da'] = boDau(c['da']).replace('Đ', 'D')
    return ma, cau, ch

# ---------------- Trộn ----------------
def tron1(goc, giuNguyen, rnd, canh):
    out = []
    for L in ('TN', 'DS', 'TLN'):
        g = [copy.deepcopy(x) for x in goc if x['loai'] == L]
        # câu chùm (cột Nhom): đi cùng nhau, giữ thứ tự trong chùm
        khoi, xem = [], {}
        for x in g:
            if x['nhom']:
                if x['nhom'] not in xem: xem[x['nhom']] = []; khoi.append(xem[x['nhom']])
                xem[x['nhom']].append(x)
            else: khoi.append([x])
        if not giuNguyen: rnd.shuffle(khoi)
        g = [x for k in khoi for x in k]
        for n, x in enumerate(g):
            x['goc'] = x['cau']; x['cau'] = '%s.%d' % (PHAN[L], n + 1)
            if L == 'TN':
                khoa = bool(KHOA_PA.search(' '.join(x['pa'])))
                if khoa and not giuNguyen: canh.add('Câu gốc %s có phương án dạng "cả A và B / tất cả…": giữ nguyên thứ tự phương án' % x['goc'])
                per = list(range(4)) if (giuNguyen or khoa) else rnd.sample(range(4), 4)
                cu = 'ABCD'.index(x['da']); x['pa'] = [x['pa'][k] for k in per]; x['da'] = 'ABCD'[per.index(cu)]
                moi = {'ABCD'[per[j]]: 'ABCD'[j] for j in range(4)}
                x['gt'] = doiLoiGiaiTN(x['gt'], moi, x['goc'], canh, giuNguyen or khoa)
            elif L == 'DS':
                per = list(range(4)) if giuNguyen else rnd.sample(range(4), 4)
                x['pa'] = [x['pa'][k] for k in per]; x['da'] = ''.join(x['da'][k] for k in per)
                if not giuNguyen: x['goc'] += ':' + ''.join('abcd'[k] for k in per)
                x['gt'] = doiLoiGiaiDS(x['gt'], per, x['goc'], canh, giuNguyen)
            out.append(x)
    return out

def doiLoiGiaiTN(gt, moi, goc, canh, giu):
    if giu or not gt: return gt
    dong = gt.split('\n'); thay = False; ra = []
    for ln in dong:
        l2 = re.sub(r'\b(Chọn|chọn|Đáp án|đáp án|phương án|Phương án)\s+([ABCD])\b', lambda m: m.group(1) + ' ' + moi[m.group(2)], ln)
        l2 = re.sub(r'^(\s*)([ABCD])(\s+(sai|đúng)\b|\s*[.:)–-]\s)', lambda m: m.group(1) + moi[m.group(2)] + m.group(3), l2)
        thay |= bool(re.search(r'\b(Chọn|chọn|Đáp án|đáp án|phương án|Phương án)\s+[ABCD]\b|^\s*[ABCD](\s+(sai|đúng)\b|\s*[.:)–-]\s)', ln)); ra.append(l2)
    if not thay: canh.add('Lời giải câu gốc %s không nhận ra chữ cái phương án – xem lại lời giải ở các mã trộn' % goc)
    # dòng "X sai vì …" xếp lại A→D
    dau = [l for l in ra if not re.match(r'^\s*[ABCD]\s+sai\b', l)]; sai = sorted([l for l in ra if re.match(r'^\s*[ABCD]\s+sai\b', l)], key=lambda l: l.strip()[0])
    return '\n'.join(dau + sai)

def doiLoiGiaiDS(gt, per, goc, canh, giu):
    if giu or not gt: return gt
    s = gt.replace('|', '\n')
    y = re.split(r'(?:^|\n|\s)([abcd])\)\s', s)
    if len(y) < 9: canh.add('Lời giải câu gốc %s chưa tách được 4 ý a) b) c) d) – xem lại' % goc); return gt
    m = {y[i]: y[i + 1].strip() for i in range(1, len(y), 2)}; mo = y[0].strip()
    return '\n'.join(([mo] if mo else []) + ['%s) %s' % ('abcd'[j], m.get('abcd'[per[j]], '')) for j in range(4)])

def kiemTra(goc, ma):
    G = {c['cau']: c for c in goc}
    for m, ds in ma.items():
        for x in ds:
            g = G[x['goc'].split(':')[0]]
            if x['loai'] == 'TN': assert x['pa']['ABCD'.index(x['da'])] == g['pa']['ABCD'.index(g['da'])], (m, x['cau'])
            if x['loai'] == 'DS':
                p = x['goc'].split(':')[1] if ':' in x['goc'] else 'abcd'
                for j in range(4): k = 'abcd'.index(p[j]); assert x['pa'][j] == g['pa'][k] and x['da'][j] == g['da'][k], (m, x['cau'])
            if x['loai'] == 'TLN': assert x['da'] == g['da']

# ---------------- Hình ----------------
def duongHinh(h, maGoc):
    if not h or h == '-': return None
    m = re.search(r'hinh/([^/]+)/([^/?#]+)$', h)
    rel = 'hinh/%s/%s' % (m.group(1), m.group(2)) if m else 'hinh/%s/%s' % (maGoc, os.path.basename(h))
    return rel

def timHinh(rel, cs):
    """Tìm file hình: thư mục --hinh → hình trong đề Word (word/media) → repo LAM-BAI-KIEM-TRA."""
    if not rel: return None
    ten = os.path.basename(rel)
    for d in cs.thuMuc:
        f = os.path.join(d, ten)
        if os.path.exists(f): return f
    f = os.path.join(REPO, rel)
    return f if os.path.exists(f) else None

def layHinhWord(duong, ra):
    """Chép hình trong file Word (word/media/imageN.*) ra thư mục tạm để dùng khi không có thư mục hình."""
    import zipfile
    d = os.path.join(ra, '_hinh_word'); os.makedirs(d, exist_ok=True)
    with zipfile.ZipFile(duong) as z:
        for n in z.namelist():
            if n.startswith('word/media/') and not n.endswith('/'):
                open(os.path.join(d, os.path.basename(n)), 'wb').write(z.read(n))
    return d

# ---------------- HTML (ô NoiDung) → Word ----------------
class HtmlDoc(HTMLParser):
    """Chuyển nội dung ô (chữ + <br> <b> <i> <sub> <sup> <table> <img>) thành các đoạn trong Word."""
    def __init__(s, viet): super().__init__(convert_charrefs=True); s.v = viet; s.kieu = {'b': 0, 'i': 0, 'sub': 0, 'sup': 0}; s.bang = None
    def handle_starttag(s, t, a):
        if t in ('b', 'strong'): s.kieu['b'] += 1
        elif t in ('i', 'em'): s.kieu['i'] += 1
        elif t in ('sub', 'sup'): s.kieu[t] += 1
        elif t == 'br': s.v.xuong()
        elif t == 'p' or t == 'div': s.v.xuong(mem=True)
        elif t == 'table': s.bang = []
        elif t == 'tr' and s.bang is not None: s.bang.append([])
        elif t in ('td', 'th') and s.bang is not None: s.bang[-1].append('')
        elif t == 'img': s.v.anh(dict(a).get('src', ''))
    def handle_endtag(s, t):
        if t in ('b', 'strong'): s.kieu['b'] -= 1
        elif t in ('i', 'em'): s.kieu['i'] -= 1
        elif t in ('sub', 'sup'): s.kieu[t] -= 1
        elif t == 'table' and s.bang is not None: s.v.bang(s.bang); s.bang = None
    def handle_data(s, d):
        if s.bang is not None:
            if s.bang and s.bang[-1]: s.bang[-1][-1] += d
            return
        d = re.sub(r'\s+', ' ', d)
        if d: s.v.chu(d, dict(s.kieu))

class VietWord:
    def __init__(s, doc, cuaso): s.doc = doc; s.p = None; s.cs = cuaso; s.thut = 0
    def moi(s):
        s.p = s.doc.add_paragraph(); s.p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if s.thut: s.p.paragraph_format.left_indent = Cm(s.thut)
        return s.p
    def xuong(s, mem=False):
        if s.p is not None and (not mem or s.p.text.strip()): s.p = None
    def chu(s, t, k):
        if s.p is None:
            t = t.lstrip()
            if not t: return
            s.moi()
        r = s.p.add_run(t); r.bold = k['b'] > 0; r.italic = k['i'] > 0
        if k['sub'] > 0: r.font.subscript = True
        if k['sup'] > 0: r.font.superscript = True
    def bang(s, rows):
        rows = [[re.sub(r'\s+', ' ', html.unescape(c)).strip() for c in r] for r in rows if r]
        if not rows: return
        n = max(len(r) for r in rows); t = s.doc.add_table(rows=len(rows), cols=n); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, r in enumerate(rows):
            for j in range(n):
                c = t.cell(i, j); c.text = ''; pp = c.paragraphs[0]; pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
                rr = pp.add_run(r[j] if j < len(r) else ''); rr.font.size = Pt(10.5); rr.bold = i == 0
        s.p = None
    def anh(s, src):
        rel = duongHinh(src, s.cs.maGoc); f = timHinh(rel, s.cs)
        if not f: s.cs.canh.add('Không tìm thấy hình %s' % src); return
        p = s.doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        from PIL import Image
        w, h = Image.open(f).size; rong = min(Cm(12), Emu(int(w / 220 * 914400)))   # ảnh ~220 dpi, tối đa 12 cm
        p.add_run().add_picture(f, width=rong); s.p = None

# ---------------- Word đề gốc: lấy phần tự luận (PHẦN IV … HẾT) ----------------
def phanTuLuan(duong):
    if not duong: return None
    d = Document(duong); body = d.element.body; ra = []; bat = False
    for el in body.iterchildren():
        tag = el.tag.split('}')[1]
        txt = ''.join(t.text or '' for t in el.iter(qn('w:t')))
        if not bat and tag == 'p' and re.match(r'\s*PHẦN\s+IV\b', txt): bat = True
        if bat:
            if re.search(r'-{3,}\s*HẾT\s*-{3,}', txt): break
            ra.append(el)
    return (d, ra) if ra else None

def chepTuLuan(doc, nguon):
    """Chép các đoạn/bảng phần tự luận sang đề mới, kèm hình (đổi rId)."""
    d, els = nguon
    for el in els:
        e2 = copy.deepcopy(el)
        for blip in e2.iter(qn('a:blip')):
            rid = blip.get(qn('r:embed')); part = d.part.related_parts[rid]
            import io
            rid2, _ = doc.part.get_or_add_image(io.BytesIO(part.blob))
            blip.set(qn('r:embed'), rid2)
        doc.element.body.append(e2) if doc.element.body[-1].tag != qn('w:sectPr') else doc.element.body[-1].addprevious(e2)

# ---------------- Đề Word cho 1 mã ----------------
def taoDe(ma, ds, a, ch, tuluan, cs, ra):
    doc = Document(); st = doc.styles['Normal']; st.font.name = 'Times New Roman'; st.font.size = Pt(11)
    st.element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'), 'Times New Roman')
    pf = st.paragraph_format; pf.space_after = Pt(0); pf.space_before = Pt(0); pf.line_spacing = 1.1
    sec = doc.sections[0]; sec.page_width = Cm(21); sec.page_height = Cm(29.7); sec.left_margin = sec.right_margin = Cm(1.8); sec.top_margin = sec.bottom_margin = Cm(1.5)
    RONG = 21 - 3.6; so = ma[-3:]
    f = sec.footer.paragraphs[0]; f.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = f.add_run('Mã đề %s – Trang ' % so); r.font.size = Pt(10)
    for t in ('begin', None, 'end'):
        r = f.add_run(); r.font.size = Pt(10)
        e = OxmlElement('w:fldChar' if t else 'w:instrText')
        if t: e.set(qn('w:fldCharType'), t)
        else: e.set(qn('xml:space'), 'preserve'); e.text = 'PAGE'
        r._r.append(e)
    def para(t='', dam=False, nghieng=False, giua=False, truoc=0):
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER if giua else WD_ALIGN_PARAGRAPH.JUSTIFY; p.paragraph_format.space_before = Pt(truoc)
        if t: rr = p.add_run(t); rr.bold = dam; rr.italic = nghieng
        return p
    # đầu đề
    t = doc.add_table(rows=1, cols=2); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    A, B = t.cell(0, 0), t.cell(0, 1)
    A.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER; A.paragraphs[0].add_run(a.truong).bold = True
    q = A.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER; q.add_run(a.to)
    for i, (x, dam) in enumerate([(a.ky, True), ('NĂM HỌC ' + a.nam, True), ('Môn: ' + a.mon, True)]):
        q = B.paragraphs[0] if i == 0 else B.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER; q.add_run(x).bold = dam
    para('Thời gian làm bài: %s phút (không kể thời gian phát đề)' % (ch.get('THOIGIAN_PHUT') or '45'), nghieng=True, giua=True, truoc=6)
    tongTN = sum(float(x['w']) for x in ds if x['loai'] != 'TL')
    p = para(); p.paragraph_format.tab_stops.add_tab_stop(Cm(RONG), WD_TAB_ALIGNMENT.RIGHT)
    p.add_run('Hình thức: Trắc nghiệm khách quan (%g điểm)%s\t' % (tongTN, ' + Tự luận (%g điểm)' % (10 - tongTN) if tuluan and tongTN < 10 else '')); p.add_run('Mã đề ' + so).bold = True
    para('Họ và tên: ................................................................ Số báo danh: .................... Lớp: ...........', truoc=6)
    ph = {'TN': [], 'DS': [], 'TLN': []}
    for x in ds: ph[x['loai']].append(x)
    def diemPhan(L): return '%g' % sum(float(x['w']) for x in ph[L])
    tieu = {'TN': ('PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (%s điểm). ', 'Học sinh trả lời từ câu 1 đến câu %d. Mỗi câu hỏi học sinh chỉ chọn một phương án.'),
            'DS': ('PHẦN II. Câu trắc nghiệm đúng sai (%s điểm). ', 'Học sinh trả lời từ câu 1 đến câu %d. Trong mỗi ý a), b), c), d) ở mỗi câu, học sinh chọn đúng hoặc sai.'),
            'TLN': ('PHẦN III. Câu trắc nghiệm trả lời ngắn (%s điểm). ', 'Học sinh trả lời từ câu 1 đến câu %d.')}
    vw = VietWord(doc, cs)
    for L in ('TN', 'DS', 'TLN'):
        if not ph[L]: continue
        p = para(truoc=8); p.add_run(tieu[L][0] % diemPhan(L)).bold = True; p.add_run(tieu[L][1] % len(ph[L]))
        for i, x in enumerate(ph[L]):
            p = vw.moi(); p.add_run('Câu %d. ' % (i + 1)).bold = True
            hoi = x['hoi'] if re.search(r'<[a-z]', x['hoi']) else html.escape(x['hoi']).replace('\n', '<br>')
            HtmlDoc(vw).feed(hoi); vw.p = None
            rel = duongHinh(x['hinh'], cs.maGoc)
            if rel and not re.search(r'<img', x['hoi']): vw.anh(rel)
            if L == 'TN':
                dai = max(len(re.sub(r'<[^>]+>', '', o)) for o in x['pa'])
                nhom = [[0, 1, 2, 3]] if dai <= 16 else [[0, 1], [2, 3]] if dai <= 38 else [[0], [1], [2], [3]]
                for g in nhom:
                    p = vw.moi(); p.paragraph_format.left_indent = Cm(0.6)
                    for k in range(1, len(g)): p.paragraph_format.tab_stops.add_tab_stop(Cm(RONG / len(g) * k + 0.6))
                    for j, k in enumerate(g):
                        if j: p.add_run('\t')
                        p.add_run('ABCD'[k] + '. ').bold = True; vw.p = p; HtmlDoc(vw).feed(x['pa'][k])
                    vw.p = None
            elif L == 'DS':
                for k in range(4):
                    p = vw.moi(); p.paragraph_format.left_indent = Cm(0.6); p.add_run('abcd'[k] + ') ').bold = True; vw.p = p; HtmlDoc(vw).feed(x['pa'][k]); vw.p = None
    if tuluan: para(truoc=8); chepTuLuan(doc, tuluan)
    para('---------- HẾT ----------', dam=True, giua=True, truoc=8)
    para('Học sinh không được sử dụng tài liệu. Giáo viên coi kiểm tra không giải thích gì thêm.', nghieng=True, giua=True)
    out = os.path.join(ra, 'DE-%s.docx' % ma); doc.save(out); return out

# ---------------- Đáp án ----------------
def taoDapAn(tien, MA, a, thang, ra):
    d = Document(); s = d.styles['Normal']; s.font.name = 'Times New Roman'; s.font.size = Pt(12)
    d.add_heading('ĐÁP ÁN – %s (%d MÃ ĐỀ)' % (a.ky, len(MA)), 1)
    tl = {'K10': '0.2 / 0.4 / 0.7 / 1', 'K12': '0.1 / 0.25 / 0.5 / 1'}.get(thang, thang.replace(';', ' / '))
    m0 = list(MA.values())[0]; w = {L: [x['w'] for x in m0 if x['loai'] == L] for L in ('TN', 'DS', 'TLN')}
    d.add_paragraph('Phần I mỗi câu %s điểm · Phần II đúng 1/2/3/4 ý: %s × điểm câu (%s điểm/câu) · Phần III mỗi câu %s điểm.' % (
        (w['TN'] or ['-'])[0], tl, (w['DS'] or ['-'])[0], (w['TLN'] or ['-'])[0]))
    for L, ten in (('TN', 'PHẦN I'), ('DS', 'PHẦN II'), ('TLN', 'PHẦN III')):
        n = len(w[L])
        if not n: continue
        d.add_paragraph().add_run(ten).bold = True
        for a0 in range(0, n, 10):
            cot = list(range(a0, min(n, a0 + 10)))
            t = d.add_table(rows=1 + len(MA), cols=1 + len(cot)); t.style = 'Table Grid'; t.cell(0, 0).text = 'Mã đề'
            for j, c in enumerate(cot): t.cell(0, j + 1).text = str(c + 1)
            for i, (ma, ds) in enumerate(MA.items()):
                q = [x for x in ds if x['loai'] == L]; t.cell(i + 1, 0).text = ma[-3:]
                for j, c in enumerate(cot): t.cell(i + 1, j + 1).text = q[c]['da'].replace('D', 'Đ') if L == 'DS' else q[c]['da']
            d.add_paragraph()
    d.add_paragraph().add_run('BẢNG ĐỐI CHIẾU VỚI ĐỀ GỐC').bold = True
    ten = list(MA.keys()); t = d.add_table(rows=1, cols=1 + len(ten)); t.style = 'Table Grid'; t.cell(0, 0).text = 'Câu gốc'
    for j, m in enumerate(ten): t.cell(0, j + 1).text = 'Mã ' + m[-3:]
    goc = sorted({x['goc'].split(':')[0] for x in m0}, key=lambda c: ({'I': 1, 'II': 2, 'III': 3}[c.split('.')[0]], int(c.split('.')[1])))
    for g in goc:
        r = t.add_row().cells; r[0].text = g
        for j, m in enumerate(ten):
            y = [z for z in MA[m] if z['goc'].split(':')[0] == g][0]; r[j + 1].text = y['cau'] + (' (ý ' + y['goc'].split(':')[1] + ')' if ':' in y['goc'] else '')
    d.add_paragraph('"II.2 (ý bcad)": câu gốc nằm ở câu II.2 của mã đó; ý a của mã đó là ý b của đề gốc, ý b là ý c gốc…')
    out = os.path.join(ra, 'DAP-AN-%s.docx' % tien); d.save(out); return out

# ---------------- Excel nạp kho ----------------
def taoKho(tien, MA, ch, a, thang, ra):
    wb = Workbook(); wb.remove(wb.active)
    for ma, ds in MA.items():
        ws = wb.create_sheet(ma); ws.append(['Cau', 'NoiDung', 'A', 'B', 'C', 'D', 'DapAn', 'Hinh', 'Loai', 'Diem', 'Goc'])
        for x in ds:
            rel = duongHinh(x['hinh'], a.maGoc)
            ws.append([x['cau'], x['hoi']] + x['pa'] + [x['da'].replace('D', 'Đ') if x['loai'] == 'DS' else x['da'], rel or x['hinh'], x['loai'], x['w'], x['goc']])
    c = wb.create_sheet('CAU HINH THEM'); c.append(['MaDot', 'TenBai', 'ThoiGian_phut', 'TrangThai', 'ChoXemLai', 'Lop', 'Kieu', 'ThangDS'])
    k = wb.create_sheet('KIEN THUC THEM'); k.append(['MaDot', 'Cau', 'KienThuc', 'MucDo'])
    g = wb.create_sheet('GIAI THICH THEM'); g.append(['MaDot', 'Cau', 'GiaiThich'])
    for ma, ds in MA.items():
        c.append([ma, ch.get('TENBAI') or a.ky, ch.get('THOIGIAN_PHUT') or '45', 'DONG', 'KHONG', a.lop or ch.get('LOP', ''), 'GIAY', thang])
        for x in ds:
            k.append([ma, x['cau'], x['kt'], x['md']])
            if x['gt']: g.append([ma, x['cau'], x['gt']])
    for s in wb.worksheets:
        for cell in s[1]: cell.font = Font(bold=True)
        for row in s.iter_rows():
            for cell in row: cell.number_format = '@'
    out = os.path.join(ra, 'KHO-DE-%s-GIAY.xlsx' % tien); wb.save(out); return out

def pdf(f, ra):
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', ra, f], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--kho', required=True); ap.add_argument('--word'); ap.add_argument('--so-ma', type=int, default=4); ap.add_argument('--ra', default='ra-tron')
    ap.add_argument('--tron-ca-goc', action='store_true'); ap.add_argument('--seed', type=int, default=None)
    ap.add_argument('--truong', default='TRƯỜNG THPT ……………………'); ap.add_argument('--to', default='Tổ: Hóa học'); ap.add_argument('--ky', default=None)
    ap.add_argument('--nam', default='2026 – 2027'); ap.add_argument('--mon', default=None); ap.add_argument('--thang', default=None); ap.add_argument('--lop', default='')
    ap.add_argument('--khong-pdf', action='store_true'); ap.add_argument('--hinh', default=None, help='thư mục chứa image1.png… của đề gốc')
    a = ap.parse_args()
    maGoc, goc, ch = docKho(a.kho); a.maGoc = maGoc
    tien = re.sub(r'-\d{3}$', '', maGoc); khoi = (re.match(r'^[A-Z]+(\d+)', tien) or [None, ''])[1]
    a.ky = a.ky or (ch.get('TENBAI') or 'ĐỀ KIỂM TRA').upper()
    a.mon = a.mon or ('KHOA HỌC TỰ NHIÊN ' + khoi if khoi in ('6', '7', '8', '9') else 'HÓA HỌC – Lớp ' + khoi)
    thang = a.thang or ch.get('THANGDS') or ('K10' if khoi == '10' else 'K12')
    loi = [c['cau'] for c in goc if c['loai'] not in ('TN', 'DS', 'TLN')]
    if loi: sys.exit('Cột Loai không hợp lệ ở câu: %s' % loi)
    if not 1 <= a.so_ma <= 9: sys.exit('--so-ma từ 1 đến 9')
    rnd = random.Random(a.seed); canh = set()
    MA = {'%s-2%02d' % (tien, i + 1): tron1(goc, i == 0 and not a.tron_ca_goc, rnd, canh) for i in range(a.so_ma)}
    kiemTra(goc, MA)
    os.makedirs(a.ra, exist_ok=True)
    tl = phanTuLuan(a.word)
    if a.word and not tl: canh.add('Đề Word không có phần "PHẦN IV" (tự luận) – đề in chỉ có Phần I–III')
    class CS: pass
    cs = CS(); cs.maGoc = maGoc; cs.canh = canh
    cs.thuMuc = ([a.hinh] if a.hinh else []) + [os.path.dirname(os.path.abspath(a.kho))] + ([layHinhWord(a.word, a.ra)] if a.word else [])
    files = [taoKho(tien, MA, ch, a, thang, a.ra)]
    for ma, ds in MA.items():
        f = taoDe(ma, ds, a, ch, tl, cs, a.ra); files.append(f)
        if not a.khong_pdf: pdf(f, a.ra)
    f = taoDapAn(tien, MA, a, thang, a.ra); files.append(f)
    if not a.khong_pdf: pdf(f, a.ra)
    thieuKT = [c['cau'] for c in goc if not c['kt']]; thieuGT = [c['cau'] for c in goc if not c['gt']]
    if thieuKT: canh.add('Đề gốc thiếu kiến thức ở câu: ' + ', '.join(thieuKT))
    if thieuGT: canh.add('Đề gốc thiếu lời giải ở câu: ' + ', '.join(thieuGT))
    print(json.dumps({'goc': maGoc, 'ma': list(MA), 'thang': thang, 'so_cau': {L: sum(1 for c in goc if c['loai'] == L) for L in ('TN', 'DS', 'TLN')},
                      'tong_diem_trac_nghiem': round(sum(float(c['w']) for c in goc), 3), 'tu_luan': bool(tl), 'canh_bao': sorted(canh),
                      'file': sorted(f for f in os.listdir(a.ra) if not f.startswith('_'))}, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()
