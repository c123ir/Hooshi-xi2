# 🎨 راهنمای جامع توسعه Frontend

## 🌟 نمای کلی

رابط کاربری این پروژه با **Vanilla JavaScript**، **CSS3** و **HTML5** طراحی شده و دارای معماری مدرن و قابل نگهداری است. سیستم شامل دو بخش اصلی می‌باشد:

- 💬 **Main Chat Interface** - رابط چت اصلی با قابلیت‌های پیشرفته TTS
- 👥 **Admin Dashboard** - پنل مدیریت کامل کاربران و سیستم

### ویژگی‌های کلیدی Frontend
- **RTL Support**: پشتیبانی کامل از راست به چپ
- **Responsive Design**: سازگار با موبایل و دسکتاپ  
- **Modern CSS**: Flexbox، Grid، CSS Variables
- **Accessibility**: مطابق استانداردهای دسترسی‌پذیری
- **Performance**: بهینه‌سازی شده برای سرعت بالا

---

## 🏗️ ساختار پروژه

```
frontend/
├── index.html                    # 🏠 صفحه چت اصلی
├── css/
│   └── styles.css               # 🎨 استایل‌های چت (1500+ خط)
├── js/
│   └── app.js                   # ⚙️ منطق چت و TTS (1800+ خط)
├── admin/
│   ├── dashboard.html           # 👑 پنل مدیریت
│   ├── admin.css               # 🎨 استایل‌های ادمین
│   └── admin.js                # ⚙️ منطق پنل مدیریت
└── assets/                      # 📁 فایل‌های کمکی
    ├── fonts/                   # فونت‌های محلی
    ├── icons/                   # آیکون‌ها
    └── images/                  # تصاویر
```

---

## 💬 رابط چت اصلی (Main Chat Interface)

### ساختار HTML (`index.html`)

