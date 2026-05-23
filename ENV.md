# ملفات البيئة — أيهم لإيه؟

## المشكلة الشائعة على Hostinger

رفع ملف `.env` على `public_html` **لا يفعل شيئاً**.  
Hostinger يعرض ملفات ثابتة فقط — لا يقرأ `.env`.

الواجهة تحتاج معرفة عنوان الـ API **عند البناء** أو عبر **`config.json`**.

---

## الملفات في المشروع

| الملف | أين يُستخدم | Hostinger |
|-------|-------------|-----------|
| **`backend/.env`** | سيرفر NestJS (محلي / Render) | ❌ لا يُرفع مع الواجهة |
| **`.env`** | تطوير Vite محلياً | ❌ |
| **`.env.production`** | `npm run build` على جهازك | ❌ لا يُرفع (يُدمج في JS) |
| **`public/config.json`** | المتصفح يقرأه بعد الرفع | ✅ **عدّليه على Hostinger** |

---

## الحل الأسهل (Hostinger)

بعد رفع الموقع، من **File Manager** عدّلي:

`public_html/config.json`

```json
{
  "apiUrl": "https://YOUR-APP.onrender.com/api",
  "wsUrl": "https://YOUR-APP.onrender.com"
}
```

احفظي — **بدون إعادة build**. حدّثي الصفحة (Ctrl+F5).

---

## محلياً (جهازك)

**Backend** — `backend/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret"
PORT=4000
FRONTEND_URL="http://localhost:3008"
```

**Frontend** — `.env` أو `.env.production`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

---

## Render (الـ API)

في لوحة Render (ليس Hostinger):

| المفتاح | مثال لموقعك |
|---------|-------------|
| `FRONTEND_URL` | `https://darkred-dove-545886.hostingersite.com` |
| `CORS_ORIGINS` | `https://darkred-dove-545886.hostingersite.com` |
| `DATABASE_URL` | `file:./data/prod.db` |
| `JWT_SECRET` | نص عشوائي طويل |

---

## ترتيب الأولوية لعنوان API

1. `config.json` على Hostinger  
2. `.env.production` عند البناء  
3. `/api` (يعمل محلياً مع Vite proxy فقط)
