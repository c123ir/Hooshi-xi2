# 🚀 راهنمای جامع استقرار و Deploy

## 🌟 نمای کلی

راهنمای کامل برای استقرار **Chat Application** در محیط‌های مختلف Production شامل سرورهای VPS، Cloud providers، Docker و Kubernetes.

### ویژگی‌های استقرار
- **Multi-Environment**: توسعه، تست، و تولید
- **Scalable Architecture**: قابل مقیاس‌بندی
- **Security Hardened**: تنظیمات امنیتی پیشرفته  
- **Monitoring Ready**: آماده برای نظارت
- **Auto-Recovery**: بازیابی خودکار از خطاها

---

## 🛠️ تنظیم محیط

### پیش‌نیازهای سیستم
```bash
# بررسی نسخه Node.js (حداقل v16)
node --version
# Expected output: v16.x.x یا بالاتر

# بررسی npm
npm --version
# Expected output: 8.x.x یا بالاتر

# نصب Git
git --version
# Expected output: 2.x.x یا بالاتر

# نصب PM2 برای مدیریت فرایند
npm install -g pm2

# بررسی PM2
pm2 --version
```

### نیازمندی‌های سیستم‌عامل
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget gnupg lsb-release

# CentOS/RHEL
sudo yum update
sudo yum install -y curl wget

# macOS (با Homebrew)
brew update
brew install node npm git
```

---

## ⚙️ تنظیم متغیرهای محیط

### فایل `.env` محیط Production
```env
# ========================================
# 🌍 Server Configuration
# ========================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# برای Load Balancer (اختیاری)
PROXY_PORT=80
HTTPS_PORT=443

# ========================================
# 🤖 OpenAI Configuration  
# ========================================
OPENAI_API_KEY=sk-your-production-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=30000
OPENAI_MAX_RETRIES=3

# ========================================
# 🔐 Security & Authentication
# ========================================
SESSION_SECRET=your-super-secure-64-character-session-secret-change-this-now
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# ========================================
# 👥 User Management
# ========================================
ALLOW_AUTO_REGISTER=false
DEFAULT_USER_ROLE=user
MAX_USERS_PER_IP=5
PASSWORD_MIN_LENGTH=8

# ========================================
# 📁 File Storage Paths
# ========================================
USERS_DIR=/var/lib/chat-app/users
CHATS_DIR=/var/lib/chat-app/chats
LOGS_DIR=/var/log/chat-app
TEMP_DIR=/tmp/chat-app

# ========================================
# 🗄️ Database (برای آینده)
# ========================================
# DATABASE_URL=postgresql://username:password@localhost:5432/chat_app
# DATABASE_POOL_SIZE=10
# DATABASE_SSL=true

# ========================================
# 🔊 TTS Configuration
# ========================================
TTS_CACHE_ENABLED=true
TTS_CACHE_DIR=/var/cache/chat-app/tts
TTS_MAX_TEXT_LENGTH=4000
TTS_RATE_LIMIT=10

# ========================================
# 📊 Monitoring & Logging
# ========================================
LOG_LEVEL=info
LOG_FILE_MAX_SIZE=10485760  # 10MB
LOG_FILE_MAX_FILES=5
ENABLE_ACCESS_LOG=true
ENABLE_ERROR_TRACKING=true

# Health Check
HEALTH_CHECK_TIMEOUT=5000
ENABLE_DETAILED_HEALTH=true

# ========================================
# 🌐 CDN & Assets (اختیاری)
# ========================================
# CDN_URL=https://cdn.your-domain.com
# STATIC_FILES_CACHE=86400  # 24 hours

# ========================================
# 🔒 SSL/TLS Configuration
# ========================================
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/your-domain.pem
SSL_KEY_PATH=/etc/ssl/private/your-domain.key
SSL_REDIRECT=true
```

### تنظیم مجوزهای فایل‌ها
```bash
# ایجاد دایرکتوری‌های مورد نیاز
sudo mkdir -p /var/lib/chat-app/{users,chats}
sudo mkdir -p /var/log/chat-app
sudo mkdir -p /var/cache/chat-app/tts

# تنظیم مالکیت
sudo chown -R $USER:$USER /var/lib/chat-app
sudo chown -R $USER:$USER /var/log/chat-app
sudo chown -R $USER:$USER /var/cache/chat-app