#### عناصر اصلی:
```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 دستیار هوش مصنوعی</title>
    
    <!-- فونت فارسی از Google Fonts -->
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    
    <!-- استایل‌های اصلی -->
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- Meta Tags برای SEO و PWA -->
    <meta name="description" content="پلتفرم پیشرفته چت با هوش مصنوعی">
    <meta name="keywords" content="چت، هوش مصنوعی، فارسی، TTS">
    <meta name="theme-color" content="#2c3e50">
</head>

<body>
    <!-- 🔝 Header Section -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <h1 class="logo">
                    <span class="logo-icon">🤖</span>
                    دستیار هوش مصنوعی
                </h1>
                
                <!-- اطلاعات کاربر -->
                <div class="user-info" id="user-info" style="display: none;">
                    <div class="user-details">
                        <span id="username-display" class="username"></span>
                        <span id="user-role" class="user-role"></span>
                    </div>
                    <div class="user-actions">
                        <button id="settings-btn" class="btn-icon" title="تنظیمات">⚙️</button>
                        <button id="logout-btn" class="btn-secondary">خروج</button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- � Login Modal -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔑 ورود به سیستم</h2>
                <button class="modal-close" id="close-login">&times;</button>
            </div>
            
            <form id="login-form" class="login-form">
                <div class="form-group">
                    <label for="username">نام کاربری:</label>
                    <input type="text" id="username" name="username" required 
                           placeholder="نام کاربری خود را وارد کنید">
                </div>
                
                <div class="form-group">
                    <label for="password">رمز عبور:</label>
                    <input type="password" id="password" name="password" required 
                           placeholder="رمز عبور خود را وارد کنید">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">ورود</button>
                    <p class="form-note">
                        اگر کاربر جدید هستید، با ورود اطلاعات حساب جدید ایجاد می‌شود.
                    </p>
                </div>
            </form>
        </div>
    </div>

    <!-- 📱 Main Content -->
    <main class="main-content">
        <div class="container">
            <div class="chat-layout">
                
                <!-- 📋 Sidebar - Chat List -->
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <h3>📋 چت‌های شما</h3>
                        <div class="sidebar-actions">
                            <button id="new-chat-btn" class="btn-primary btn-sm">
                                ➕ چت جدید
                            </button>
                            <button id="import-btn" class="btn-secondary btn-sm">
                                📥 ایمپورت
                            </button>
                        </div>
                    </div>
                    
                    <!-- جستجوی چت‌ها -->
                    <div class="search-section">
                        <input type="text" id="search-chats" placeholder="🔍 جستجو در چت‌ها...">
                    </div>
                    
                    <!-- لیست چت‌ها -->
                    <div class="chat-list-container">
                        <ul id="chat-list" class="chat-list">
                            <!-- چت‌ها به صورت دینامیک اضافه می‌شوند -->
                        </ul>
                    </div>
                    
                    <!-- عملیات بالک -->
                    <div class="bulk-actions" style="display: none;">
                        <button id="select-all-btn" class="btn-secondary btn-sm">انتخاب همه</button>
                        <button id="delete-selected-btn" class="btn-danger btn-sm">حذف انتخاب‌شده</button>
                        <button id="export-selected-btn" class="btn-secondary btn-sm">خروجی انتخاب‌شده</button>
                    </div>
                </aside>

                <!-- 💬 Chat Area -->
                <section class="chat-area">
                    
                    <!-- هدر چت -->
                    <div class="chat-header">
                        <div class="chat-title-section">
                            <h2 id="chat-title">چت جدید</h2>
                            <div class="chat-actions">
                                <button id="edit-title-btn" class="btn-icon" title="ویرایش عنوان">✏️</button>
                                <button id="pin-chat-btn" class="btn-icon" title="پین کردن">📌</button>
                                <button id="archive-chat-btn" class="btn-icon" title="آرشیو">📦</button>
                                <button id="delete-chat-btn" class="btn-icon btn-danger" title="حذف چت">🗑️</button>
                            </div>
                        </div>
                        
                        <!-- تنظیمات مدل -->
                        <div class="model-settings">
                            <label for="model-select">مدل:</label>
                            <select id="model-select">
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini" selected>GPT-4o Mini</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </select>
                        </div>
                    </div>

                    <!-- پیام‌های چت -->
                    <div id="messages" class="messages-container">
                        <!-- پیام‌ها به صورت دینامیک اضافه می‌شوند -->
                    </div>

                    <!-- فرم ارسال پیام -->
                    <form id="chat-form" class="message-form">
                        <div class="input-container">
                            <textarea id="message-input" 
                                    placeholder="پیام خود را بنویسید..." 
                                    rows="1"
                                    maxlength="4000"></textarea>
                            
                            <div class="input-actions">
                                <button type="button" id="attach-btn" class="btn-icon" title="ضمیمه فایل">📎</button>
                                <button type="button" id="voice-btn" class="btn-icon" title="ضبط صوت">🎤</button>
                                <button type="submit" id="send-btn" class="btn-primary">
                                    <span class="send-icon">➤</span>
                                    ارسال
                                </button>
                            </div>
                        </div>
                        
                        <!-- نوار پیشرفت -->
                        <div id="progress-bar" class="progress-bar" style="display: none;">
                            <div class="progress-fill"></div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    </main>

    <!-- 🔊 TTS Floating Controls -->
    <div id="tts-floating-controls" class="tts-floating" style="display: none;">
        <div class="tts-content">
            <div class="tts-info">
                <span class="tts-status">در حال پخش...</span>
                <span class="tts-progress">0 / 100</span>
            </div>
            <div class="tts-controls">
                <button id="tts-pause-btn" class="btn-icon">⏸️</button>
                <button id="tts-stop-btn" class="btn-icon">⏹️</button>
                <button id="tts-close-btn" class="btn-icon">✖️</button>
            </div>
        </div>
    </div>

    <!-- ⚙️ TTS Settings Modal -->
    <div id="tts-settings-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔊 تنظیمات صوت</h2>
                <button class="modal-close" id="close-tts-settings">&times;</button>
            </div>
            
            <div class="modal-body">
                <form id="tts-settings-form">
                    <div class="form-group">
                        <label for="voice-select">صدا:</label>
                        <select id="voice-select">
                            <option value="alloy">Alloy</option>
                            <option value="echo">Echo</option>
                            <option value="fable">Fable</option>
                            <option value="onyx">Onyx</option>
                            <option value="nova">Nova</option>
                            <option value="shimmer">Shimmer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="speed-range">سرعت: <span id="speed-value">1.0</span></label>
                        <input type="range" id="speed-range" min="0.25" max="2.0" step="0.25" value="1.0">
                    </div>
                    
                    <div class="form-group">
                        <label for="quality-select">کیفیت:</label>
                        <select id="quality-select">
                            <option value="standard">استاندارد</option>
                            <option value="hd">بالا (HD)</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">ذخیره تنظیمات</button>
                        <button type="button" class="btn-secondary" id="test-voice-btn">تست صدا</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 🔄 Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay" style="display: none;">
        <div class="loading-content">
            <div class="spinner"></div>
            <p>در حال پردازش...</p>
        </div>
    </div>

    <!-- 📱 Scripts -->
    <script src="js/app.js"></script>
</body>
</html>
```

