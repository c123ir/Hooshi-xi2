/* File: helpers/middleware.js */
/*
  مجموعه middleware های امنیتی و بهینه‌سازی
  - Rate limiting برای جلوگیری از spam
  - Security headers
  - Request logging
  - Error handling
*/

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { logRequest, logSecurityEvent, logger } = require('./logger');

// Rate limiting configurations
const rateLimiters = {
  // عمومی - برای تمام درخواست‌ها (به جز فایل‌های استاتیک)
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 100, // حداکثر 100 درخواست در 15 دقیقه
    message: {
      error: 'تعداد درخواست‌های شما از حد مجاز گذشته است. لطفاً 15 دقیقه صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip static files
    skip: (req) => {
      const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
      return staticExtensions.some(ext => req.url.toLowerCase().endsWith(ext));
    },
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        user: req.user?.username
      });
      res.status(429).json({
        error: 'تعداد درخواست‌های شما از حد مجاز گذشته است. لطفاً 15 دقیقه صبر کنید.'
      });
    }
  }),

  // ورود - محدودیت شدیدتر
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 5, // حداکثر 5 تلاش ورود در 15 دقیقه
    message: {
      error: 'تلاش‌های ورود شما از حد مجاز گذشته است. لطفاً 15 دقیقه صبر کنید.'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        attempts: req.rateLimit?.totalHits
      });
      res.status(429).json({
        error: 'تلاش‌های ورود شما از حد مجاز گذشته است. لطفاً 15 دقیقه صبر کنید.'
      });
    }
  }),

  // API چت - محدودیت برای پیام‌ها
  chat: rateLimit({
    windowMs: 60 * 1000, // 1 دقیقه
    max: 10, // حداکثر 10 پیام در دقیقه
    message: {
      error: 'شما خیلی سریع پیام می‌فرستید. لطفاً کمی صبر کنید.'
    },
    handler: (req, res) => {
      logSecurityEvent('CHAT_RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        user: req.user?.username,
        chatId: req.params?.chatId
      });
      res.status(429).json({
        error: 'شما خیلی سریع پیام می‌فرستید. لطفاً کمی صبر کنید.'
      });
    }
  }),

  // ادمین - محدودیت ملایم‌تر
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 دقیقه
    max: 30, // حداکثر 30 درخواست ادمین در دقیقه
    message: {
      error: 'تعداد درخواست‌های مدیریتی شما از حد مجاز گذشته است.'
    }
  })
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
  });
  
  next();
};

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const { logError } = require('./logger');
  
  // لاگ کردن خطا
  logError(err, req, {
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID
  });

  // پاسخ مناسب به کاربر
  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // خطاهای مختلف
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'فایل آپلودی خیلی بزرگ است'
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'فرمت درخواست نامعتبر است'
    });
  }

  // خطای عمومی
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    error: isDevelopment ? err.message : 'خطای سرور رخ داده است'
  };

  if (isDevelopment) {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

// Not found handler
const notFoundHandler = (req, res) => {
  logger.warn('Route Not Found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'صفحه یا API مورد نظر یافت نشد'
  });
};

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

module.exports = {
  rateLimiters,
  requestLogger,
  securityHeaders,
  errorHandler,
  notFoundHandler,
  compressionMiddleware
};
