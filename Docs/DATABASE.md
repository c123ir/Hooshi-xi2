# 🗄️ مستندات ساختار داده و ذخیره‌سازی

راهنمای کامل سیستم ذخیره‌سازی مبتنی بر فایل JSON

**نسخه**: 2.0.0 | **آخرین بروزرسانی**: آگوست 2025

---

## 🎯 نمای کلی

پروژه از یک سیستم ذخیره‌سازی مبتنی بر **فایل JSON** استفاده می‌کند که برای پروژه‌های کوچک تا متوسط بسیار مناسب است و مزایای زیر را دارد:

### مزایای سیستم فعلی
- **سادگی**: بدون نیاز به دیتابیس پیچیده
- **سرعت**: دسترسی مستقیم به فایل‌ها
- **قابلیت انتقال**: آسان برای backup و migration
- **عدم وابستگی**: بدون نیاز به نصب database server
- **شفافیت**: فایل‌های قابل خواندن توسط انسان
- **Atomic Operations**: عملیات ایمن با file locking

### محدودیت‌ها
- **Scalability**: محدود برای پروژه‌های بزرگ
- **Concurrent Access**: محدودیت در دسترسی همزمان
- **Querying**: عدم پشتیبانی از complex queries
- **Indexing**: فقدان سیستم ایندکس خودکار

---

## 📁 ساختار فایل‌ها

```
📦 پروژه/
├── 📁 users/                    # مدیریت کاربران
│   ├── 📄 users.json            # لیست کاربران اصلی
│   └── 📄 users.json.backup     # فایل پشتیبان (خودکار)
├── 📁 chats/                    # ذخیره چت‌ها
│   ├── 📁 username1/            # چت‌های کاربر 1
│   │   ├── 📄 chat_id1.json     # چت اول
│   │   ├── 📄 chat_id2.json     # چت دوم
│   │   └── 📄 ...
│   ├── 📁 username2/            # چت‌های کاربر 2
│   └── 📁 ...
└── 📁 logs/                     # فایل‌های لاگ
    ├── 📄 combined.log          # تمام لاگ‌ها
    ├── 📄 error.log             # فقط خطاها
    └── 📄 access.log            # درخواست‌های HTTP
```

---

## 👥 مدیریت کاربران

### فایل: `users/users.json`

#### ساختار کلی
```json
{
  "users": [
    {
      "username": "string (unique identifier)",
      "passwordHash": "string (scrypt format: scrypt:salt:hash)",
      "firstName": "string (optional)",
      "lastName": "string (optional)",
      "mobile": "string (optional)",
      "email": "string (optional)",
      "role": "user|admin (default: user)",
      "isActive": "boolean (default: true)",
      "maxChats": "number|null (محدودیت تعداد چت)",
      "maxMessagesPerChat": "number|null (محدودیت پیام در چت)",
      "expiryDate": "string|null (YYYY-MM-DD format)",
      "stats": {
        "totalChats": "number (تعداد کل چت‌ها)",
        "totalMessages": "number (تعداد کل پیام‌ها)",
        "lastLoginAt": "string|null (ISO timestamp)"
      },
      "ttsSettings": {
        "voice": "string (صدای انتخابی)",
        "speed": "number (سرعت پخش)",
        "quality": "string (کیفیت صوت)",
        "gender": "string (جنسیت صدا)",
        "costTier": "string (سطح هزینه)"
      }
    }
  ]
}
```

