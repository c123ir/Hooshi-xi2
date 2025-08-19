# Database Schema Documentation

## Overview
پروژه از یک سیستم ذخیره‌سازی مبتنی بر فایل JSON استفاده می‌کند. این رویکرد برای پروژه‌های کوچک و متوسط مناسب است.

---

## User Management Schema

### File: `users/users.json`

#### Structure:
```json
{
  "users": [
    {
      "username": "string (unique identifier)",
      "passwordHash": "string (scrypt format: scrypt:salt:hash)",
      "firstName": "string (اختیاری)",
      "lastName": "string (اختیاری)",
      "mobile": "string (اختیاری)",
      "email": "string (اختیاری)",
      "role": "user|admin (default: user)",
      "isActive": "boolean (default: true)",
      "maxChats": "number|null (محدودیت تعداد چت)",
      "maxMessagesPerChat": "number|null (محدودیت پیام در چت)",
      "expiryDate": "string|null (YYYY-MM-DD format)",
      "stats": {
        "totalChats": "number (تعداد کل چت‌ها)",
        "totalMessages": "number (تعداد کل پیام‌ها)",
        "lastLoginAt": "string|null (ISO timestamp)"
      }
    }
  ]
}
```

#### مثال کاربر کامل:
```json
{
  "users": [
    {
      "username": "admin",
      "passwordHash": "scrypt:a1b2c3d4e5f6:1234567890abcdef...",
      "firstName": "مدیر",
      "lastName": "سیستم",
      "mobile": "09123456789",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "maxChats": null,
      "maxMessagesPerChat": null,
      "expiryDate": null,
      "stats": {
        "totalChats": 15,
        "totalMessages": 147,
        "lastLoginAt": "2025-08-14T10:30:00.000Z"
      }
    },
    {
      "username": "user123",
      "passwordHash": "scrypt:f6e5d4c3b2a1:fedcba0987654321...",
      "firstName": "علی",
      "lastName": "احمدی",
      "mobile": "09987654321",
      "email": "ali@example.com",
      "role": "user",
      "isActive": true,
      "maxChats": 10,
      "maxMessagesPerChat": 20,
      "expiryDate": "2025-12-31",
      "stats": {
        "totalChats": 3,
        "totalMessages": 28,
        "lastLoginAt": "2025-08-14T09:15:00.000Z"
      }
    }
  ]
}
```

### Field Descriptions:

#### Core Fields:
- **username**: شناسه یکتا کاربر (string, required, unique)
- **passwordHash**: رمز عبور هش شده با Scrypt (string, required)
- **role**: نقش کاربر - "user" یا "admin" (string, default: "user")
- **isActive**: وضعیت فعال/غیرفعال (boolean, default: true)

#### Profile Fields:
- **firstName**: نام (string, optional)
- **lastName**: نام خانوادگی (string, optional)  
- **mobile**: شماره موبایل (string, optional)
- **email**: آدرس ایمیل (string, optional)

#### Limitation Fields:
- **maxChats**: حداکثر تعداد چت مجاز (number|null, null = unlimited)
- **maxMessagesPerChat**: حداکثر پیام در هر چت (number|null, null = unlimited)
- **expiryDate**: تاریخ انقضای حساب (string|null, YYYY-MM-DD format)

#### Statistics Fields:
- **stats.totalChats**: تعداد کل چت‌های ایجاد شده (number, auto-calculated)
- **stats.totalMessages**: تعداد کل پیام‌های ارسالی (number, auto-calculated)
- **stats.lastLoginAt**: آخرین زمان ورود (string|null, ISO timestamp)

---

## Chat Storage Schema

### Directory Structure:
```
chats/
├── username1/
│   ├── chat_id_1.json
│   ├── chat_id_2.json
│   └── ...
├── username2/
│   ├── chat_id_3.json
│   └── ...
└── ...
```

### Chat File Structure:
#### File: `chats/{username}/{chatId}.json`

```json
{
  "id": "string (chat identifier)",
  "subject": "string (chat subject/title)",
  "createdAt": "string (ISO timestamp)",
  "messages": [
    {
      "id": "string (message identifier)", 
      "role": "user|assistant",
      "content": "string (message content)",
      "timestamp": "string (ISO timestamp)"
    }
  ]
}
```

