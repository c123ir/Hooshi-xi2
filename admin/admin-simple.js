// Admin Panel Simple Test - Version 1.0
console.log('🔧 Admin panel شروع بارگذاری...');

// المنت‌های اصلی
let elements = {};

// تابع اولیه
function initializeElements() {
    console.log('🔍 جستجوی المنت‌ها...');
    
    elements = {
        // ناوبری - با data-section
        navDashboard: document.querySelector('[data-section="dashboard"]'),
        navUsers: document.querySelector('[data-section="users"]'),
        navStats: document.querySelector('[data-section="stats"]'),
        navSystem: document.querySelector('[data-section="system"]'),
        navSettings: document.querySelector('[data-section="settings"]'),
        
        // بخش‌ها
        dashboardSection: document.getElementById('dashboard-section'),
        usersSection: document.getElementById('users-section'),
        statsSection: document.getElementById('stats-section'),
        systemSection: document.getElementById('system-section'),
        settingsSection: document.getElementById('settings-section'),
        
        // آمار
        totalUsersSpan: document.getElementById('totalUsers'),
        totalChatsSpan: document.getElementById('totalChats'),
        totalMessagesSpan: document.getElementById('totalMessages'),
        systemUptimeSpan: document.getElementById('systemUptime'),
        
        // جدول کاربران
        usersTableBody: document.getElementById('usersTableBody')
    };
    
    console.log('✅ المنت‌های پیدا شده:', Object.keys(elements).filter(key => elements[key]));
    console.log('❌ المنت‌های گم شده:', Object.keys(elements).filter(key => !elements[key]));
}

