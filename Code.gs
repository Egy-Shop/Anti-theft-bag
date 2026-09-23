/* ✏️ باك إند شيت ترنديكس — أوردرات + ليدز + تقييمات
   الأعمدة هنا متظبطة بالظبط على البيانات اللي script.js الحالي بيبعتها */

const SHEETS = {
  Orders: ['التاريخ', 'رقم الطلب', 'الاسم', 'التليفون', 'المحافظة', 'العنوان', 'العرض', 'الكمية', 'باور بانك', 'الشحن', 'الإجمالي', 'الحالة', 'المصدر', 'الكوبون'],
  Leads: ['التاريخ', 'الاسم', 'التليفون', 'المصدر'],
  Reviews: ['التاريخ', 'الاسم', 'النجوم', 'التقييم', 'الحالة']
};
const ORDER_STATUSES = ['جديد', 'تم التأكيد', 'مفيش رد', 'اتشحن', 'اتسلّم', 'مرتجع', 'ملغي'];
const REVIEW_STATUSES = ['قيد المراجعة', 'موافق', 'مرفوض'];
const DUPLICATE_WINDOW_MIN = 10; // منع تكرار نفس الرقم كأوردر خلال كام دقيقة

/* شغّل الدالة دي مرة واحدة بس من قائمة Apps Script (Run ← setup) */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    let s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    s.clear();
    const headers = SHEETS[name];
    s.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    s.setFrozenRows(1);
    s.autoResizeColumns(1, headers.length);
  });
  const def = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة1');
  if (def && ss.getSheets().length > 3) ss.deleteSheet(def);
  SpreadsheetApp.flush();
  Logger.log('تم إنشاء شيتات Orders / Leads / Reviews بنجاح.');
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.type === 'order') return handleOrder_(d);
    if (d.type === 'lead') return handleLead_(d);
    if (d.type === 'review') return handleReview_(d);
    return out_({ ok: false, error: 'unknown type' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  if (e.parameter.action === 'reviews') {
    const s = sheet_('Reviews');
    const rows = s.getDataRange().getValues().slice(1);
    const approved = rows
      .filter(function (r) { return r[4] === 'موافق'; })
      .map(function (r) { return { name: r[1], stars: r[2], text: r[3] }; })
      .reverse();
    return out_(approved);
  }
  return out_({ ok: true });
}

function handleOrder_(d) {
  const s = sheet_('Orders');
  const phone = clean_(d.phone, 20);

  // امنع تسجيل نفس الرقم مرتين قريب من بعض (لمس مزدوج / ريفريش)
  const recent = s.getDataRange().getValues().slice(1).slice(-25);
  const now = new Date();
  const dup = recent.some(function (r) {
    return String(r[3]).replace(/^'/, '') === phone && (now - new Date(r[0])) / 60000 < DUPLICATE_WINDOW_MIN;
  });
  if (dup) return out_({ ok: true, duplicate: true });

  s.appendRow([
    now, clean_(d.id, 30), clean_(d.name, 80), "'" + phone, clean_(d.gov, 40),
    clean_(d.address, 250), clean_(d.offer, 80), Number(d.qty) || 1,
    Number(d.addon) ? 'نعم' : 'لا', Number(d.ship) || 0, Number(d.total) || 0,
    'جديد', clean_(d.src, 120), clean_(d.coupon, 20)
  ]);
  const r = s.getLastRow();
  s.getRange(r, 12).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ORDER_STATUSES, true).build()
  );
  return out_({ ok: true, id: d.id });
}

function handleLead_(d) {
  const s = sheet_('Leads');
  const phone = clean_(d.phone, 20);
  const recent = s.getDataRange().getValues().slice(1).slice(-25);
  const now = new Date();
  const dup = recent.some(function (r) {
    return String(r[2]).replace(/^'/, '') === phone && (now - new Date(r[0])) / 60000 < DUPLICATE_WINDOW_MIN;
  });
  if (dup) return out_({ ok: true, duplicate: true });
  s.appendRow([now, clean_(d.name, 80), "'" + phone, clean_(d.src, 120)]);
  return out_({ ok: true });
}

function handleReview_(d) {
  const s = sheet_('Reviews');
  s.appendRow([new Date(), clean_(d.name, 60), Number(d.stars) || 5, clean_(d.text, 500), 'قيد المراجعة']);
  const r = s.getLastRow();
  s.getRange(r, 5).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(REVIEW_STATUSES, true).build()
  );
  return out_({ ok: true });
}

/* ---------- أدوات مساعدة ---------- */
function sheet_(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) throw new Error('شيت "' + name + '" مش موجود — شغّل دالة setup الأول');
  return s;
}
// تنظيف القيمة: يمنع حقن معادلات في الشيت (=, +, -, @ في أول الخلية) ويقص الطول
function clean_(v, maxLen) {
  let s = (v === undefined || v === null) ? '' : String(v).trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, maxLen || 500);
}
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
