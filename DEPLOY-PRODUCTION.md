# نشر الإنتاج — لماذا يعمل محلياً ويفشل على السيرفر؟

## السبب الرئيسي (99% من الحالات)

| محلياً (جهازك) | على السيرفر الحقيقي |
|----------------|---------------------|
| Frontend على `localhost:3008` | Frontend فقط (ملفات `dist` في `public_html`) |
| Vite يوجّه `/api` تلقائياً إلى `localhost:4000` | **لا يوجد Backend** إلا إذا رفعته أنت |
| قاعدة SQLite + seed جاهزة | قاعدة فارغة أو غير موجودة |

**النتيجة على السيرفر بدون إعداد:**
- صفحة بيضاء في `/book`
- «بيانات الدخول غير صحيحة» للأدمن
- «تعذر الاتصال بالسيرفر»
- الطابور والمرضى فارغين

---

## الحل الصحيح: جزئان

### 1) Backend (API) — يجب أن يعمل 24/7

اختيار واحد:

**أ) VPS / Hostinger VPS** (مُفضّل)
```bash
cd backend
cp .env.example .env
# عدّلي FRONTEND_URL=https://yourdomain.com
npm install
npx prisma db push
npm run db:seed
npm run build
npm run start:prod
# أو: pm2 start ecosystem.config.cjs
```

**ب) Railway / Render** (مجاني للبداية)
- ارفعي مجلد `backend`
- `DATABASE_URL` = PostgreSQL من الخدمة
- `FRONTEND_URL` = `https://yourdomain.com`
- `JWT_SECRET` = نص عشوائي طويل
- Start command: `npm run build && npm run start:prod`
- بعد النشر: `npm run db:seed` من shell الخدمة

### 2) Frontend — يُبنى بعنوان الـ API الصحيح

**قبل** `npm run build` أنشئي `.env.production`:

```env
# Backend على دومين فرعي:
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=https://api.yourdomain.com

# أو Backend على نفس السيرفر (بعد إعداد proxy في Apache):
# VITE_API_URL=/api
```

ثم:
```bash
npm install
npm run build
# ارفعي محتويات dist/ إلى public_html
```

---

## حسابات الأدمن بعد النشر

على سيرفر الـ Backend نفّذي **مرة واحدة**:

```bash
cd backend
npx prisma db push
npm run db:seed
```

| الدور | البريد | كلمة المرور |
|--------|--------|-------------|
| **أدمن** | `admin@clinic.com` | `clinic123` |
| دكتور | `doctor@clinic.com` | `clinic123` |
| استقبال | `reception@clinic.com` | `clinic123` |

---

## نفس الدومين (VPS) — proxy للـ API

إذا الواجهة والـ API على **نفس الدومين**، فعّلي في `.htaccess` (قبل قواعد SPA):

```apache
RewriteRule ^api/(.*)$ http://127.0.0.1:4000/api/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:4000/uploads/$1 [P,L]
```

يتطلب `mod_proxy` على Apache. عندها `.env.production`:
```env
VITE_API_URL=/api
```

انظري أيضاً: `public/.htaccess.proxy-example`

---

## متغيرات Backend المهمة

```env
DATABASE_URL="file:./prisma/dev.db"
# أو PostgreSQL للإنتاج:
# DATABASE_URL="postgresql://user:pass@host:5432/clinic_db"

JWT_SECRET="ضعي-سراً-عشوائياً-طويلاً"
PORT=4000
FRONTEND_URL="https://yourdomain.com"
# عدة دومينات:
# CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## قائمة تحقق بعد الرفع

- [ ] `https://yourdomain.com` يفتح الصفحة الرئيسية
- [ ] `https://api.yourdomain.com/api` أو `/api` يرد (ليس 404 HTML)
- [ ] تسجيل دخول `admin@clinic.com` / `clinic123` يعمل
- [ ] `/book` تظهر الخدمات (ليست بيضاء)
- [ ] تم تشغيل `db:seed` على سيرفر الـ API

---

## Docker (اختياري — VPS)

```bash
docker compose -f docker-compose.full.yml up -d --build
docker compose -f docker-compose.full.yml exec backend npm run db:seed
```

انظري `docker-compose.full.yml` في المشروع.