// بررسی احراز هویت
async function checkAuth() {
    console.log('🔐 بررسی احراز هویت...');
    try {
        const response = await makeAuthenticatedRequest('/api/auth/me');
        if (!response.ok) {
            console.log('❌ احراز هویت ناموفق - انتقال به صفحه اصلی');
            window.location.href = '/';
            return false;
        }
        
        const user = await response.json();
        console.log('✅ کاربر احراز شده:', user.username);
        
        if (user.role !== 'admin') {
            console.log('❌ دسترسی ممنوع - کاربر ادمین نیست');
            alert('دسترسی ممنوع - شما مجوز دسترسی به پنل ادمین را ندارید');
            window.location.href = '/';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('خطا در بررسی احراز هویت:', error);
        return false;
    }
}

// تابع helper برای درخواست‌های معتبر
async function makeAuthenticatedRequest(url, options = {}) {
    const defaultOptions = {
        credentials: 'include', // ارسال کوکی‌ها
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    return fetch(url, defaultOptions);
}

// بارگذاری داشبورد
async function loadDashboard() {
    console.log('📊 بارگذاری داشبورد...');
    
    if (elements.totalUsersSpan) {
        elements.totalUsersSpan.textContent = 'در حال بارگذاری...';
    }
    
    try {
        // بارگذاری آمار
        const response = await makeAuthenticatedRequest('/api/admin/stats');
        if (response.ok) {
            const stats = await response.json();
            console.log('📈 آمار دریافت شد:', stats);
            
            if (elements.totalUsersSpan) {
                elements.totalUsersSpan.textContent = stats.totalUsers || '0';
            }
            if (elements.totalChatsSpan) {
                elements.totalChatsSpan.textContent = stats.totalChats || '0';
            }
            if (elements.totalMessagesSpan) {
                elements.totalMessagesSpan.textContent = stats.totalMessages || '0';
            }
            if (elements.systemUptimeSpan) {
                const uptimeHours = Math.round(stats.uptime / 3600) || 0;
                elements.systemUptimeSpan.textContent = uptimeHours;
            }
            
            // تاریخ آخرین به‌روزرسانی
            const lastUpdateElement = document.getElementById('lastUpdate');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = new Date().toLocaleString('fa-IR');
            }
            
            console.log('✅ آمار نمایش داده شد');
        } else {
            console.error('❌ خطا در دریافت آمار:', response.status);
            if (elements.totalUsersSpan) {
                elements.totalUsersSpan.textContent = 'خطا';
            }
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری آمار:', error);
        if (elements.totalUsersSpan) {
            elements.totalUsersSpan.textContent = 'خطا';
        }
    }
}

// نمایش بخش
function showSection(sectionName) {
    console.log('🔄 نمایش بخش:', sectionName);
    
    // مخفی کردن همه بخش‌ها
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // غیرفعال کردن همه ناوها
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // نمایش بخش انتخابی
    const targetSection = document.getElementById(sectionName + '-section');
    const targetNav = document.querySelector(`[data-section="${sectionName}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('✅ بخش نمایش داده شد:', sectionName);
    } else {
        console.log('❌ بخش پیدا نشد:', sectionName + '-section');
    }
    
    if (targetNav) {
        targetNav.classList.add('active');
        console.log('✅ ناو فعال شد:', sectionName);
    } else {
        console.log('❌ ناو پیدا نشد:', sectionName);
    }
    
    // بارگذاری محتوای مربوطه
    if (sectionName === 'dashboard') {
        loadDashboard();
    } else if (sectionName === 'users') {
        // استفاده از UserManager برای مدیریت کاربران
        if (window.userManager) {
            window.userManager.loadUsers();
        }
    } else if (sectionName === 'stats') {
        loadStats();
    } else if (sectionName === 'system') {
        loadSystemStatus();
    } else if (sectionName === 'settings') {
        loadSettings();
    }
}

// بارگذاری تنظیمات
function loadSettings() {
    console.log('⚙️ بارگذاری تنظیمات...');
    
    // اینجا می‌توانید تنظیمات را از سرور بارگذاری کنید
    // فعلاً مقادیر پیش‌فرض را نمایش می‌دهیم
    
    const lastBackupElement = document.getElementById('lastBackup');
    if (lastBackupElement) {
        lastBackupElement.textContent = 'هرگز';
    }
    
    // Event listeners برای دکمه‌های تنظیمات
    setupSettingsEvents();
    
    console.log('✅ تنظیمات بارگذاری شد');
}

// راه‌اندازی رویدادهای تنظیمات
function setupSettingsEvents() {
    const saveBtn = document.getElementById('saveSettings');
    const resetBtn = document.getElementById('resetSettings');
    const backupBtn = document.getElementById('createBackup');
    const restoreBtn = document.getElementById('restoreBackup');
    const exportBtn = document.getElementById('exportData');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
    
    if (backupBtn) {
        backupBtn.addEventListener('click', createBackup);
    }
    
    if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreBackup);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
}

// ذخیره تنظیمات
function saveSettings() {
    console.log('💾 ذخیره تنظیمات...');
    
    // جمع‌آوری تنظیمات از فرم
    const settings = {
        siteName: document.getElementById('siteName')?.value,
        maxUsers: document.getElementById('maxUsers')?.value,
        maintenanceMode: document.getElementById('maintenanceMode')?.checked,
        maxChatLength: document.getElementById('maxChatLength')?.value,
        allowFileUpload: document.getElementById('allowFileUpload')?.checked,
        autoSave: document.getElementById('autoSave')?.checked,
        sessionTimeout: document.getElementById('sessionTimeout')?.value,
        requireAuth: document.getElementById('requireAuth')?.checked,
        logUserActivity: document.getElementById('logUserActivity')?.checked
    };
    
    console.log('📋 تنظیمات جمع‌آوری شد:', settings);
    
    // اینجا می‌توانید تنظیمات را به سرور ارسال کنید
    alert('تنظیمات با موفقیت ذخیره شد!');
}

// بازگردانی تنظیمات پیش‌فرض
function resetSettings() {
    if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
        console.log('🔄 بازگردانی تنظیمات پیش‌فرض...');
        
        // بازگردانی مقادیر پیش‌فرض
        if (document.getElementById('siteName')) document.getElementById('siteName').value = 'پنل مدیریت چت';
        if (document.getElementById('maxUsers')) document.getElementById('maxUsers').value = '1000';
        if (document.getElementById('maintenanceMode')) document.getElementById('maintenanceMode').checked = false;
        if (document.getElementById('maxChatLength')) document.getElementById('maxChatLength').value = '4000';
        if (document.getElementById('allowFileUpload')) document.getElementById('allowFileUpload').checked = true;
        if (document.getElementById('autoSave')) document.getElementById('autoSave').checked = true;
        if (document.getElementById('sessionTimeout')) document.getElementById('sessionTimeout').value = '60';
        if (document.getElementById('requireAuth')) document.getElementById('requireAuth').checked = true;
        if (document.getElementById('logUserActivity')) document.getElementById('logUserActivity').checked = true;
        
        alert('تنظیمات به حالت پیش‌فرض بازگردانده شد!');
    }
}

// ایجاد پشتیبان
function createBackup() {
    console.log('📦 ایجاد پشتیبان...');
    alert('پشتیبان‌گیری شروع شد. این عملیات ممکن است چند دقیقه طول بکشد.');
    
    // اینجا می‌توانید درخواست پشتیبان‌گیری را به سرور ارسال کنید
    setTimeout(() => {
        const lastBackupElement = document.getElementById('lastBackup');
        if (lastBackupElement) {
            lastBackupElement.textContent = new Date().toLocaleString('fa-IR');
        }
        alert('پشتیبان با موفقیت ایجاد شد!');
    }, 2000);
}

// بازیابی از پشتیبان
function restoreBackup() {
    if (confirm('آیا مطمئن هستید که می‌خواهید از پشتیبان بازیابی کنید؟ این عملیات غیرقابل برگشت است.')) {
        console.log('📥 بازیابی از پشتیبان...');
        alert('بازیابی شروع شد. لطفاً صبر کنید...');
    }
}

// صادر کردن داده‌ها
function exportData() {
    console.log('📤 صادر کردن داده‌ها...');
    alert('صادر کردن داده‌ها شروع شد. فایل به زودی دانلود خواهد شد.');
}

// ویرایش کاربر
function editUser(username) {
    console.log('✏️ ویرایش کاربر:', username);
    
    const newUsername = prompt(`نام کاربری جدید برای "${username}":`, username);
    if (newUsername && newUsername !== username) {
        if (confirm(`آیا مطمئن هستید که می‌خواهید نام کاربری "${username}" را به "${newUsername}" تغییر دهید؟`)) {
            console.log(`🔄 تغییر نام کاربری از "${username}" به "${newUsername}"`);
            
            // اینجا می‌توانید درخواست ویرایش را به سرور ارسال کنید
            // fetch(`/api/admin/users/${username}`, { method: 'PUT', ... })
            
            alert(`نام کاربری با موفقیت به "${newUsername}" تغییر یافت.`);
            
            // بارگذاری مجدد لیست کاربران
            loadUsers();
        }
    }
}

// حذف کاربر
function deleteUser(username) {
    console.log('🗑️ درخواست حذف کاربر:', username);
    
    if (username === 'admin') {
        alert('امکان حذف کاربر ادمین وجود ندارد!');
        return;
    }
    
    if (confirm(`آیا مطمئن هستید که می‌خواهید کاربر "${username}" را حذف کنید؟\n\nاین عملیات غیرقابل برگشت است و تمام چت‌ها و داده‌های این کاربر نیز حذف خواهد شد.`)) {
        console.log(`❌ حذف کاربر: ${username}`);
        
        // اینجا می‌توانید درخواست حذف را به سرور ارسال کنید
        fetch(`/api/admin/users/${username}`, { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert(`کاربر "${username}" با موفقیت حذف شد.`);
                
                // بارگذاری مجدد لیست کاربران
                loadUsers();
                
                // بارگذاری مجدد آمار داشبورد
                loadDashboard();
            } else {
                throw new Error(`خطا در حذف کاربر: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('❌ خطا در حذف کاربر:', error);
            alert(`خطا در حذف کاربر: ${error.message}`);
        });
    }
}