#### ویژگی‌های HTML:
- **Semantic Structure**: استفاده از عناصر semantic مناسب
- **Accessibility**: Aria labels و keyboard navigation
- **RTL Support**: dir="rtl" و lang="fa"
- **Mobile-First**: responsive meta viewport
- **Progressive Enhancement**: کار بدون JavaScript

---

## ⚙️ منطق JavaScript (`js/app.js`)

### ساختار کلی کد

```javascript
// ========================================
// 🔧 Global Variables & Configuration
// ========================================

// عناصر DOM اصلی
let chatForm = null;
let messageInput = null;
let messagesContainer = null;
let chatList = null;
let loginModal = null;
let userInfo = null;
let currentChatId = null;
let currentMessages = [];

// تنظیمات TTS
let ttsSettings = {
    voice: 'alloy',
    speed: 1.0,
    quality: 'standard',
    enabled: true
};

// وضعیت‌های سیستم
let isFloatingVisible = false;
let isPausedByUser = false;
let currentAudio = null;
let isLoggedIn = false;

// ========================================
// 🚀 Initialization & Event Setup
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 برنامه در حال راه‌اندازی...');
    
    // مقداردهی اولیه عناصر DOM
    initializeDOMElements();
    
    // تنظیم event listeners
    setupEventListeners();
    
    // بررسی وضعیت ورود
    checkAuthStatus();
    
    // بارگذاری تنظیمات
    loadSettings();
    
    console.log('✅ راه‌اندازی کامل شد');
});

// ========================================
// 🔗 DOM Elements Initialization
// ========================================

function initializeDOMElements() {
    // عناصر اصلی چت
    chatForm = document.getElementById('chat-form');
    messageInput = document.getElementById('message-input');
    messagesContainer = document.getElementById('messages');
    chatList = document.getElementById('chat-list');
    
    // عناصر احراز هویت
    loginModal = document.getElementById('login-modal');
    userInfo = document.getElementById('user-info');
    
    // عناصر TTS
    ttsFloatingControls = document.getElementById('tts-floating-controls');
    
    // بررسی موجودیت عناصر مهم
    if (!chatForm || !messageInput || !messagesContainer) {
        console.error('❌ عناصر DOM اصلی یافت نشدند');
        return;
    }
    
    console.log('✅ عناصر DOM مقداردهی شدند');
}

// ========================================
// 📡 Event Listeners Setup
// ========================================

function setupEventListeners() {
    
    // 💬 رویدادهای چت
    if (chatForm) {
        chatForm.addEventListener('submit', handleMessageSubmit);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keydown', handleMessageKeydown);
        messageInput.addEventListener('input', autoResize);
    }
    
    // 🔐 رویدادهای احراز هویت
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 📋 رویدادهای مدیریت چت
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', createNewChat);
    }
    
    const searchChats = document.getElementById('search-chats');
    if (searchChats) {
        searchChats.addEventListener('input', handleChatSearch);
    }
    
    // 🔊 رویدادهای TTS
    setupTTSEventListeners();
    
    // ⚙️ رویدادهای تنظیمات
    setupSettingsEventListeners();
    
    // 🔔 رویدادهای سیستم
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    console.log('✅ Event listeners تنظیم شدند');
}
```

### ویژگی‌های کلیدی JavaScript:

#### 1. مدیریت DOM مدرن
```javascript
// استفاده از DOMContentLoaded برای اطمینان از بارگذاری کامل
document.addEventListener('DOMContentLoaded', function() {
    // مقداردهی عناصر
    initializeDOMElements();
    
    // تنظیم event listeners
    setupEventListeners();
});

// مدیریت خطاهای DOM
function safely(fn, fallback = () => {}) {
    try {
        return fn();
    } catch (error) {
        console.warn('خطا در اجرای تابع:', error);
        return fallback();
    }
}
```