#### مثال فایل چت:
```json
{
  "id": "chat_abc123def456",
  "subject": "سوال در مورد برنامه‌نویسی JavaScript",
  "createdAt": "2025-08-14T10:30:00.000Z",
  "messages": [
    {
      "id": "msg_user_001",
      "role": "user",
      "content": "چطور می‌تونم یک API در Node.js ایجاد کنم؟",
      "timestamp": "2025-08-14T10:30:15.000Z"
    },
    {
      "id": "msg_assistant_002", 
      "role": "assistant",
      "content": "برای ایجاد API در Node.js می‌تونید از Express.js استفاده کنید...",
      "timestamp": "2025-08-14T10:30:18.000Z"
    },
    {
      "id": "msg_user_003",
      "role": "user", 
      "content": "ممنون! یک مثال کامل هم می‌تونید بدید؟",
      "timestamp": "2025-08-14T10:32:00.000Z"
    },
    {
      "id": "msg_assistant_004",
      "role": "assistant",
      "content": "البته! این یک مثال کامل است:\n\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n\napp.listen(3000);\n```",
      "timestamp": "2025-08-14T10:32:05.000Z"
    }
  ]
}
```

### Message Field Descriptions:
- **id**: شناسه یکتا پیام (string, auto-generated)
- **role**: نوع پیام - "user" (کاربر) یا "assistant" (هوش مصنوعی) 
- **content**: محتوای پیام (string, max 4000 chars)
- **timestamp**: زمان ارسال پیام (string, ISO format)

---

## Migration System

### Auto Migration Features:
سیستم به صورت خودکار ساختار قدیمی کاربران را به‌روزرسانی می‌کند.

#### Migration Process:
```javascript
async function migrateUsersStructure() {
  // بررسی وجود فیلدهای جدید
  users.forEach(user => {
    // اضافه کردن profile fields
    if (user.firstName === undefined) {
      user.firstName = '';
      user.lastName = '';
      user.mobile = '';
      user.email = '';
    }
    
    // اضافه کردن role
    if (user.role === undefined) {
      user.role = 'user';
    }
    
    // اضافه کردن status fields
    if (user.isActive === undefined) {
      user.isActive = true;
    }
    
    // اضافه کردن limitation fields
    if (user.maxChats === undefined) {
      user.maxChats = null;
      user.maxMessagesPerChat = null;
      user.expiryDate = null;
    }
    
    // اضافه کردن statistics
    if (!user.stats) {
      user.stats = {
        totalChats: 0,
        totalMessages: 0,
        lastLoginAt: null
      };
    }
  });
}
```

### Backward Compatibility:
- کاربران قدیمی بدون profile fields به صورت خودکار به‌روزرسانی می‌شوند
- Default values برای فیلدهای جدید تنظیم می‌شود
- هیچ داده‌ای از دست نمی‌رود

---

## Data Validation

### User Validation:
```javascript
// Username validation
const isValidUsername = (username) => {
  return username && 
         typeof username === 'string' && 
         username.length >= 3 && 
         username.length <= 50 &&
         /^[a-zA-Z0-9_]+$/.test(username);
};

// Password validation  
const isValidPassword = (password) => {
  return password && 
         typeof password === 'string' && 
         password.length >= 6;
};

// Email validation (if provided)
const isValidEmail = (email) => {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Mobile validation (if provided)
const isValidMobile = (mobile) => {
  if (!mobile) return true; // optional field
  return /^09\d{9}$/.test(mobile);
};

// Date validation
const isValidDate = (dateString) => {
  if (!dateString) return true; // null allowed
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && 
         !isNaN(Date.parse(dateString));
};
```

### Chat Validation:
```javascript
// Subject validation
const isValidSubject = (subject) => {
  return subject && 
         typeof subject === 'string' && 
         subject.trim().length > 0 && 
         subject.length <= 100;
};

// Message content validation
const isValidContent = (content) => {
  return content && 
         typeof content === 'string' && 
         content.trim().length > 0 && 
         content.length <= 4000;
};
```

---

## File Operations

### Core Helper Functions:

#### User Operations:
```javascript
// helpers/auth.js
async function readUsers()           // خواندن تمام کاربران
async function writeUsers(users)    // نوشتن آرایه کاربران
async function findUser(username)   // یافتن کاربر خاص
async function createUser(...)      // ایجاد کاربر جدید
async function updateUser(...)      // به‌روزرسانی کاربر
async function deleteUser(username) // حذف کاربر
```

#### Chat Operations:
```javascript
// helpers/fs.js
async function ensureChatDir(username)        // ایجاد پوشه چت کاربر
async function readChatFile(username, chatId) // خواندن فایل چت
async function writeChatFile(username, chat)  // نوشتن فایل چت
async function listChats(username)            // لیست چت‌های کاربر
async function deleteChatFile(username, chatId) // حذف فایل چت
```

### File Permissions:
- `users/users.json`: خواندن/نوشتن برای سرور
- `chats/{username}/`: خواندن/نوشتن برای سرور  
- محدودیت دسترسی کاربران به چت‌های خودشان

---

## Performance Considerations

### Current Approach:
- ✅ ساده و مستقیم
- ✅ بدون نیاز به دیتابیس
- ✅ مناسب پروژه‌های کوچک تا متوسط
- ⚠️ محدودیت همزمانی
- ⚠️ عدم بهینگی برای دیتای زیاد

### Optimization Tips:
1. **Caching:** Cache کردن user data در memory
2. **Batch Operations:** گروه‌بندی عملیات I/O
3. **Index Files:** ایجاد فایل‌های index برای جستجوی سریع
4. **Compression:** فشرده‌سازی فایل‌های بزرگ

### Migration to Database:
برای scale کردن پروژه، می‌توان به دیتابیس مهاجرت کرد:

```sql
-- PostgreSQL Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  mobile VARCHAR(15),
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  max_chats INTEGER,
  max_messages_per_chat INTEGER,
  expiry_date DATE,
  total_chats INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chats (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) REFERENCES users(username),
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) REFERENCES chats(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## Backup and Recovery

### Backup Strategy:
```bash
# ساده‌ترین روش backup
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz users/ chats/

# اسکریپت backup خودکار
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "$BACKUP_DIR/chat_backup_$DATE.tar.gz" users/ chats/
find "$BACKUP_DIR" -name "chat_backup_*.tar.gz" -mtime +7 -delete
```

### Recovery Process:
```bash
# بازیابی از backup
tar -xzf backup_file.tar.gz
# بررسی integrity فایل‌ها
node -e "console.log(JSON.parse(require('fs').readFileSync('users/users.json')))"
```
