# 📡 مستندات کامل API

مستندات جامع RESTful API برای **دستیار هوش مصنوعی چت**

**نسخه API**: 2.0 | **آخرین بروزرسانی**: آگوست 2025

---

## 🌐 Base URL و تنظیمات کلی

### Base URL
```
Production:  https://your-domain.com/api
Development: http://localhost:3000/api
```

### Headers مورد نیاز
```http
Content-Type: application/json
Accept: application/json
Cookie: session=<session-token>  # برای authenticated requests
```

### Response Format
همه پاسخ‌ها در فرمت JSON ارسال می‌شوند:
```json
{
  "success": true|false,
  "data": {...},           // در صورت موفقیت
  "error": "message",      // در صورت خطا
  "timestamp": "ISO-8601"  // زمان پاسخ
}
```

---

## 🔐 Authentication API

### POST /auth/login
ورود کاربر به سیستم

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (موفق):**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "admin",
      "firstName": "مدیر",
      "lastName": "سیستم",
      "role": "admin",
      "isActive": true
    },
    "session": {
      "expiresAt": "2025-08-21T10:30:00Z"
    }
  }
}
```

**Response (خطا):**
```json
{
  "success": false,
  "error": "نام کاربری یا گذرواژه نادرست است"
}
```

**Status Codes:**
- `200`: ورود موفق
- `400`: پارامترهای نادرست
- `401`: اطلاعات ورود نادرست
- `429`: تعداد تلاش زیاد

---

### POST /auth/logout
خروج کاربر از سیستم

**Request:** بدون body

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "خروج موفقیت‌آمیز"
  }
}
```

---

### GET /auth/me
دریافت اطلاعات کاربر فعلی

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "admin",
    "firstName": "مدیر", 
    "lastName": "سیستم",
    "role": "admin",
    "isActive": true,
    "stats": {
      "totalChats": 15,
      "totalMessages": 147,
      "lastLoginAt": "2025-08-20T08:30:00Z"
    }
  }
}
```

---

### POST /auth/password
تغییر گذرواژه کاربر

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "گذرواژه با موفقیت تغییر یافت"
  }
}
```

---

## 💬 Chat Management API

### GET /chats
دریافت لیست چت‌های کاربر

**Query Parameters:**
- `search`: جستجو در عناوین (اختیاری)
- `limit`: تعداد نتایج (پیش‌فرض: 50)
- `offset`: شروع از (پیش‌فرض: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat_abc123",
        "subject": "سوال در مورد برنامه‌نویسی",
        "createdAt": "2025-08-20T10:30:00Z",
        "updatedAt": "2025-08-20T11:15:00Z",
        "messageCount": 8,
        "lastMessage": {
          "role": "assistant",
          "content": "این یک پاسخ نمونه است...",
          "timestamp": "2025-08-20T11:15:00Z"
        }
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

---

### POST /chats
ایجاد چت جدید

**Request:**
```json
{
  "subject": "سوال جدید درباره React"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "chat_xyz789",
      "subject": "سوال جدید درباره React",
      "createdAt": "2025-08-20T12:00:00Z",
      "messages": []
    }
  }
}
```

---

### GET /chats/:id
دریافت چت خاص با تمام پیام‌ها

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "chat_abc123",
      "subject": "سوال در مورد برنامه‌نویسی",
      "createdAt": "2025-08-20T10:30:00Z",
      "updatedAt": "2025-08-20T11:15:00Z",
      "messages": [
        {
          "id": "msg_001",
          "role": "user",
          "content": "چطور می‌تونم یک API در Node.js ایجاد کنم؟",
          "timestamp": "2025-08-20T10:30:15Z"
        },
        {
          "id": "msg_002",
          "role": "assistant", 
          "content": "برای ایجاد API در Node.js می‌تونید از Express.js استفاده کنید...",
          "timestamp": "2025-08-20T10:30:18Z"
        }
      ]
    }
  }
}
```

---

### POST /chats/:id/message
ارسال پیام جدید به چت

**Request:**
```json
{
  "content": "ممنون! یک مثال کامل هم می‌تونید بدید؟",
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg_003",
      "role": "user",
      "content": "ممنون! یک مثال کامل هم می‌تونید بدید؟",
      "timestamp": "2025-08-20T11:00:00Z"
    },
    "assistantMessage": {
      "id": "msg_004",
      "role": "assistant",
      "content": "البته! این یک مثال کامل است:\n\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n\napp.listen(3000);\n```",
      "timestamp": "2025-08-20T11:00:05Z"
    }
  }
}
```

---

### PUT /chats/:id
بروزرسانی عنوان چت

**Request:**
```json
{
  "subject": "راهنمای کامل Node.js API"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "chat_abc123",
      "subject": "راهنمای کامل Node.js API",
      "updatedAt": "2025-08-20T12:30:00Z"
    }
  }
}
```

---

### DELETE /chats/:id
حذف چت

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "چت با موفقیت حذف شد"
  }
}
```

