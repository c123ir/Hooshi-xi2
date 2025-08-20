/**
 * ماژول رابط کاربری - UI Module  
 * @author Agent ChatGPT
 * @version 2.0.0
 */

// عناصر DOM
let sidebar, sidebarOverlay, settingsModal;

// مقداردهی
function initDOM() {
    sidebar = document.getElementById('sidebar');
    sidebarOverlay = document.getElementById('sidebar-overlay');
    settingsModal = document.getElementById('settingsModal');
}

// مدیریت سایدبار
function toggleSidebar() {
    if (sidebar && sidebarOverlay) {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            sidebar.classList.remove('open');
            sidebarOverlay.style.display = 'none';
        } else {
            sidebar.classList.add('open');
            sidebarOverlay.style.display = 'block';
        }
    }
}

function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('open');
        sidebarOverlay.style.display = 'none';
    }
}

// تنظیم Event Listeners
function setupEventListeners() {
    // منوی همبرگری
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
    
    // بستن سایدبار
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // بستن سایدبار با کلیک روی پس‌زمینه
    document.addEventListener('click', (e) => {
        if (!sidebar?.contains(e.target) && !e.target.closest('#menuToggle')) {
            closeSidebar();
        }
    });
    
    // تنظیمات
    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
    
    // بستن تنظیمات
    document.getElementById('closeSettingsBtn')?.addEventListener('click', closeSettings);
    
    // ذخیره تنظیمات
    document.getElementById('saveModelBtn')?.addEventListener('click', saveSettings);
    
    // چت جدید
    document.getElementById('newChatBtn')?.addEventListener('click', () => {
        if (window.ChatModule) window.ChatModule.newChat();
        closeSidebar();
    });
    
    // دکمه پنل ادمین
    document.getElementById('adminPanelBtn')?.addEventListener('click', () => {
        window.open('/admin/dashboard.html', '_blank');
    });
}

// مدیریت تنظیمات
function openSettings() {
    const selectedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) modelSelect.value = selectedModel;
    
    if (settingsModal) settingsModal.style.display = 'flex';
}

function closeSettings() {
    if (settingsModal) settingsModal.style.display = 'none';
}

function saveSettings() {
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        localStorage.setItem('openai_model', modelSelect.value);
        showNotification('تنظیمات ذخیره شد');
    }
    closeSettings();
}

// کپی کردن
function copyToClipboard(text, button = null) {
    navigator.clipboard.writeText(text).then(() => {
        if (button) {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 1000);
        }
        showNotification('متن کپی شد');
    }).catch(() => {
        showNotification('خطا در کپی کردن');
    });
}

// نوتیفیکیشن
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.ui-notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = `ui-notification ${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px;
        background: ${type === 'error' ? '#e74c3c' : '#2ecc71'}; color: white;
        border-radius: 5px; z-index: 10000; opacity: 0;
        transition: opacity 0.3s ease; font-size: 14px;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.style.opacity = '1', 10);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// نمایش محدودیت
function showLimitNotification(message) {
    showNotification(message, 'error');
}

// مقداردهی ماژول UI
function init() {
    initDOM();
    setupEventListeners();
    console.log('ماژول UI مقداردهی شد');
}

// Export کردن توابع
if (typeof window !== 'undefined') {
    window.UIModule = {
        init,
        toggleSidebar,
        closeSidebar,
        showNotification,
        copyToClipboard
    };
}

console.log('📦 ماژول UI بارگذاری شد - UIModule در window قرار گرفت');
