# 📖 مستندات کامل API

## 🔐 سیستم احراز هویت

### نمای کلی
سیستم احراز هویت پروژه بر پایه **Scrypt hashing** و **Session-based authentication** پیاده‌سازی شده است که امنیت بالا و عملکرد مطلوب را تضمین می‌کند.

### ویژگی‌های امنیتی
- **Session-based Authentication**: استفاده از کوکی‌های امن
- **Scrypt Hashing**: هش کردن امن رمزهای عبور
- **Auto-registration**: ثبت‌نام خودکار (قابل تنظیم)
- **Rate Limiting**: محافظت در برابر حملات Brute Force
- **Role-based Access**: دسترسی‌های سطح‌بندی شده

---

## 🔑 Endpoints احراز هویت

### POST `/api/auth/login`
**مسئولیت:** ورود کاربر به سیستم یا ثبت‌نام خودکار

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string (required, 3-50 characters)",
  "password": "string (required, 8+ characters)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "username": "user123",
  "role": "user",
  "message": "ورود موفقیت‌آمیز"
}
```

**Error Responses:**
- `400 Bad Request`: نام کاربری و گذرواژه لازم است
- `401 Unauthorized`: کاربر یافت نشد / گذرواژه نادرست است
- `403 Forbidden`: کاربر غیرفعال / محدودیت دسترسی
- `429 Too Many Requests`: تعداد تلاش‌های زیاد

**ویژگی‌های خاص:**
- **Auto-registration**: اگر `ALLOW_AUTO_REGISTER=true` باشد
- **Session Cookie**: ایجاد کوکی امن با HttpOnly
- **Login Statistics**: ثبت آمار ورود کاربر
- **Role Detection**: تشخیص خودکار نقش کاربر

### POST `/api/auth/logout`
**مسئولیت:** خروج امن کاربر از سیستم

**Headers:**
```http
Cookie: session=...
```

**Success Response (200):**
```json
{
  "success": true
}
```

#### GET `/api/auth/me`
**مسئولیت:** دریافت اطلاعات کاربر جاری
**Middleware:** `requireAuth`

**Success Response (200):**
```json
{
  "username": "user123",
  "firstName": "نام",
  "lastName": "نام خانوادگی",
  "mobile": "09123456789",
  "email": "user@example.com",
  "role": "user",
  "isActive": true,
  "stats": {
    "totalChats": 5,
    "totalMessages": 25,
    "lastLoginAt": "2025-08-14T10:30:00.000Z"
  }
}
```

---

## Chat Management

### GET `/api/chats`
**مسئولیت:** دریافت لیست چت‌های کاربر
**Middleware:** `requireAuth`

**Success Response (200):**
```json
[
  {
    "id": "chat_id_123",
    "subject": "موضوع چت",
    "createdAt": "2025-08-14T10:30:00.000Z",
    "messageCount": 5
  }
]
```

### POST `/api/chats`
**مسئولیت:** ایجاد چت جدید
**Middleware:** `requireAuth`

**Request Body:**
```json
{
  "subject": "string (required, max 100 chars)"
}
```

**Success Response (201):**
```json
{
  "id": "new_chat_id",
  "subject": "موضوع چت",
  "createdAt": "2025-08-14T10:30:00.000Z",
  "messages": []
}
```

**Error Responses:**
- `400`: موضوع چت لازم است
- `403`: محدودیت تعداد چت

### GET `/api/chats/:chatId`
**مسئولیت:** دریافت جزئیات یک چت
**Middleware:** `requireAuth`

**Success Response (200):**
```json
{
  "id": "chat_id_123",
  "subject": "موضوع چت",
  "createdAt": "2025-08-14T10:30:00.000Z",
  "messages": [
    {
      "id": "msg_id_1",
      "role": "user",
      "content": "سلام",
      "timestamp": "2025-08-14T10:31:00.000Z"
    },
    {
      "id": "msg_id_2", 
      "role": "assistant",
      "content": "سلام! چطور می‌تونم کمک کنم؟",
      "timestamp": "2025-08-14T10:31:05.000Z"
    }
  ]
}
```

### POST `/api/chats/:chatId/messages`
**مسئولیت:** ارسال پیام جدید
**Middleware:** `requireAuth`

**Request Body:**
```json
{
  "content": "string (required, max 4000 chars)",
  "role": "user"
}
```

**Success Response (200):**
```json
{
  "userMessage": {
    "id": "msg_id_user",
    "role": "user", 
    "content": "سوال کاربر",
    "timestamp": "2025-08-14T10:32:00.000Z"
  },
  "assistantMessage": {
    "id": "msg_id_assistant",
    "role": "assistant",
    "content": "پاسخ هوش مصنوعی",
    "timestamp": "2025-08-14T10:32:03.000Z"
  }
}
```

**Error Responses:**
- `400`: محتوای پیام لازم است
- `403`: محدودیت تعداد پیام
- `404`: چت یافت نشد
- `500`: خطا در ارتباط با OpenAI

### DELETE `/api/chats/:chatId`
**مسئولیت:** حذف چت
**Middleware:** `requireAuth`

**Success Response (200):**
```json
{
  "success": true
}
```

---

## Admin Management

### GET `/api/admin/users`
**مسئولیت:** دریافت لیست تمام کاربران
**Middleware:** `requireAdmin`

**Success Response (200):**
```json
[
  {
    "username": "user123",
    "firstName": "نام",
    "lastName": "نام خانوادگی",
    "mobile": "09123456789",
    "email": "user@example.com",
    "role": "user",
    "isActive": true,
    "maxChats": 10,
    "maxMessagesPerChat": 20,
    "expiryDate": "2025-12-31",
    "stats": {
      "totalChats": 5,
      "totalMessages": 25,
      "lastLoginAt": "2025-08-14T10:30:00.000Z"
    }
  }
]
```

### POST `/api/admin/users`
**مسئولیت:** ایجاد کاربر جدید
**Middleware:** `requireAdmin`

**Request Body:**
```json
{
  "username": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "mobile": "string (optional)",
  "email": "string (optional)",
  "role": "user|admin (default: user)",
  "isActive": "boolean (default: true)",
  "maxChats": "number|null (default: null)",
  "maxMessagesPerChat": "number|null (default: null)",
  "expiryDate": "string|null (YYYY-MM-DD format)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "username": "newuser"
}
```

**Error Responses:**
- `400`: فیلدهای اجباری یا نام کاربری تکراری
- `500`: خطا در ایجاد کاربر

### PUT `/api/admin/users/:username`
**مسئولیت:** ویرایش کاربر
**Middleware:** `requireAdmin`

**Request Body:** همان فیلدهای POST با اختیاری بودن همه فیلدها

**Success Response (200):**
```json
{
  "success": true
}
```

### DELETE `/api/admin/users/:username`
**مسئولیت:** حذف کاربر
**Middleware:** `requireAdmin`

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400`: نمی‌توان ادمین خود را حذف کرد
- `404`: کاربر یافت نشد

