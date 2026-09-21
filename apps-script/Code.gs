const SS = SpreadsheetApp.getActiveSpreadsheet();
const HEAD = {
  Orders: ['التاريخ','رقم الطلب','الاسم','التليفون','المحافظة','العنوان','العرض','الكمية','الشحن','الإجمالي','الحالة','المصدر','الكوبون'],
  Leads: ['التاريخ','الاسم','التليفون','المصدر','اتحوّل لأوردر؟'],
  Reviews: ['التاريخ','الاسم','التقييم','التعليق','موافق']
};

function sheet_(n) {
  let s = SS.getSheetByName(n) || SS.insertSheet(n);
  if (s.getLastRow() === 0) {
    s.appendRow(HEAD[n]); s.setFrozenRows(1);
    s.getRange(1, 1, 1, HEAD[n].length).setFontWeight('bold');
  }
  return s;
}
// يمنع حقن المعادلات في الشيت
function clean_(v, max) {
  v = String(v || '').trim().slice(0, max || 200);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
const okPhone_ = p => /^01[0125]\d{8}$/.test(String(p));
const out_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function recentPhone_(s, col, phone, minutes, rows) {
  const last = s.getLastRow(); if (last < 2) return false;
  const from = Math.max(2, last - rows + 1);
  const v = s.getRange(from, 1, last - from + 1, s.getLastColumn()).getValues();
  const limit = Date.now() - minutes * 60000;
  return v.some(r => String(r[col]).replace(/^'/, '') === phone && new Date(r[0]).getTime() > limit);
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.type === 'order') order_(d);
    else if (d.type === 'lead') lead_(d);
    else if (d.type === 'review') review_(d);
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false }); }
  finally { lock.releaseLock(); }
}

function order_(d) {
  if (!okPhone_(d.phone) || String(d.name).length < 3) return;
  const s = sheet_('Orders');
  if (recentPhone_(s, 3, d.phone, 10, 50)) return; // منع التكرار
  s.appendRow([new Date(), clean_(d.id, 30), clean_(d.name, 80), "'" + d.phone, clean_(d.gov, 40),
    clean_(d.address, 250), clean_(d.offer, 60), Number(d.qty) || 1, Number(d.ship) || 0,
    Number(d.total) || 0, 'جديد', clean_(d.src, 120), clean_(d.coupon, 20)]);
  const r = s.getLastRow();
  s.getRange(r, 11).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['جديد','تم التأكيد','مفيش رد','اتشحن','اتسلّم','مرتجع','ملغي'], true).build());
}

function lead_(d) {
  if (!okPhone_(d.phone)) return;
  const s = sheet_('Leads');
  if (recentPhone_(s, 2, d.phone, 1440, 100)) return;
  s.appendRow([new Date(), clean_(d.name, 80), "'" + d.phone, clean_(d.src, 120)]);
  const r = s.getLastRow();
  s.getRange(r, 5).setFormula(`=IF(COUNTIF(Orders!D:D,C${r})>0,"نعم","لا")`);
}

function review_(d) {
  const stars = Math.min(5, Math.max(1, Number(d.stars) || 5));
  if (String(d.text).length < 5) return;
  const s = sheet_('Reviews');
  s.appendRow([new Date(), clean_(d.name, 60), stars, clean_(d.text, 400), false]);
  s.getRange(s.getLastRow(), 5).insertCheckboxes(); // علّم "موافق" عشان يظهر في الصفحة
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'reviews') {
    const v = sheet_('Reviews').getDataRange().getValues().slice(1)
      .filter(r => r[4] === true).slice(-20).reverse()
      .map(r => ({ name: r[1], stars: r[2], text: r[3] }));
    return out_(v);
  }
  return out_({ ok: true });
}

// شغّلها مرة واحدة يدويًا عشان تنشئ الأوراق
function setup() { ['Orders','Leads','Reviews'].forEach(sheet_); }
