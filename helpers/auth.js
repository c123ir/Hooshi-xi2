const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const USERS_DIR = path.join(process.cwd(), 'users');
const USERS_FILE = path.join(USERS_DIR, 'users.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

async function ensureUsersFile() {
  await fs.mkdir(USERS_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
    // فایل وجود دارد، بررسی migration
    await migrateUsersStructure();
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8');
  }
}

// Migration برای به‌روزرسانی ساختار کاربران قدیمی
async function migrateUsersStructure() {
  try {
    // خواندن مستقیم فایل بدون صدا کردن ensureUsersFile برای جلوگیری از infinite recursion
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const users = data.users || [];
    let needsUpdate = false;
    
    users.forEach(user => {
      // اضافه کردن فیلدهای جدید به کاربران قدیمی
      if (user.firstName === undefined) {
        user.firstName = '';
        user.lastName = '';
        user.mobile = '';
        user.email = '';
        needsUpdate = true;
      }
      
      if (user.role === undefined) {
        user.role = 'user';
        needsUpdate = true;
      }
      
      if (user.isActive === undefined) {
        user.isActive = true;
        needsUpdate = true;
      }
      
      if (user.maxChats === undefined) {
        user.maxChats = null;
        user.maxMessagesPerChat = null;
        user.expiryDate = null;
        needsUpdate = true;
      }
      
      if (!user.stats) {
        user.stats = {
          totalChats: 0,
          totalMessages: 0,
          lastLoginAt: null
        };
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      // نوشتن مستقیم فایل بدون صدا کردن writeUsers
      await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8');
      console.log('ساختار کاربران به‌روزرسانی شد');
    }
  } catch (error) {
    console.error('خطا در migration کاربران:', error);
  }
}

async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, 'utf-8');
  return JSON.parse(raw).users || [];
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [alg, salt, hash] = stored.split(':');
    if (alg !== 'scrypt' || !salt || !hash) return false;
    const calc = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

async function findUser(username) {
  const users = await readUsers();
  return users.find(u => u.username === username) || null;
}

async function createUser(username, password, userDetails = {}) {
  const users = await readUsers();
  if (users.some(u => u.username === username)) throw new Error('USERNAME_EXISTS');
  
  const now = new Date().toISOString();
  const newUser = {
    username,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
    
    // اطلاعات شخصی
    firstName: userDetails.firstName || '',
    lastName: userDetails.lastName || '',
    mobile: userDetails.mobile || '',
    email: userDetails.email || '',
    
    // مدیریت دسترسی
    role: userDetails.role || 'user', // 'user' یا 'admin'
    isActive: userDetails.isActive !== undefined ? userDetails.isActive : true,
    
    // محدودیت‌های استفاده
    maxChats: userDetails.maxChats || null, // null = نامحدود
    maxMessagesPerChat: userDetails.maxMessagesPerChat || null, // null = نامحدود
    expiryDate: userDetails.expiryDate || null, // null = نامحدود
    
    // آمار استفاده
    stats: {
      totalChats: 0,
      totalMessages: 0,
      lastLoginAt: null
    }
  };
  
  users.push(newUser);
  await writeUsers(users);
  return { username, ...newUser };
}

async function updatePassword(username, newPassword) {
  const users = await readUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) throw new Error('USER_NOT_FOUND');
  users[idx].passwordHash = hashPassword(newPassword);
  users[idx].updatedAt = new Date().toISOString();
  await writeUsers(users);
}

// توابع جدید مدیریت کاربر
async function updateUser(username, updates) {
  const users = await readUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) throw new Error('USER_NOT_FOUND');
  
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeUsers(users);
  return users[idx];
}

async function getAllUsers() {
  const users = await readUsers();
  return users.map(user => {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

async function deleteUser(username) {
  const users = await readUsers();
  const filteredUsers = users.filter(u => u.username !== username);
  if (filteredUsers.length === users.length) throw new Error('USER_NOT_FOUND');
  await writeUsers(filteredUsers);
}

// بررسی محدودیت‌ها
async function checkUserLimits(username, action = 'message') {
  const user = await findUser(username);
  if (!user) throw new Error('USER_NOT_FOUND');
  
  // بررسی فعال بودن - برای کاربران قدیمی که isActive ندارند، پیش‌فرض true
  const isActive = user.isActive !== undefined ? user.isActive : true;
  if (!isActive) return { allowed: false, reason: 'کاربر غیرفعال است' };
  
  // بررسی تاریخ انقضا
  if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
    return { allowed: false, reason: 'اعتبار کاربر منقضی شده' };
  }
  
  // بررسی محدودیت چت‌ها - برای کاربران قدیمی که stats ندارند
  const userStats = user.stats || { totalChats: 0, totalMessages: 0 };
  if (action === 'chat' && user.maxChats && userStats.totalChats >= user.maxChats) {
    return { allowed: false, reason: `حداکثر تعداد چت (${user.maxChats}) به پایان رسیده` };
  }
  
  return { allowed: true };
}

async function updateUserStats(username, action, data = {}) {
  const users = await readUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return;
  
  // اطمینان از وجود ساختار stats برای کاربران قدیمی
  if (!users[idx].stats) {
    users[idx].stats = {
      totalChats: 0,
      totalMessages: 0,
      lastLoginAt: null
    };
  }
  
  if (action === 'login') {
    users[idx].stats.lastLoginAt = new Date().toISOString();
  } else if (action === 'newChat') {
    users[idx].stats.totalChats += 1;
  } else if (action === 'newMessage') {
    users[idx].stats.totalMessages += 1;
  }
  
  users[idx].updatedAt = new Date().toISOString();
  await writeUsers(users);
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

function setSessionCookie(res, username) {
  const token = signSession({ username, iat: Date.now() });
  const parts = [
    `session=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=2592000'
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}

module.exports = {
  readUsers,
  writeUsers,
  findUser,
  createUser,
  updateUser,
  getAllUsers,
  deleteUser,
  updatePassword,
  verifyPassword,
  checkUserLimits,
  updateUserStats,
  setSessionCookie,
  clearSessionCookie,
  verifySession,
  ensureUsersFile
};
