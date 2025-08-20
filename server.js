/* File: server.js */
/*
  این سرور وظیفه مدیریت تاریخچه چت‌ها و ارتباط با A}

// Health Check Endpoints
app.get('/health', async (req, res) => {
  try {
    const healthData = await performHealthCheck();
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthData);
  } catch (error) {
    logError(error, req);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/simple', (req, res) => {
  res.json(getSimpleHealth());
});

app.get('/health/ready', (req, res) => {
  // بررسی آماده بودن سرور برای دریافت ترافیک
  const isReady = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY.startsWith('sk-');
  
  if (isReady) {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ 
      status: 'not_ready', 
      reason: 'OpenAI API key not configured',
      timestamp: new Date().toISOString() 
    });
  }
});

function requireAuth(req, res, next) {اپن‌اِی‌آی را بر عهده دارد.
  - برای هر چت یک فایل JSON در پوشه chats ایجاد می‌شود و شامل subject، messages، timestamps است.
  - کلید API از فایل .env خوانده می‌شود و نباید در کلاینت افشا شود.
  - از nanoid برای تولید شناسه‌های یکتا استفاده می‌کنیم.
  - بهبودهای امنیتی: Rate limiting، Proper logging، Health check، HTTPS
*/

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { nanoid } = require('nanoid');

// Helpers
const { ensureChatDir, readChatFile, writeChatFile, listChats, BASE_CHAT_DIR } = require('./helpers/fs');
const { findUser, createUser, updateUser, getAllUsers, deleteUser, updatePassword, verifyPassword, checkUserLimits, updateUserStats, setSessionCookie, clearSessionCookie, verifySession, ensureUsersFile } = require('./helpers/auth');
const { logger, logUserActivity, logAdminAction, logSecurityEvent, logError } = require('./helpers/logger');
const { rateLimiters, requestLogger, securityHeaders, errorHandler, notFoundHandler, compressionMiddleware } = require('./helpers/middleware');
const { performHealthCheck, getSimpleHealth } = require('./helpers/health');
const { configureHTTPS } = require('./helpers/https');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ORIGIN = process.env.CORS_ORIGIN || '*';

// Security و Performance Middlewares
app.use(compressionMiddleware);
app.use(securityHeaders);
app.use(requestLogger);

// Rate limiting
app.use('/api/auth/login', rateLimiters.auth);
app.use('/api/chats/:chatId/messages', rateLimiters.chat);
app.use('/api/admin', rateLimiters.admin);
app.use(rateLimiters.general);

app.use(express.json({ limit: '200kb' }));
logger.info('سرور: دریافت و پردازش JSON فعال شد');

