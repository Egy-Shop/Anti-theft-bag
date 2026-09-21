/* ✏️ كل اللي محتاج تعدله في الصفحة موجود هنا فقط */
window.CONFIG = {
  brand: 'ترنديكس',
  appsScriptUrl: '',   // رابط Web App بتاع Apps Script
  pixelId: '',         // Meta Pixel ID
  clarityId: '',       // Microsoft Clarity ID (هيت ماب وتسجيلات الشاشة)
  facebookUrl: '',     // لينك صفحتك على فيسبوك (اختياري، لو فاضي مش هيظهر)
  returnUrl: '',       // لينك الاسترجاع والاستبدال (لو فاضي الزرار مش هيظهر)

  offerEnds: '2026-10-05T23:59:00+03:00', // نهاية العرض الحقيقي، بعدها العداد بيختفي

  // المخزون الحقيقي: عدّل الرقم بإيدك كل ما تحتاج
  stock: 24,           // المتبقي فعليًا
  stockTotal: 60,      // إجمالي الكمية اللي بدأت بيها (بيحدد طول الشريط)

  warrantyDays: 14,
  delivery: '١ - ٣ أيام عمل',

  // price = السعر الحالي | old = السعر قبل الخصم | ship = الشحن
  offers: [
    { qty: 1, label: 'شنطة واحدة', price: 399, old: 999,  ship: 35 },
    { qty: 2, label: 'شنطتين',     price: 700, old: 1998, ship: 0, badge: 'شحن مجاني' },
    { qty: 3, label: '٣ شنط',      price: 900, old: 2997, ship: 0, badge: 'شحن مجاني + كوبون', coupon: true }
  ],
  couponText: 'كوبون خصم على طلبك الجاي',

  reviews: []          // تقييمات حقيقية بس. الباقي بييجي من الشيت بعد ما تعلّم "موافق"
};
