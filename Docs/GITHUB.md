# 📖 راهنمای GitHub Repository

## 🏠 اطلاعات کلی مخزن

### 📋 جزئیات پروژه
- **نام مخزن**: `Hooshi-xi2`
- **مالک**: `c123ir`
- **نوع**: اپلیکیشن چت هوش مصنوعی با قابلیت TTS
- **زبان اصلی**: JavaScript (Node.js)
- **پشتیبانی زبان**: فارسی (RTL)

### 🌐 آدرس‌های مهم
- **GitHub Repository**: [https://github.com/c123ir/Hooshi-xi2](https://github.com/c123ir/Hooshi-xi2)
- **Branch اصلی**: `main`
- **وضعیت**: فعال و در حال توسعه

## 🚀 نحوه کلون کردن و راه‌اندازی

### 📥 کلون کردن مخزن
```bash
# کلون کردن مخزن
git clone https://github.com/c123ir/Hooshi-xi2.git

# ورود به پوشه پروژه
cd Hooshi-xi2

# نصب وابستگی‌ها
npm install

# راه‌اندازی سرور توسعه
npm start
```

### 🔐 تنظیمات محیط
1. فایل `.env.example` را به `.env` کپی کنید
2. متغیرهای محیط مورد نیاز را تنظیم کنید:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

## 📂 ساختار پروژه

### 🗂️ پوشه‌های اصلی
```
├── 📁 js/modules/          # ماژول‌های JavaScript
│   ├── auth.js            # احراز هویت
│   ├── chat.js            # مدیریت چت
│   ├── settings.js        # تنظیمات
│   ├── tts.js             # تبدیل متن به گفتار
│   └── ui.js              # رابط کاربری
├── 📁 css/                # فایل‌های استایل RTL
├── 📁 helpers/            # ماژول‌های کمکی سرور
├── 📁 admin/              # پنل مدیریت
├── 📁 Docs/               # مستندات پروژه
├── 📁 .github/            # تنظیمات GitHub و Copilot
└── 📄 server.js           # سرور اصلی Express
```

## 🔄 فرآیند توسعه و Git Workflow

### 📝 مراحل توسعه
1. **Clone** مخزن
2. **Branch جدید** برای feature
3. **توسعه** و تست
4. **Commit** با پیام مناسب
5. **Push** به GitHub
6. **Pull Request** (در صورت نیاز)

### 🏷️ قوانین Commit Message
```bash
# فرمت استاندارد
git commit -m "🎯 نوع تغییر: توضیح کوتاه

✅ تغییرات:
- توضیح تغییر اول
- توضیح تغییر دوم

🔧 جزئیات تکنیکی:
- جزئیات فنی مهم"
```

### 🏗️ انواع Commit
| ایموجی | نوع | توضیح |
|---------|-----|-------|
| 🎯 | feat | قابلیت جدید |
| 🐛 | fix | رفع باگ |
| 🎨 | style | بهبود UI/UX |
| 🔧 | refactor | بازنویسی کد |
| 📝 | docs | مستندات |
| 🧪 | test | تست‌ها |
| ⚡ | perf | بهبود عملکرد |

## 🛠️ GitHub Copilot Integration

### 🤖 تنظیمات فعلی
- **Copilot Chat**: فعال
- **Auto-completion**: فعال
- **Code Review**: نیمه‌خودکار
- **Workspace Instructions**: تنظیم شده

### 📋 فایل‌های مرتبط
```
.github/
├── instructions/
│   ├── instructions.instructions.md    # دستورالعمل‌های اصلی
│   ├── chat-role.instructions.md       # نقش چت
│   └── workspace.instructions.md       # تنظیمات workspace
└── prompts/
    ├── Rool-Chat.prompt.md            # پرامپت چت
    └── Rool-cooding.prompt.md         # پرامپت کدنویسی
```

## 📊 آمار و وضعیت

### 🔥 فعالیت‌های اخیر
- ✅ بهبود رابط کاربری تنظیمات
- ✅ رفع مشکلات عملکردی دکمه‌ها
- ✅ بهبود responsive design
- ✅ اضافه کردن debug logging

### 📈 آمار کد
- **خطوط کد**: ~5000+
- **فایل‌های JavaScript**: 15+
- **ماژول‌ها**: 5 ماژول اصلی
- **کامیت‌ها**: مرتب و منظم

## 🤝 مشارکت در پروژه

### 👥 نحوه مشارکت
1. **Fork** کردن مخزن
2. **Branch جدید** ایجاد کنید
3. **تغییرات** خود را اعمال کنید
4. **تست** کنید
5. **Pull Request** ارسال کنید

### 📜 قوانین کدنویسی
- **فارسی**: کامنت‌ها و متغیرها
- **RTL Support**: همیشه در نظر گرفته شود
- **Modular**: کد ماژولار و قابل نگهداری
- **Clean Code**: کد تمیز و خوانا

## 🔗 لینک‌های مفید

### 📚 مستندات
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Start](./QUICK_START.md)
- [Change Log](./CHANGELOG.md)

### 🆘 پشتیبانی
- **Issues**: از GitHub Issues استفاده کنید
- **Discussions**: برای بحث‌های عمومی
- **Pull Requests**: برای پیشنهاد تغییرات

---

### 📝 یادداشت
این مخزن برای یک اپلیکیشن چت هوش مصنوعی با پشتیبانی کامل از زبان فارسی و قابلیت تبدیل متن به گفتار توسعه داده شده است. تمام کدها با رعایت استانداردهای RTL و بهترین practices نوشته شده‌اند.

**آخرین بروزرسانی**: {{ current_date }}
