/* File: helpers/logger.js */
/*
  سیستم logging پیشرفته با Winston
  - ثبت لاگ‌ها در فایل و کنسول
  - سطح‌بندی لاگ‌ها (error, warn, info, debug)
  - Rotation برای فایل‌های لاگ
  - Format مناسب برای خواندن
*/

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ایجاد پوشه logs اگر وجود ندارد
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// تنظیم فرمت لاگ
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// تنظیم فرمت کنسول
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// ایجاد logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'chat-app' },
  transports: [
    // لاگ خطاها در فایل جداگانه
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // تمام لاگ‌ها در فایل combined
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // نمایش در کنسول
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
  ],
});

// اضافه کردن transports اضافی در development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'debug.log'),
    level: 'debug',
    maxsize: 5242880,
    maxFiles: 3,
  }));
}

// helper functions
const loggerHelpers = {
  // لاگ درخواست‌های HTTP
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      user: req.user?.username || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },
  
  // لاگ خطاهای API
  logError: (error, req = null, additionalInfo = {}) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      ...additionalInfo
    };
    
    if (req) {
      errorData.request = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        user: req.user?.username
      };
    }
    
    logger.error('Application Error', errorData);
  },
  
  // لاگ فعالیت‌های کاربر
  logUserActivity: (username, activity, details = {}) => {
    logger.info('User Activity', {
      username,
      activity,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  // لاگ تغییرات ادمین
  logAdminAction: (adminUsername, action, target, details = {}) => {
    logger.warn('Admin Action', {
      admin: adminUsername,
      action,
      target,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  // لاگ مشکلات امنیتی
  logSecurityEvent: (type, details = {}) => {
    logger.error('Security Event', {
      type,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { logger, ...loggerHelpers };