# تنظیم مجوزها
sudo chmod -R 755 /var/lib/chat-app
sudo chmod -R 644 /var/log/chat-app
sudo chmod -R 755 /var/cache/chat-app
```

---

## 📦 نصب و پیکربندی

### نصب مستقیم روی سرور

```bash
# 1. کلون کردن پروژه
git clone https://github.com/your-username/chat-app.git
cd chat-app

# 2. تغییر به branch production (اگر موجود است)
git checkout production  # یا main

# 3. نصب dependencies
npm ci --production

# 4. کپی کردن تنظیمات محیط
cp .env.example .env
nano .env  # ویرایش تنظیمات

# 5. تست اجرای برنامه
npm test  # اجرای تست‌ها
npm start  # تست اجرای سرور

# 6. ایجاد کاربر admin اولیه
npm run create-admin  # اگر اسکریپت موجود است
```

### نصب با PM2 (توصیه شده)

```bash
# نصب و تنظیم PM2
npm install -g pm2

# ایجاد فایل تنظیمات PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'chat-app',
    script: 'server.js',
    instances: 'max',  // یا تعداد CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Restart settings
    max_memory_restart: '1G',
    error_file: '/var/log/chat-app/error.log',
    out_file: '/var/log/chat-app/access.log',
    log_file: '/var/log/chat-app/combined.log',
    time: true,
    // Monitoring
    monitoring: false,
    // Auto restart on file changes (فقط در development)
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'chats', 'users'],
    // Environment-specific settings
    node_args: '--max_old_space_size=1024'
  }]
};
EOF

# شروع برنامه با PM2
pm2 start ecosystem.config.js --env production

# ذخیره تنظیمات PM2
pm2 save

# تنظیم auto-start پس از reboot
pm2 startup
# سپس دستور نمایش داده شده را اجرا کنید

# نظارت بر وضعیت
pm2 status
pm2 logs chat-app
pm2 monit
```

---

## 🐳 استقرار با Docker

### ایجاد Dockerfile

```dockerfile
# استفاده از تصویر Node.js رسمی
FROM node:18-alpine AS base

# نصب dependencies سیستم
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# ایجاد کاربر غیر root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# تنظیم دایرکتوری کار
WORKDIR /app

# کپی کردن package files
COPY package*.json ./

# ======================================
# Dependencies stage
# ======================================
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# ======================================
# Build stage  
# ======================================
FROM base AS build
COPY . .
RUN npm ci
RUN npm run build 2>/dev/null || echo "No build script found"

# ======================================
# Production stage
# ======================================
FROM base AS production

# کپی کردن dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# کپی کردن کد
COPY --chown=nextjs:nodejs . .

# ایجاد دایرکتوری‌های مورد نیاز
RUN mkdir -p logs chats users && \
    chown -R nextjs:nodejs logs chats users

# تغییر به کاربر غیر root
USER nextjs

# بازکردن پورت
EXPOSE 3000

# تنظیم متغیرهای محیط
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# اجرای برنامه
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Docker Compose برای Production

```yaml
version: '3.8'

services:
  chat-app:
    build:
      context: .
      target: production
    container_name: chat-app-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    volumes:
      - chat_data:/app/chats
      - user_data:/app/users
      - app_logs:/app/logs
    networks:
      - chat-network
    depends_on:
      - redis  # اگر از Redis استفاده می‌کنید
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: chat-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - chat-network
    depends_on:
      - chat-app

  # Redis (اختیاری - برای session storage)
  redis:
    image: redis:7-alpine
    container_name: chat-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - chat-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring (اختیاری)
  prometheus:
    image: prom/prometheus
    container_name: chat-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - chat-network

volumes:
  chat_data:
    driver: local
  user_data:
    driver: local
  app_logs:
    driver: local
  redis_data:
    driver: local
  nginx_logs:
    driver: local
  prometheus_data:
    driver: local

networks:
  chat-network:
    driver: bridge
```

### دستورات Docker

```bash
# Build کردن تصویر
docker build -t chat-app:latest .

# اجرای کانتینر
docker run -d \
  --name chat-app \
  -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/chats:/app/chats \
  -v $(pwd)/users:/app/users \
  -v $(pwd)/logs:/app/logs \
  chat-app:latest

# اجرا با Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# نظارت بر لاگ‌ها
docker logs -f chat-app

# ورود به کانتینر
docker exec -it chat-app sh

# توقف و پاک کردن
docker-compose down
docker rmi chat-app:latest
```

