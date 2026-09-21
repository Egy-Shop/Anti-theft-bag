(function () {
  'use strict';
  var C = window.CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (n) { return Number(n).toLocaleString('ar-EG'); };
  var fmt = function (n) { return num(n) + ' ج.م'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var digits = function (s) { return s.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); };
  var okPhone = function (p) { return /^01[0125]\d{8}$/.test(p); };
  var q = new URLSearchParams(location.search);
  var src = ['utm_source', 'utm_campaign', 'utm_content'].map(function (k) { return q.get(k); }).filter(Boolean).join('|') || (q.get('fbclid') ? 'fb' : 'direct');

  /* ---------- التتبع ---------- */
  if (C.pixelId) {
    (function (f, b, e, v) { if (f.fbq) return; var n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; var t = b.createElement(e); t.async = true; t.src = v; b.head.appendChild(t); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', C.pixelId); fbq('track', 'PageView');
  }
  if (C.clarityId) {
    (function (c, l, a, r, i) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; var t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; l.head.appendChild(t); })(window, document, 'clarity', 'script', C.clarityId);
  }
  var track = function (e, d, id) { try { if (window.fbq) fbq('track', e, d || {}, id ? { eventID: id } : undefined); } catch (x) {} };
  var send = function (d) {
    if (!C.appsScriptUrl) { console.warn('appsScriptUrl فاضي، الطلب مش هيتسجل:', d); return Promise.resolve(); }
    return fetch(C.appsScriptUrl, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(d) });
  };

  /* ---------- نصوص ثابتة من الإعدادات ---------- */
  $$('[data-brand]').forEach(function (e) { e.textContent = C.brand; });
  $$('[data-warranty]').forEach(function (e) { e.textContent = num(C.warrantyDays); });
  $$('[data-delivery]').forEach(function (e) { e.textContent = C.delivery; });
  if (C.returnUrl) { ['#retBtn', '#fRet'].forEach(function (s) { var a = $(s); a.href = C.returnUrl; a.hidden = false; }); }
  if (C.facebookUrl) { var fb = $('#fFb'); fb.href = C.facebookUrl; fb.hidden = false; }

  /* ---------- المخزون ---------- */
  var stock = Math.max(0, +C.stock || 0), total = Math.max(stock, +C.stockTotal || stock || 1);
  var stockMsg = stock > 0 ? 'متبقي ' + num(stock) + (stock === 1 ? ' قطعة فقط' : ' قطعة في المخزون') : 'الكمية خلصت حاليًا';
  $('#stockTxt').textContent = stockMsg; $('#formStock').textContent = stockMsg;
  requestAnimationFrame(function () { $('#stockBar').style.width = Math.max(4, stock / total * 100) + '%'; });

  /* ---------- الأسعار ---------- */
  var offers = C.offers, o0 = offers[0];
  var pct = function (o) { return o.old ? Math.round((1 - o.price / o.old) * 100) : 0; };
  $('#price').textContent = fmt(o0.price);
  $('#old').textContent = o0.old ? fmt(o0.old) : '';
  if (pct(o0)) { var b = $('#discBadge'); b.textContent = 'خصم ' + num(pct(o0)) + '٪'; b.hidden = false; }
  var free = offers.filter(function (o) { return !o.ship; })[0];
  var freeTxt = free ? (free.qty === 2 ? 'قطعتين' : num(free.qty) + ' قطع') : '';
  $('#shipnote').textContent = o0.ship ? '+ شحن ' + fmt(o0.ship) + (free ? ' · مجاني لو طلبت ' + freeTxt + ' أو أكتر' : '') : 'شحن مجاني';
  $('#faqShip').textContent = o0.ship ? 'الشحن ' + fmt(o0.ship) + ' للقطعة الواحدة' + (free ? '، ومجاني لو طلبت ' + freeTxt + ' أو أكتر.' : '.') : 'الشحن مجاني.';

  /* ---------- العداد (لعرض حقيقي) ---------- */
  var end = new Date(C.offerEnds).getTime(), timer;
  function tick() {
    var d = end - Date.now();
    if (!(d > 0)) { $('#cdWrap').hidden = true; clearInterval(timer); return; }
    var p = function (n) { return String(n).padStart(2, '0'); }, days = Math.floor(d / 864e5);
    $('#cd').innerHTML = (days ? num(days) + ' يوم و ' : '') + '<span dir="ltr">' + [Math.floor(d % 864e5 / 36e5), Math.floor(d % 36e5 / 6e4), Math.floor(d % 6e4 / 1e3)].map(p).join(':') + '</span>';
  }
  timer = setInterval(tick, 1000); tick();

  /* ---------- معرض الصور ---------- */
  var slides = $$('.slide'), thumbs = $$('#thumbs button'), box = $('#slides');
  thumbs.forEach(function (t, i) {
    t.addEventListener('click', function () { slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); });
  });
  if ('IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var i = slides.indexOf(e.target); thumbs.forEach(function (t, k) { t.classList.toggle('on', k === i); }); }
      });
    }, { root: box, threshold: .6 });
    slides.forEach(function (s) { gio.observe(s); });
  }

  /* ---------- الفيديو ---------- */
  var v = $('#vid'), vb = $('#vplay');
  function vPlay() { var p = v.play(); if (p && p.then) p.then(function () { vb.classList.add('hide'); }).catch(function () { vb.classList.remove('hide'); }); }
  var vs = $('#vsound');
  vs.addEventListener('click', function () { v.muted = !v.muted; vs.querySelector('use').setAttribute('href', v.muted ? '#i-mute' : '#i-sound'); vs.setAttribute('aria-label', v.muted ? 'تشغيل الصوت' : 'كتم الصوت'); if (v.paused) vPlay(); });
  vb.addEventListener('click', function () { vPlay(); });
  v.addEventListener('click', function () { if (v.paused) vPlay(); else { v.pause(); vb.classList.remove('hide'); } });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? vPlay() : v.pause(); }, { threshold: .55 }).observe(v);
  }

  /* ---------- الأكورديون ---------- */
  $$('.acc-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.nextElementSibling.classList.toggle('open', !open);
    });
  });

  /* ---------- فورم الطلب ---------- */
  var GOV = 'القاهرة الجيزة الإسكندرية القليوبية الشرقية الدقهلية الغربية المنوفية البحيرة كفر_الشيخ دمياط بورسعيد الإسماعيلية السويس الفيوم بني_سويف المنيا أسيوط سوهاج قنا الأقصر أسوان البحر_الأحمر الوادي_الجديد مطروح شمال_سيناء جنوب_سيناء'.split(' ');
  $('#gov').insertAdjacentHTML('beforeend', GOV.map(function (g) { g = g.replace('_', ' '); return '<option>' + g + '</option>'; }).join(''));

  var f = $('#f'), firstOk = -1;
  $('#offers').insertAdjacentHTML('beforeend', offers.map(function (o, i) {
    var dis = o.qty > stock;
    if (!dis && firstOk < 0) firstOk = i;
    var pc = pct(o);
    return '<label class="offer' + (dis ? ' dis' : '') + '"><input type="radio" name="offer" value="' + i + '"' + (dis ? ' disabled' : '') + '><span class="dot"></span>' +
      '<span class="t"><span>' + esc(o.label) + '</span>' + (o.badge ? '<em>' + esc(o.badge) + '</em>' : '') + '</span>' +
      '<span class="p"><b>' + fmt(o.price) + '</b>' + (o.old ? '<s>' + fmt(o.old) + '</s>' : '') + '</span></label>';
  }).join(''));
  var radios = $$('[name=offer]', f);
  if (firstOk >= 0) radios[firstOk].checked = true;
  var sel = function () { var r = radios.filter(function (x) { return x.checked; })[0]; return offers[r ? +r.value : 0]; };
  function upd() {
    var o = sel();
    radios.forEach(function (r) { r.closest('.offer').classList.toggle('on', r.checked); });
    $('#sPrice').textContent = fmt(o.price);
    $('#sShip').textContent = o.ship ? fmt(o.ship) : 'مجاني';
    $('#sTotal').textContent = fmt(o.price + o.ship);
    $('#stickyPrice').textContent = fmt(o.price + o.ship);
  }
  f.addEventListener('change', upd); upd();
  if (stock <= 0) { var go0 = $('#go'); go0.disabled = true; go0.textContent = 'الكمية خلصت حاليًا'; }

  var started = false, leadSent = false;
  f.addEventListener('focusin', function () { if (!started) { started = true; track('InitiateCheckout', { currency: 'EGP', value: sel().price }); } });
  // تسجيل Lead أول ما الرقم يتكتب صح حتى لو العميل مكملش الطلب
  f.elements.phone.addEventListener('change', function () {
    var p = digits(f.elements.phone.value.trim());
    if (okPhone(p) && !leadSent) { leadSent = true; send({ type: 'lead', name: f.elements.fullname.value, phone: p, src: src }); track('Lead'); }
  });

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = f.elements, phone = digits(el.phone.value.trim()), name = el.fullname.value.trim(), addr = el.address.value.trim(), err = $('#err');
    err.textContent = '';
    if (el.hp.value || stock <= 0) return;
    if (name.length < 3) { err.textContent = 'اكتب اسمك بالكامل'; return; }
    if (!okPhone(phone)) { err.textContent = 'اكتب رقم موبايل صحيح من ١١ رقم'; return; }
    if (!el.gov.value) { err.textContent = 'اختار المحافظة'; return; }
    if (addr.length < 8) { err.textContent = 'اكتب العنوان بالتفصيل'; return; }
    var o = sel(), tot = o.price + o.ship, id = 'TX' + Date.now().toString(36).toUpperCase(), btn = $('#go');
    var coupon = o.coupon ? 'NEXT-' + Math.random().toString(36).slice(2, 7).toUpperCase() : '';
    btn.disabled = true; btn.textContent = 'جاري تسجيل الطلب…';
    send({ type: 'order', id: id, name: name, phone: phone, gov: el.gov.value, address: addr, offer: o.label, qty: o.qty, ship: o.ship, total: tot, coupon: coupon, src: src })
      .then(function () {
        track('Purchase', { value: tot, currency: 'EGP', content_name: 'شنطة كروس ضد السرقة', num_items: o.qty }, id);
        f.outerHTML = '<div class="thanks" role="status"><h3>تم استلام طلبك ✅</h3><p>رقم الطلب: <b>' + id + '</b></p><p>هنتصل بيك على ' + esc(phone) + ' لتأكيد الطلب قبل الشحن. خلّي موبايلك متاح.</p>' +
          (coupon ? '<div class="coupon">' + esc(C.couponText) + '<br><b>' + coupon + '</b><br><small>احتفظ بالكود، هتحتاجه في طلبك الجاي.</small></div>' : '') + '</div>';
        $('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'تأكيد الطلب';
        err.textContent = 'حصلت مشكلة في الاتصال. تأكد من النت وجرّب تاني.';
      });
  });

  /* ---------- التقييمات ---------- */
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<svg class="ic' + (i > n ? ' off' : '') + '"><use href="#i-star"/></svg>'; return '<span class="stars">' + s + '</span>'; }
  function drawRev(list) {
    list = list.filter(function (r) { return r && r.name && r.text; });
    $('#revEmpty').hidden = list.length > 0;
    var sm = $('#revSum'); sm.hidden = !list.length;
    if (list.length) {
      var avg = list.reduce(function (a, r) { return a + (+r.stars || 5); }, 0) / list.length;
      sm.innerHTML = stars(Math.round(avg)) + ' ' + num(avg.toFixed(1)) + ' من ٥ · ' + num(list.length) + ' تقييم';
    }
    $('#revList').innerHTML = list.map(function (r) { return '<div class="rev">' + stars(+r.stars || 5) + '<b>' + esc(r.name) + '</b><p>' + esc(r.text) + '</p></div>'; }).join('');
  }
  drawRev(C.reviews || []);
  if (C.appsScriptUrl) {
    fetch(C.appsScriptUrl + '?action=reviews').then(function (r) { return r.json(); })
      .then(function (l) { if (Array.isArray(l)) drawRev((C.reviews || []).concat(l)); }).catch(function () {});
  }
  $('#rf').addEventListener('submit', function (e) {
    e.preventDefault();
    var el = e.target.elements;
    if (el.rname.value.trim().length < 2 || el.rtext.value.trim().length < 5) return;
    send({ type: 'review', name: el.rname.value, stars: el.stars.value, text: el.rtext.value });
    e.target.outerHTML = '<p class="muted">شكرًا لتقييمك. هيظهر بعد المراجعة.</p>';
  });

  /* ---------- الشريط الثابت: يختفي لما الفورم على الشاشة ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { $('#sticky').classList.toggle('off', es[0].isIntersecting); }, { threshold: .12 }).observe($('#order'));
  }
  $$('[data-cta]').forEach(function (a) { a.addEventListener('click', function () { track('AddToCart', { currency: 'EGP', value: o0.price }); }); });
  track('ViewContent', { content_name: 'شنطة كروس ضد السرقة', currency: 'EGP', value: o0.price });
})();
