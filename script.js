(function () {
  'use strict';
  var C = window.CONFIG, TX = window.TX;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (n) { return Number(n).toLocaleString('ar-EG'); };
  var fmt = function (n) { return num(n) + ' ج.م'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var digits = function (s) { return s.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); };
  var okPhone = function (p) { return /^01[0125]\d{8}$/.test(p); };
  var q = new URLSearchParams(location.search);
  var src = ['utm_source', 'utm_campaign', 'utm_content'].map(function (k) { return q.get(k); }).filter(Boolean).join('|') || (q.get('fbclid') ? 'fb' : 'direct');

  $$('[data-brand]').forEach(function (e) { e.textContent = C.brand; });
  $$('[data-warranty]').forEach(function (e) { e.textContent = num(C.warrantyDays); });
  $$('[data-delivery]').forEach(function (e) { e.textContent = C.delivery; });
  if (C.returnUrl) { ['#retBtn', '#fRet'].forEach(function (s) { var a = $(s); a.href = C.returnUrl; a.hidden = false; }); }
  if (C.facebookUrl) { ['#fFb', '#fbIcon'].forEach(function (s) { var a = $(s); a.href = C.facebookUrl; a.hidden = false; }); }

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
  if (pct(o0)) { var bd = $('#discBadge'); bd.textContent = 'خصم ' + num(pct(o0)) + '٪'; bd.hidden = false; }
  $('#shipnote').textContent = o0.ship ? '+ شحن ' + fmt(o0.ship) : 'شحن مجاني';
  $('#faqShip').textContent = 'شحن مجاني على عروض الشنطة + الباور بانك. لو طلبت الشنطة لوحدها، الشحن ' + fmt(C.bagOnlyOffers[0].ship) + ' للقطعة الواحدة، ومجاني لو طلبت قطعتين أو أكتر.';

  /* ---------- العداد: ٢٤ ساعة لكل زائر، بيتجدد لو رجع بعد ما تنتهي ---------- */
  var offerHours = C.offerHours || 24, offerMs = offerHours * 36e5, timer;
  var start;
  try {
    start = +localStorage.getItem('tx_offer_start');
    if (!start || Date.now() - start > offerMs) { start = Date.now(); localStorage.setItem('tx_offer_start', start); }
  } catch (x) { start = Date.now(); }
  var end = start + offerMs;
  function tick() {
    var d = end - Date.now();
    if (!(d > 0)) {
      start = Date.now(); end = start + offerMs;
      try { localStorage.setItem('tx_offer_start', start); } catch (x) {}
      d = offerMs;
    }
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
  var v = $('#vid'), vb = $('#vplay'), vs = $('#vsound');
  function vPlay() { var p = v.play(); if (p && p.then) p.then(function () { vb.classList.add('hide'); }).catch(function () { vb.classList.remove('hide'); }); }
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

  var f = $('#f'), firstOk = -1, radios = [], bundleMode = true;

  function renderOffers(list) {
    $('#offers').innerHTML = '';
    firstOk = -1;
    $('#offers').insertAdjacentHTML('beforeend', list.map(function (o, i) {
      var dis = o.qty > stock;
      if (!dis && firstOk < 0) firstOk = i;
      return '<label class="offer' + (dis ? ' dis' : '') + '"><input type="radio" name="offer" value="' + i + '"' + (dis ? ' disabled' : '') + '><span class="dot"></span>' +
        '<span class="t"><span>' + esc(o.label) + '</span>' + (o.badge ? '<em>' + esc(o.badge) + '</em>' : '') + '</span>' +
        '<span class="p"><b>' + fmt(o.price) + '</b>' + (o.old ? '<s>' + fmt(o.old) + '</s>' : '') + '</span></label>';
    }).join(''));
    radios = $$('[name=offer]');
    if (firstOk >= 0) radios[firstOk].checked = true;
    radios.forEach(function (r) { r.addEventListener('change', upd); });
  }
  var sel = function () { var list = bundleMode ? C.offers : C.bagOnlyOffers; var r = radios.filter(function (x) { return x.checked; })[0]; return list[r ? +r.value : 0]; };

  function calc() {
    var o = sel();
    return { o: o, ship: o.ship, total: o.price + o.ship };
  }
  function upd() {
    radios.forEach(function (r) { r.closest('.offer').classList.toggle('on', r.checked); });
    var c = calc();
    $('#sPrice').textContent = fmt(c.o.price);
    $('#sShip').textContent = c.ship ? fmt(c.ship) : 'مجاني';
    $('#sTotal').textContent = fmt(c.total);
    $('#stickyPrice').textContent = fmt(c.total);
  }
  function setMode(bundle) {
    bundleMode = bundle;
    $('#modeBundle').classList.toggle('on', bundle);
    $('#modeBagOnly').classList.toggle('on', !bundle);
    $('#modeBundle').setAttribute('aria-selected', String(bundle));
    $('#modeBagOnly').setAttribute('aria-selected', String(!bundle));
    $('#fheadTitle').textContent = bundle ? 'شنطة + باور بانك' : 'الشنطة لوحدها';
    $('#modeNote').textContent = bundle ? 'باور بانك 10000 مللي أمبير هدية مع أي عرض من دول.' : 'من غير باور بانك. عايز تضيفه؟ دوس "الشنطة + الباور بانك" فوق.';
    renderOffers(bundle ? C.offers : C.bagOnlyOffers);
    upd();
  }
  $('#modeBundle').addEventListener('click', function () { setMode(true); });
  $('#modeBagOnly').addEventListener('click', function () { setMode(false); });
  setMode(true);
  if (stock <= 0) { $('#go').disabled = true; $('#go').textContent = 'الكمية خلصت حاليًا'; }

  function setErr(id, msg) { $('#e-' + id).textContent = msg || ''; }
  function val(id) { return f.elements[id].value.trim(); }

  var started = false, leadSent = false;
  function maybeLead() {
    var p = digits(val('phone'));
    if (okPhone(p) && !leadSent) { leadSent = true; TX.send({ type: 'lead', name: val('fullname'), phone: p, src: src }); TX.track('Lead'); }
  }
  f.elements.fullname.addEventListener('focus', function () { if (!started) { started = true; TX.track('InitiateCheckout', { currency: 'EGP', value: calc().total }); } });
  f.elements.phone.addEventListener('change', maybeLead);

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    ['name', 'phone', 'gov', 'address'].forEach(function (id) { setErr(id); });
    $('#err').textContent = '';
    if (f.elements.hp.value || stock <= 0) return;
    var name = val('fullname'), phone = digits(val('phone')), gov = val('gov'), addr = val('address'), ok = true;
    if (name.length < 3) { setErr('name', 'اكتب اسمك بالكامل'); ok = false; }
    if (!okPhone(phone)) { setErr('phone', 'اكتب رقم موبايل صحيح من ١١ رقم'); ok = false; }
    if (!gov) { setErr('gov', 'اختار المحافظة'); ok = false; }
    if (addr.length < 8) { setErr('address', 'اكتب العنوان بالتفصيل'); ok = false; }
    if (!ok) return;
    maybeLead();

    var c = calc();
    var id = 'TX' + Date.now().toString(36).toUpperCase();
    var coupon = c.o.coupon ? 'NEXT-' + Math.random().toString(36).slice(2, 7).toUpperCase() : '';
    var btn = $('#go'); btn.disabled = true; btn.textContent = 'جاري تسجيل الطلب…';

    TX.send({ type: 'order', id: id, name: name, phone: phone, gov: gov, address: addr, offer: c.o.label, qty: c.o.qty, addon: bundleMode ? 1 : 0, ship: c.ship, total: c.total, coupon: coupon, src: src })
      .then(function () {
        var p = new URLSearchParams({ id: id, total: c.total, offer: c.o.label, phone: phone });
        if (coupon) p.set('coupon', coupon);
        location.href = 'thanks.html?' + p.toString();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'تأكيد الطلب';
        $('#err').textContent = 'حصلت مشكلة في الاتصال. تأكد من النت وجرّب تاني.';
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
    TX.send({ type: 'review', name: el.rname.value, stars: el.stars.value, text: el.rtext.value });
    e.target.outerHTML = '<p class="muted">شكرًا لتقييمك. هيظهر بعد المراجعة.</p>';
  });

  /* ---------- الشريط الثابت ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { $('#sticky').classList.toggle('off', es[0].isIntersecting); }, { threshold: .12 }).observe($('#order'));
  }
  $$('[data-cta]').forEach(function (a) { a.addEventListener('click', function () { TX.track('AddToCart', { currency: 'EGP', value: o0.price }); }); });
  TX.track('ViewContent', { content_name: 'شنطة كروس ضد السرقة', currency: 'EGP', value: o0.price });

  /* ---------- إشعار "فلان طلب كذا": أوردرات حقيقية من الشيت بس، مفيش أسماء وهمية ---------- */
  if (C.appsScriptUrl) {
    fetch(C.appsScriptUrl + '?action=recent').then(function (r) { return r.json(); }).then(function (list) {
      if (!Array.isArray(list) || !list.length) return;
      var box = $('#orderNotify'), nameEl = $('#notifyName'), detailEl = $('#notifyDetail');
      var i = 0, stopped = false, timer;
      function detailText(o) {
        var d = 'طلب ' + o.offer + (o.addon ? ' وباور بانك' : '');
        return o.gov ? d + ' — ' + o.gov : d;
      }
      function showNext() {
        if (stopped) return;
        var o = list[i % list.length]; i++;
        nameEl.textContent = o.name;
        detailEl.textContent = detailText(o);
        box.hidden = false;
        requestAnimationFrame(function () { box.classList.add('show'); });
        setTimeout(function () {
          box.classList.remove('show');
          setTimeout(function () { box.hidden = true; if (!stopped) timer = setTimeout(showNext, 4500); }, 300);
        }, 4500);
      }
      $('#notifyClose').addEventListener('click', function () {
        stopped = true; clearTimeout(timer);
        box.classList.remove('show');
        setTimeout(function () { box.hidden = true; }, 300);
      });
      timer = setTimeout(showNext, 5000);
    }).catch(function () {});
  }
})();