#### 2. سیستم TTS پیشرفته
```javascript
// تولید صوت با OpenAI TTS
async function generateTTS(text, messageElement) {
    try {
        showFloatingControls();
        
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voice: ttsSettings.voice,
                speed: ttsSettings.speed,
                quality: ttsSettings.quality
            })
        });
        
        if (!response.ok) {
            throw new Error(`خطای سرور: ${response.status}`);
        }
        
        const audioBlob = await response.blob();
        const audioURL = URL.createObjectURL(audioBlob);
        
        playAudio(audioURL, messageElement);
        
    } catch (error) {
        console.error('خطا در تولید صوت:', error);
        hideFloatingControls();
        showToast('خطا در تولید صوت: ' + error.message, 'error');
    }
}

// کنترل پخش صوت
function playAudio(audioURL, messageElement) {
    // توقف صدای قبلی
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentAudio = new Audio(audioURL);
    
    currentAudio.addEventListener('loadstart', () => {
        updateFloatingStatus('در حال بارگذاری...');
    });
    
    currentAudio.addEventListener('canplay', () => {
        updateFloatingStatus('آماده پخش');
    });
    
    currentAudio.addEventListener('play', () => {
        updateFloatingStatus('در حال پخش...');
        messageElement.classList.add('playing-audio');
    });
    
    currentAudio.addEventListener('pause', () => {
        updateFloatingStatus('متوقف شده');
        messageElement.classList.remove('playing-audio');
    });
    
    currentAudio.addEventListener('ended', () => {
        updateFloatingStatus('پایان پخش');
        messageElement.classList.remove('playing-audio');
        hideFloatingControls();
        URL.revokeObjectURL(audioURL); // آزادسازی حافظه
    });
    
    currentAudio.addEventListener('error', (e) => {
        console.error('خطا در پخش صوت:', e);
        hideFloatingControls();
        showToast('خطا در پخش صوت', 'error');
    });
    
    // شروع پخش
    currentAudio.play().catch(error => {
        console.error('خطا در شروع پخش:', error);
        hideFloatingControls();
    });
}
```

#### 3. مدیریت چت‌ها
```javascript
// بارگذاری لیست چت‌ها
async function loadChats() {
    try {
        const response = await fetch('/api/chats', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`خطای ${response.status}: ${response.statusText}`);
        }
        
        const chats = await response.json();
        displayChatList(chats);
        
    } catch (error) {
        console.error('خطا در بارگذاری چت‌ها:', error);
        showToast('خطا در بارگذاری چت‌ها', 'error');
    }
}

// نمایش لیست چت‌ها
function displayChatList(chats) {
    if (!chatList) return;
    
    chatList.innerHTML = '';
    
    if (chats.length === 0) {
        chatList.innerHTML = `
            <li class="no-chats">
                <p>هنوز چتی ندارید</p>
                <button onclick="createNewChat()" class="btn-primary btn-sm">
                    ایجاد اولین چت
                </button>
            </li>
        `;
        return;
    }
    
    // مرتب‌سازی چت‌ها (پین شده‌ها اول، سپس بر اساس آخرین فعالیت)
    chats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
    
    chats.forEach(chat => {
        const chatItem = createChatListItem(chat);
        chatList.appendChild(chatItem);
    });
}

// ایجاد آیتم چت در لیست
function createChatListItem(chat) {
    const li = document.createElement('li');
    li.className = 'chat-item';
    li.dataset.chatId = chat.id;
    
    if (chat.isPinned) li.classList.add('pinned');
    if (chat.isArchived) li.classList.add('archived');
    if (currentChatId === chat.id) li.classList.add('active');
    
    li.innerHTML = `
        <div class="chat-item-content" onclick="loadChat('${chat.id}')">
            <div class="chat-title">
                ${chat.isPinned ? '📌 ' : ''}
                ${chat.title || 'چت بدون عنوان'}
            </div>
            <div class="chat-meta">
                <span class="message-count">${chat.messageCount || 0} پیام</span>
                <span class="last-activity">${formatDate(chat.lastActivity)}</span>
            </div>
            ${chat.lastMessage ? `<div class="chat-preview">${truncate(chat.lastMessage, 50)}</div>` : ''}
        </div>
        
        <div class="chat-actions">
            <button onclick="event.stopPropagation(); togglePin('${chat.id}')" 
                    class="btn-icon ${chat.isPinned ? 'active' : ''}" 
                    title="${chat.isPinned ? 'حذف پین' : 'پین کردن'}">
                📌
            </button>
            <button onclick="event.stopPropagation(); toggleArchive('${chat.id}')" 
                    class="btn-icon ${chat.isArchived ? 'active' : ''}" 
                    title="${chat.isArchived ? 'خروج از آرشیو' : 'آرشیو'}">
                📦
            </button>
            <button onclick="event.stopPropagation(); deleteChat('${chat.id}')" 
                    class="btn-icon btn-danger" 
                    title="حذف چت">
                🗑️
            </button>
        </div>
    `;
    
    return li;
}
```

