# تشغيل النظام المتكامل (Frontend + Backend)

## المتطلبات

- Node.js 18+
- (اختياري) Docker لـ PostgreSQL — أو استخدم SQLite المحلي الافتراضي

## 1. Backend

```bash
cd backend
cp .env.example .env   # SQLite جاهز في .env
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run start:dev
```

الـ API يعمل على: `http://localhost:4000/api`

### حسابات الدخول الافتراضية (الطاقم)

**كلمة المرور لجميع الحسابات:** `clinic123`

| الدور | البريد الإلكتروني |
|--------|-------------------|
| **مشرف (أدمن)** | `admin@clinic.com` |
| دكتور | `doctor@clinic.com` |
| استقبال | `reception@clinic.com` |

> لو ظهر «بيانات الدخول غير صحيحة» على السيرفر الحقيقي، نفّذي مرة واحدة من مجلد `backend`:
> ```bash
> npx prisma db push
> npm run db:seed
> ```
> هذا يُنشئ الحسابات أو **يُحدّث** كلمات المرور إلى `clinic123` بدون مسح مرضاك.

### بوابة المريضة

- **تسجيل:** اسم + جوال (11 رقم يبدأ بـ 01) + عمر + عنوان
- **دخول:** نفس رقم الجوال فقط (بدون OTP)

## 2. Frontend

```bash
# من جذر المشروع
npm install
npm run dev
```

الواجهة: `http://localhost:3008` — الـ proxy يوجّه `/api` إلى الـ backend.

## PostgreSQL (اختياري)

```bash
docker compose up -d
```

غيّر في `backend/.env`:

```
DATABASE_URL="postgresql://clinic:clinic_secret@localhost:5432/clinic_db?schema=public"
```

وغيّر `provider` في `prisma/schema.prisma` إلى `postgresql` ثم `npx prisma db push`.

## الميزات المربوطة بالـ API

- تسجيل دخول JWT + صلاحيات الأدوار
- مرضى، حمل (EDD)، زيارات، مرفقات
- مواعيد + طابور حي (WebSocket)
- فواتير POS + ورديات وتقفيل يومي
- روشتات + قوالب
- لوحة إحصائيات
- بوابة مريضة (OTP + حجز)