app.use((req, res, next) => {
  logger.debug(`درخواست دریافت شد: ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user?.username
  });
  
  res.header('Access-Control-Allow-Origin', ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // اضافه کردن CSP برای اجازه blob URLs برای audio
  res.header('Content-Security-Policy', "default-src 'self'; media-src 'self' blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;");
  
  next();
});

// ساده‌ترین پارس کوکی - باید پیش از روت‌های محافظت‌شده قرار گیرد
app.use((req, _res, next) => {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach(v => {
    const [k, ...rest] = v.trim().split('=');
    if (!k) return;
    cookies[k] = decodeURIComponent(rest.join('='));
  });
  req.cookies = cookies;
  const session = cookies.session;
  const payload = verifySession(session);
  if (payload && payload.username) req.user = { username: payload.username };
  next();
});

// API برای خواندن تنظیمات TTS کاربر
app.get('/api/users/:username/tts', requireAuth, async (req, res) => {
  const { username } = req.params;
  try {
    const usersFile = path.join(__dirname, 'users', 'users.json');
    const raw = await fs.promises.readFile(usersFile, 'utf8');
    const data = JSON.parse(raw);
    const user = (data.users || []).find(u => u.username === username);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    // اگر تنظیمات وجود ندارد، مقدار پیش‌فرض را برگردان
    const ttsSettings = user.ttsSettings || {
      voice: 'alloy',
      gender: 'neutral',
      rate: 1.0,
      quality: 'standard',
      costTier: 'medium'
    };

    res.json({ ttsSettings });
  } catch (err) {
    logger.error('خطا در خواندن تنظیمات TTS:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// API برای بروزرسانی تنظیمات TTS کاربر
app.put('/api/users/:username/tts', requireAuth, async (req, res) => {
  const { username } = req.params;
  const newSettings = req.body.ttsSettings;
  try {
    const usersFile = path.join(__dirname, 'users', 'users.json');
    const raw = await fs.promises.readFile(usersFile, 'utf8');
    const data = JSON.parse(raw);
    const idx = (data.users || []).findIndex(u => u.username === username);
    if (idx === -1) return res.status(404).json({ error: 'user_not_found' });

    // اعتبارسنجی پایه‌ای
    const allowedGenders = ['male', 'female', 'neutral'];
    const allowedQualities = ['standard', 'high'];
    if (newSettings.gender && !allowedGenders.includes(newSettings.gender)) {
      return res.status(400).json({ error: 'invalid_gender' });
    }
    if (newSettings.quality && !allowedQualities.includes(newSettings.quality)) {
      return res.status(400).json({ error: 'invalid_quality' });
    }

    data.users[idx].ttsSettings = Object.assign({}, data.users[idx].ttsSettings || {}, newSettings);
    data.users[idx].updatedAt = new Date().toISOString();

    await fs.promises.writeFile(usersFile, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true, ttsSettings: data.users[idx].ttsSettings });
  } catch (err) {
    logger.error('خطا در بروزرسانی تنظیمات TTS:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

function requireAuth(req, res, next) {
  if (!req.user || !req.user.username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // بررسی نقش ادمین
  findUser(req.user.username).then(user => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'دسترسی ادمین لازم است' });
    }
    next();
  }).catch(() => {
    res.status(500).json({ error: 'خطا در بررسی دسترسی' });
  });
}

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    logSecurityEvent('LOGIN_MISSING_CREDENTIALS', { ip: req.ip });
    return res.status(400).json({ error: 'نام کاربری و گذرواژه لازم است' });
  }
  
  await ensureUsersFile();
  let user = await findUser(username);
  const auto = (process.env.ALLOW_AUTO_REGISTER || 'true') === 'true';
  
  if (!user && auto) {
    await createUser(username, password);
    user = await findUser(username);
    logUserActivity(username, 'USER_AUTO_REGISTERED', { ip: req.ip });
  }
  
  if (!user) {
    logSecurityEvent('LOGIN_USER_NOT_FOUND', { username, ip: req.ip });
    return res.status(401).json({ error: 'کاربر یافت نشد' });
  }
  
  if (!verifyPassword(password, user.passwordHash)) {
    logSecurityEvent('LOGIN_INVALID_PASSWORD', { username, ip: req.ip });
    return res.status(401).json({ error: 'گذرواژه نادرست است' });
  }
  
  // بررسی محدودیت‌های کاربر
  const limitCheck = await checkUserLimits(username);
  if (!limitCheck.allowed) {
    logSecurityEvent('LOGIN_USER_RESTRICTED', { username, reason: limitCheck.reason, ip: req.ip });
    return res.status(403).json({ error: limitCheck.reason });
  }
  
  setSessionCookie(res, username);
  await ensureChatDir(username);
  
  // ثبت آمار ورود
  await updateUserStats(username, 'login');
  logUserActivity(username, 'USER_LOGIN_SUCCESS', { ip: req.ip });
  
  res.json({ success: true, username });
});

app.post('/api/auth/logout', (req, res) => {
  const username = req.user?.username;
  clearSessionCookie(res);
  if (username) {
    logUserActivity(username, 'USER_LOGOUT', { ip: req.ip });
  }
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await findUser(req.user.username);
    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    
    // بازگرداندن اطلاعات کاربر بدون رمز عبور
    const userInfo = {
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      mobile: user.mobile || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      stats: user.stats || { totalChats: 0, totalMessages: 0, lastLoginAt: null }
    };
    
    res.json(userInfo);
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات کاربر' });
  }
});

app.post('/api/auth/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'اطلاعات ناقص است' });
  const user = await findUser(req.user.username);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
  if (!verifyPassword(currentPassword, user.passwordHash)) return res.status(401).json({ error: 'گذرواژه فعلی نادرست است' });
  await updatePassword(req.user.username, newPassword);
  res.json({ success: true });
});

// Health Check Endpoints
app.get('/health', async (req, res) => {
  try {
    const healthData = await performHealthCheck();
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthData);
  } catch (error) {
    logError(error, req);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/simple', (req, res) => {
  res.json(getSimpleHealth());
});

app.get('/health/ready', (req, res) => {
  // بررسی آماده بودن سرور برای دریافت ترافیک
  const isReady = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY.startsWith('sk-');
  
  if (isReady) {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ 
      status: 'not_ready', 
      reason: 'OpenAI API key not configured',
      timestamp: new Date().toISOString() 
    });
  }
});

// Admin API endpoints
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  console.log('درخواست لیست کاربران توسط ادمین');
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('خطا در دریافت لیست کاربران:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کاربران' });
  }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  logAdminAction(req.user.username, 'CREATE_USER_ATTEMPT', 'N/A', { ip: req.ip });
  try {
    const { 
      username, 
      password, 
      firstName, 
      lastName, 
      mobile, 
      email,
      role = 'user',
      isActive = true,
      maxChats,
      maxMessagesPerChat,
      expiryDate
    } = req.body;

    if (!username || !password || !firstName || !lastName || !mobile) {
      return res.status(400).json({ error: 'فیلدهای اجباری کامل نیست' });
    }

    const userDetails = {
      firstName,
      lastName,
      mobile,
      email,
      role,
      isActive,
      maxChats: maxChats || null,
      maxMessagesPerChat: maxMessagesPerChat || null,
      expiryDate: expiryDate || null
    };

    const newUser = await createUser(username, password, userDetails);
    logAdminAction(req.user.username, 'CREATE_USER_SUCCESS', username, userDetails);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    logError(error, req, { action: 'CREATE_USER', target: username });
    if (error.message === 'USERNAME_EXISTS') {
      res.status(409).json({ error: 'نام کاربری قبلاً وجود دارد' });
    } else {
      res.status(500).json({ error: 'خطا در ایجاد کاربر' });
    }
  }
});

app.put('/api/admin/users/:username', requireAdmin, async (req, res) => {
  console.log(`درخواست ویرایش کاربر ${req.params.username} توسط ادمین`);
  try {
    const { username } = req.params;
    const updates = req.body;
    
    // حذف فیلدهایی که نباید ویرایش شوند
    delete updates.username;
    delete updates.passwordHash;
    delete updates.createdAt;
    delete updates.stats;

    const updatedUser = await updateUser(username, updates);
    console.log(`کاربر ${username} ویرایش شد`);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('خطا در ویرایش کاربر:', error);
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'کاربر یافت نشد' });
    } else {
      res.status(500).json({ error: 'خطا در ویرایش کاربر' });
    }
  }
});

app.delete('/api/admin/users/:username', requireAdmin, async (req, res) => {
  console.log(`درخواست حذف کاربر ${req.params.username} توسط ادمین`);
  try {
    const { username } = req.params;
    await deleteUser(username);
    console.log(`کاربر ${username} حذف شد`);
    res.json({ success: true });
  } catch (error) {
    console.error('خطا در حذف کاربر:', error);
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'کاربر یافت نشد' });
    } else {
      res.status(500).json({ error: 'خطا در حذف کاربر' });
    }
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  console.log('درخواست آمار سیستم توسط ادمین');
  try {
    const users = await getAllUsers();
    const activeUsers = users.filter(u => u.isActive).length;
    const totalChats = users.reduce((sum, u) => sum + (u.stats?.totalChats || 0), 0);
    const totalMessages = users.reduce((sum, u) => sum + (u.stats?.totalMessages || 0), 0);
    
    const stats = {
      totalUsers: users.length,
      activeUsers,
      totalChats,
      totalMessages,
      uptime: Math.floor(process.uptime() / 3600), // ساعت
      lastUpdate: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});



/**
 * فراخوانی API اپن‌اِی‌آی برای دریافت پاسخ
 * @param {Array} messages
 */
async function getAssistantReply(messages, { temperature = 0.3, maxTokens = 600, timeoutMs = 30000, retries = 2, model } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing in .env');
  const trimmed = messages.slice(-20);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || MODEL,
          temperature,
          max_tokens: maxTokens,
          messages: trimmed
        }),
        signal: controller.signal
      });
      if (!res.ok) {
        const text = await res.text();
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`OpenAI ${res.status}: ${text}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty completion');
      clearTimeout(t);
      return content;
    } catch (e) {
      lastErr = e.name === 'AbortError' ? new Error('Request timeout') : e;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
        continue;
      }
      clearTimeout(t);
      throw lastErr;
    }
  }
  throw lastErr;
}