#### 4. امنیت و Performance
```javascript
// Debounce برای جستجو
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// جستجوی چت‌ها با debounce
const handleChatSearch = debounce(function(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    filterChats(searchTerm);
}, 300);

// فیلتر کردن چت‌ها
function filterChats(searchTerm) {
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const title = item.querySelector('.chat-title').textContent.toLowerCase();
        const preview = item.querySelector('.chat-preview')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(searchTerm) || preview.includes(searchTerm);
        item.style.display = matches ? 'block' : 'none';
    });
}

// Sanitization برای امنیت
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Escape کردن HTML
function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
```

---

## 🎨 استایل‌دهی CSS (`css/styles.css`)

### ساختار CSS

```css
    </div>
  </header>

  <!-- Login Section -->
  <section id="login-section" class="login-section">
    <!-- Login Form -->
  </section>

  <!-- Main App Section -->
  <main id="main-app" class="main-app" style="display: none;">
    <!-- Chat List Sidebar -->
    <aside class="sidebar">
      <div class="chat-list">
        <div class="new-chat-btn">
          <button id="new-chat-btn">+ چت جدید</button>
        </div>
        <div id="chats-list" class="chats"></div>
      </div>
    </aside>

    <!-- Chat Area -->
    <section class="chat-area">
      <div id="chat-header" class="chat-header"></div>
      <div id="messages-container" class="messages-container"></div>
      <div class="input-area">
        <div class="input-container">
          <textarea id="message-input" placeholder="پیام خود را بنویسید..."></textarea>
          <button id="send-btn">ارسال</button>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
```

### CSS Architecture (`css/styles.css`)

#### CSS Variables:
```css
:root {
  /* Primary Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #343a40;
  
  /* Text Colors */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-light: #ffffff;
  
  /* Borders & Shadows */
  --border-color: #dee2e6;
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
}
```

#### Layout System:
```css
/* Grid Layout for Main App */
.main-app {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr;
  height: calc(100vh - 80px);
}

/* Sidebar Styling */
.sidebar {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

/* Chat Area */
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Messages Container */
.messages-container {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
```

#### Message Styling:
```css
/* Message Bubbles */
.message {
  display: flex;
  margin-bottom: var(--spacing-md);
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: var(--spacing-md);
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: var(--primary-color);
  color: var(--text-light);
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}
```

### JavaScript Architecture (`js/app.js`)

#### Core State Management:
```javascript
// Global State
let currentUser = null;
let currentChatId = null;
let chats = [];
let isLoading = false;

// API Base Configuration
const API_BASE = '';
const headers = { 'Content-Type': 'application/json' };
```

#### Main Functions:

##### Authentication:
```javascript
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.username;
      showMainApp();
      await loadChats();
      updateUI();
    } else {
      const error = await response.json();
      showError(error.error);
    }
  } catch (error) {
    showError('خطا در ارتباط با سرور');
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    currentUser = null;
    currentChatId = null;
    chats = [];
    showLoginSection();
  } catch (error) {
    console.error('خطا در خروج:', error);
  }
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`);
    if (response.ok) {
      const data = await response.json();
      currentUser = data.username;
      showMainApp();
      await loadChats();
      updateUI();
    } else {
      showLoginSection();
    }
  } catch (error) {
    showLoginSection();
  }
}
```

##### Chat Management:
```javascript
async function loadChats() {
  try {
    const response = await fetch(`${API_BASE}/api/chats`);
    if (response.ok) {
      chats = await response.json();
      renderChatsList();
    }
  } catch (error) {
    showError('خطا در بارگذاری چت‌ها');
  }
}

