const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const { logger } = require('./logger');

const BASE_CHAT_DIR = path.join(process.cwd(), 'chats');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// سیستم کش حافظه با TTL
class MemoryCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 دقیقه
    this.cache = new Map();
    this.ttl = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  set(key, data) {
    const entry = {
      data,
      expiry: Date.now() + this.ttl,
      size: JSON.stringify(data).length
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;
    
    // پاکسازی خودکار موارد منقضی شده
    this.cleanup();
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.size = 0;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.stats.deletes += cleaned;
      this.stats.size = this.cache.size;
      logger.debug(`کش پاکسازی شد: ${cleaned} مورد حذف شد`);
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 ? 
      (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryUsage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }
}

// نمونه کش سراسری
const chatCache = new MemoryCache();

async function ensureChatDir(username) {
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

async function readChatFile(id, username) {
  const startTime = Date.now();
  const cacheKey = `${username || 'global'}:${id}`;
  
  // بررسی کش
  const cachedData = chatCache.get(cacheKey);
  if (cachedData) {
    logger.debug(`چت از کش خوانده شد: ${cacheKey} در ${Date.now() - startTime}ms`);
    return cachedData;
  }

  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  const filePath = path.join(dir, `${id}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const chatData = JSON.parse(data);
    
    // ذخیره در کش
    chatCache.set(cacheKey, chatData);
    
    const duration = Date.now() - startTime;
    logger.debug(`چت خوانده شد: ${id} در ${duration}ms`);
    return chatData;
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    logger.error(`خطا در خواندن چت ${id}:`, e);
    throw e;
  }
}

async function writeChatFile(id, chatData, username) {
  const startTime = Date.now();
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  await ensureChatDir(username);
  
  const filePath = path.join(dir, `${id}.json`);
  const tempPath = path.join(dir, `${id}.tmp`);
  const cacheKey = `${username || 'global'}:${id}`;
  
  try {
    // نوشتن اتمی با فایل موقت
    const jsonData = JSON.stringify(chatData, null, 2);
    await fs.writeFile(tempPath, jsonData, 'utf-8');
    
    // جابجایی اتمی
    await fs.rename(tempPath, filePath);
    
    // بروزرسانی کش
    chatCache.set(cacheKey, chatData);
    
    const duration = Date.now() - startTime;
    logger.debug(`چت نوشته شد: ${id} در ${duration}ms (${jsonData.length} بایت)`);
    
  } catch (error) {
    // پاکسازی فایل موقت در صورت خطا
    try {
      await fs.unlink(tempPath);
    } catch {}
    
    // حذف از کش در صورت خطا
    chatCache.delete(cacheKey);
    
    logger.error(`خطا در نوشتن چت ${id}:`, error);
    throw error;
  }
}

async function listChats(username, options = {}) {
  const startTime = Date.now();
  const { page = 1, limit = null, sortBy = 'updatedAt', order = 'desc' } = options;
  
  await ensureChatDir(username);
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json') && !f.includes('.backup.') && !f.includes('.tmp'));
  const items = [];
  
  for (const file of files) {
    const id = path.basename(file, '.json');
    const chat = await readChatFile(id, username);
    if (chat) {
      // Migration: اطمینان از وجود فیلدهای isPinned و isArchived
      let needsUpdate = false;
      if (chat.isPinned === undefined) {
        chat.isPinned = false;
        needsUpdate = true;
      }
      if (chat.isArchived === undefined) {
        chat.isArchived = false;
        needsUpdate = true;
      }
      
      // اگر فیلدهای جدید اضافه شدند، فایل را بروزرسانی کن
      if (needsUpdate) {
        await writeChatFile(id, chat, username);
      }
      
      // محاسبه سایز فایل برای مرتب‌سازی
      const filePath = path.join(dir, file);
      const fileStats = await fs.stat(filePath);
      
      items.push({ 
        id, 
        subject: chat.subject || 'بدون عنوان', 
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        isPinned: chat.isPinned,
        isArchived: chat.isArchived,
        messageCount: chat.messages ? chat.messages.length : 0,
        size: fileStats.size
      });
    }
  }
  
  // مرتب‌سازی
  items.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === 'desc' ? -comparison : comparison;
  });
  
  // صفحه‌بندی
  let result = items;
  if (limit && limit > 0) {
    const startIndex = (page - 1) * limit;
    result = items.slice(startIndex, startIndex + limit);
  }
  
  const duration = Date.now() - startTime;
  logger.debug(`فهرست چت‌ها: ${result.length}/${items.length} در ${duration}ms`);
  
  // سازگاری با نسخه قبلی - اگر options خالی است، فقط آرایه برگردان
  if (Object.keys(options).length === 0) {
    return result;
  }
  
  return {
    chats: result,
    pagination: limit ? {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    } : null
  };
}

async function deleteChatFile(id, username) {
  const startTime = Date.now();
  const cacheKey = `${username || 'global'}:${id}`;
  
  try {
    const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
    const filePath = path.join(dir, `${id}.json`);
    
    // بررسی وجود فایل قبل از حذف
    try {
      await fs.access(filePath);
    } catch (error) {
      logger.warn(`فایل چت برای حذف پیدا نشد: ${filePath}`);
      return false;
    }
    
    await fs.unlink(filePath);
    
    // حذف از کش
    chatCache.delete(cacheKey);
    
    const duration = Date.now() - startTime;
    logger.info(`فایل چت حذف شد: ${filePath} در ${duration}ms`);
    return true;
  } catch (error) {
    logger.error(`خطا در حذف فایل چت ${id}:`, error);
    return false;
  }
}

/**
 * ایجاد نسخه پشتیبان فشرده از فایل چت
 * @param {string} id - شناسه چت
 * @param {string} username - نام کاربری
 * @returns {Promise<string|null>} - مسیر فایل پشتیبان یا null در صورت خطا
 */
async function backupChatFile(id, username) {
  const startTime = Date.now();
  
  try {
    const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
    const originalPath = path.join(dir, `${id}.json`);
    const backupPath = path.join(dir, `${id}.backup.json.gz`);
    
    // بررسی وجود فایل اصلی
    try {
      await fs.access(originalPath);
    } catch (error) {
      logger.warn(`فایل اصلی برای پشتیبان‌گیری پیدا نشد: ${originalPath}`);
      return null;
    }
    
    // خواندن و فشردن فایل
    const originalData = await fs.readFile(originalPath, 'utf-8');
    const compressedData = await gzip(originalData);
    
    // نوشتن فایل فشرده
    await fs.writeFile(backupPath, compressedData);
    
    const originalSize = Buffer.byteLength(originalData, 'utf-8');
    const compressedSize = compressedData.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    const duration = Date.now() - startTime;
    
    logger.info(`پشتیبان فشرده ایجاد شد: ${backupPath} در ${duration}ms (فشردگی: ${compressionRatio}%)`);
    return backupPath;
  } catch (error) {
    logger.error(`خطا در ایجاد پشتیبان چت ${id}:`, error);
    return null;
  }
}

/**
 * بررسی صحت ساختار JSON چت
 * @param {Object} chatData - داده‌های چت
 * @returns {Object} - نتیجه بررسی اعتبار
 */
function validateChatStructure(chatData) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // بررسی فیلدهای اجباری
    const requiredFields = ['id', 'subject', 'messages', 'createdAt'];
    
    for (const field of requiredFields) {
      if (chatData[field] === undefined || chatData[field] === null) {
        result.isValid = false;
        result.errors.push(`فیلد اجباری ${field} موجود نیست`);
      }
    }
    
    // بررسی نوع داده‌ها
    if (chatData.id && typeof chatData.id !== 'string') {
      result.isValid = false;
      result.errors.push('فیلد id باید از نوع string باشد');
    }
    
    if (chatData.subject && typeof chatData.subject !== 'string') {
      result.isValid = false;
      result.errors.push('فیلد subject باید از نوع string باشد');
    }
    
    if (chatData.messages && !Array.isArray(chatData.messages)) {
      result.isValid = false;
      result.errors.push('فیلد messages باید آرایه باشد');
    }
    
    if (chatData.createdAt && !Date.parse(chatData.createdAt)) {
      result.isValid = false;
      result.errors.push('فیلد createdAt باید تاریخ معتبر باشد');
    }
    
    // بررسی فیلدهای اختیاری
    if (chatData.updatedAt && !Date.parse(chatData.updatedAt)) {
      result.warnings.push('فیلد updatedAt معتبر نیست');
    }
    
    if (chatData.isPinned !== undefined && typeof chatData.isPinned !== 'boolean') {
      result.warnings.push('فیلد isPinned باید از نوع boolean باشد');
    }
    
    if (chatData.isArchived !== undefined && typeof chatData.isArchived !== 'boolean') {
      result.warnings.push('فیلد isArchived باید از نوع boolean باشد');
    }
    
    // بررسی ساختار پیام‌ها
    if (chatData.messages && Array.isArray(chatData.messages)) {
      chatData.messages.forEach((message, index) => {
        if (!message.role || !message.content) {
          result.warnings.push(`پیام ${index + 1} فاقد role یا content است`);
        }
        if (message.role && !['user', 'assistant', 'system'].includes(message.role)) {
          result.warnings.push(`پیام ${index + 1} دارای role نامعتبر است`);
        }
      });
    }
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`خطا در بررسی ساختار: ${error.message}`);
    logger.error('خطا در اعتبارسنجی ساختار چت:', error);
  }
  
  return result;
}

/**
 * محاسبه آمار کل چت‌های کاربر
 * @param {string} username - نام کاربری
 * @returns {Promise<Object>} - آمار چت‌های کاربر
 */
async function calculateChatStats(username) {
  const stats = {
    totalChats: 0,
    totalMessages: 0,
    totalSize: 0,
    pinnedChats: 0,
    archivedChats: 0,
    avgMessagesPerChat: 0,
    oldestChat: null,
    newestChat: null,
    totalSizeFormatted: '0 B'
  };

  try {
    await ensureChatDir(username);
    const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json') && !f.includes('.backup.'));
    
    stats.totalChats = files.length;
    
    if (files.length === 0) {
      return stats;
    }
    
    for (const file of files) {
      try {
        const filePath = path.join(dir, file);
        const fileStats = await fs.stat(filePath);
        stats.totalSize += fileStats.size;
        
        const chatData = await fs.readFile(filePath, 'utf-8');
        const chat = JSON.parse(chatData);
        
        if (chat.messages && Array.isArray(chat.messages)) {
          stats.totalMessages += chat.messages.length;
        }
        
        if (chat.isPinned) {
          stats.pinnedChats++;
        }
        
        if (chat.isArchived) {
          stats.archivedChats++;
        }
        
        // پیدا کردن قدیمی‌ترین و جدیدترین چت
        const createdAt = new Date(chat.createdAt);
        if (!stats.oldestChat || createdAt < new Date(stats.oldestChat)) {
          stats.oldestChat = chat.createdAt;
        }
        if (!stats.newestChat || createdAt > new Date(stats.newestChat)) {
          stats.newestChat = chat.createdAt;
        }
        
      } catch (error) {
        logger.warn(`خطا در خواندن فایل چت ${file}:`, error);
      }
    }
    
    // محاسبه میانگین پیام‌ها
    stats.avgMessagesPerChat = stats.totalChats > 0 ? 
      Math.round(stats.totalMessages / stats.totalChats * 100) / 100 : 0;
    
    // فرمت کردن سایز فایل‌ها به شکل قابل خواندن
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let sizeIndex = 0;
    let size = stats.totalSize;
    while (size >= 1024 && sizeIndex < sizes.length - 1) {
      size /= 1024;
      sizeIndex++;
    }
    stats.totalSizeFormatted = `${Math.round(size * 100) / 100} ${sizes[sizeIndex]}`;
    
    logger.info(`آمار چت‌های کاربر ${username} محاسبه شد: ${stats.totalChats} چت، ${stats.totalMessages} پیام، ${stats.totalSizeFormatted}`);
    
  } catch (error) {
    logger.error(`خطا در محاسبه آمار چت‌های کاربر ${username}:`, error);
  }
  
  return stats;
}

/**
 * حذف دسته‌ای چندین چت
 * @param {string[]} ids - آرایه شناسه‌های چت
 * @param {string} username - نام کاربری
 * @returns {Promise<Object>} - نتیجه عملیات دسته‌ای
 */
async function batchDeleteChats(ids, username) {
  const startTime = Date.now();
  const results = { success: [], failed: [], totalProcessed: 0 };
  
  logger.info(`شروع حذف دسته‌ای ${ids.length} چت برای کاربر ${username}`);
  
  for (const id of ids) {
    try {
      const success = await deleteChatFile(id, username);
      if (success) {
        results.success.push(id);
      } else {
        results.failed.push({ id, error: 'فایل پیدا نشد' });
      }
    } catch (error) {
      results.failed.push({ id, error: error.message });
    }
    results.totalProcessed++;
  }
  
  const duration = Date.now() - startTime;
  logger.info(`حذف دسته‌ای تمام شد: ${results.success.length} موفق، ${results.failed.length} ناموفق در ${duration}ms`);
  
  return results;
}

/**
 * پشتیبان‌گیری دسته‌ای چندین چت
 * @param {string[]} ids - آرایه شناسه‌های چت
 * @param {string} username - نام کاربری
 * @returns {Promise<Object>} - نتیجه عملیات دسته‌ای
 */
async function batchBackupChats(ids, username) {
  const startTime = Date.now();
  const results = { success: [], failed: [], totalProcessed: 0, totalSaved: 0 };
  
  logger.info(`شروع پشتیبان‌گیری دسته‌ای ${ids.length} چت برای کاربر ${username}`);
  
  for (const id of ids) {
    try {
      const backupPath = await backupChatFile(id, username);
      if (backupPath) {
        const stats = await fs.stat(backupPath);
        results.success.push({ id, backupPath, size: stats.size });
        results.totalSaved += stats.size;
      } else {
        results.failed.push({ id, error: 'فایل پیدا نشد' });
      }
    } catch (error) {
      results.failed.push({ id, error: error.message });
    }
    results.totalProcessed++;
  }
  
  const duration = Date.now() - startTime;
  const savedFormatted = `${(results.totalSaved / 1024).toFixed(2)} KB`;
  logger.info(`پشتیبان‌گیری دسته‌ای تمام شد: ${results.success.length} موفق، ${savedFormatted} ذخیره شد در ${duration}ms`);
  
  return results;
}

/**
 * آرشیو دسته‌ای چندین چت
 * @param {string[]} ids - آرایه شناسه‌های چت
 * @param {string} username - نام کاربری
 * @param {boolean} isArchived - وضعیت آرشیو (true/false)
 * @returns {Promise<Object>} - نتیجه عملیات دسته‌ای
 */
async function batchArchiveChats(ids, username, isArchived = true) {
  const startTime = Date.now();
  const results = { success: [], failed: [], totalProcessed: 0 };
  const action = isArchived ? 'آرشیو' : 'خروج از آرشیو';
  
  logger.info(`شروع ${action} دسته‌ای ${ids.length} چت برای کاربر ${username}`);
  
  for (const id of ids) {
    try {
      const chatData = await readChatFile(id, username);
      if (chatData) {
        chatData.isArchived = isArchived;
        chatData.updatedAt = new Date().toISOString();
        
        await writeChatFile(id, chatData, username);
        results.success.push(id);
      } else {
        results.failed.push({ id, error: 'چت پیدا نشد' });
      }
    } catch (error) {
      results.failed.push({ id, error: error.message });
    }
    results.totalProcessed++;
  }
  
  const duration = Date.now() - startTime;
  logger.info(`${action} دسته‌ای تمام شد: ${results.success.length} موفق، ${results.failed.length} ناموفق در ${duration}ms`);
  
  return results;
}

/**
 * دریافت آمار کش حافظه
 * @returns {Object} - آمار کامل کش
 */
function getCacheStats() {
  const stats = chatCache.getStats();
  return {
    ...stats,
    ttl: `${chatCache.ttl / 1000} ثانیه`,
    description: 'آمار کش حافظه سیستم فایل چت'
  };
}

/**
 * پاکسازی دستی کش
 * @param {string} pattern - الگوی کلید برای پاکسازی (اختیاری)
 * @returns {number} - تعداد موارد پاک شده
 */
function clearCache(pattern = null) {
  const startTime = Date.now();
  let cleared = 0;
  
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of chatCache.cache.keys()) {
      if (regex.test(key)) {
        chatCache.delete(key);
        cleared++;
      }
    }
  } else {
    cleared = chatCache.cache.size;
    chatCache.clear();
  }
  
  const duration = Date.now() - startTime;
  logger.info(`کش پاکسازی شد: ${cleared} مورد در ${duration}ms`);
  
  return cleared;
}

module.exports = { 
  ensureChatDir, 
  readChatFile, 
  writeChatFile, 
  listChats, 
  deleteChatFile,
  backupChatFile,
  validateChatStructure,
  calculateChatStats,
  batchDeleteChats,
  batchBackupChats,
  batchArchiveChats,
  getCacheStats,
  clearCache,
  BASE_CHAT_DIR 
};