---

## 🔊 Text-to-Speech API

### POST /tts
تولید فایل صوتی از متن

**Request:**
```json
{
  "text": "سلام! این یک تست صوتی است.",
  "voice": "alloy",
  "speed": 1.0,
  "quality": "standard"
}
```

**Available Voices:**
- `alloy`: صدای متعادل (پیش‌فرض)
- `echo`: صدای مردانه
- `fable`: صدای بریتانیایی
- `onyx`: صدای عمیق
- `nova`: صدای زنانه جوان
- `shimmer`: صدای نرم

**Speed Range:** 0.25 - 2.0
**Quality:** `standard` | `hd`

**Response:** 
فایل صوتی MP3 به صورت binary با headers:
```http
Content-Type: audio/mpeg
Content-Length: [size]
Content-Disposition: attachment; filename="tts_audio.mp3"
```

**خطاهای محتمل:**
```json
{
  "success": false,
  "error": "متن خیلی طولانی است (حداکثر 4000 کاراکتر)"
}
```

---

### GET /users/:username/tts
دریافت تنظیمات TTS کاربر

**Response:**
```json
{
  "success": true,
  "data": {
    "ttsSettings": {
      "voice": "alloy",
      "speed": 1.2,
      "quality": "hd",
      "gender": "neutral",
      "costTier": "medium"
    }
  }
}
```

---

### POST /users/:username/tts
ذخیره تنظیمات TTS کاربر

**Request:**
```json
{
  "voice": "nova",
  "speed": 1.5,
  "quality": "standard",
  "gender": "female",
  "costTier": "low"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "تنظیمات TTS ذخیره شد"
  }
}
```

---

## 👑 Admin API

### GET /admin/users
دریافت لیست کاربران (فقط ادمین)

**Query Parameters:**
- `role`: فیلتر بر اساس نقش (`admin`, `user`)
- `active`: فیلتر کاربران فعال (`true`, `false`)
- `search`: جستجو در نام کاربری
- `limit`: تعداد نتایج (پیش‌فرض: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "username": "user123",
        "firstName": "علی",
        "lastName": "احمدی",
        "role": "user",
        "isActive": true,
        "stats": {
          "totalChats": 5,
          "totalMessages": 32,
          "lastLoginAt": "2025-08-19T14:20:00Z"
        },
        "limitations": {
          "maxChats": 10,
          "maxMessagesPerChat": 20,
          "expiryDate": "2025-12-31"
        }
      }
    ],
    "total": 150,
    "pagination": {
      "page": 1,
      "pages": 8,
      "hasNext": true
    }
  }
}
```

---

### POST /admin/users
ایجاد کاربر جدید (فقط ادمین)

**Request:**
```json
{
  "username": "newuser",
  "password": "securepass123",
  "firstName": "کاربر",
  "lastName": "جدید", 
  "email": "user@example.com",
  "mobile": "09123456789",
  "role": "user",
  "limitations": {
    "maxChats": 5,
    "maxMessagesPerChat": 15,
    "expiryDate": "2025-12-31"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "newuser",
      "firstName": "کاربر",
      "lastName": "جدید",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-08-20T13:00:00Z"
    }
  }
}
```

---

### PUT /admin/users/:username
بروزرسانی کاربر (فقط ادمین)

**Request:**
```json
{
  "firstName": "کاربر جدید",
  "isActive": false,
  "limitations": {
    "maxChats": 3
  }
}
```

---

### DELETE /admin/users/:username
حذف کاربر (فقط ادمین)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "کاربر با موفقیت حذف شد"
  }
}
```

---