async function createNewChat() {
  const subject = prompt('موضوع چت جدید:');
  if (!subject?.trim()) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subject: subject.trim() })
    });
    
    if (response.ok) {
      const newChat = await response.json();
      chats.unshift(newChat);
      renderChatsList();
      selectChat(newChat.id);
    } else {
      const error = await response.json();
      showError(error.error);
    }
  } catch (error) {
    showError('خطا در ایجاد چت جدید');
  }
}

async function loadChat(chatId) {
  try {
    const response = await fetch(`${API_BASE}/api/chats/${chatId}`);
    if (response.ok) {
      const chat = await response.json();
      currentChatId = chatId;
      renderMessages(chat.messages);
      updateChatHeader(chat.subject);
    }
  } catch (error) {
    showError('خطا در بارگذاری چت');
  }
}
```

##### Message Handling:
```javascript
async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();
  
  if (!content || !currentChatId || isLoading) return;
  
  isLoading = true;
  input.value = '';
  updateSendButton();
  
  // نمایش پیام کاربر
  addMessage('user', content);
  
  try {
    const response = await fetch(`${API_BASE}/api/chats/${currentChatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content, role: 'user' })
    });
    
    if (response.ok) {
      const data = await response.json();
      // نمایش پاسخ ربات
      addMessage('assistant', data.assistantMessage.content);
    } else {
      const error = await response.json();
      showError(error.error);
    }
  } catch (error) {
    showError('خطا در ارسال پیام');
  } finally {
    isLoading = false;
    updateSendButton();
  }
}
```

##### UI Rendering:
```javascript
function renderChatsList() {
  const container = document.getElementById('chats-list');
  
  if (chats.length === 0) {
    container.innerHTML = '<div class="no-chats">هنوز چتی ایجاد نکرده‌اید</div>';
    return;
  }
  
  container.innerHTML = chats.map(chat => `
    <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" 
         onclick="selectChat('${chat.id}')">
      <div class="chat-title">${escapeHtml(chat.subject)}</div>
      <div class="chat-date">${formatDate(chat.createdAt)}</div>
      <button class="delete-chat" onclick="deleteChat('${chat.id}', event)">🗑️</button>
    </div>
  `).join('');
}

function renderMessages(messages) {
  const container = document.getElementById('messages-container');
  
  container.innerHTML = messages.map(message => `
    <div class="message ${message.role}">
      <div class="message-content">
        <div class="message-text">${formatMessage(message.content)}</div>
        <div class="message-time">${formatTime(message.timestamp)}</div>
      </div>
    </div>
  `).join('');
  
  scrollToBottom();
}

function addMessage(role, content) {
  const container = document.getElementById('messages-container');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}`;
  messageElement.innerHTML = `
    <div class="message-content">
      <div class="message-text">${formatMessage(content)}</div>
      <div class="message-time">${formatTime(new Date().toISOString())}</div>
    </div>
  `;
  
  container.appendChild(messageElement);
  scrollToBottom();
}
```

---

## Admin Dashboard

### HTML Structure (`admin/dashboard.html`)

#### Core Layout:
```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پنل مدیریت</title>
  <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <div id="admin-app">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <h1>پنل مدیریت</h1>
        <div class="header-actions">
          <span id="admin-username"></span>
          <button id="logout-btn" class="btn btn-secondary">خروج</button>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <nav class="admin-sidebar">
      <div class="sidebar-content">
        <div class="menu-item active" data-section="users">
          <span class="icon">👥</span>
          <span>مدیریت کاربران</span>
        </div>
        <div class="menu-item" data-section="stats">
          <span class="icon">📊</span>
          <span>آمار سیستم</span>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Users Section -->
      <section id="users-section" class="content-section active">
        <div class="section-header">
          <h2>مدیریت کاربران</h2>
          <button id="add-user-btn" class="btn btn-primary">+ افزودن کاربر</button>
        </div>
        
        <div class="users-grid" id="users-grid">
          <!-- Users will be loaded here -->
        </div>
      </section>

      <!-- Stats Section -->
      <section id="stats-section" class="content-section">
        <h2>آمار سیستم</h2>
        <div class="stats-grid">
          <!-- Stats cards -->
        </div>
      </section>
    </main>
  </div>

  <!-- Add/Edit User Modal -->
  <div id="user-modal" class="modal">
    <div class="modal-content">
      <h2 id="modal-title">افزودن کاربر جدید</h2>
      <form id="user-form" class="modal-form">
        <!-- Form fields -->
      </form>
    </div>
  </div>
</body>
</html>
```

### CSS Architecture (`admin/admin.css`)

#### Admin Color Scheme:
```css
:root {
  --admin-primary: #2c3e50;
  --admin-secondary: #3498db;
  --admin-success: #27ae60;
  --admin-warning: #f39c12;
  --admin-danger: #e74c3c;
  --admin-light: #ecf0f1;
  --admin-dark: #34495e;
  --admin-border: #bdc3c7;
}
```

#### Grid Layout:
```css
#admin-app {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main";
  grid-template-rows: auto 1fr;
  grid-template-columns: 250px 1fr;
  height: 100vh;
}

