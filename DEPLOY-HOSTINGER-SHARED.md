# نشر على Hostinger — الخطة العادية (استضافة مشتركة)

الخطة العادية من Hostinger (Premium / Business / Web) ترفع **مواقع ثابتة** (HTML/CSS/JS) فقط.  
**لا تشغّل Node.js/NestJS** على هذه الخطة.

لذلك التقسيم كالتالي:

| أين | ماذا |
|-----|------|
| **Hostinger** | واجهة الموقع فقط (`dist`) |
| **Render.com** (مجاني) | الـ API + قاعدة البيانات |

---

## الجزء 1 — رفع الـ API على Render (مرة واحدة)

### 1) حساب Render
- ادخلي https://render.com وسجّلي بحساب GitHub.

### 2) ربط المستودع
- **New +** → **Web Service**
- اربطي repo: `ahmedhussieny11/TEST`
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:**
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  npx prisma db push && npm run db:seed && node dist/main.js
  ```

### 3) متغيرات البيئة (Environment)

في لوحة Render → Environment:

| المفتاح | القيمة |
|---------|--------|
| `DATABASE_URL` | `file:./data/prod.db` |
| `JWT_SECRET` | أي نص طويل عشوائي (مثلاً 32 حرف) |
| `JWT_EXPIRES_IN` | `8h` |
| `PORT` | `4000` |
| `FRONTEND_URL` | `https://darkred-dove-545886.hostingersite.com` |
| `CORS_ORIGINS` | `https://darkred-dove-545886.hostingersite.com` |

> لو عندك دومين خاص لاحقاً، استبدلي الرابط في المتغيرين أعلاه.
| `UPLOAD_DIR` | `./uploads` |

> استبدلي `دومينك.com` بدومين Hostinger الحقيقي.

### 4) بعد النشر
- Render يعطيك رابط مثل: `https://clinic-api-xxxx.onrender.com`
- جرّبي في المتصفح:  
  `https://clinic-api-xxxx.onrender.com/api`  
  (قد يظهر 404 على `/api` فقط — المهم أن السيرفر يرد وليس خطأ اتصال)

### 5) (اختياري) دومين فرعي للـ API
من Hostinger → **DNS**:
- نوع: `CNAME`
- الاسم: `api`
- القيمة: الرابط من Render (بدون `https://`)

بعدها الـ API يصبح: `https://api.دومينك.com`

---

## الجزء 2 — بناء الواجهة على جهازك

من مجلد المشروع على الكمبيوتر:

### 1) ملف `.env.production`

انسخي `.env.production.example` إلى `.env.production`:

**لو تستخدمين رابط Render مباشرة:**
```env
VITE_API_URL=https://clinic-api-xxxx.onrender.com/api
VITE_WS_URL=https://clinic-api-xxxx.onrender.com
```

**لو ربطتي دومين فرعي `api`:**
```env
VITE_API_URL=https://api.دومينك.com/api
VITE_WS_URL=https://api.دومينك.com
```

### 2) البناء
```bash
npm install
npm run build:prod
```

يُنشأ مجلد **`dist`**.

---

## الجزء 3 — رفع الواجهة على Hostinger

1. hPanel → **File Manager** → **`public_html`**
2. احذفي أو انسخي احتياطياً الملفات القديمة
3. ارفعي **محتويات** مجلد `dist` (ليس المجلد نفسه):
   - `index.html`
   - مجلد `assets/`
   - `.htaccess`
   - **`config.json`** ← مهم
4. فعّلي **SSL** من Hostinger (Let's Encrypt)

### تعديل `config.json` (بدل .env على السيرفر)

ملف **`.env` لا يعمل على Hostinger**. افتحي `public_html/config.json`:

```json
{
  "apiUrl": "https://clinic-api-xxxx.onrender.com/api",
  "wsUrl": "https://clinic-api-xxxx.onrender.com"
}
```

استبدلي برابط Render الحقيقي واحفظي. انظري **`ENV.md`** للتفاصيل.

---

## الجزء 4 — التجربة

| الرابط | المتوقع |
|--------|---------|
| `https://دومينك.com` | الصفحة الرئيسية |
| `https://دومينك.com/book` | صفحة حجز (ليست بيضاء) |
| `https://دومينك.com/login` | دخول الطاقم |

### دخول الأدمن (بعد `db:seed` على Render)
| | |
|---|---|
| البريد | `admin@clinic.com` |
| كلمة المرور | `clinic123` |

---

## ملاحظات الخطة العادية

1. **لا ترفعي مجلد `backend`** على `public_html` — لن يعمل.
2. **كل تحديث للكود:**
   - Render يعيد النشر تلقائياً من GitHub (لو فعّلت Auto-Deploy)
   - Hostinger: أعيدي `npm run build:prod` وارفعي `dist` من جديد
3. **Render المجاني** ينام بعد 15 دقيقة بدون زيارات — أول طلب قد يأخذ 30–60 ثانية (طبيعي).
4. للعيادة بشكل دائم: لاحقاً ترقية Render أو Hostinger **VPS**.

---

## مشاكل شائعة

| المشكلة | السبب | الحل |
|---------|--------|------|
| صفحة بيضاء `/book` | `VITE_API_URL` غلط عند البناء | أعيدي البناء بـ `.env.production` صحيح |
| دخول أدمن فاشل | seed لم يُشغّل على Render | Start Command فيه `db:seed` أو شغّليه من Shell |
| CORS error | `FRONTEND_URL` / `CORS_ORIGINS` | طابقي دومين Hostinger بالضبط |
| 404 على `/login` | `.htaccess` ناقص | ارفعي `.htaccess` من `public/` |

---

## ملخص سريع

```
GitHub → Render (backend) → رابط API
جهازك → npm run build:prod → dist
dist → Hostinger public_html
```