// GET /api/chats - لیست چت‌ها
app.get('/api/chats', requireAuth, async (req, res) => {
  console.log('درخواست لیست چت‌ها دریافت شد');
  const chats = await listChats(req.user.username);
  chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(chats);
  console.log('لیست چت‌ها ارسال شد');
});

// POST /api/chats - ایجاد چت جدید
app.post('/api/chats', requireAuth, async (req, res) => {
  console.log('درخواست ایجاد چت جدید دریافت شد');
  
  // بررسی محدودیت تعداد چت
  const limitCheck = await checkUserLimits(req.user.username, 'chat');
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.reason });
  }
  
  const { subject } = req.body;
  const id = nanoid(10);
  const now = new Date().toISOString();
  const chatData = {
    id,
    subject: subject || 'گفتگوی جدید',
    messages: [],
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    isArchived: false
  };
  await writeChatFile(id, chatData, req.user.username);
  
  // ثبت آمار چت جدید
  await updateUserStats(req.user.username, 'newChat');
  
  res.status(201).json({ id, subject: chatData.subject });
  console.log(`چت جدید با شناسه ${id} ایجاد شد`);
});

// GET /api/chats/:id - دریافت یک چت
app.get('/api/chats/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`درخواست دریافت چت با شناسه ${id}`);
  const chat = await readChatFile(id, req.user.username);
  if (!chat) {
    console.log(`چت با شناسه ${id} یافت نشد`);
    return res.status(404).json({ error: 'چت یافت نشد' });
  }
  res.json(chat);
  console.log(`چت با شناسه ${id} ارسال شد`);
});