.admin-header { grid-area: header; }
.admin-sidebar { grid-area: sidebar; }
.admin-main { grid-area: main; }
```

#### Modal System:
```css
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-form {
    grid-template-columns: 1fr;
  }
  
  #admin-app {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
  
  .admin-sidebar {
    display: none;
  }
}
```

### JavaScript Architecture (`admin/admin.js`)

#### Core State:
```javascript
let users = [];
let currentUser = null;
let editingUser = null;

// Logging System
function logInfo(message, data = null) {
  console.log(`ℹ️ [INFO] ${message}`, data || '');
}

function logError(message, error = null) {
  console.error(`❌ [ERROR] ${message}`, error || '');
}

function logWarning(message, data = null) {
  console.warn(`⚠️ [WARNING] ${message}`, data || '');
}
```

#### Admin Functions:
```javascript
async function loadUsers() {
  try {
    logInfo('شروع بارگذاری کاربران...');
    const response = await fetch('/api/admin/users');
    
    if (response.ok) {
      users = await response.json();
      logInfo('کاربران با موفقیت بارگذاری شدند', `تعداد: ${users.length}`);
      renderUsers();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    logError('خطا در بارگذاری کاربران', error);
    showNotification('خطا در بارگذاری کاربران', 'error');
  }
}

async function createUser(userData) {
  try {
    logInfo('شروع ایجاد کاربر جدید...', userData.username);
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      logInfo('کاربر با موفقیت ایجاد شد', userData.username);
      closeModal();
      await loadUsers();
      showNotification('کاربر با موفقیت ایجاد شد', 'success');
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    logError('خطا در ایجاد کاربر', error);
    showNotification(error.message, 'error');
  }
}

async function updateUser(username, userData) {
  try {
    logInfo('شروع به‌روزرسانی کاربر...', username);
    const response = await fetch(`/api/admin/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      logInfo('کاربر با موفقیت به‌روزرسانی شد', username);
      closeModal();
      await loadUsers();
      showNotification('کاربر با موفقیت به‌روزرسانی شد', 'success');
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    logError('خطا در به‌روزرسانی کاربر', error);
    showNotification(error.message, 'error');
  }
}
```

#### UI Rendering:
```javascript
function renderUsers() {
  const grid = document.getElementById('users-grid');
  
  if (users.length === 0) {
    grid.innerHTML = '<div class="no-users">هیچ کاربری یافت نشد</div>';
    return;
  }
  
  grid.innerHTML = users.map(user => `
    <div class="user-card ${user.isActive ? 'active' : 'inactive'}">
      <div class="user-header">
        <div class="user-avatar">${user.firstName?.[0] || user.username[0]}</div>
        <div class="user-info">
          <h3>${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h3>
          <p class="user-role ${user.role}">${user.role === 'admin' ? 'مدیر' : 'کاربر'}</p>
        </div>
        <div class="user-status">
          <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
            ${user.isActive ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
      </div>
      
      <div class="user-details">
        <div class="detail-item">
          <span class="label">نام کاربری:</span>
          <span class="value">${user.username}</span>
        </div>
        ${user.email ? `
          <div class="detail-item">
            <span class="label">ایمیل:</span>
            <span class="value">${user.email}</span>
          </div>
        ` : ''}
        ${user.mobile ? `
          <div class="detail-item">
            <span class="label">موبایل:</span>
            <span class="value">${user.mobile}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">${user.stats?.totalChats || 0}</span>
          <span class="stat-label">چت</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${user.stats?.totalMessages || 0}</span>
          <span class="stat-label">پیام</span>
        </div>
      </div>
      
      <div class="user-actions">
        <button class="btn btn-sm btn-secondary" onclick="editUser('${user.username}')">
          ویرایش
        </button>
        ${user.username !== currentUser ? `
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.username}')">
            حذف
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}
```

---

## Responsive Design

### Breakpoints:
```css
/* Mobile First Approach */
/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) { ... }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { ... }

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) { ... }

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) { ... }
```

### Mobile Adaptations:
```css
@media (max-width: 768px) {
  /* Main Chat Interface */
  .main-app {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    right: -300px;
    height: 100vh;
    transition: right 0.3s ease;
    z-index: 1000;
  }
  
  .sidebar.open {
    right: 0;
  }
  
  /* Admin Dashboard */
  #admin-app {
    grid-template-columns: 1fr;
    grid-template-areas: "header" "main";
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-form {
    grid-template-columns: 1fr;
  }
}
```

---

## Performance Optimization

### JavaScript Optimization:
```javascript
// Debounced Search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Lazy Loading for Large Lists
function lazyLoadUsers(page = 1, limit = 20) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return users.slice(start, end);
}

// Virtual Scrolling for Messages
function virtualScroll(container, items, itemHeight) {
  const visibleCount = Math.ceil(container.clientHeight / itemHeight);
  const scrollTop = container.scrollTop;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  return items.slice(startIndex, endIndex);
}
```

### CSS Optimization:
```css
/* Use transform for animations (GPU accelerated) */
.slide-in {
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
}

.slide-in.active {
  transform: translateX(0);
}

/* Optimize repaints with will-change */
.message {
  will-change: transform;
}

/* Use contain for better performance */
.messages-container {
  contain: layout style paint;
}
```

---

## Accessibility (A11y)

### ARIA Labels:
```html
<button id="send-btn" aria-label="ارسال پیام">ارسال</button>
<div class="message user" role="article" aria-label="پیام کاربر">
<div class="message assistant" role="article" aria-label="پاسخ ربات">
```

### Keyboard Navigation:
```javascript
// Focus Management
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// Escape to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.modal:not([style*="display: none"])')) {
    closeModal();
  }
});
```

### Screen Reader Support:
```html
<div class="sr-only">متن فقط برای screen reader</div>
<button aria-expanded="false" aria-controls="menu">منو</button>
<div id="menu" aria-hidden="true">محتوای منو</div>
```

---

## Testing Guidelines

### Unit Testing:
```javascript
// Test Authentication
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const response = await login('testuser', 'password');
    expect(response.success).toBe(true);
  });
  
  test('should handle invalid credentials', async () => {
    try {
      await login('invalid', 'wrong');
    } catch (error) {
      expect(error.message).toContain('گذرواژه نادرست');
    }
  });
});

// Test Message Rendering
describe('Message Rendering', () => {
  test('should render user message correctly', () => {
    const message = { role: 'user', content: 'سلام', timestamp: new Date().toISOString() };
    const element = createMessageElement(message);
    expect(element.classList).toContain('user');
    expect(element.textContent).toContain('سلام');
  });
});
```

### E2E Testing:
```javascript
// Cypress Example
describe('Chat Flow', () => {
  it('should complete full chat flow', () => {
    cy.visit('/');
    cy.get('#username').type('testuser');
    cy.get('#password').type('password');
    cy.get('#login-btn').click();
    
    cy.get('#new-chat-btn').click();
    cy.get('#message-input').type('سلام');
    cy.get('#send-btn').click();
    
    cy.get('.message.assistant').should('be.visible');
  });
});
```

---

## Build Process

### Development:
```bash
# Start development server
node server.js

# Watch CSS changes
sass --watch css/styles.scss:css/styles.css

# Live reload
live-server --port=3001 --proxy="/api:http://localhost:3000"
```

### Production:
```bash
# Minify CSS
cleancss -o css/styles.min.css css/styles.css

# Minify JavaScript  
uglifyjs js/app.js -o js/app.min.js

# Optimize images
imagemin images/* --out-dir=images/optimized
```
