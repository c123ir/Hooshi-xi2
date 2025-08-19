/* File: helpers/https.js */
/*
  تنظیمات HTTPS برای production
  - ایجاد self-signed certificate برای development
  - پیکربندی HTTPS server
  - Redirect HTTP به HTTPS
*/

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

// مسیر certificates
const CERTS_DIR = path.join(__dirname, '..', 'certs');

// ایجاد self-signed certificate برای development
function createSelfSignedCert() {
  const { execSync } = require('child_process');
  
  try {
    // ایجاد پوشه certs
    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }

    const keyPath = path.join(CERTS_DIR, 'private-key.pem');
    const certPath = path.join(CERTS_DIR, 'certificate.pem');

    // بررسی وجود certificate
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      logger.info('SSL Certificate موجود است');
      return { keyPath, certPath };
    }

    logger.info('ایجاد Self-Signed SSL Certificate...');

    // ایجاد private key
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

    // ایجاد certificate
    execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=IR/ST=Tehran/L=Tehran/O=ChatApp/OU=Development/CN=localhost"`, { stdio: 'inherit' });

    logger.info('SSL Certificate با موفقیت ایجاد شد');
    return { keyPath, certPath };

  } catch (error) {
    logger.error('خطا در ایجاد SSL Certificate:', error);
    return null;
  }
}

// تنظیم HTTPS server
function setupHTTPS(app, port = 443) {
  try {
    let keyPath, certPath;

    // در production از certificates واقعی استفاده کنید
    if (process.env.NODE_ENV === 'production') {
      keyPath = process.env.SSL_PRIVATE_KEY || '/etc/ssl/private/chat-app.key';
      certPath = process.env.SSL_CERTIFICATE || '/etc/ssl/certs/chat-app.crt';
      
      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        logger.error('SSL Certificate برای production یافت نشد');
        return null;
      }
    } else {
      // در development از self-signed certificate استفاده کنید
      const certs = createSelfSignedCert();
      if (!certs) return null;
      keyPath = certs.keyPath;
      certPath = certs.certPath;
    }

    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const certificate = fs.readFileSync(certPath, 'utf8');

    const credentials = {
      key: privateKey,
      cert: certificate
    };

    // اضافه کردن intermediate certificate اگر وجود دارد
    const chainPath = process.env.SSL_CHAIN || path.join(CERTS_DIR, 'chain.pem');
    if (fs.existsSync(chainPath)) {
      credentials.ca = fs.readFileSync(chainPath, 'utf8');
    }

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(port, () => {
      logger.info(`HTTPS Server روی پورت ${port} اجرا شد`);
    });

    return httpsServer;

  } catch (error) {
    logger.error('خطا در راه‌اندازی HTTPS Server:', error);
    return null;
  }
}

// Redirect HTTP to HTTPS
function setupHTTPRedirect(httpsPort = 443) {
  const redirectApp = (req, res) => {
    const host = req.headers.host?.replace(/:\d+$/, ''); // حذف پورت از host
    const httpsUrl = `https://${host}${httpsPort !== 443 ? ':' + httpsPort : ''}${req.url}`;
    
    logger.info(`HTTP Redirect: ${req.url} -> ${httpsUrl}`);
    
    res.writeHead(301, {
      Location: httpsUrl,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    res.end();
  };

  const httpServer = http.createServer(redirectApp);
  
  httpServer.listen(80, () => {
    logger.info('HTTP Redirect Server روی پورت 80 اجرا شد');
  });

  return httpServer;
}

// تنظیمات امنیتی HTTPS
function getSecurityHeaders() {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:;"
  };
}

// middleware برای اضافه کردن security headers
function securityHeadersMiddleware(req, res, next) {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  next();
}

// بررسی نیاز به HTTPS
function shouldUseHTTPS() {
  return process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';
}

// تنظیم کامل HTTPS
function configureHTTPS(app, options = {}) {
  const {
    httpPort = 80,
    httpsPort = 443,
    enableRedirect = true
  } = options;

  if (!shouldUseHTTPS()) {
    logger.info('HTTPS غیرفعال است');
    return { httpsServer: null, httpServer: null };
  }

  // راه‌اندازی HTTPS server
  const httpsServer = setupHTTPS(app, httpsPort);
  
  // راه‌اندازی HTTP redirect
  const httpServer = enableRedirect ? setupHTTPRedirect(httpsPort) : null;

  // اضافه کردن security headers
  app.use(securityHeadersMiddleware);

  return { httpsServer, httpServer };
}

module.exports = {
  setupHTTPS,
  setupHTTPRedirect,
  configureHTTPS,
  createSelfSignedCert,
  securityHeadersMiddleware,
  shouldUseHTTPS,
  getSecurityHeaders
};