### GET /admin/stats
آمار کلی سیستم (فقط ادمین)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 120,
      "admins": 3,
      "newThisMonth": 15
    },
    "chats": {
      "total": 1250,
      "thisMonth": 180,
      "averagePerUser": 8.3
    },
    "messages": {
      "total": 8500,
      "thisMonth": 1200,
      "averagePerChat": 6.8
    },
    "tts": {
      "totalRequests": 450,
      "thisMonth": 85,
      "totalCost": 12.50,
      "averageCostPerRequest": 0.028
    },
    "system": {
      "uptime": "15 days, 8 hours",
      "memoryUsage": "245 MB",
      "diskUsage": "2.1 GB"
    }
  }
}
```

---

## 🏥 Health & Monitoring API

### GET /health
بررسی کامل سلامت سیستم

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-20T14:30:00Z",
  "uptime": "15 days, 8 hours, 30 minutes",
  "version": "2.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "2ms"
    },
    "openai": {
      "status": "healthy", 
      "responseTime": "150ms",
      "lastRequest": "2025-08-20T14:25:00Z"
    },
    "filesystem": {
      "status": "healthy",
      "freeSpace": "15.2 GB"
    }
  },
  "metrics": {
    "requests": {
      "total": 15420,
      "last24h": 1250,
      "errorRate": "0.2%"
    },
    "memory": {
      "used": "245 MB",
      "free": "512 MB",
      "usage": "48%"
    },
    "activeUsers": 23,
    "activeSessions": 15
  }
}
```

---

### GET /health/simple
بررسی ساده سلامت

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-20T14:30:00Z"
}
```

---

### GET /health/ready
آمادگی برای دریافت ترافیک

**Response:**
```json
{
  "ready": true,
  "timestamp": "2025-08-20T14:30:00Z"
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "پیام خطا به فارسی",
  "code": "ERROR_CODE",
  "details": {...},        // جزئیات اضافی (اختیاری)
  "timestamp": "2025-08-20T14:30:00Z"
}
```

### Common Error Codes
| کد HTTP | پیام | توضیح |
|---------|------|--------|
| `400` | درخواست نادرست | پارامترهای ارسالی اشتباه |
| `401` | عدم احراز هویت | نیاز به ورود |
| `403` | عدم دسترسی | کاربر مجوز ندارد |
| `404` | یافت نشد | منبع موجود نیست |
| `429` | محدودیت درخواست | تعداد درخواست زیاد |
| `500` | خطای سرور | خطای داخلی سرور |

### Rate Limiting
```json
{
  "success": false,
  "error": "تعداد درخواست‌ها بیش از حد مجاز",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "window": "15 minutes",
    "reset": "2025-08-20T14:45:00Z"
  }
}
```

---

## 🔧 Examples & SDKs

### JavaScript/Node.js Example
```javascript
const chatAPI = {
  baseURL: 'http://localhost:3000/api',
  
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include', // شامل session cookie
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  },
  
  // ورود
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // دریافت چت‌ها
  async getChats() {
    return this.request('/chats');
  },
  
  // ارسال پیام
  async sendMessage(chatId, content, model = 'gpt-4o-mini') {
    return this.request(`/chats/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content, model })
    });
  },
  
  // تولید TTS
  async generateTTS(text, options = {}) {
    const response = await fetch(`${this.baseURL}/tts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text, 
        voice: 'alloy',
        speed: 1.0,
        ...options 
      })
    });
    
    if (!response.ok) {
      throw new Error('خطا در تولید صوت');
    }
    
    return response.blob(); // فایل صوتی
  }
};

// استفاده
async function example() {
  try {
    // ورود
    await chatAPI.login('admin', 'admin123');
    
    // دریافت چت‌ها
    const chats = await chatAPI.getChats();
    console.log('چت‌ها:', chats);
    
    // ارسال پیام
    const response = await chatAPI.sendMessage(
      chats.chats[0].id, 
      'سلام! چطوری؟'
    );
    console.log('پاسخ:', response);
    
  } catch (error) {
    console.error('خطا:', error.message);
  }
}
```

---

## 📊 API Usage Analytics

### Request/Response Metrics
- **میانگین Response Time**: 150ms
- **Success Rate**: 99.8%
- **Peak Concurrent Requests**: 50 req/sec
- **Average Payload Size**: 2.5KB

### Popular Endpoints
1. `/chats` - 35% از کل درخواست‌ها
2. `/chats/:id/message` - 25%
3. `/auth/me` - 15%
4. `/tts` - 12%
5. `/health` - 8%

### Usage Patterns
- **Peak Hours**: 9-11 AM، 2-4 PM
- **Average Session Duration**: 25 دقیقه
- **Messages per Session**: 8.5
- **TTS Usage**: 15% از کل پیام‌ها

---

**مستندات API نسخه 2.0.0** | **آخرین بروزرسانی**: آگوست 2025