#### مثال کاربر کامل
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
        "lastLoginAt": "2025-08-20T10:30:00.000Z"
      },
      "ttsSettings": {
        "voice": "alloy",
        "speed": 1.0,
        "quality": "standard",
        "gender": "neutral",
        "costTier": "medium"
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
        "lastLoginAt": "2025-08-20T09:15:00.000Z"
      },
      "ttsSettings": {
        "voice": "nova",
        "speed": 1.2,
        "quality": "hd",
        "gender": "female",
        "costTier": "low"
      }
    }
  ]
}
```

#### توضیح فیلدها

**فیلدهای اصلی:**
- `username`: شناسه یکتا کاربر (required, unique)
- `passwordHash`: رمز عبور هش شده با Scrypt (required)
- `role`: نقش کاربر - "user" یا "admin" (default: "user")
- `isActive`: وضعیت فعال/غیرفعال (default: true)

**فیلدهای پروفایل:**
- `firstName`, `lastName`: نام و نام خانوادگی (optional)
- `mobile`: شماره موبایل با فرمت 09xxxxxxxxx (optional)
- `email`: آدرس ایمیل (optional)

**محدودیت‌ها:**
- `maxChats`: حداکثر تعداد چت مجاز (null = unlimited)
- `maxMessagesPerChat`: حداکثر پیام در هر چت (null = unlimited)
- `expiryDate`: تاریخ انقضای حساب (YYYY-MM-DD format)

**آمار کاربری:**
- `stats.totalChats`: تعداد کل چت‌های ایجاد شده (auto-calculated)
- `stats.totalMessages`: تعداد کل پیام‌های ارسالی (auto-calculated)
- `stats.lastLoginAt`: آخرین زمان ورود (ISO timestamp)

**تنظیمات TTS:**
- `voice`: صدای انتخابی از 6 صدای OpenAI
- `speed`: سرعت پخش (0.25-2.0)
- `quality`: کیفیت صوت (standard/hd)
- `gender`: جنسیت صدا (male/female/neutral)
- `costTier`: سطح هزینه (low/medium/high)

---

## 💬 مدیریت چت‌ها

### ساختار دایرکتوری
```
chats/
├── admin/
│   ├── chat_abc123def456.json
│   ├── chat_xyz789ghi012.json
│   └── ...
├── user123/
│   ├── chat_def456abc123.json
│   └── ...
└── ...
```

### فایل: `chats/{username}/{chatId}.json`

#### ساختار چت
```json
{
  "id": "string (chat identifier)",
  "subject": "string (chat subject/title)", 
  "createdAt": "string (ISO timestamp)",
  "updatedAt": "string (ISO timestamp)",
  "messageCount": "number (تعداد پیام‌ها)",
  "model": "string (مدل AI استفاده شده)",
  "messages": [
    {
      "id": "string (message identifier)",
      "role": "user|assistant",
      "content": "string (message content)",
      "timestamp": "string (ISO timestamp)",
      "model": "string (مدل استفاده شده برای این پیام)",
      "tokens": "number (تعداد توکن مصرفی)",
      "cost": "number (هزینه تخمینی)"
    }
  ],
  "metadata": {
    "totalTokens": "number",
    "totalCost": "number",
    "averageResponseTime": "number (ms)",
    "isPinned": "boolean",
    "isArchived": "boolean",
    "tags": ["array of strings"]
  }
}
```

#### مثال چت کامل
```json
{
  "id": "chat_abc123def456", 
  "subject": "سوال در مورد برنامه‌نویسی JavaScript",
  "createdAt": "2025-08-20T10:30:00.000Z",
  "updatedAt": "2025-08-20T11:15:30.000Z",
  "messageCount": 4,
  "model": "gpt-4o-mini",
  "messages": [
    {
      "id": "msg_user_001",
      "role": "user",
      "content": "چطور می‌تونم یک API در Node.js ایجاد کنم؟",
      "timestamp": "2025-08-20T10:30:15.000Z",
      "model": null,
      "tokens": 0,
      "cost": 0
    },
    {
      "id": "msg_assistant_002",
      "role": "assistant", 
      "content": "برای ایجاد API در Node.js می‌تونید از Express.js استفاده کنید...",
      "timestamp": "2025-08-20T10:30:18.000Z",
      "model": "gpt-4o-mini",
      "tokens": 150,
      "cost": 0.0002
    },
    {
      "id": "msg_user_003",
      "role": "user",
      "content": "ممنون! یک مثال کامل هم می‌تونید بدید؟",
      "timestamp": "2025-08-20T11:10:00.000Z",
      "model": null,
      "tokens": 0,
      "cost": 0
    },
    {
      "id": "msg_assistant_004",
      "role": "assistant",
      "content": "البته! این یک مثال کامل است:\n\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n\napp.listen(3000);\n```",
      "timestamp": "2025-08-20T11:15:30.000Z",
      "model": "gpt-4o-mini",
      "tokens": 89,
      "cost": 0.0001
    }
  ],
  "metadata": {
    "totalTokens": 239,
    "totalCost": 0.0003,
    "averageResponseTime": 2500,
    "isPinned": false,
    "isArchived": false,
    "tags": ["برنامه‌نویسی", "Node.js", "API"]
  }
}
```

#### توضیح فیلدهای پیام
- `id`: شناسه یکتا پیام (auto-generated)
- `role`: نوع پیام - "user" یا "assistant"
- `content`: محتوای پیام (max 4000 chars)
- `timestamp`: زمان ارسال (ISO format)
- `model`: مدل AI برای پیام‌های assistant
- `tokens`: تعداد توکن مصرفی
- `cost`: هزینه تخمینی بر اساس نرخ OpenAI

---

## 🔧 Helper Functions و Operations

### helpers/fs.js - عملیات فایل

#### توابع اصلی چت
```javascript
/**
 * اطمینان از وجود دایرکتوری چت کاربر
 */
