# Getting Started Guide

این راهنمای سریع برای شروع کار با Chat Application طراحی شده است.

---

## نمای سریع ⚡

### چیست؟
یک اپلیکیشن چت مبتنی بر OpenAI که شامل:
- 💬 **Chat Interface** - چت با هوش مصنوعی
- 👥 **Admin Panel** - مدیریت کاربران
- 🔐 **User Management** - احراز هویت و محدودیت‌ها
- 📱 **Responsive Design** - سازگار با موبایل

### برای چه کسانی؟
- 🧑‍💻 **توسعه‌دهندگان** که می‌خواهند chatbot راه‌اندازی کنند
- 🏢 **کسب‌وکارها** برای پشتیبانی مشتریان
- 🎓 **محققان** برای آزمایش AI applications
- 👨‍🏫 **آموزشگاه‌ها** برای ابزار آموزشی

---

## راه‌اندازی سریع (5 دقیقه) 🚀

### پیش‌نیازها
```bash
# بررسی نصب Node.js
node --version  # باید v16+ باشد

# اگر نصب نیست:
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: از nodejs.org دانلود کنید
```

### مرحله 1: دانلود پروژه
```bash
# اگر از Git استفاده می‌کنید:
git clone <repository-url>
cd chat-application

# یا فایل zip را دانلود و extract کنید
```

### مرحله 2: نصب Dependencies
```bash
npm install
```

### مرحله 3: تنظیم API Key
```bash
# ایجاد فایل محیطی
cp .env.example .env

# ویرایش فایل .env
nano .env
```

**محتوای `.env`:**
```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
SESSION_SECRET=change-this-to-secure-secret
ALLOW_AUTO_REGISTER=true
```

### مرحله 4: اجرا
```bash
node server.js
```

### مرحله 5: دسترسی
- 🌐 **Chat:** http://localhost:3000
- ⚙️ **Admin:** http://localhost:3000/admin/dashboard.html

---

## اولین استفاده 👋

### ورود به سیستم
1. در صفحه اصلی، نام کاربری و رمز دلخواه وارد کنید
2. اگر `ALLOW_AUTO_REGISTER=true` باشد، خودکار حساب ایجاد می‌شود
3. وارد محیط چت می‌شوید

### شروع چت
1. روی **"+ چت جدید"** کلیک کنید
2. موضوع چت را وارد کنید (مثلاً "سوال برنامه‌نویسی")
3. پیام خود را بنویسید و **ارسال** کنید
4. منتظر پاسخ هوش مصنوعی باشید

### دسترسی به پنل مدیریت
1. اگر نقش ادمین دارید، به `/admin/dashboard.html` بروید
2. می‌توانید کاربران را مدیریت کنید
3. محدودیت‌ها و آمار را مشاهده کنید

---

## ساختار پروژه 📁

```
your-project/
├── 📄 server.js          # سرور اصلی
├── 📄 package.json       # تنظیمات پروژه
├── 📄 .env              # متغیرهای محیطی (شما ایجاد می‌کنید)
├── 📄 index.html        # صفحه چت اصلی
├── 📁 users/            # اطلاعات کاربران (خودکار ایجاد می‌شود)
├── 📁 chats/            # فایل‌های چت (خودکار ایجاد می‌شود)
├── 📁 helpers/          # ماژول‌های کمکی
├── 📁 admin/            # پنل مدیریت
├── 📁 css/              # استایل‌ها
├── 📁 js/               # جاوااسکریپت
└── 📁 Docs/             # مستندات کامل
```

---

## تنظیمات اولیه 🔧

