# 🛡️ مستندات پنل ادمین

مستندات کامل پنل مدیریت **دستیار هوش مصنوعی چت**

**نسخه**: 2.0 | **آخرین بروزرسانی**: آگوست 2025

---

## 🎯 نمای کلی

پنل ادمین یک رابط کاربری کامل و مدرن برای مدیریت سیستم چت AI است که شامل امکانات زیر می‌باشد:

### ✨ **ویژگی‌های کلیدی**
- 📊 **Dashboard تعاملی**: نمایش آمار realtime
- 👥 **مدیریت کاربران**: CRUD کامل با امکانات پیشرفته
- 📈 **آمار تفصیلی**: مانیتورینگ عملکرد سیستم
- 🖥️ **وضعیت سیستم**: بررسی سلامت و منابع
- ⚙️ **تنظیمات**: کنترل پیکربندی‌های مختلف
- 📱 **Responsive Design**: قابل استفاده در تمام دستگاه‌ها

---

## 🔐 دسترسی به پنل ادمین

### مسیر دسترسی
```
http://localhost:3000/admin/dashboard.html
```

### احراز هویت
- **نقش مورد نیاز**: `admin`
- **Session-based**: ورود از طریق API `/auth/login`
- **Auto-redirect**: در صورت عدم احراز هویت به صفحه login

### کاربر پیش‌فرض
```
Username: admin
Password: admin (قابل تغییر از پنل)
```

---

## 📊 Dashboard (صفحه اصلی)

### آمار کلی
نمایش 4 کارت اصلی:

```javascript
{
  totalUsers: 5,          // تعداد کل کاربران
  activeUsers: 5,         // کاربران فعال
  totalChats: 11,         // تعداد کل چت‌ها
  totalMessages: 49       // تعداد کل پیام‌ها
}
```

### ویژگی‌های Dashboard
- **Real-time Updates**: بروزرسانی خودکار آمار
- **Visual Cards**: نمایش آمار با آیکون‌های FontAwesome
- **Persian Numbers**: نمایش اعداد به فارسی
- **Color Coding**: رنگ‌بندی بر اساس وضعیت

---

## 👥 مدیریت کاربران

### 🔍 نمایش لیست کاربران

**جدول کاربران شامل:**
- 👤 **نام کاربری**: Username منحصربه‌فرد
- 📝 **نام و نام خانوادگی**: اطلاعات شخصی
- 📧 **ایمیل**: آدرس ایمیل (اختیاری)
- 👔 **نقش**: User یا Admin
- 🟢 **وضعیت**: فعال/غیرفعال
- 📅 **تاریخ ایجاد**: زمان ثبت‌نام
- 🔧 **عملیات**: دکمه‌های مدیریتی

### 🛠️ عملیات مدیریتی

#### 1️⃣ **مشاهده جزئیات** (👁️)
```javascript
// نمایش اطلاعات کامل کاربر
{
  username: "admin",
  firstName: "مدیر", 
  lastName: "سیستم",
  email: "admin@example.com",
  role: "admin",
  isActive: true,
  createdAt: "2025-08-14T02:29:19.340Z",
  updatedAt: "2025-08-20T06:26:28.945Z",
  chatsCount: 7,           // تعداد چت‌های کاربر
  messagesCount: 35        // تعداد پیام‌های کاربر
}
```

#### 2️⃣ **ویرایش کاربر** (✏️)
- تغییر نام و نام خانوادگی
- بروزرسانی ایمیل
- تغییر نقش (User ↔ Admin)
- تنظیم محدودیت‌ها:
  ```javascript
  {
    maxChats: null,              // تعداد چت (null = نامحدود)
    maxMessagesPerChat: null,    // تعداد پیام در چت
    expiryDate: null            // تاریخ انقضا
  }
  ```

#### 3️⃣ **تغییر وضعیت** (🔄)
- فعال/غیرفعال کردن کاربر
- جلوگیری از ورود کاربران غیرفعال
- حفظ داده‌ها بدون حذف

#### 4️⃣ **حذف کاربر** (🗑️)
- حذف کامل کاربر و داده‌هایش
- محافظت از کاربر admin (غیرقابل حذف)
- Confirmation dialog برای جلوگیری از حذف تصادفی

### 📤 **صادرات داده‌ها**
- دانلود لیست کاربران در فرمت JSON
- شامل تمام اطلاعات (به جز password)
- فرمت قابل استفاده در Excel

