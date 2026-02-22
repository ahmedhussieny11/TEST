# رفع المشروع على GitHub

## الخطوة 1: إنشاء مستودع جديد على GitHub

1. ادخل إلى [github.com](https://github.com) وسجّل الدخول.
2. اضغط **New** (أو **+** ثم **New repository**).
3. اختر اسم للمستودع، مثلاً: `clinic-management`
4. اختر **Public**.
5. **لا** تضف README أو .gitignore (المشروع عنده بالفعل).
6. اضغط **Create repository**.

---

## الخطوة 2: على جهازك (من مجلد المشروع)

افتح **Terminal** أو **PowerShell** داخل مجلد المشروع (`f:\test`)، ثم نفّذ الأوامر بالترتيب:

### إذا المشروع مش متتبّع بـ Git من قبل:

```bash
git init
git add .
git commit -m "Initial commit - نظام إدارة العيادة"
```

### إذا كان عندك بالفعل Git ومستودع جديد على GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/clinic-management.git
git branch -M main
git push -u origin main
```

**غيّر `YOUR_USERNAME`** باسم حسابك على GitHub، و**`clinic-management`** باسم المستودع اللي أنشأته.

---

## إذا المشروع جديد تماماً (بدون Git)

نفّذ كل الأوامر بالترتيب:

```bash
git init
git add .
git commit -m "Initial commit - نظام إدارة العيادة"
git remote add origin https://github.com/YOUR_USERNAME/clinic-management.git
git branch -M main
git push -u origin main
```

سيُطلب منك اسم المستخدم وكلمة المرور (أو **Personal Access Token**) لـ GitHub — أدخلها عند الطلب.

---

## تحديث المشروع لاحقاً (بعد أي تعديل)

```bash
git add .
git commit -m "وصف التعديل"
git push
```

---

## ملاحظات

- **node_modules** و **dist** لن تُرفع (موجودين في `.gitignore`) — هذا صحيح.
- لو GitHub طلب **Token** بدل كلمة المرور: من GitHub → Settings → Developer settings → Personal access tokens أنشئ token وانسخه واستخدمه مكان كلمة المرور.
