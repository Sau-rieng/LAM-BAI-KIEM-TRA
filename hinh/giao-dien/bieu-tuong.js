/* Bieu tuong hoa hoc dung chung (SVG net, mau theo currentColor) */
window.BT = (function () {
  var t = function (d) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var nguyenTu = '<circle cx="16" cy="16" r="2.4" fill="currentColor"/><ellipse cx="16" cy="16" rx="12" ry="4.6"/><ellipse cx="16" cy="16" rx="12" ry="4.6" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="12" ry="4.6" transform="rotate(-60 16 16)"/>';
  return {
    de: t('<rect x="7" y="6" width="18" height="22" rx="3"/><rect x="12" y="3.5" width="8" height="5" rx="1.5"/><path d="M11.5 17.5l3 3 6-6.5"/>'),
    qr: t('<rect x="5" y="5" width="8" height="8" rx="1.5"/><rect x="19" y="5" width="8" height="8" rx="1.5"/><rect x="5" y="19" width="8" height="8" rx="1.5"/><path d="M19 19h3v3h-3zM25 25h2v2M19 26h2M26 19v3"/>'),
    hs: t('<circle cx="12" cy="11" r="4.2"/><path d="M4.5 26c1-5 4-7.5 7.5-7.5s6.5 2.5 7.5 7.5"/><path d="M23 26v-6M27.5 26V15"/>'),
    tro: t('<path d="M9 11h14a5 5 0 0 1 5 4.6l.8 6.4a3 3 0 0 1-5.2 2.3L21 22H11l-2.6 2.3A3 3 0 0 1 3.2 22l.8-6.4A5 5 0 0 1 9 11z"/><path d="M10.5 14.5v4M8.5 16.5h4"/><circle cx="21" cy="15.5" r="1" fill="currentColor"/><circle cx="23.8" cy="18.3" r="1" fill="currentColor"/>'),
    kq: t('<path d="M10.5 5h11v7a5.5 5.5 0 0 1-11 0z"/><path d="M10.5 7H6.5a4 4 0 0 0 4.4 5M21.5 7h4a4 4 0 0 1-4.4 5M16 17.5v4M11 27h10M13 21.5h6V27h-6z"/>'),
    ml: t('<rect x="5" y="5" width="9" height="9" rx="2"/><rect x="18" y="5" width="9" height="9" rx="2"/><rect x="5" y="18" width="9" height="9" rx="2"/><rect x="18" y="18" width="9" height="9" rx="2"/>'),
    tn: t(nguyenTu),
    ma: t('<circle cx="10.5" cy="16" r="5"/><path d="M15.5 16H28M24 16v4M28 16v3"/>'),
    dt: t('<path d="M12.5 4h7M14 4v8.5L7.3 24.6A2.3 2.3 0 0 0 9.3 28h13.4a2.3 2.3 0 0 0 2-3.4L18 12.5V4"/><path d="M10 21h12"/><circle cx="14" cy="24.5" r=".8" fill="currentColor"/><circle cx="18" cy="23.5" r=".8" fill="currentColor"/>'),
    xem: t('<path d="M8 4h11l6 6v18H8z"/><path d="M19 4v6h6"/><circle cx="15" cy="18" r="4"/><path d="M18 21l3.5 3.5"/>'),
    ong: t('<path d="M20 4l8 4.6M22 5.5L11.5 23.6a4 4 0 0 1-7-4L15 1.6"/><path d="M8.5 17h7"/>'),
    benzen: t('<path d="M16 4l10.4 6v12L16 28 5.6 22V10z"/><circle cx="16" cy="16" r="5.5"/>'),
    nhom: t('<circle cx="11" cy="11" r="3.6"/><circle cx="21.5" cy="11" r="3.6"/><path d="M4 25c.8-4 3.6-6.4 7-6.4s6.2 2.4 7 6.4M18 19.2c1-.4 2.2-.6 3.5-.6 3.4 0 6.2 2.4 7 6.4"/>')
  };
})();