---

## ☁️ استقرار در Cloud Providers

### AWS (Amazon Web Services)

#### EC2 Instance Setup
```bash
# راه‌اندازی EC2 Instance (Ubuntu 20.04 LTS)
# t3.medium یا بالاتر توصیه می‌شود

# 1. اتصال به instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# 2. بروزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# 3. نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. نصب nginx
sudo apt install nginx -y

# 5. تنظیم firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 6. کلون و نصب پروژه
git clone https://github.com/your-username/chat-app.git
cd chat-app
npm ci --production

# 7. تنظیم nginx reverse proxy
sudo nano /etc/nginx/sites-available/chat-app
```

#### Nginx Configuration برای AWS
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy Settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /css/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /js/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

#### فعال‌سازی SSL با Let's Encrypt
```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx -y

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تنظیم auto-renewal
sudo crontab -e
# اضافه کردن این خط:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Google Cloud Platform (GCP)

#### App Engine Deployment
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  OPENAI_API_KEY: your-openai-api-key
  SESSION_SECRET: your-session-secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

network:
  forwarded_ports:
    - 3000

handlers:
  - url: /.*
    script: auto
    secure: always
    redirect_http_response_code: 301
```

```bash
# نصب Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Deploy
gcloud app deploy

# مشاهده لاگ‌ها
gcloud app logs tail -s default
```

### DigitalOcean Droplet

```bash
# ایجاد Droplet (Ubuntu 20.04, 2GB RAM minimum)

# اتصال SSH
ssh root@your-droplet-ip

# تنظیم اولیه
apt update && apt upgrade -y
apt install nginx git curl -y

# نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# ایجاد کاربر غیر root
adduser chatapp
usermod -aG sudo chatapp
su - chatapp

# کلون پروژه
git clone https://github.com/your-username/chat-app.git
cd chat-app
npm ci --production

# تنظیم PM2
sudo npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🔒 تنظیمات امنیتی

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# iptables (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### SSL/TLS Hardening

```bash
# تولید DH parameters قوی
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# تنظیم مجوزهای SSL
sudo chmod 600 /etc/ssl/private/your-domain.key
sudo chmod 644 /etc/ssl/certs/your-domain.pem
```

### System Hardening

```bash
# غیرفعال کردن root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# تنظیم fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# پیکربندی fail2ban
sudo tee /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

---

## 📊 نظارت و Monitoring

### Health Checks

```bash
# اسکریپت health check
cat > /usr/local/bin/chat-app-health.sh << 'EOF'
#!/bin/bash

# بررسی وضعیت سرویس
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Chat app is DOWN"
    # ارسال alert (اختیاری)
    # /usr/local/bin/send-alert.sh "Chat App Down"
    exit 1
fi

# بررسی استفاده از CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "⚠️ High CPU usage: $CPU_USAGE%"
fi

# بررسی استفاده از حافظه
MEM_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "⚠️ High memory usage: $MEM_USAGE%"
fi

echo "✅ Chat app is healthy"
EOF

chmod +x /usr/local/bin/chat-app-health.sh

# تنظیم cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/chat-app-health.sh") | crontab -
```

### Log Management

```bash
# تنظیم logrotate
sudo tee /etc/logrotate.d/chat-app << 'EOF'
/var/log/chat-app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 chatapp chatapp
    postrotate
        pm2 reload chat-app > /dev/null 2>&1 || true
    endscript
}
EOF

# تست logrotate
sudo logrotate -d /etc/logrotate.d/chat-app
```

### Performance Monitoring

```bash
# نصب htop برای نظارت real-time
sudo apt install htop iotop nethogs -y

# نصب Node.js monitoring tools
npm install -g clinic
npm install -g autocannon  # برای load testing

# Load testing
autocannon -c 10 -d 30 http://localhost:3000
```

---

## 🔧 عیب‌یابی و Troubleshooting

### مشکلات رایج

#### 1. سرور راه‌اندازی نمی‌شود
```bash
# بررسی لاگ‌ها
pm2 logs chat-app
# یا
journalctl -u chat-app -f

# بررسی پورت در حال استفاده
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000

# بررسی متغیرهای محیط
pm2 env 0
```

