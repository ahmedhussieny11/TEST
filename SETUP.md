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

### حسابات التجربة (الطاقم)

| الدور | البريد | كلمة المرور |
|--------|--------|-------------|
| دكتور | doctor@clinic.com | clinic123 |
| استقبال | reception@clinic.com | clinic123 |
| مشرف | admin@clinic.com | clinic123 |

### بوابة المريضة

- هاتف تجريبي: `01012345678`
- OTP يظهر في استجابة الـ API (`devOtp`) أثناء التطوير

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
