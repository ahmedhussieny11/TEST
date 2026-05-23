# رفع الواجهة على Hostinger (استضافة مشتركة)

> **مهم:** رفع `dist` فقط **لا يكفي**. النظام يحتاج **Backend (API)** شغال.
> اقرئي **`DEPLOY-PRODUCTION.md`** — يشرح لماذا يعمل محلياً ويفشل على السيرفر.

---

## المتطلبات

- حساب Hostinger
- **سيرفر API** منفصل (VPS، Railway، Render) — أو Hostinger **VPS**
- Node.js على جهازك للبناء

---

## الخطوة 1: بناء الواجهة بعنوان API الحقيقي

انسخي `.env.production.example` إلى `.env.production` وعدّلي:

```env
VITE_API_URL=https://api.YOUR-DOMAIN.com/api
VITE_WS_URL=https://api.YOUR-DOMAIN.com
```

ثم:

```bash
npm install
npm run build
```

بعد الانتهاء سيتم إنشاء مجلد **`dist`** ويحتوي على كل الملفات الجاهزة للرفع.

---

## الخطوة 2: الدخول إلى Hostinger

1. ادخل إلى [hPanel - Hostinger](https://hpanel.hostinger.com)
2. اختر الاستضافة (الاستضافة المشتركة أو استضافة الأعمال)
3. من القائمة اختر **File Manager** (مدير الملفات)

---

## الخطوة 3: رفع الملفات

1. في مدير الملفات ادخل إلى مجلد **`public_html`**
2. إذا كان الموقع سيعمل على الدومين الرئيسي: امسح محتويات `public_html` إن وجدت (أو انسخها احتياطياً)
3. ارفع **كل محتويات** مجلد **`dist`** (وليس المجلد نفسه) داخل `public_html`:
   - `index.html` في جذر `public_html`
   - مجلد `assets` كاملاً
   - ملف `.htaccess` (مهم لصفحات التطبيق مثل `/app`, `/login`)

### طريقة الرفع

- **من الواجهة:** استخدم زر "Upload" واختر كل الملفات من داخل `dist`
- **أو:** اضغط مجلد `dist` كاملاً كـ ZIP ثم ارفع الملف ثم استخرجه من مدير الملفات ثم انقل المحتويات إلى `public_html`

---

## الخطوة 4: التأكد من ملف .htaccess

يجب أن يكون في `public_html` ملف اسمه **`.htaccess`** (تم نسخه من `public/.htaccess` أثناء البناء).

- إذا لم يظهر: في مدير الملفات فعّل "Show hidden files"
- إذا لم يُرفع: أنشئ ملفاً جديداً باسم `.htaccess` والصق فيه محتوى الملف الموجود في المشروع داخل `public/.htaccess`

هذا الملف يوجّه كل الروابط (مثل `/app`, `/login`, `/patient/dashboard`) إلى `index.html` حتى يعمل التطبيق بشكل صحيح.

---

## الخطوة 5: فتح الموقع

افتح في المتصفح:

- إذا الموقع على الدومين الرئيسي: `https://yourdomain.com`
- إذا على نطاق فرعي: `https://subdomain.yourdomain.com`

جرّب الصفحة الرئيسية ثم صفحة تسجيل الدخول: `https://yourdomain.com/login`

---

## إذا كان الموقع داخل مجلد فرعي (مثلاً yourdomain.com/clinic)

1. في **`vite.config.ts`** غيّر السطر إلى:
   ```ts
   base: '/clinic/',   // استبدل clinic باسم المجلد الفعلي
   ```
2. في **`src/main.tsx`** استخدم `basename` في الـ Router:
   ```tsx
   <BrowserRouter basename="/clinic">
   ```
3. أعد البناء: `npm run build`
4. ارفع محتويات `dist` داخل المجلد `public_html/clinic/`
5. في **`public/.htaccess`** غيّر `RewriteBase /` إلى `RewriteBase /clinic/`

ثم افتح: `https://yourdomain.com/clinic/`

---

## مشاكل شائعة وحلولها

| المشكلة | الحل |
|--------|------|
| صفحة 404 عند فتح `/app` أو `/login` | تأكد من وجود `.htaccess` في `public_html` ومحتواه صحيح |
| الصفحة بيضاء بعد الرفع | غالباً **الـ API غير موصول** — راجع `DEPLOY-PRODUCTION.md` و`VITE_API_URL` |
| تسجيل دخول لا يعمل | شغّلي `npm run db:seed` على **سيرفر الـ Backend** وليس Hostinger فقط |
| الصور أو الـ CSS لا تظهر | تأكد أن مجلد `assets` مرفوع بالكامل داخل `public_html` |
| خطأ 500 | غالباً الاستضافة لا تدعم `mod_rewrite`؛ تواصل مع دعم Hostinger لتفعيله |

---

## نصائح أمان وأداء

- استخدم **HTTPS** (عادة Hostinger توفر شهادة SSL مجانية)
- من لوحة Hostinger يمكنك تفعيل **Cloudflare CDN** لتحسين السرعة
- احتفظ بنسخة من مجلد `dist` قبل أي تحديث جديد

بعد تنفيذ الخطوات، الموقع يكون جاهزاً للاستخدام على Hostinger.