### تنظیم OpenAI API
1. به [platform.openai.com](https://platform.openai.com) بروید
2. حساب بسازید یا وارد شوید
3. به API Keys بروید
4. یک کلید جدید بسازید
5. آن را در `.env` قرار دهید

### تنظیم Admin User
```bash
# ایجاد اولین کاربر ادمین
node -e "
const { createUser } = require('./helpers/auth');
createUser('admin', 'your-secure-password', {
  firstName: 'مدیر',
  lastName: 'سیستم',
  role: 'admin'
}).then(() => console.log('Admin created'))
"
```

### تنظیم امنیتی برای Production
```env
# در .env برای production
NODE_ENV=production
ALLOW_AUTO_REGISTER=false
SESSION_SECRET=very-secure-random-string-here
CORS_ORIGIN=https://your-domain.com
```

---

## استفاده روزانه 📱

### برای کاربران عادی

#### چت جدید
1. کلیک روی **"+ چت جدید"**
2. موضوع را انتخاب کنید:
   - 💻 "کمک برنامه‌نویسی"
   - 📚 "سوالات عمومی"
   - 🎨 "کمک خلاقانه"
   - 📊 "تحلیل داده"

#### نکات مفید
- **پیام‌های واضح**: سوالات مشخص و واضح بپرسید
- **Context**: اطلاعات زمینه‌ای کافی بدهید
- **Follow-up**: سوالات تکمیلی بپرسید
- **نگهداری History**: چت‌ها خودکار ذخیره می‌شوند

### برای ادمین‌ها

#### مدیریت کاربران
1. به پنل ادمین بروید
2. **"+ افزودن کاربر"** برای کاربر جدید
3. تنظیم محدودیت‌ها:
   - تعداد چت مجاز
   - تعداد پیام در هر چت
   - تاریخ انقضا

#### نظارت بر استفاده
- آمار کل کاربران
- تعداد چت‌ها و پیام‌ها
- آخرین فعالیت کاربران

---

## عیب‌یابی سریع 🔍

### مشکلات رایج

#### "خطا در ارتباط با سرور"
```bash
# بررسی کنید سرور اجرا شده
ps aux | grep node

# اگر اجرا نشده:
node server.js
```

#### "API Key نامعتبر"
```bash
# بررسی فایل .env
cat .env | grep OPENAI_API_KEY

# مطمئن شوید کلید صحیح است
```

#### "نمی‌توانم وارد شوم"
```bash
# بررسی فایل کاربران
cat users/users.json

# اگر وجود ندارد، کاربر جدید بسازید
```

#### "Modal باز نمی‌شود"
- صفحه را refresh کنید
- Console browser را چک کنید (F12)
- مطمئن شوید JavaScript فعال است

### لاگ‌های مفید
```bash
# در console browser (F12):
# [INFO] برای اطلاعات عادی
# [ERROR] برای خطاها
# [WARNING] برای هشدارها

# در terminal سرور:
# "سرور با موفقیت روی پورت 3000 اجرا شد"
```

---

## بهترین شیوه‌ها 💡

### برای توسعه‌دهندگان
1. **Environment Files**: هرگز `.env` را commit نکنید
2. **Backup**: از داده‌های `users/` و `chats/` backup بگیرید
3. **Updates**: دوره‌ای dependencies را update کنید
4. **Monitoring**: از logs برای نظارت استفاده کنید

### برای کاربران
1. **Password Security**: رمزهای قوی استفاده کنید
2. **Data Privacy**: اطلاعات حساس در چت قرار ندهید
3. **Regular Cleanup**: چت‌های غیرضروری را حذف کنید

### برای ادمین‌ها
1. **User Limits**: محدودیت‌های معقول تنظیم کنید
2. **Regular Monitoring**: دوره‌ای آمار را بررسی کنید
3. **Security Updates**: سیستم را به‌روز نگه دارید

---

## منابع کمکی 📚

### مستندات داخلی
- 📖 [README.md](./README.md) - نمای کلی کامل
- 🔧 [API.md](./API.md) - راهنمای API
- 💾 [DATABASE.md](./DATABASE.md) - ساختار داده‌ها
- 🎨 [FRONTEND.md](./FRONTEND.md) - راهنمای UI
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - استقرار Production

### منابع خارجی
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)

### کمک و پشتیبانی
- 🐛 **Bug Reports**: از GitHub Issues استفاده کنید
- 💬 **سوالات**: در بخش Discussions بپرسید
- 📧 **ارتباط مستقیم**: از طریق فایل README

---

## Next Steps 🎯

### بعد از راه‌اندازی موفق

#### سطح مبتدی
1. ✅ چند چت تست کنید
2. ✅ کاربر ادمین ایجاد کنید
3. ✅ پنل مدیریت را کاوش کنید
4. ✅ محدودیت‌ها را تست کنید

#### سطح متوسط
1. 🔧 Nginx یا Apache setup کنید
2. 🔒 HTTPS certificate اضافه کنید
3. 📊 Monitoring tools setup کنید
4. 💾 Backup strategy پیاده‌سازی کنید

#### سطح پیشرفته
1. 🗄️ به Database migrate کنید
2. 🔄 Load balancing setup کنید
3. 📈 Analytics اضافه کنید
4. 🚀 Docker containerize کنید

### ایده‌های توسعه
- 📸 **File Upload**: امکان ارسال تصویر
- 🌙 **Dark Mode**: حالت شب
- 🔔 **Notifications**: اعلان‌های real-time
- 📱 **Mobile App**: نسخه موبایل
- 🌐 **Multi-language**: پشتیبانی چند زبانه

---

## چک‌لیست راه‌اندازی ✅

### قبل از شروع
- [ ] Node.js نصب شده (v16+)
- [ ] OpenAI API Key دریافت شده
- [ ] پروژه دانلود شده
- [ ] Terminal/Command Prompt آماده

### مراحل نصب
- [ ] `npm install` اجرا شده
- [ ] فایل `.env` ایجاد شده
- [ ] API Key در `.env` قرار گرفته
- [ ] `node server.js` اجرا شده
- [ ] صفحه در مرورگر باز شده

### تست اولیه
- [ ] ورود به سیستم انجام شده
- [ ] چت جدید ایجاد شده
- [ ] پیام ارسال و پاسخ دریافت شده
- [ ] پنل ادمین قابل دسترسی است
- [ ] کاربر جدید ایجاد شده

### آماده برای استفاده
- [ ] کاربر ادمین اصلی ایجاد شده
- [ ] تنظیمات امنیتی انجام شده
- [ ] backup اولیه گرفته شده
- [ ] مستندات مطالعه شده

---

**🎉 تبریک! شما آماده استفاده از Chat Application هستید.**

برای سوالات بیشتر، به مستندات کامل در پوشه `Docs/` مراجعه کنید یا از GitHub Issues استفاده کنید.

*راهنمای سریع - نسخه 1.0.0*
