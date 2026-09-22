/* التتبع والإرسال: بيتحمّل في الصفحة الرئيسية وصفحة الشكر */
(function () {
  var C = window.CONFIG;
  if (C.pixelId) {
    (function (f, b, e, v) { if (f.fbq) return; var n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; var t = b.createElement(e); t.async = true; t.src = v; b.head.appendChild(t); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', C.pixelId); fbq('track', 'PageView');
  }
  if (C.clarityId) {
    (function (c, l, a, r, i) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; var t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; l.head.appendChild(t); })(window, document, 'clarity', 'script', C.clarityId);
  }
  window.TX = {
    configured: !!C.appsScriptUrl,
    track: function (e, d, id) { try { if (window.fbq) fbq('track', e, d || {}, id ? { eventID: id } : undefined); } catch (x) {} },
    send: function (d) {
      if (!C.appsScriptUrl) { console.warn('appsScriptUrl فاضي: وضع تجريبي، مش هيتسجل حاجة', d); return Promise.resolve(); }
      return fetch(C.appsScriptUrl, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(d) });
    }
  };
})();