---

## User Limits System

### محدودیت‌های پشتیبانی شده:

1. **maxChats:** حداکثر تعداد چت
2. **maxMessagesPerChat:** حداکثر پیام در هر چت  
3. **expiryDate:** تاریخ انقضای حساب کاربری
4. **isActive:** وضعیت فعال/غیرفعال کاربر

### بررسی محدودیت‌ها:
```javascript
const limitCheck = await checkUserLimits(username);
if (!limitCheck.allowed) {
  return res.status(403).json({ error: limitCheck.reason });
}
```

**نتایج ممکن:**
- حساب کاربری غیرفعال است
- حساب کاربری منقضی شده است  
- تعداد چت‌ها به حد مجاز رسیده
- تعداد پیام‌ها در این چت به حد مجاز رسیده

---

## Statistics System

### آمارهای کاربر:
```json
{
  "stats": {
    "totalChats": "تعداد کل چت‌ها",
    "totalMessages": "تعداد کل پیام‌ها", 
    "lastLoginAt": "آخرین زمان ورود"
  }
}
```

### به‌روزرسانی آمار:
- هنگام ورود: `updateUserStats(username, 'login')`
- هنگام ایجاد چت: خودکار
- هنگام ارسال پیام: خودکار

---

## Error Handling

### کدهای خطای استاندارد:
- `400`: Bad Request - داده‌های نامعتبر
- `401`: Unauthorized - عدم احراز هویت
- `403`: Forbidden - عدم دسترسی
- `404`: Not Found - منبع یافت نشد
- `500`: Internal Server Error - خطای سرور

### فرمت پاسخ خطا:
```json
{
  "error": "پیام خطا به فارسی"
}
```

---

## Request/Response Examples

### مثال کامل ایجاد چت و ارسال پیام:

```javascript
// 1. ورود
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user123',
    password: 'password123'
  })
});

// 2. ایجاد چت
const chatResponse = await fetch('/api/chats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'سوال در مورد برنامه‌نویسی'
  })
});
const { id: chatId } = await chatResponse.json();

// 3. ارسال پیام
const messageResponse = await fetch(`/api/chats/${chatId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'چطور می‌تونم یک API ایجاد کنم؟',
    role: 'user'
  })
});
```

---

## Security Considerations

### Authentication:
- Scrypt hashing برای رمزهای عبور
- Session-based authentication
- Secure session secrets در production

### Authorization:
- Role-based access control
- Admin-only endpoints protection
- User isolation برای چت‌ها

### Data Validation:
- Input sanitization
- Length limits
- Type checking

### Rate Limiting:
- محدودیت تعداد چت و پیام
- User-specific limits
- Time-based restrictions