---

## 📈 آمار تفصیلی

### 📊 آمار کلی سیستم
```javascript
{
  totalUsers: 5,           // تعداد کل کاربران
  activeUsers: 5,          // کاربران فعال
  totalChats: 11,          // تعداد کل چت‌ها
  totalMessages: 49,       // تعداد کل پیام‌ها
  uptime: 0,              // مدت زمان فعالیت (ثانیه)
  version: "2.0.0"        // نسخه سیستم
}
```

### 🗄️ آمار Cache (در حال توسعه)
```javascript
{
  cacheHits: 1250,        // تعداد cache hits
  cacheMisses: 89,        // تعداد cache misses
  totalSize: "2.4MB",     // حجم کل cache
  itemCount: 45           // تعداد آیتم‌ها
}
```

### 📋 نمایش آمار
- **Cards تعاملی**: نمایش آمار در کارت‌های زیبا
- **Progress Bars**: نمایش درصد استفاده
- **Trend Indicators**: نشان‌دهنده افزایش/کاهش
- **Persian Formatting**: فرمت‌بندی اعداد فارسی

---

## 🖥️ وضعیت سیستم

### 💚 بررسی سلامت
```javascript
{
  status: "healthy",               // وضعیت کلی
  timestamp: "2025-08-20T07:09:02.510Z",
  response_time_ms: 1,            // زمان پاسخ (میلی‌ثانیه)
  version: "1.0.0",               // نسخه اپلیکیشن
  environment: "development",      // محیط اجرا
  uptime_seconds: 3600,           // مدت فعالیت
  memory_usage: {
    used: "45.2MB",               // RAM استفاده شده
    total: "512MB",               // کل RAM
    percentage: 8.8               // درصد استفاده
  },
  database: {
    status: "connected",          // وضعیت اتصال دیتابیس
    response_time_ms: 2          // زمان پاسخ
  }
}
```

### 🔍 جزئیات نظارت
- **Real-time Status**: بروزرسانی زنده وضعیت
- **Performance Metrics**: متریک‌های عملکرد
- **Resource Usage**: مصرف منابع سیستم
- **Health Indicators**: نشان‌گرهای سلامت

---

## ⚙️ تنظیمات سیستم

### 🛠️ تنظیمات قابل دسترس
- **User Registration**: فعال/غیرفعال کردن ثبت‌نام
- **Chat Limits**: محدودیت‌های پیش‌فرض چت
- **TTS Settings**: تنظیمات سیستم TTS
- **Session Timeout**: مدت زمان session
- **Log Level**: سطح لاگ‌گذاری

### 📋 فرم تنظیمات
```javascript
{
  allowAutoRegister: true,        // اجازه ثبت‌نام خودکار
  defaultMaxChats: null,          // حداکثر چت پیش‌فرض
  defaultMaxMessages: null,       // حداکثر پیام پیش‌فرض
  sessionTimeout: 86400,          // مدت session (ثانیه)
  logLevel: "info"               // سطح لاگ
}
```

---

## 🎨 رابط کاربری و UX

### 📱 Responsive Design
- **Mobile First**: طراحی اولویت موبایل
- **Tablet Optimized**: بهینه‌سازی برای تبلت
- **Desktop Enhanced**: امکانات پیشرفته در دسکتاپ

### 🎯 Navigation
```
📊 Dashboard    - صفحه اصلی و آمار کلی
👥 کاربران     - مدیریت کاربران
📈 آمار        - آمار تفصیلی سیستم
🖥️ سیستم      - وضعیت و سلامت
⚙️ تنظیمات     - پیکربندی سیستم
```

### 🎨 طراحی
- **RTL Support**: پشتیبانی کامل راست به چپ
- **Persian Fonts**: فونت‌های فارسی زیبا
- **Color Scheme**: طرح رنگی حرفه‌ای
- **Icon Integration**: آیکون‌های FontAwesome

---

## 🔧 معماری فنی

### 📁 ساختار فایل‌ها
```
admin/
├── 📄 dashboard.html           # صفحه اصلی (472 خط)
├── 📄 admin-simple.js          # منطق کنترل (500+ خط)
├── 📄 admin.css               # استایل‌های اصلی (600+ خط)
├── 📁 modules/                # ماژول‌های JavaScript
│   └── 📄 UserManager.js      # مدیریت کاربران (590+ خط)
└── 📁 components/             # کامپوننت‌های HTML/CSS
    ├── 📄 users-section.html  # بخش کاربران (178 خط)
    └── 📄 users-styles.css    # استایل کاربران
```