// بارگذاری آمار و گزارش
async function loadStats() {
    console.log('📊 بارگذاری آمار تفصیلی...');
    
    try {
        // درخواست آمار کش سیستم
        const cacheResponse = await makeAuthenticatedRequest('/api/cache/stats');
        if (cacheResponse.ok) {
            const cacheStats = await cacheResponse.json();
            console.log('💾 آمار کش دریافت شد:', cacheStats);
            
            // نمایش آمار کش در بخش stats
            displayCacheStats(cacheStats);
        } else {
            console.error('❌ خطا در دریافت آمار کش:', cacheResponse.status, cacheResponse.statusText);
        }
        
        // درخواست آمار کلی
        const adminResponse = await makeAuthenticatedRequest('/api/admin/stats');
        if (adminResponse.ok) {
            const adminStats = await adminResponse.json();
            console.log('📈 آمار ادمین دریافت شد:', adminStats);
            
            // نمایش نمودارها و آمار تفصیلی
            displayDetailedStats(adminStats);
        } else {
            console.error('❌ خطا در دریافت آمار ادمین:', adminResponse.status, adminResponse.statusText);
        }
        
    } catch (error) {
        console.error('❌ خطا در بارگذاری آمار:', error);
    }
}

// نمایش آمار کش
function displayCacheStats(stats) {
    // اینجا می‌توانید آمار کش را در بخش stats نمایش دهید
    console.log('💾 نمایش آمار کش:', stats);
}

