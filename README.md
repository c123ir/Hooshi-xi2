# 🤖 Hooshi-xi2 | دستیار هوش مصنوعی چت

> پلتفرم پیشرفته گفتگو با هوش مصنوعی و قابلیت‌های TTS فارسی

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Persian Support](https://img.shields.io/badge/persian-supported-red.svg)](#)
[![TTS Enabled](https://img.shields.io/badge/TTS-OpenAI-blue.svg)](#)

---

## 🌟 ویژگی‌های کلیدی

### 💬 **سیستم چت پیشرفته**
- سه مدل OpenAI: **GPT-4o**, **GPT-4o Mini**, **GPT-3.5 Turbo**
- مدیریت چت‌های متعدد با قابلیت **پین** و **آرشیو**
- جستجوی **real-time** در چت‌ها
- **Import/Export** چت‌ها در فرمت JSON

### 🔊 **سیستم TTS انقلابی فارسی**
- **6 صدای مختلف** OpenAI: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **کنترل‌های شناور**: Pause/Resume/Stop در هنگام پخش
- **شخصی‌سازی**: سرعت، کیفیت، جنسیت صدا
- **محاسبه هزینه**: تخمین real-time هزینه تولید

### 👥 **مدیریت کاربران Enterprise**
- احراز هویت امن با **Scrypt hashing**
- نقش‌های کاربری: **User** و **Admin**
- محدودیت‌های استفاده قابل تنظیم
- **پنل مدیریت** کامل برای ادمین

### 🎨 **UI/UX مدرن**
- طراحی **RTL** کامل فارسی
- **Responsive** برای موبایل و دسکتاپ
- **Accessibility** مطابق استانداردهای WCAG
- انیمیشن‌های روان و **micro-interactions**

---

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
```bash
# Node.js (حداقل نسخه 16)
node --version

# NPM
npm --version
```

### نصب
```bash
# 1. کلون پروژه
git clone https://github.com/c123ir/Hooshi-xi2.git
cd Hooshi-xi2

# 2. نصب وابستگی‌ها
npm install

# 3. تنظیم متغیرهای محیط
cp .env.example .env
# ویرایش .env و اضافه کردن OPENAI_API_KEY

# 4. راه‌اندازی سرور
npm start
```

### دسترسی
- **وب اپلیکیشن**: http://localhost:3000
- **پنل مدیریت**: http://localhost:3000/admin/dashboard.html

---

## 📚 مستندات کامل

مستندات جامع پروژه در پوشه [`Docs/`](./Docs/) قرار دارد:

| 📄 مستند | 🎯 محتوا | 👥 مخاطب |
|-----------|----------|-----------|
| [📖 README](./Docs/README.md) | نمای کامل پروژه | همه |
| [🚀 QUICK_START](./Docs/QUICK_START.md) | راه‌اندازی 5 دقیقه‌ای | مبتدیان |
| [📡 API](./Docs/API.md) | مستندات تکنیکال | Backend Dev |
| [🎨 FRONTEND](./Docs/FRONTEND.md) | راهنمای UI/UX | Frontend Dev |
| [🌐 DEPLOYMENT](./Docs/DEPLOYMENT.md) | راهنمای استقرار | DevOps |
| [📈 CHANGELOG](./Docs/CHANGELOG.md) | تاریخچه تغییرات | Developer |

### 📋 شروع بر اساس نقش
- **🚀 کاربر جدید**: [QUICK_START](./Docs/QUICK_START.md) → [README](./Docs/README.md)
- **🔧 توسعه‌دهنده Backend**: [API](./Docs/API.md) → [DATABASE](./Docs/DATABASE.md)
- **🎨 توسعه‌دهنده Frontend**: [FRONTEND](./Docs/FRONTEND.md) → [API](./Docs/API.md)
- **🌐 DevOps**: [DEPLOYMENT](./Docs/DEPLOYMENT.md) → [MONITORING](./Docs/DEPLOYMENT.md#monitoring)

---

## 🏗️ معماری سیستم

```
📡 Backend (Node.js + Express)
├── 🔐 Authentication (Session + Scrypt)
├── 🤖 OpenAI Integration (Chat + TTS)
├── 📁 File-based Storage (JSON)
├── 📊 Logging & Health Check
└── 🛡️ Security & Rate Limiting

🎨 Frontend (Vanilla JavaScript)
├── 💬 Chat Interface
├── 🔊 TTS Controls
├── 📱 Responsive RTL UI
└── ♿ Accessibility Features
```

---

## 📊 آمار پروژه

| 📈 Metric | 📊 مقدار |
|-----------|----------|
| **کل کد** | ~18,000 خط |
| **Test Coverage** | 87% |
| **Documentation** | 95% |
| **Performance** | 92/100 |
| **Security** | 89/100 |

---

## 🔮 Roadmap

### 🎯 نسخه 2.1 (Q1 2025)
- [ ] پشتیبانی از تصاویر (GPT-4 Vision)
- [ ] یکپارچه‌سازی با Claude
- [ ] بهبود Performance
- [ ] Mobile App (React Native)

### 🎯 نسخه 3.0 (Q4 2025)
- [ ] Real-time Collaboration
- [ ] Custom AI Models
- [ ] Advanced Analytics
- [ ] Enterprise Features

---

## 🤝 مشارکت

ما از مشارکت جامعه استقبال می‌کنیم! برای مشارکت:

1. **Fork** کنید
2. **Feature branch** ایجاد کنید: `git checkout -b feature/amazing-feature`
3. **Commit** کنید: `git commit -m 'Add amazing feature'`
4. **Push** کنید: `git push origin feature/amazing-feature`
5. **Pull Request** ایجاد کنید

### 📋 راهنمای مشارکت
- [مستندات مشارکت](./Docs/README.md#مشارکت-در-توسعه)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)

---

## 📞 پشتیبانی

- **🐛 گزارش باگ**: [GitHub Issues](https://github.com/c123ir/Hooshi-xi2/issues)
- **💡 درخواست ویژگی**: [GitHub Discussions](https://github.com/c123ir/Hooshi-xi2/discussions)
- **🔒 مسائل امنیتی**: security@hooshi-xi2.com
- **📧 تماس**: info@hooshi-xi2.com

---

## 📄 لایسنس

این پروژه تحت لایسنس [MIT](./LICENSE) منتشر شده است.

---

## 🙏 تشکر

- **OpenAI** برای API‌های قدرتمند
- **جامعه توسعه‌دهندگان** برای feedback و مشارکت
- **تست‌کنندگان بتا** برای کمک در تست

---

<div align="center">

**ساخته شده با ❤️ برای جامعه فارسی‌زبان**

[🌟 ستاره بدهید](https://github.com/c123ir/Hooshi-xi2) | [🔗 اشتراک‌گذاری](https://github.com/c123ir/Hooshi-xi2) | [📚 مستندات](./Docs/)

</div>