async function ensureChatDir(username) {
  const chatDir = path.join('chats', username);
  if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir, { recursive: true });
  }
}

/**
 * خواندن فایل چت
 */
async function readChatFile(username, chatId) {
  const filePath = path.join('chats', username, `${chatId}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // فایل وجود ندارد
    }
    throw error;
  }
}

/**
 * نوشتن فایل چت
 */
async function writeChatFile(username, chat) {
  await ensureChatDir(username);
  const filePath = path.join('chats', username, `${chat.id}.json`);
  
  // به‌روزرسانی timestamp
  chat.updatedAt = new Date().toISOString();
  chat.messageCount = chat.messages.length;
  
  // محاسبه metadata
  chat.metadata = calculateChatMetadata(chat);
  
  // نوشتن atomic
  const tempFile = filePath + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(chat, null, 2));
  fs.renameSync(tempFile, filePath);
}

/**
 * لیست چت‌های کاربر
 */
async function listChats(username) {
  const chatDir = path.join('chats', username);
  if (!fs.existsSync(chatDir)) {
    return [];
  }
  
  const files = fs.readdirSync(chatDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
    
  return files;
}

/**
 * حذف فایل چت
 */
async function deleteChatFile(username, chatId) {
  const filePath = path.join('chats', username, `${chatId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
```

### helpers/auth.js - عملیات کاربران

#### توابع اصلی کاربران
```javascript
/**
 * خواندن تمام کاربران
 */
async function readUsers() {
  const filePath = path.join('users', 'users.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.users || [];
  } catch (error) {
    return [];
  }
}

/**
 * نوشتن آرایه کاربران
 */
async function writeUsers(users) {
  const filePath = path.join('users', 'users.json');
  const backupPath = filePath + '.backup';
  
  // ایجاد backup قبل از تغییر
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
  }
  
  const data = {
    users: users,
    lastUpdated: new Date().toISOString(),
    version: "2.0.0"
  };
  
  // نوشتن atomic
  const tempFile = filePath + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, filePath);
}

/**
 * یافتن کاربر خاص
 */
async function findUser(username) {
  const users = await readUsers();
  return users.find(user => user.username === username);
}

/**
 * ایجاد کاربر جدید
 */
async function createUser(username, password, details = {}) {
  const users = await readUsers();
  
  // بررسی تکراری بودن نام کاربری
  if (users.find(u => u.username === username)) {
    throw new Error('نام کاربری تکراری است');
  }
  
  const newUser = {
    username,
    passwordHash: await hashPassword(password),
    firstName: details.firstName || '',
    lastName: details.lastName || '',
    mobile: details.mobile || '',
    email: details.email || '',
    role: details.role || 'user',
    isActive: details.isActive !== false,
    maxChats: details.maxChats || null,
    maxMessagesPerChat: details.maxMessagesPerChat || null,
    expiryDate: details.expiryDate || null,
    stats: {
      totalChats: 0,
      totalMessages: 0,
      lastLoginAt: null
    },
    ttsSettings: {
      voice: 'alloy',
      speed: 1.0,
      quality: 'standard',
      gender: 'neutral',
      costTier: 'medium'
    }
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  return newUser;
}
```

---

## 🔍 اعتبارسنجی داده‌ها

### User Validation
```javascript
// Username validation
const isValidUsername = (username) => {
  return username && 
         typeof username === 'string' && 
         username.length >= 3 && 
         username.length <= 30 &&
         /^[a-zA-Z0-9_]+$/.test(username);
};

// Password validation  
const isValidPassword = (password) => {
  return password && 
         typeof password === 'string' && 
         password.length >= 6 && 
         password.length <= 100;
};

// Email validation
const isValidEmail = (email) => {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Mobile validation
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

### Chat Validation
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

## 📊 Performance و Optimization

### File Locking
```javascript
const lockfile = require('proper-lockfile');

async function safeFileOperation(filePath, operation) {
  const release = await lockfile.lock(filePath);
  try {
    return await operation();
  } finally {
    await release();
  }
}
```

### Caching Strategy
```javascript
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUser(username) {
  const cached = userCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedUser(username, userData) {
  userCache.set(username, {
    data: userData,
    timestamp: Date.now()
  });
}
```

### Backup Strategy
```javascript
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup_${timestamp}`;
  
  // کپی کردن users
  fs.copyFileSync('users/users.json', `${backupDir}/users.json`);
  
  // کپی کردن chats
  fs.cpSync('chats', `${backupDir}/chats`, { recursive: true });
  
  // ایجاد فایل metadata
  const metadata = {
    timestamp,
    version: "2.0.0",
    userCount: (await readUsers()).length,
    chatCount: await getTotalChatCount()
  };
  
  fs.writeFileSync(`${backupDir}/metadata.json`, 
    JSON.stringify(metadata, null, 2));
}
```

---

## 📈 Migration و Upgrade Path

### نسخه 2.1 (PostgreSQL Migration)
```javascript
// Migration script برای انتقال به PostgreSQL
async function migrateToPostgreSQL() {
  const users = await readUsers();
  const client = new Client(DATABASE_CONFIG);
  
  await client.connect();
  
  // Migration users
  for (const user of users) {
    await client.query(`
      INSERT INTO users (username, password_hash, first_name, ...)
      VALUES ($1, $2, $3, ...)
    `, [user.username, user.passwordHash, user.firstName, ...]);
  }
  
  // Migration chats
  // ... similar process for chats
  
  await client.end();
}
```

### Data Integrity Checks
```javascript
async function validateDataIntegrity() {
  const errors = [];
  
  // بررسی users
  const users = await readUsers();
  for (const user of users) {
    if (!isValidUsername(user.username)) {
      errors.push(`Invalid username: ${user.username}`);
    }
    // ... other validations
  }
  
  // بررسی chats
  for (const user of users) {
    const chatIds = await listChats(user.username);
    for (const chatId of chatIds) {
      const chat = await readChatFile(user.username, chatId);
      if (!chat || !chat.messages) {
        errors.push(`Invalid chat: ${chatId}`);
      }
    }
  }
  
  return errors;
}
```

---

## 🛡️ Security Considerations

### File Permissions
```bash
# تنظیم مجوزهای فایل
chmod 600 users/users.json      # فقط صاحب فایل
chmod 700 users/                # فقط صاحب دایرکتوری
chmod 755 chats/                # خواندن برای همه، نوشتن فقط صاحب
```

### Data Encryption
```javascript
// رمزنگاری حساس data
const crypto = require('crypto');

function encryptSensitiveData(data, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptSensitiveData(encryptedData, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
```

---

## 📊 آمار و گزارش‌ها

### تولید آمار سیستم
```javascript
async function generateSystemStats() {
  const users = await readUsers();
  const activeUsers = users.filter(u => u.isActive);
  
  let totalChats = 0;
  let totalMessages = 0;
  
  for (const user of users) {
    const chatIds = await listChats(user.username);
    totalChats += chatIds.length;
    
    for (const chatId of chatIds) {
      const chat = await readChatFile(user.username, chatId);
      if (chat) {
        totalMessages += chat.messages.length;
      }
    }
  }
  
  return {
    users: {
      total: users.length,
      active: activeUsers.length,
      admins: users.filter(u => u.role === 'admin').length
    },
    chats: {
      total: totalChats,
      averagePerUser: totalChats / users.length
    },
    messages: {
      total: totalMessages,
      averagePerChat: totalMessages / totalChats
    },
    storage: {
      usersFileSize: getFileSize('users/users.json'),
      chatsTotalSize: getDirSize('chats/')
    }
  };
}
```

---

**آخرین بروزرسانی**: آگوست 2025 | **نسخه**: 2.0.0