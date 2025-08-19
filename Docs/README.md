# 🤖 دستیار هوش مصنوعی چت - Chat AI Assistant

یک پلتفرم کامل گفتگو با هوش مصنوعی که قابلیت‌های پیشرفته TTS (تبدیل متن به گفتار) فارسی، مدیریت کاربران و رابط کاربری مدرن ارائه می‌دهد.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Persian Support](https://img.shields.io/badge/persian-supported-red.svg)](#)

---

## 🌟 ویژگی‌های کلیدی

### 💬 سیستم چت پیشرفته
- **مدل‌های مختلف OpenAI**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **مدیریت چت‌های متعدد**: ایجاد، ویرایش، حذف و سازماندهی
- **جستجوی هوشمند**: جستجو در عناوین و محتوای چت‌ها
- **پین و آرشیو**: مدیریت اولویت‌بندی چت‌ها
- **ایمپورت/اکسپورت**: ذخیره و بازیابی چت‌ها در فرمت JSON

### 🔊 سیستم TTS فارسی پیشرفته
- **تولید صوت با OpenAI TTS**: کیفیت بالا و صداهای متنوع
- **6 صدای مختلف**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **تنظیمات شخصی‌سازی**: جنسیت، کیفیت، سرعت پخش
- **کنترل شناور**: pause/resume در هنگام پخش
- **پخش چندگانه**: جلوگیری از تداخل صداها
- **محاسبه هزینه**: تخمین هزینه real-time

### 👥 مدیریت کاربران کامل
- **احراز هویت امن**: Session-based authentication
- **نقش‌های کاربری**: User و Admin
- **محدودیت‌های استفاده**: تعداد چت و پیام
- **آمار کاربری**: رصد فعالیت و استفاده
- **پنل مدیریت**: مدیریت کاربران توسط ادمین

### 🎨 رابط کاربری مدرن
- **طراحی Responsive**: موبایل و دسکتاپ
- **RTL فارسی**: پشتیبانی کامل از راست به چپ
- **Dark/Light Mode**: انتخاب تم
- **انیمیشن‌های روان**: تجربه کاربری بهتر
- **دسترسی‌پذیری**: استانداردهای WCAG

---

## 🏗️ معماری سیستم

### Backend (Node.js + Express)
```
server.js                 # Entry point اصلی
├── helpers/
│   ├── auth.js           # مدیریت احراز هویت و کاربران
│   ├── fs.js             # عملیات فایل چت‌ها
│   ├── logger.js         # سیستم لاگ‌گذاری
│   ├── middleware.js     # Rate limiting و امنیت
│   ├── health.js         # بررسی سلامت سیستم
│   └── https.js          # پیکربندی SSL
├── chats/                # ذخیره چت‌ها (JSON files)
├── users/                # اطلاعات کاربران
└── logs/                 # فایل‌های لاگ
```

### Frontend (Vanilla JavaScript)
```
index.html               # صفحه اصلی
├── css/
│   └── styles.css       # استایل‌های کامل RTL
├── js/
│   └── app.js           # منطق کلاینت و TTS
└── admin/
    ├── dashboard.html   # پنل مدیریت
    ├── admin.js         # منطق پنل ادمین
    └── admin.css        # استایل پنل
```

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- **Node.js** >= 16.0.0
- **NPM** >= 8.0.0
- **OpenAI API Key** (برای ChatGPT و TTS)

### نصب سریع
```bash
# 1. کلون پروژه
git clone [repository-url]
cd new-chat

# 2. نصب وابستگی‌ها
npm install

# 3. تنظیم متغیرهای محیط
cp .env.example .env
# ویرایش .env و اضافه کردن OPENAI_API_KEY

# 4. راه‌اندازی سرور
npm start
```

### دسترسی به برنامه
- **وب اپلیکیشن**: http://localhost:3000
- **پنل مدیریت**: http://localhost:3000/admin/dashboard.html
- **Health Check**: http://localhost:3000/health

---

## 🔧 تنظیمات

### متغیرهای محیط (.env)
```bash
# اجباری
OPENAI_API_KEY=sk-...              # کلید OpenAI

# اختیاری
PORT=3000                          # پورت سرور
OPENAI_MODEL=gpt-4o-mini          # مدل پیش‌فرض
SESSION_SECRET=your-secret         # کلید جلسات
ALLOW_AUTO_REGISTER=true           # ثبت‌نام خودکار
CORS_ORIGIN=*                      # CORS origin
NODE_ENV=development               # محیط اجرا

# HTTPS (production)
HTTPS_PORT=3443
HTTPS_CERT_PATH=./certs/certificate.pem
HTTPS_KEY_PATH=./certs/private-key.pem
```

### تنظیمات TTS
```javascript
// تنظیمات پیش‌فرض در localStorage/server
{
  voice: 'alloy',        // alloy, echo, fable, onyx, nova, shimmer
  gender: 'neutral',     // male, female, neutral
  quality: 'standard',   // standard, high
  speed: 1.0,           // 0.25 - 2.0
  costTier: 'medium'    // low, medium, high
}
```

---

## 📊 API Reference

### احراز هویت
```http
POST /api/auth/login      # ورود/ثبت‌نام
GET  /api/auth/me         # اطلاعات کاربر
POST /api/auth/logout     # خروج
POST /api/auth/password   # تغییر رمز
```

### مدیریت چت‌ها
```http
GET    /api/chats                 # لیست چت‌ها
POST   /api/chats                 # ایجاد چت جدید
GET    /api/chats/:id             # دریافت چت
PUT    /api/chats/:id             # ویرایش چت
DELETE /api/chats/:id             # حذف چت
POST   /api/chats/:id/message     # ارسال پیام
```

### سیستم TTS
```http
POST /api/tts                     # تولید صوت
GET  /api/users/:username/tts     # دریافت تنظیمات TTS
PUT  /api/users/:username/tts     # ذخیره تنظیمات TTS
```

### مدیریت کاربران (Admin)
```http
GET    /api/admin/users           # لیست کاربران
POST   /api/admin/users           # ایجاد کاربر
PUT    /api/admin/users/:username # ویرایش کاربر
DELETE /api/admin/users/:username # حذف کاربر
```

---

## 💡 نوآوری‌ها و ویژگی‌های منحصربه‌فرد

### 1. TTS فارسی پیشرفته
- **اولین** سیستم TTS فارسی با OpenAI در ایران
- **کنترل شناور**: امکان pause/resume در هر نقطه
- **جلوگیری از تداخل**: stop صدای قبلی قبل از شروع صدای جدید
- **محاسبه هزینه**: نمایش real-time هزینه تولید صوت

### 2. مدیریت چت‌های پیشرفته
- **Pin & Archive**: سازماندهی بهتر چت‌ها
- **Import/Export**: پشتیبان‌گیری و انتقال داده‌ها
- **جستجوی لحظه‌ای**: در عناوین و محتوا

### 3. امنیت و عملکرد
- **Rate Limiting**: محافظت در برابر Spam
- **Session Management**: امنیت جلسات
- **Health Monitoring**: نظارت بر سلامت سیستم
- **Comprehensive Logging**: لاگ‌گذاری کامل

---

## 🔒 امنیت

### احراز هویت
- **Session-based**: استفاده از کوکی‌های امن
- **HMAC Signatures**: امضای دیجیتال جلسات
- **Password Hashing**: scrypt برای هش کردن رمز

### محافظت در برابر حملات
- **Rate Limiting**: محدودیت درخواست
- **CORS Protection**: کنترل دسترسی Origin
- **Input Validation**: اعتبارسنجی ورودی‌ها
- **CSP Headers**: Content Security Policy

### لاگ‌گذاری امنیتی
- **Authentication Events**: ورود/خروج کاربران
- **Security Events**: تلاش‌های مشکوک
- **Admin Actions**: عملیات مدیریتی
- **Error Tracking**: ردیابی خطاها

---

## 📈 نظارت و آمار

### Health Monitoring
```http
GET /health         # وضعیت کامل سیستم
GET /health/simple  # وضعیت ساده
GET /health/ready   # آمادگی برای ترافیک
```

### آمار کاربری
- **تعداد چت‌های ایجادشده**
- **تعداد پیام‌های ارسالی**  
- **آخرین زمان ورود**
- **استفاده از TTS**

### لاگ‌های سیستم
```
logs/
├── combined.log    # تمام لاگ‌ها
├── error.log       # فقط خطاها
└── debug.log       # اطلاعات دیباگ
```

---

## 🌐 چندزبانه و محلی‌سازی

### پشتیبانی فارسی
- **RTL Layout**: طراحی راست به چپ
- **فونت فارسی**: Vazirmatn از Google Fonts
- **تاریخ فارسی**: نمایش تاریخ شمسی
- **TTS فارسی**: تولید صوت فارسی با OpenAI

### قابلیت‌های بین‌المللی
- **UTF-8 Support**: پشتیبانی کامل کاراکترهای فارسی
- **Locale-aware**: تنظیمات منطقه‌ای
- **Timezone Support**: مدیریت زمان محلی

---

## 🤝 مشارکت در توسعه

### ساختار کد
- **Backend**: MVC pattern با helpers
- **Frontend**: Component-based approach
- **Documentation**: مستندسازی کامل
- **Testing**: آماده برای تست‌های واحد

### استانداردهای کد
```javascript
// نام‌گذاری فارسی برای متغیرها
const currentChatId = null;
const currentMessages = [];

// کامنت‌های فارسی
// تابع بارگذاری چت‌ها از سرور
async function fetchChats() {
  // کد...
}
```

---

## 📞 پشتیبانی

### مستندات
- **[راهنمای سریع](./QUICK_START.md)**: شروع در 5 دقیقه
- **[API Reference](./API.md)**: مستندات کامل API
- **[Frontend Guide](./FRONTEND.md)**: راهنمای توسعه UI
- **[Deployment](./DEPLOYMENT.md)**: راهنمای استقرار

### عیب‌یابی رایج
- **خطای 401**: بررسی session cookies
- **خطای 500 TTS**: بررسی OpenAI API key
- **خطای CORS**: تنظیم CORS_ORIGIN
- **خطای Rate Limit**: کاهش سرعت درخواست‌ها

---

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](../LICENSE) را مطالعه کنید.

---

## 🔮 نقشه راه آینده

### نسخه 2.0
- [ ] پشتیبانی از Claude و Gemini
- [ ] ویرایشگر متن پیشرفته
- [ ] پلاگین‌های کاربر پسند
- [ ] API عمومی برای توسعه‌دهندگان

### نسخه 2.1
- [ ] پشتیبانی از تصاویر (Vision)
- [ ] یکپارچه‌سازی با تقویم
- [ ] نوتیفیکیشن Push
- [ ] حالت آفلاین

---

*آخرین بروزرسانی: آگوست 2025*