// PUT /api/chats/:id - ویرایش موضوع یا پیام‌ها
app.put('/api/chats/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`درخواست ویرایش چت با شناسه ${id}`);
  const chat = await readChatFile(id, req.user.username);
  if (!chat) {
    console.log(`چت با شناسه ${id} برای ویرایش یافت نشد`);
    return res.status(404).json({ error: 'چت یافت نشد' });
  }
  const { subject, messages, isPinned, isArchived } = req.body;
  console.log(`داده‌های دریافتی: subject=${subject}, messages=${messages ? messages.length : 'undefined'}, isPinned=${isPinned}, isArchived=${isArchived}`);
  if (subject !== undefined) chat.subject = subject;
  // فقط اگر messages واقعاً آرایه‌ای با محتوا باشد
  if (messages !== undefined && Array.isArray(messages)) {
    console.log(`بروزرسانی پیام‌ها: ${messages.length} پیام`);
    chat.messages = messages;
  }
  if (isPinned !== undefined) chat.isPinned = isPinned;
  if (isArchived !== undefined) chat.isArchived = isArchived;
  chat.updatedAt = new Date().toISOString();
  await writeChatFile(id, chat, req.user.username);
  res.json({ success: true });
  console.log(`چت با شناسه ${id} ویرایش شد - ویژه: ${chat.isPinned}, آرشیو: ${chat.isArchived}`);
});

