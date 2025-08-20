# 🤖 دستیار هوش مصنوعی چت - Chat AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Persian Support](https://img.shields.io/badge/persian-✓-red.svg)](#)
[![TTS Support](https://img.shields.io/badge/TTS-OpenAI-blue.svg)](#)

یک پلتفرم کامل و مدرن گفتگو با هوش مصنوعی که قابلیت‌های پیشرفته TTS (تبدیل متن به گفتار) فارسی، معماری مدولار و رابط کاربری responsive ارائه می‌دهد.

---

## 🌟 ویژگی‌های کلیدی

### 💬 **سیستم چت پیشرفته**
- **چندین مدل OpenAI**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **مدیریت چت‌های پیشرفته**: ایجاد، ویرایش، جستجو و سازماندهی
- **Import/Export**: پشتیبان‌گیری و بازیابی چت‌ها در فرمت JSON
- **جستجوی هوشمند**: جستجو در عناوین و محتوای چت‌ها
- **Session Management**: حفظ وضعیت بین بازدیدها

### 🔊 **سیستم TTS فارسی منحصربه‌فرد**
- **6 صدای OpenAI**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **کنترل‌های شناور**: Play/Pause/Stop در real-time
- **شخصی‌سازی کامل**: سرعت (0.25-2.0x)، کیفیت (Standard/HD)
- **محاسبه هزینه**: تخمین هزینه قبل از تولید صوت
- **Anti-overlap**: جلوگیری از تداخل چندین صدا

### 👥 **مدیریت کاربران حرفه‌ای**
- **احراز هویت امن**: Session-based authentication با Scrypt
- **نقش‌های کاربری**: User و Admin با سطوح دسترسی مختلف
- **محدودیت‌های قابل تنظیم**: تعداد چت و پیام
- **پنل مدیریت کامل**: مدیریت کاربران، آمار و تنظیمات

### 🎨 **رابط کاربری مدرن**
- **طراحی Responsive**: بهینه برای موبایل و دسکتاپ
- **RTL فارسی**: پشتیبانی کامل از راست به چپ
- **Modular Architecture**: معماری قابل نگهداری و توسعه
- **انیمیشن‌های روان**: تجربه کاربری بهتر

---

## 🏗️ معماری پروژه

```
📦 chat-application/
├── 📄 server.js                    # Entry point سرور Express
├── 📄 package.json                 # Dependencies و scripts
├── 📄 index.html                   # صفحه اصلی چت
├── 📁 js/                          # Frontend JavaScript
│   ├── 📄 app.js                   # Entry point کلاینت (152 خط)
│   └── 📁 modules/                 # ماژول‌های ES6
│       ├── 📄 auth.js              # احراز هویت و session (443 خط)
│       ├── 📄 chat.js              # مدیریت چت‌ها (260 خط)
│       ├── 📄 tts.js               # سیستم TTS (376 خط)
│       ├── 📄 ui.js                # کنترل‌های UI (161 خط)
│       └── 📄 settings.js          # تنظیمات مدل (89 خط)
├── 📁 css/                         # استایل‌های RTL
│   └── 📄 styles.css               # استایل‌های کامل (2000+ خط)
├── 📁 helpers/                     # Backend helpers
│   ├── 📄 auth.js                  # Authentication backend
│   ├── 📄 fs.js                    # File operations
│   ├── 📄 logger.js                # سیستم لاگ
│   ├── 📄 middleware.js            # Express middlewares
│   └── 📄 health.js                # Health monitoring
├── 📁 admin/                       # پنل مدیریت
│   ├── 📄 dashboard.html           # Dashboard ادمین
│   ├── 📄 admin.js                 # منطق پنل مدیریت
│   └── 📄 admin.css                # استایل‌های ادمین
├── 📁 users/                       # داده‌های کاربران (JSON)
├── 📁 chats/                       # فایل‌های چت (JSON)
├── 📁 logs/                        # فایل‌های لاگ
└── 📁 Docs/                        # مستندات کامل
```

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- **Node.js** >= 18.0.0
- **NPM** >= 9.0.0
- **OpenAI API Key** (برای ChatGPT و TTS)

### راه‌اندازی سریع (5 دقیقه)

```bash
# 1. کلون پروژه
git clone <repository-url>
cd chat-application

# 2. نصب وابستگی‌ها
npm install

# 3. تنظیم متغیرهای محیط
cp .env.example .env
# ویرایش .env و اضافه کردن OPENAI_API_KEY

# 4. اجرای برنامه
npm start
# یا برای توسعه:
npm run dev
```

### متغیرهای محیط ضروری

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Server Configuration  
PORT=3000
SESSION_SECRET=your-secure-secret-here

# Feature Flags
ALLOW_AUTO_REGISTER=true
LOG_LEVEL=info
```

---

## 🔧 دستورات NPM

```bash
# Production
npm start                    # اجرای production
npm run logs                 # مشاهده لاگ‌ها

# Development  
npm run dev                  # اجرای development با debug
npm run debug                # اجرای debug mode

# Monitoring
npm run health               # بررسی سلامت سیستم
npm run logs:error          # مشاهده خطاها

# Maintenance
npm run clean:logs          # پاک کردن لاگ‌ها
npm run ssl:create          # ایجاد SSL certificate
```

---

## 📡 API Endpoints

### Authentication
```http
POST   /api/auth/login       # ورود کاربر
POST   /api/auth/logout      # خروج کاربر  
GET    /api/auth/me          # اطلاعات کاربر فعلی
POST   /api/auth/password    # تغییر رمز عبور
```

### Chat Management
```http
GET    /api/chats            # دریافت لیست چت‌ها
POST   /api/chats            # ایجاد چت جدید
GET    /api/chats/:id        # دریافت چت خاص
POST   /api/chats/:id/message # ارسال پیام
DELETE /api/chats/:id        # حذف چت
```

### TTS (Text-to-Speech)
```http
POST   /api/tts              # تولید صوت از متن
GET    /api/users/:username/tts # تنظیمات TTS کاربر
POST   /api/users/:username/tts # ذخیره تنظیمات TTS
```

### Admin Panel
```http
GET    /api/admin/users      # لیست کاربران (ادمین)
POST   /api/admin/users      # ایجاد کاربر جدید
PUT    /api/admin/users/:id  # بروزرسانی کاربر
DELETE /api/admin/users/:id  # حذف کاربر
GET    /api/admin/stats      # آمار سیستم
```

### System Health
```http
GET    /health               # وضعیت کامل سیستم
GET    /health/simple        # وضعیت ساده
GET    /health/ready         # آمادگی برای ترافیک
```

---

## 🔒 امنیت

### ویژگی‌های امنیتی
- **Session Authentication**: کوکی‌های امن با HMAC
- **Password Hashing**: Scrypt برای امنیت بالا
- **Rate Limiting**: محدودیت درخواست‌ها
- **Input Validation**: اعتبارسنجی کامل ورودی‌ها
- **CORS Protection**: کنترل دسترسی Origin
- **Helmet.js**: تنظیمات امنیتی HTTP headers

### لاگ‌گذاری امنیتی
- **Authentication Events**: ورود/خروج کاربران
- **Security Events**: تلاش‌های مشکوک
- **Admin Actions**: عملیات مدیریتی
- **Error Tracking**: ردیابی خطاها با جزئیات

---

## 📊 نظارت و عملکرد

### Health Monitoring
برنامه شامل سیستم کامل نظارت سلامت است:

```bash
# بررسی وضعیت
curl http://localhost:3000/health

# مشاهده آمار عملکرد
curl http://localhost:3000/health/stats
```

### Logging System
سیستم لاگ‌گذاری با Winston:

```
logs/
├── combined.log    # تمام لاگ‌ها
├── error.log       # فقط خطاها  
└── debug.log       # اطلاعات debug
```

---

## 🌐 پشتیبانی چندزبانه

### فارسی (اصلی)
- **RTL Layout**: طراحی راست به چپ
- **فونت فارسی**: Vazirmatn از Google Fonts
- **TTS فارسی**: تولید صوت با OpenAI
- **تاریخ شمسی**: نمایش تاریخ فارسی

### قابلیت‌های بین‌المللی
- **UTF-8 Support**: پشتیبانی کامل کاراکترها
- **Timezone Support**: مدیریت زمان محلی
- **Locale-aware**: تنظیمات منطقه‌ای

---

## 🔧 تنظیمات پیشرفته

### تنظیم TTS
```javascript
// تنظیمات پیش‌فرض
{
  voice: 'alloy',      // صدای پیش‌فرض
  speed: 1.0,          // سرعت نرمال
  quality: 'standard'  // کیفیت استاندارد
}
```

### محدودیت‌های کاربری
```javascript
// تنظیمات پیش‌فرض کاربر
{
  maxChats: null,              // تعداد نامحدود چت
  maxMessagesPerChat: null,    # تعداد نامحدود پیام
  expiryDate: null            // بدون تاریخ انقضا
}
```

---

## 🤝 مشارکت در توسعه

### استانداردهای کد
- **ES6+ JavaScript**: استفاده از ویژگی‌های مدرن
- **Modular Architecture**: هر ماژول حداکثر 200 خط
- **Persian Comments**: تمام کامنت‌ها به فارسی
- **Error Handling**: هر تابع شامل مدیریت خطا

### ساختار Module
```javascript
// Header استاندارد برای هر فایل
// =============================================================================
// 📄 مسیر: js/modules/example.js
// 🎯 هدف: توضیح فارسی هدف فایل
// 📝 شامل: لیست ویژگی‌های اصلی
// 🔗 وابستگی‌ها: لیست وابستگی‌ها
// 📅 آخرین بروزرسانی: تاریخ فارسی
// =============================================================================
```

---

## 📚 مستندات کامل

| 📄 مستند | 🎯 هدف | 👥 مخاطب | ⏱️ زمان |
|-----------|---------|-----------|----------|
| [QUICK_START](Docs/QUICK_START.md) | شروع سریع | مبتدیان | 5 دقیقه |
| [API](Docs/API.md) | مستندات API | Backend Dev | 25 دقیقه |
| [FRONTEND](Docs/FRONTEND.md) | راهنمای UI/UX | Frontend Dev | 35 دقیقه |
| [DEPLOYMENT](Docs/DEPLOYMENT.md) | راهنمای استقرار | DevOps | 45 دقیقه |
| [DATABASE](Docs/DATABASE.md) | ساختار داده | Database Admin | 15 دقیقه |

---

## 🔮 نقشه راه آینده

### نسخه 2.1 (Q1 2026)
- **GPT-4 Vision**: پردازش تصاویر
- **Voice Input**: ورودی صوتی با Whisper
- **Multi-modal Chat**: چت چندرسانه‌ای
- **Real-time Collaboration**: همکاری همزمان

### نسخه 2.2 (Q2 2026)
- **Database Migration**: انتقال به PostgreSQL
- **Microservices**: تقسیم به میکروسرویس‌ها
- **Docker Support**: پشتیبانی کامل Docker
- **Kubernetes**: استقرار در Kubernetes

---

## 📞 پشتیبانی

### گزارش مشکلات
- **GitHub Issues**: برای باگ‌ها و درخواست ویژگی
- **Security Issues**: ایمیل مستقیم برای مسائل امنیتی

### منابع کمکی
- **مستندات**: پوشه `Docs/` برای راهنمای کامل
- **Examples**: نمونه کدها در `examples/`
- **FAQ**: پاسخ به سوالات متداول

---

## 📝 لایسنس

این پروژه تحت [لایسنس MIT](LICENSE) منتشر شده است.

---

**آخرین بروزرسانی**: آگوست 2025 | **نسخه**: 2.0.0 | **وضعیت**: 🟢 Production Ready