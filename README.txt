لاند بيدج ترنديكس - ملفات جاهزة للرفع (HTML / CSS / JS بس، من غير أي أدوات بناء)

الملفات:
  index.html     الصفحة الرئيسية
  thanks.html    صفحة الشكر بعد إتمام الطلب (فيها بيكسل Purchase منفصل)
  style.css      الشكل (نفس الملف يخدم الصفحتين)
  script.js      سلوك الصفحة الرئيسية (المعرض، الفورم بخطوتين، الباور بانك)
  tracking.js    التتبع والإرسال للشيت (مشترك بين الصفحتين)
  config.js      ✏️ كل الإعدادات (الأسعار، المخزون، الباور بانك، الروابط) هنا بس
  assets/        الصور WebP + الفيديو + أيقونات الموقع + صورة المشاركة
  apps-script/Code.gs   كود الشيت

الرفع على GitHub (نفس الريبو Anti-theft-bag):
  1) في فولدر الريبو على جهازك امسح كل الملفات القديمة (Ctrl+A ثم Delete،
     مع التأكد إن Hidden items مقفولة عشان متمسحش فولدر .git).
  2) الصق محتويات الفولدر ده (مش الفولدر نفسه) في فولدر الريبو.
  3) GitHub Desktop: اكتب Summary ← Commit to main ← Push origin.
  4) Settings ← Pages ← Source: Deploy from a branch ← Branch: main، / (root) ← Save.
  5) الرابط: https://egy-shop.github.io/Anti-theft-bag/

الشيت (خطوات أول مرة فقط):
  1) Google Sheet جديد ← Extensions ← Apps Script.
  2) الصق apps-script/Code.gs وشغّل دالة setup مرة (وافق على الصلاحيات).
  3) Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Anyone.
  4) انسخ الرابط وحطه في config.js عند appsScriptUrl.
  5) أي تعديل بعد كده في الكود يحتاج Deploy ← Manage deployments ← New version.
  6) اعمل أوردر تجريبي (بالباور بانك ومن غيره) وتأكد إنه ظهر في ورقة Orders
     بعمود "باور بانك" واضح.

قبل الإعلان، عدّل في config.js:
  stock          المخزون الحقيقي المتبقي (الرقم الحالي مؤقت)
  offerEnds      تاريخ نهاية العرض الحقيقي
  addon          سعر وخصم الباور بانك لو اتغيّروا
  pixelId / clarityId / facebookUrl

ملاحظات:
  - رابط الاسترجاع والاستبدال متحط بالفعل: jawdaonline.com/egy-request
  - الواتساب مش موجود في الصفحة نهائيًا، التواصل بالتليفون بس
  - بعد الطلب العميل بيتنقل لصفحة thanks.html، وده اللي بيخلي بيكسل الشراء
    يشتغل في صفحة منفصلة عن باقي أحداث التتبع اللي في الصفحة الرئيسية
  - اللوجو الحقيقي مستخدم في الهيدر والفوتر وأيقونة المتصفح وصورة المشاركة
    على فيسبوك/واتساب (assets/og-image.jpg)