// DELETE /api/chats/:id - حذف یک چت
const fsNative = require('fs').promises;
const path = require('path');
app.delete('/api/chats/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`درخواست حذف چت با شناسه ${id}`);
  const filePath = require('path').join(BASE_CHAT_DIR, req.user.username, `${id}.json`);
  try {
    await fsNative.unlink(filePath);
    res.json({ success: true });
    console.log(`چت با شناسه ${id} حذف شد`);
  } catch (e) {
    console.log(`چت با شناسه ${id} برای حذف یافت نشد`);
    return res.status(404).json({ error: 'چت یافت نشد' });
  }
});

// POST /api/chats/:id/message - افزودن پیام کاربر و دریافت پاسخ از مدل
app.post('/api/chats/:id/message', requireAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`درخواست ارسال پیام جدید به چت ${id}`);
  
  // بررسی محدودیت‌های کاربر
  const limitCheck = await checkUserLimits(req.user.username, 'message');
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.reason });
  }
  
  const { content, model } = req.body;
  if (!content || !content.trim()) {
    console.log('ارسال پیام: محتوای پیام معتبر نیست');
    return res.status(400).json({ error: 'محتوای پیام معتبر نیست' });
  }
  const chat = await readChatFile(id, req.user.username);
  if (!chat) {
    console.log(`ارسال پیام: چت با شناسه ${id} یافت نشد`);
    return res.status(404).json({ error: 'چت یافت نشد' });
  }
  
  // بررسی محدودیت تعداد پیام در چت
  const user = await findUser(req.user.username);
  if (user.maxMessagesPerChat && chat.messages.length >= user.maxMessagesPerChat * 2) {
    // ضرب در 2 چون هر سوال دو پیام دارد (کاربر + دستیار)
    return res.status(403).json({ 
      error: `حداکثر تعداد پیام در این چت (${user.maxMessagesPerChat} سوال) به پایان رسیده` 
    });
  }
  
  // اعتبارسنجی مدل انتخابی کاربر (در صورت ارسال)
  const allowedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
  const chosenModel = allowedModels.includes(model) ? model : undefined;
  if (chosenModel) {
    console.log(`مدل انتخابی کاربر برای این درخواست: ${chosenModel}`);
  } else {
    console.log(`مدل پیش‌فرض سرور استفاده می‌شود: ${MODEL}`);
  }
  // اضافه کردن پیام کاربر
  const userMessage = {
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString()
  };
  chat.messages.push(userMessage);
  try {
    const assistantContent = await getAssistantReply(
      chat.messages.map(({ role, content }) => ({ role, content })),
      { model: chosenModel }
    );
    const assistantMessage = {
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date().toISOString()
    };
    chat.messages.push(assistantMessage);
    chat.updatedAt = new Date().toISOString();
    console.log(`در حال ذخیره چت ${id} با ${chat.messages.length} پیام`);
    await writeChatFile(id, chat, req.user.username);
    console.log(`چت ${id} با موفقیت ذخیره شد`);
    
    // ثبت آمار پیام جدید
    await updateUserStats(req.user.username, 'newMessage');
    
    res.json({ assistantMessage });
    console.log(`پاسخ دستیار به چت ${id} ارسال شد`);
  } catch (err) {
    console.error('OpenAI error:', err);
    // در صورت خطا، همچنان پیام کاربر را ذخیره کن
    try {
      console.log(`در حال ذخیره چت ${id} با ${chat.messages.length} پیام (فقط پیام کاربر)`);
      await writeChatFile(id, chat, req.user.username);
      console.log(`چت ${id} با موفقیت ذخیره شد (فقط پیام کاربر)`);
    } catch (writeErr) {
      console.error('خطا در ذخیره‌سازی چت:', writeErr);
    }
    res.status(500).json({ error: 'خطا در ارتباط با مدل', details: err.message || err.toString() });
    console.log('ارسال پیام: خطا در ارتباط با مدل', err.message || err.toString());
  }
});