#### 2. مشکلات SSL
```bash
# تست گواهی SSL
openssl s_client -connect your-domain.com:443

# بررسی انقضای گواهی
openssl x509 -in /etc/ssl/certs/your-domain.pem -text -noout | grep "Not After"

# تجدید گواهی Let's Encrypt
sudo certbot renew --dry-run
```

#### 3. مشکلات Performance
```bash
# بررسی استفاده از منابع
htop
iotop
free -h
df -h

# پروفایل Node.js
clinic doctor -- node server.js
clinic flame -- node server.js
```

#### 4. مشکلات شبکه
```bash
# تست اتصال
curl -I http://localhost:3000/health
curl -I https://your-domain.com/health

# بررسی DNS
nslookup your-domain.com
dig your-domain.com

# بررسی firewall
sudo ufw status
sudo iptables -L
```

### لاگ‌های مفید

```bash
# System logs
sudo journalctl -xe
sudo tail -f /var/log/syslog

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs chat-app --lines 100

# Application logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Recovery Procedures

```bash
# Restart services
sudo systemctl restart nginx
pm2 restart chat-app

# Full system restart (اضطراری)
sudo reboot

# Rollback to previous version
git log --oneline
git checkout previous-commit-hash
npm ci --production
pm2 restart chat-app
```

---

## 📋 Checklist استقرار

### پیش از استقرار
- [ ] تست کامل در محیط staging
- [ ] پشتیبان‌گیری از داده‌های موجود
- [ ] تنظیم monitoring و alerting
- [ ] بررسی performance requirements
- [ ] تنظیم DNS records
- [ ] دریافت SSL certificates

### هنگام استقرار
- [ ] کلون کردن کد از production branch
- [ ] نصب dependencies
- [ ] تنظیم environment variables
- [ ] اجرای migration scripts (در صورت نیاز)
- [ ] تست smoke tests
- [ ] تنظیم reverse proxy
- [ ] فعال‌سازی SSL

### پس از استقرار
- [ ] تست عملکرد endpoints
- [ ] بررسی logs برای خطاها
- [ ] تست load balancing
- [ ] بررسی monitoring dashboards
- [ ] اطلاع‌رسانی به تیم
- [ ] مستندسازی تغییرات

---

*آخرین بروزرسانی: آگوست 2025*

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/chat-app/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@your-domain.com
```

---

## Local Development

### Setup:
```bash
# Clone repository
git clone <repository-url>
cd chat-application

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Create necessary directories
mkdir -p users chats logs

# Start development server
npm run dev
# or
node server.js
```

### Development Scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "build": "npm run build:css && npm run build:js",
    "build:css": "cleancss -o css/styles.min.css css/styles.css",
    "build:js": "uglifyjs js/app.js -o js/app.min.js"
  }
}
```

---

## Production Deployment

### 1. VPS/Dedicated Server

#### Ubuntu/Debian Setup:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash chatapp
sudo usermod -aG sudo chatapp

# Setup directories
sudo mkdir -p /var/lib/chat-app/{users,chats}
sudo mkdir -p /var/log/chat-app
sudo chown -R chatapp:chatapp /var/lib/chat-app
sudo chown -R chatapp:chatapp /var/log/chat-app

# Switch to app user
sudo su - chatapp
```

#### Application Deployment:
```bash
# Clone application
cd /home/chatapp
git clone <repository-url> chat-app
cd chat-app

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production settings

# Test application
node server.js

# Setup PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### PM2 Configuration (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'chat-app',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/chat-app/error.log',
    out_file: '/var/log/chat-app/out.log',
    log_file: '/var/log/chat-app/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 2. Nginx Reverse Proxy

#### Installation:
```bash
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/chat-app
```

#### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        root /home/chatapp/chat-app;
    }
    
    # API requests
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

#### Enable Site:
```bash
sudo ln -s /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Docker Deployment

### Dockerfile:
```dockerfile
FROM node:18-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chatapp -u 1001

# Copy application code
COPY --chown=chatapp:nodejs . .

# Create necessary directories
RUN mkdir -p users chats logs
RUN chown -R chatapp:nodejs users chats logs

USER chatapp

EXPOSE 3000

ENV NODE_ENV production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### docker-compose.yml:
```yaml
version: '3.8'

