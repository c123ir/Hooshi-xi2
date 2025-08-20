# 🚀 راهنمای شروع سریع

راه‌اندازی **دستیار هوش مصنوعی چت** در کمتر از 5 دقیقه

**آخرین بروزرسانی**: آگوست 2025 | **نسخه**: 2.0.1

---

## ⚡ شروع فوری (2 دقیقه)

### 1️⃣ **دانلود و نصب**
```bash
# کلون پروژه
git clone <repository-url>
cd chat-application

# نصب وابستگی‌ها
npm install
```

### 2️⃣ **تنظیم API Key**
```bash
# ایجاد فایل .env
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env

# (اختیاری) سایر تنظیمات
echo "PORT=3000" >> .env
echo "SESSION_SECRET=your-secret-key" >> .env
```

### 3️⃣ **اجرای برنامه**
```bash
# اجرای production
npm start

# یا اجرای development
npm run dev
```

### 4️⃣ **دسترسی**
- **چت عمومی**: http://localhost:3000
- **پنل ادمین**: http://localhost:3000/admin/dashboard.html

---

## 🛡️ دسترسی به پنل ادمین

### 🔐 **ورود پیش‌فرض**
```
URL: http://localhost:3000/admin/dashboard.html
Username: admin
Password: admin
```

### 🎯 **امکانات فوری**
- ✅ **Dashboard**: آمار realtime سیستم
- ✅ **مدیریت کاربران**: ایجاد، ویرایش، حذف کاربران
- ✅ **آمار تفصیلی**: نمایش آمار کامل
- ✅ **سلامت سیستم**: مانیتورینگ عملکرد
- ✅ **تنظیمات**: کنترل پیکربندی

---

## 🎉 تست سریع عملکرد

### 1️⃣ **تست چت عمومی**
```bash
# دسترسی به صفحه اصلی
curl http://localhost:3000

# بررسی وضعیت سلامت
curl http://localhost:3000/health
```

### 2️⃣ **تست پنل ادمین**
```bash
# ورود ادمین
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -c cookies.txt

# دریافت آمار
curl http://localhost:3000/api/admin/stats \
  -b cookies.txt

# دریافت لیست کاربران
curl http://localhost:3000/api/admin/users \
  -b cookies.txt
```

### 3️⃣ **تست TTS**
```bash
# تولید صوت نمونه
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"text":"سلام، این یک تست است","voice":"alloy","speed":1.0}'
```

---

## 🔧 عیب‌یابی سریع

### ❌ **مشکلات رایج**

#### خطای OpenAI API
```bash
# بررسی API key
echo $OPENAI_API_KEY

# تست اتصال
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### پورت اشغال
```bash
# یافتن پروسه
lsof -i :3000

# کشتن پروسه
kill -9 $(lsof -t -i:3000)
```

#### مشکل دسترسی ادمین
```bash
# بررسی فایل کاربران
cat users/users.json | jq '.admin'

# ریست رمز ادمین (در صورت نیاز)
# در فایل users/users.json رمز admin را تغییر دهید
```

### ✅ **راه‌حل‌های فوری**

1. **مشکل نصب**: `npm install --force`
2. **مشکل permission**: `sudo npm install`
3. **مشکل port**: تغییر PORT در .env
4. **مشکل session**: پاک کردن کوکی‌های مرورگر

---

## 📋 چک‌لیست راه‌اندازی

### قبل از شروع:
- [ ] Node.js >= 18.0.0 نصب شده
- [ ] OpenAI API Key آماده
- [ ] پورت 3000 آزاد است

### بعد از راه‌اندازی:
- [ ] صفحه اصلی لود می‌شود: http://localhost:3000
- [ ] پنل ادمین در دسترس: http://localhost:3000/admin/dashboard.html
- [ ] ورود با admin/admin موفق
- [ ] آمار در dashboard نمایش داده می‌شود
- [ ] لیست کاربران قابل مشاهده
- [ ] Health check: http://localhost:3000/health

---

## 🎯 مرحله بعدی

### برای توسعه‌دهندگان:
- 📖 [مستندات کامل Frontend](FRONTEND.md)
- 📡 [مستندات API](API.md)
- 🛡️ [راهنمای پنل ادمین](ADMIN-PANEL.md)

### برای مدیران:
- 📊 [نمای کلی پروژه](README.md)
- 🚀 [راهنمای استقرار](DEPLOYMENT.md)
- 📈 [تاریخچه تغییرات](CHANGELOG.md)

### برای DevOps:
- 🌐 [راهنمای استقرار Production](DEPLOYMENT.md)
- 🗄️ [ساختار دیتابیس](DATABASE.md)
- 💡 [نوآوری‌ها و ویژگی‌ها](INNOVATION.md)

---

## 📞 دریافت کمک

### مشکل فنی؟
- **GitHub Issues**: گزارش باگ و درخواست ویژگی
- **مستندات**: بررسی فایل‌های `Docs/`
- **لاگ‌ها**: بررسی پوشه `logs/` برای خطاها

### تنظیمات پیشرفته؟
- **متغیرهای محیط**: ویرایش `.env`
- **تنظیمات کاربری**: فایل `users/users.json`
- **پیکربندی سرور**: فایل `server.js`

---

**موفق باشید! 🎉**

در صورت بروز مشکل، ابتدا بخش عیب‌یابی را بررسی کنید یا از مستندات کامل استفاده کنید.