// نمایش آمار تفصیلی  
function displayDetailedStats(stats) {
    // اینجا می‌توانید نمودارها و آمار تفصیلی را نمایش دهید
    console.log('📊 نمایش آمار تفصیلی:', stats);
}

// بارگذاری وضعیت سیستم
async function loadSystemStatus() {
    console.log('🖥️ بارگذاری وضعیت سیستم...');
    
    try {
        // درخواست Health Check
        const healthResponse = await makeAuthenticatedRequest('/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('💚 وضعیت سلامت سیستم:', healthData);
            
            // نمایش وضعیت سیستم
            displaySystemHealth(healthData);
        }
        
    } catch (error) {
        console.error('❌ خطا در بارگذاری وضعیت سیستم:', error);
    }
}

// نمایش وضعیت سلامت سیستم
function displaySystemHealth(health) {
    console.log('🖥️ نمایش وضعیت سیستم:', health);
    
    // نمایش CPU Usage
    const cpuElement = document.getElementById('cpuUsage');
    if (cpuElement && health.resources && health.resources.cpu) {
        cpuElement.style.width = `${health.resources.cpu.usage}%`;
        cpuElement.setAttribute('data-percentage', `${health.resources.cpu.usage}%`);
    }
    
    // نمایش Memory Usage
    const memoryElement = document.getElementById('memoryUsage');
    if (memoryElement && health.resources && health.resources.memory) {
        const memoryPercentage = (health.resources.memory.used / health.resources.memory.total) * 100;
        memoryElement.style.width = `${memoryPercentage.toFixed(1)}%`;
        memoryElement.setAttribute('data-percentage', `${memoryPercentage.toFixed(1)}%`);
    }
    
    // نمایش Disk Usage
    const diskElement = document.getElementById('diskUsage');
    if (diskElement && health.resources && health.resources.disk) {
        const diskPercentage = (health.resources.disk.used / health.resources.disk.total) * 100;
        diskElement.style.width = `${diskPercentage.toFixed(1)}%`;
        diskElement.setAttribute('data-percentage', `${diskPercentage.toFixed(1)}%`);
    }
}

// راه‌اندازی رویدادها
function setupEvents() {
    console.log('🎯 راه‌اندازی رویدادها...');
    
    // رویداد کلیک برای تمام nav-item ها
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = navItem.getAttribute('data-section');
            showSection(sectionName);
        });
    });
    
    // UserManager handles its own event listeners, no need to set them here
    
    console.log('✅ رویدادها راه‌اندازی شد');
}

// شروع برنامه
async function init() {
    console.log('🚀 شروع admin panel...');
    
    // منتظر بارگذاری کامل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    initializeElements();
    
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    
    setupEvents();
    showSection('dashboard'); // نمایش داشبورد به عنوان صفحه اول
    
    // مقداردهی UserManager
    if (window.UserManager) {
        window.userManager = new UserManager();
        console.log('✅ UserManager initialized');
    } else {
        console.warn('⚠️ UserManager class not found');
    }
    
    console.log('✅ Admin panel آماده است');
}

// شروع برنامه
init();
