لاند بيدج ترنديكس - ملفات جاهزة للرفع (HTML / CSS / JS بس، من غير بناء)

الملفات:
  index.html   الصفحة
  style.css    الشكل
  script.js    السلوك (العداد، الفورم، الشيت، البيكسل)
  config.js    ✏️ كل الإعدادات (الأسعار، المخزون، الروابط) هنا بس
  assets/      الصور WebP والفيديو (جاهزين)
  apps-script/Code.gs   كود الشيت

الرفع على GitHub (الريبو Anti-theft-bag):
  1) في فولدر الريبو على جهازك امسح كل الملفات القديمة
     (.github و src و scripts و media و package.json و vite.config.js و README.md و .gitignore و index.html القديم).
  2) الصق محتويات الفولدر ده (مش الفولدر نفسه) في فولدر الريبو، لازم index.html يبقى في أوله.
  3) GitHub Desktop: اكتب Summary ← Commit to main ← Push origin.
  4) على GitHub: Settings ← Pages ← Source اختار "Deploy from a branch"
     ← Branch: main و Folder: / (root) ← Save.
  5) الرابط: https://egy-shop.github.io/Anti-theft-bag/

الشيت:
  1) Google Sheet جديد ← Extensions ← Apps Script.
  2) الصق apps-script/Code.gs وشغّل دالة setup مرة (وافق على الصلاحيات).
  3) Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Anyone.
  4) انسخ الرابط وحطه في config.js عند appsScriptUrl.
  5) أي تعديل في الكود لازم Deploy ← Manage deployments ← New version.
  6) اعمل أوردر تجريبي وتأكد إنه ظهر في ورقة Orders.

قبل الإعلان عدّل في config.js:
  stock        المخزون الحقيقي المتبقي (الرقم الحالي مؤقت)
  offerEnds    تاريخ نهاية العرض الحقيقي
  returnUrl    لينك الاسترجاع والاستبدال
  pixelId / clarityId / facebookUrl
