/* File: helpers/health.js */
/*
  سیستم Health Check برای monitoring
  - بررسی وضعیت سرور
  - بررسی دسترسی به فایل‌ها
  - آمار عملکرد سیستم
  - پایش منابع
*/

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { logger } = require('./logger');

// بررسی وضعیت فایل‌های مهم
async function checkFileSystem() {
  const checks = [];
  
  try {
    // بررسی فایل کاربران
    const usersPath = path.join(__dirname, '..', 'users', 'users.json');
    await fs.access(usersPath);
    checks.push({ name: 'users_file', status: 'healthy', message: 'فایل کاربران در دسترس است' });
  } catch (error) {
    checks.push({ name: 'users_file', status: 'unhealthy', message: 'فایل کاربران در دسترس نیست', error: error.message });
  }

  try {
    // بررسی پوشه چت‌ها
    const chatsPath = path.join(__dirname, '..', 'chats');
    await fs.access(chatsPath);
    checks.push({ name: 'chats_directory', status: 'healthy', message: 'پوشه چت‌ها در دسترس است' });
  } catch (error) {
    checks.push({ name: 'chats_directory', status: 'unhealthy', message: 'پوشه چت‌ها در دسترس نیست', error: error.message });
  }

  try {
    // بررسی پوشه logs
    const logsPath = path.join(__dirname, '..', 'logs');
    await fs.access(logsPath);
    checks.push({ name: 'logs_directory', status: 'healthy', message: 'پوشه لاگ‌ها در دسترس است' });
  } catch (error) {
    checks.push({ name: 'logs_directory', status: 'unhealthy', message: 'پوشه لاگ‌ها در دسترس نیست', error: error.message });
  }

  return checks;
}

// بررسی منابع سیستم
function checkSystemResources() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  const cpuUsage = os.loadavg()[0]; // میانگین بار 1 دقیقه اخیر
  const uptime = os.uptime();
  
  return {
    memory: {
      total: Math.round(totalMemory / 1024 / 1024), // MB
      used: Math.round(usedMemory / 1024 / 1024), // MB
      free: Math.round(freeMemory / 1024 / 1024), // MB
      usage_percent: Math.round(memoryUsagePercent)
    },
    cpu: {
      load_average: cpuUsage,
      cores: os.cpus().length
    },
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    platform: os.platform(),
    node_version: process.version
  };
}

// فرمت زمان uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// بررسی OpenAI API
async function checkExternalServices() {
  const checks = [];
  
  // بررسی کلید API
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.startsWith('sk-')) {
    checks.push({ 
      name: 'openai_api_key', 
      status: 'healthy', 
      message: 'کلید OpenAI تنظیم شده است' 
    });
  } else {
    checks.push({ 
      name: 'openai_api_key', 
      status: 'unhealthy', 
      message: 'کلید OpenAI تنظیم نشده یا نامعتبر است' 
    });
  }

  return checks;
}

// آمار کاربران و چت‌ها
async function getApplicationStats() {
  try {
    const { getAllUsers } = require('./auth');
    const { listChats } = require('./fs');
    
    const users = await getAllUsers();
    let totalChats = 0;
    let totalMessages = 0;
    
    // شمارش کل چت‌ها و پیام‌ها
    for (const user of users) {
      if (user.stats) {
        totalChats += user.stats.totalChats || 0;
        totalMessages += user.stats.totalMessages || 0;
      }
    }
    
    return {
      users: {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        admins: users.filter(u => u.role === 'admin').length
      },
      chats: {
        total: totalChats
      },
      messages: {
        total: totalMessages
      }
    };
  } catch (error) {
    logger.error('خطا در دریافت آمار برنامه:', error);
    return {
      users: { total: 0, active: 0, admins: 0 },
      chats: { total: 0 },
      messages: { total: 0 },
      error: 'خطا در دریافت آمار'
    };
  }
}

// Health check اصلی
async function performHealthCheck() {
  const startTime = Date.now();
  
  try {
    const [fileSystemChecks, externalServiceChecks, appStats] = await Promise.all([
      checkFileSystem(),
      checkExternalServices(),
      getApplicationStats()
    ]);

    const systemResources = checkSystemResources();
    const responseTime = Date.now() - startTime;
    
    // تعیین وضعیت کلی
    const allChecks = [...fileSystemChecks, ...externalServiceChecks];
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy');
    const overallStatus = hasUnhealthy ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      version: require('../package.json').version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        filesystem: fileSystemChecks,
        external_services: externalServiceChecks
      },
      system: systemResources,
      application: appStats
    };
  } catch (error) {
    logger.error('خطا در Health Check:', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      error: 'خطا در بررسی وضعیت سیستم',
      details: error.message
    };
  }
}

// Health check ساده برای load balancer
function getSimpleHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

module.exports = {
  performHealthCheck,
  getSimpleHealth,
  checkFileSystem,
  checkSystemResources,
  getApplicationStats
};