services:
  chat-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    volumes:
      - ./data/users:/usr/src/app/users
      - ./data/chats:/usr/src/app/chats
      - ./logs:/usr/src/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - chat-app
    restart: unless-stopped

  # Optional: Database
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: chat_app
      POSTGRES_USER: chatapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Docker Commands:
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f chat-app

# Scale application
docker-compose up -d --scale chat-app=3

# Update application
docker-compose pull
docker-compose up -d --force-recreate
```

---

## Cloud Deployment

### 1. Heroku

#### Preparation:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-chat-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your-key
heroku config:set SESSION_SECRET=your-secret
```

#### Procfile:
```
web: node server.js
```

#### Deploy:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Digital Ocean App Platform

#### app.yaml:
```yaml
name: chat-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/chat-app
    branch: main
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: OPENAI_API_KEY
    value: your-key
    type: SECRET
  - key: SESSION_SECRET
    value: your-secret
    type: SECRET
  http_port: 3000
  routes:
  - path: /
```

### 3. AWS EC2

#### User Data Script:
```bash
#!/bin/bash
yum update -y
yum install -y git

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone and setup app
cd /home/ec2-user
git clone <repository-url> chat-app
cd chat-app
npm install --production

# Setup PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Setup nginx (if needed)
amazon-linux-extras install nginx1
systemctl start nginx
systemctl enable nginx
```

---

## Database Migration

### PostgreSQL Setup:
```sql
-- Create database
CREATE DATABASE chat_app;
CREATE USER chatapp WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chat_app TO chatapp;

-- Connect to database
\c chat_app;

-- Create tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  mobile VARCHAR(15),
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  max_chats INTEGER,
  max_messages_per_chat INTEGER,
  expiry_date DATE,
  total_chats INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chats (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) REFERENCES chats(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
```

### Migration Script:
```javascript
// migrate.js
const fs = require('fs').promises;
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateFromFiles() {
  try {
    // Migrate users
    const usersData = JSON.parse(await fs.readFile('users/users.json'));
    
    for (const user of usersData.users) {
      await pool.query(
        `INSERT INTO users (username, password_hash, first_name, last_name, 
         mobile, email, role, is_active, max_chats, max_messages_per_chat, 
         expiry_date, total_chats, total_messages, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [user.username, user.passwordHash, user.firstName, user.lastName,
         user.mobile, user.email, user.role, user.isActive, user.maxChats,
         user.maxMessagesPerChat, user.expiryDate, user.stats?.totalChats || 0,
         user.stats?.totalMessages || 0, user.stats?.lastLoginAt]
      );
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateFromFiles();
```

---

## Monitoring & Logging

### PM2 Monitoring:
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs chat-app

# Restart with zero downtime
pm2 reload chat-app

# Setup monitoring service
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### Application Logging:
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chat-app' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Check Endpoint:
```javascript
// Add to server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

---

## Security Hardening

### Server Security:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban

# Configure UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart ssh
```

### Application Security:
```javascript
// helmet.js middleware
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Backup Strategy

### Automated Backup Script:
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/chat-app"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/chatapp/chat-app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C $APP_DIR users/ chats/

# Backup database (if using PostgreSQL)
pg_dump chat_app > "$BACKUP_DIR/db_$DATE.sql"

# Compress database backup
gzip "$BACKUP_DIR/db_$DATE.sql"

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job:
```bash
# Daily backup at 2 AM
0 2 * * * /home/chatapp/backup.sh >> /var/log/chat-app/backup.log 2>&1
```

---

## Troubleshooting

### Common Issues:

#### Port Already in Use:
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

#### Permission Issues:
```bash
# Fix permissions
sudo chown -R chatapp:chatapp /var/lib/chat-app
sudo chmod -R 755 /var/lib/chat-app
```

#### Memory Issues:
```bash
# Monitor memory usage
free -h
top -p $(pgrep node)

# Increase Node.js memory limit
node --max-old-space-size=2048 server.js
```

#### SSL Certificate Issues:
```bash
# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew --force-renewal
```

### Log Analysis:
```bash
# View application logs
tail -f /var/log/chat-app/combined.log

# Search for errors
grep "ERROR" /var/log/chat-app/combined.log

# Monitor real-time access
tail -f /var/log/nginx/access.log
```