### 🔗 وابستگی‌ها
- **FontAwesome 6**: آیکون‌ها
- **Vanilla JavaScript**: بدون فریمورک
- **ES6 Modules**: ماژول‌های مدرن
- **Fetch API**: درخواست‌های HTTP
- **CSS Grid/Flexbox**: Layout مدرن

### 🛠️ ویژگی‌های فنی
- **Session Management**: مدیریت session خودکار
- **Error Handling**: مدیریت خطای جامع
- **Loading States**: نمایش وضعیت بارگذاری
- **Form Validation**: اعتبارسنجی فرم‌ها
- **Responsive Tables**: جداول responsive

---

## 🔒 امنیت پنل ادمین

### 🛡️ اقدامات امنیتی
- **Role-based Access**: دسترسی بر اساس نقش
- **Session Validation**: اعتبارسنجی session
- **CSRF Protection**: محافظت از CSRF
- **Input Sanitization**: پاکسازی ورودی‌ها
- **Audit Logging**: لاگ عملیات مدیریتی

### 📋 سطوح دسترسی
```javascript
{
  admin: {
    users: ["read", "write", "delete"],
    stats: ["read"],
    system: ["read"],
    settings: ["read", "write"]
  },
  user: {
    // دسترسی محدود به پنل عمومی
  }
}
```

---

## 🐛 عیب‌یابی و مشکلات رایج

### ❌ مشکلات رایج

#### 1️⃣ خطای 403 برای Cache Stats
```
GET /api/cache/stats 403 (Forbidden)
```
**راه حل**: این endpoint در حال توسعه است و فعلاً در دسترس نیست.

#### 2️⃣ مشکل بارگذاری کاربران
```javascript
// بررسی console برای خطاهای JavaScript
console.log('UserManager errors');
```

#### 3️⃣ مشکل احراز هویت
```javascript
// بررسی session
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log);
```

### 🔧 ابزارهای عیب‌یابی
- **Browser DevTools**: بررسی console و network
- **Server Logs**: لاگ‌های سرور در `logs/`
- **Health Endpoint**: `/health` برای وضعیت
- **API Testing**: استفاده از Postman یا curl

---

## 📚 نمونه کدها

### 🔌 استفاده از API
```javascript
// ورود ادمین
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin'
    })
  });
  return response.json();
};

// دریافت لیست کاربران
const getUsers = async () => {
  const response = await fetch('/api/admin/users', {
    credentials: 'include'
  });
  return response.json();
};
```

### 🎨 کاستومایز کردن استایل
```css
/* تغییر رنگ اصلی */
:root {
  --primary-color: #your-color;
  --secondary-color: #your-secondary;
}

/* استایل کارت‌های dashboard */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 🚀 آپدیت‌های آینده

### 📋 نقشه راه v2.1
- [ ] **Cache Management**: مدیریت کامل cache
- [ ] **Backup/Restore**: پشتیبان‌گیری خودکار
- [ ] **User Analytics**: آنالیز رفتار کاربران
- [ ] **Role Management**: نقش‌های سفارشی
- [ ] **Notification System**: سیستم اطلاع‌رسانی

### 🔄 بهبودهای v2.2
- [ ] **Dark Mode**: حالت تاریک
- [ ] **Multi-language**: چندزبانه
- [ ] **Advanced Charts**: نمودارهای پیشرفته
- [ ] **Real-time Updates**: بروزرسانی realtime
- [ ] **Mobile App**: اپلیکیشن موبایل

---

## 📞 پشتیبانی

### 🆘 راه‌های دریافت کمک
- **GitHub Issues**: گزارش باگ و درخواست ویژگی
- **Documentation**: مستندات کامل در `Docs/`
- **Email**: پشتیبانی مستقیم برای مسائل حساس

### 📖 منابع اضافی
- [API Documentation](API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Frontend Guide](FRONTEND.md)
- [Database Schema](DATABASE.md)

---

**آخرین بروزرسانی**: آگوست 2025 | **نسخه**: 2.0.0 | **وضعیت**: 🟢 Production Ready