// POST /api/tts - تبدیل متن به گفتار با OpenAI TTS
app.post('/api/tts', requireAuth, async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'متن برای تبدیل به گفتار مورد نیاز است' });
    }

    // بررسی محدودیت طول متن (OpenAI حداکثر 4096 کاراکتر)
    if (text.length > 4096) {
      return res.status(400).json({ error: 'متن نباید بیش از 4096 کاراکتر باشد' });
    }

    console.log('درخواست TTS دریافت شد:', { textLength: text.length, voice, speed });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: speed,
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('خطا در OpenAI TTS:', errorData);
      return res.status(500).json({ error: 'خطا در تولید صدا' });
    }

    // ارسال فایل صوتی به کلاینت
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    
    // دریافت آرایه‌بایت و ارسال به کلاینت
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);
    
    res.send(audioData);
    
    console.log('فایل صوتی با موفقیت ارسال شد');

  } catch (error) {
    console.error('خطا در endpoint TTS:', error);
    res.status(500).json({ error: 'خطا داخلی سرور' });
  }
});

// Static files: serve client app
app.use(express.static(__dirname, { 
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true
}));
logger.info('سرو فایل‌های استاتیک فعال شد');

app.listen(PORT, async () => {
  await ensureChatDir();
  await ensureUsersFile();
  
  // ایجاد ادمین اولیه
  await createInitialAdmin();
  
  console.log(`سرور با موفقیت روی پورت ${PORT} اجرا شد`);
});

// ایجاد ادمین اولیه
async function createInitialAdmin() {
  try {
    const adminUser = await findUser('admin');
    if (!adminUser) {
      const adminDetails = {
        firstName: 'مدیر',
        lastName: 'سیستم',
        mobile: '09123456789',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        maxChats: null,
        maxMessagesPerChat: null,
        expiryDate: null
      };
      
      await createUser('admin', 'admin123', adminDetails);
      logger.info('ادمین اولیه ایجاد شد:');
      logger.info('نام کاربری: admin');
      logger.info('گذرواژه: admin123');
      logger.info('لینک ادمین: http://localhost:' + PORT + '/admin/dashboard.html');
    }
  } catch (error) {
    logger.error('خطا در ایجاد ادمین اولیه:', error);
  }
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    await ensureChatDir();
    await ensureUsersFile();
    
    // ایجاد ادمین اولیه
    await createInitialAdmin();
    
    logger.info(`سرور در حال راه‌اندازی روی پورت ${PORT}...`);
    
    // تنظیم HTTPS اگر فعال باشد
    const { httpsServer, httpServer } = configureHTTPS(app, {
      httpPort: 80,
      httpsPort: 443,
      enableRedirect: process.env.NODE_ENV === 'production'
    });
    
    // راه‌اندازی HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`✅ HTTP Server با موفقیت روی پورت ${PORT} اجرا شد`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`📊 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV === 'production') {
        logger.info('🔒 Production mode - تمام امکانات امنیتی فعال');
      }
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`🛑 دریافت سیگنال ${signal} - شروع Graceful Shutdown...`);
      
      // تنظیم timeout برای shutdown
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful Shutdown Timeout - اجبار خروج');
        process.exit(1);
      }, 30000); // 30 ثانیه timeout
      
      server.close((err) => {
        clearTimeout(shutdownTimeout);
        if (err) {
          logger.error('خطا در بستن HTTP Server:', err);
        } else {
          logger.info('HTTP Server بسته شد');
        }
        
        if (httpsServer) {
          httpsServer.close((err) => {
            if (err) {
              logger.error('خطا در بستن HTTPS Server:', err);
            } else {
              logger.info('HTTPS Server بسته شد');
            }
            process.exit(err ? 1 : 0);
          });
        } else {
          process.exit(err ? 1 : 0);
        }
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Error handling
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('خطا در راه‌اندازی سرور:', error);
    process.exit(1);
  }
}

startServer();