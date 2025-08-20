/**
 * ماژول رابط کاربری - UI Module  
 * @author Agent ChatGPT
 * @version 2.0.0
 */

// عناصر DOM و وضعیت اولیه
let sidebar, sidebarOverlay, settingsModal;
let uiInitialized = false; // جلوگیری از افزودن چندباره لیسنرها

// مقداردهی
function initDOM() {
    sidebar = document.getElementById('sidebar');
    sidebarOverlay = document.getElementById('sidebar-overlay');
    settingsModal = document.getElementById('settingsModal');
}

// مدیریت سایدبار
function toggleSidebar() {
    console.log('🔥 toggleSidebar called!');
    if (sidebar && sidebarOverlay) {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    // بروزرسانی aria-expanded برای دسترس‌پذیری
    const btn = document.getElementById('menuToggle');
    if (btn) btn.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
        console.log(`Sidebar is now ${sidebar.classList.contains('open') ? 'open' : 'closed'}`);
    } else {
        console.error('❌ sidebar یا sidebarOverlay پیدا نشد!');
    }
}

function closeSidebar() {
    console.log('🔒 closeSidebar called');
    if (sidebar && sidebarOverlay && sidebar.classList.contains('open')) {
        console.log('🔒 در حال بستن سایدبار از closeSidebar...');
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    const btn = document.getElementById('menuToggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

// تنظیم Event Listeners
function setupEventListeners() {
    console.log('🔧 تنظیم UI Event Listeners...');
    if (uiInitialized) {
        console.log('⚠️ UI Event Listeners قبلا تنظیم شده‌اند، عبور.');
        return;
    }
    uiInitialized = true;
    
    // منوی همبرگری - تفویض رویداد در فاز capture برای اطمینان
    document.addEventListener('click', function onMenuCapture(e) {
        const btn = e.target && (e.target.id === 'menuToggle' ? e.target : e.target.closest && e.target.closest('#menuToggle'));
        if (btn) {
            console.log('🔥 UI Module: menuToggle (delegated, capture) clicked!', e);
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        }
    }, true);
    console.log('✅ menuToggle delegated listener ثبت شد (capture)');
    
    // بستن سایدبار با overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function(e) {
            console.log('🔥 Overlay clicked - بستن سایدبار');
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
        console.log('✅ sidebarOverlay event listener اضافه شد');
    } else {
        console.warn('⚠️ sidebarOverlay element پیدا نشد!');
    }
    
    // رویداد عمومی برای بستن سایدبار
    document.addEventListener('click', function(e) {
        // فقط اگر sidebar در حالت موبایل باز است
        if (sidebar && sidebar.classList.contains('open')) {
            console.log('🔍 Document click - target:', e.target.tagName, e.target.className);
            console.log('🔍 Target element:', e.target);
            
            // بررسی اینکه آیا کلیک داخل sidebar بوده یا خیر
            const clickedInsideSidebar = sidebar.contains(e.target);
            const clickedOnMenuToggle = e.target.closest('#menuToggle');
            
            console.log('🔍 clickedInsideSidebar:', clickedInsideSidebar);
            console.log('🔍 clickedOnMenuToggle:', clickedOnMenuToggle);
            
            // اگر کلیک خارج از sidebar و دکمه منو بود
            if (!clickedInsideSidebar && !clickedOnMenuToggle) {
                console.log('🔥 کلیک خارج از sidebar - بستن منو');
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
            }
            
            // اگر روی چت کلیک شد
            if (e.target.closest('.chat-list li')) {
                console.log('🔥 کلیک روی چت - بستن منو');
                setTimeout(() => closeSidebar(), 150);
            }
        }
    }, false); // استفاده از bubble phase

    // بستن سایدبار در تغییر اندازه به دسکتاپ
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // تنظیمات - اتصال به SettingsModule
    document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
        console.log('🔥 Settings button clicked!');
        e.preventDefault();
        if (window.SettingsModule && typeof window.SettingsModule.openSettings === 'function') {
            console.log('✅ Opening settings via SettingsModule');
            window.SettingsModule.openSettings();
        } else {
            console.error('❌ SettingsModule یا openSettings function پیدا نشد!', {
                SettingsModule: !!window.SettingsModule,
                openSettings: window.SettingsModule ? typeof window.SettingsModule.openSettings : 'N/A'
            });
        }
        closeSidebar();
    });
    
    // تنظیمات TTS - اتصال به TTSModule  
    document.getElementById('ttsSettingsBtn')?.addEventListener('click', (e) => {
        console.log('🔥 TTS Settings button clicked!');
        e.preventDefault();
        if (window.TTSModule && typeof window.TTSModule.openTTSSettings === 'function') {
            console.log('✅ Opening TTS settings via TTSModule');
            window.TTSModule.openTTSSettings();
        } else {
            console.error('❌ TTSModule یا openTTSSettings function پیدا نشد!', {
                TTSModule: !!window.TTSModule,
                openTTSSettings: window.TTSModule ? typeof window.TTSModule.openTTSSettings : 'N/A'
            });
        }
    });
    
    // بستن تنظیمات - deprecated, will be removed when SettingsModule fully takes over
    // document.getElementById('closeSettingsBtn')?.addEventListener('click', closeSettings);
    
    // ذخیره تنظیمات - deprecated, will be removed when SettingsModule fully takes over  
    // document.getElementById('saveModelBtn')?.addEventListener('click', saveSettings);
    
    // چت جدید
    document.getElementById('newChatBtn')?.addEventListener('click', () => {
        if (window.ChatModule) window.ChatModule.newChat();
        closeSidebar();
    });
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

// اطمینان از مقداردهی حتی اگر app.js معطل سایر ماژول‌ها بماند
try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.UIModule && typeof window.UIModule.init === 'function') {
                window.UIModule.init();
            }
        });
    } else {
        if (window.UIModule && typeof window.UIModule.init === 'function') {
            window.UIModule.init();
        }
    }
} catch (e) {
    console.warn('⚠️ خطا در self-init ماژول UI:', e);
}
