// DANH SACH LOP - dung chung cho LAM-BAI.html va XEM-LAI.html
// ten: ten lop; tiento: 6 so dau cua SBD; url: duong link /exec cua file SO THEO DOI lop do
window.DS_LOP = [
  { ten: '10E01', tiento: '261001', url: 'https://script.google.com/macros/s/AKfycbyyJbdbnq02jY1fSWdaMNEIWr-q9VH2rWVyBLlNTfUEtvFq3IoYYsJ5IJlIL42YoUVNTw/exec' },
  { ten: '12G01', tiento: '261201', url: 'https://script.google.com/macros/s/AKfycbxRNblcoD3GG-R-YiioWrfZ2KGcHRFQzUKBYTau6oOsDn1UGMn0vwjcQ4S3WnvI2Y9Njw/exec' },
  { ten: '12G02', tiento: '261202', url: 'https://script.google.com/macros/s/AKfycbyuXPe1iZigF634sF1sOSBODUtksSOtAEXUjnAd5oSkxy_qUp4aplbhNlFjxdRW45WX/exec' },
  { ten: '9D01',  tiento: '260901', url: 'https://script.google.com/macros/s/AKfycbx_eessoVe_9zu32-LHHVtqOFGShs4mlv36YdSlXRRQCaRXA_3PesfFlMHKVvhKtZY/exec' },
  { ten: '9D03',  tiento: '260903', url: 'https://script.google.com/macros/s/AKfycbyEViQtxxKc8hxAGypHW3QBAKneChPupD9PF-KZi136plRvNIycQ6HT-B5Ge-geM0MMXw/exec' }
];

// ---- LOP DUNG THU (DEMO): kho de ban sao + so theo doi rieng, bo ma rieng; mo trang voi ?demo ----
window.DS_LOP_DEMO = [
  { ten: 'DEMO', tiento: '269999', url: 'CHUA_CO_LINK_DEMO' }
];
window.LAM_DEMO = /[?&]demo(=|&|$)/i.test(location.search);
if (window.LAM_DEMO) {
  window.DS_LOP = window.DS_LOP_DEMO;
  (function () {
    var b = document.createElement('div');
    b.textContent = 'BẢN DÙNG THỬ · lớp DEMO · không ảnh hưởng các lớp thật';
    b.style.cssText = 'position:sticky;top:0;z-index:60;background:#a06b00;color:#fff;text-align:center;font:600 14px -apple-system,Segoe UI,Arial,sans-serif;padding:6px 10px';
    document.body.insertBefore(b, document.body.firstChild);
  })();
}
