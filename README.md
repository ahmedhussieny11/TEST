# نظام إدارة العيادة — عيادة نساء وتوليد

نظام متكامل: مواعيد، طابور حي، مرضى، كشوفات، روشتات، تحاليل، فواتير، وبوابة مريضة.

## تشغيل محلي (تطوير)

```bash
# Backend
cd backend && cp .env.example .env && npm install
npx prisma db push && npm run db:seed && npm run start:dev

# Frontend (من الجذر)
npm install && npm run dev
```

- الواجهة: http://localhost:3008  
- API: http://localhost:4000/api  

### حسابات الطاقم (بعد seed)

| الدور | البريد | كلمة المرور |
|--------|--------|-------------|
| **أدمن** | `admin@clinic.com` | `clinic123` |
| دكتور | `doctor@clinic.com` | `clinic123` |
| استقبال | `reception@clinic.com` | `clinic123` |

## نشر على سيرفر حقيقي

**لا ترفعي `dist` فقط.**

| استضافتك | الدليل |
|----------|--------|
| **Hostinger خطة عادية** | **[DEPLOY-HOSTINGER-SHARED.md](./DEPLOY-HOSTINGER-SHARED.md)** |
| Hostinger VPS / سيرفر | [DEPLOY-PRODUCTION.md](./DEPLOY-PRODUCTION.md) |
| عام | [SETUP.md](./SETUP.md) |

قبل `npm run build` للإنتاج: انسخي `.env.production.example` → `.env.production` وضعي رابط الـ API الحقيقي.

## التقنيات

React · TypeScript · Vite · NestJS · Prisma · SQLite/PostgreSQL · Socket.IO

## المستودع

https://github.com/ahmedhussieny11/TEST
