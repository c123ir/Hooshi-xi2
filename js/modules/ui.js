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

// نمایش loading state
function showLoadingState(message = 'در حال بارگذاری...') {
    const existingLoader = document.getElementById('global-loader');
    if (existingLoader) {
        existingLoader.querySelector('.loader-text').textContent = message;
        return;
    }
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'global-loader';
    loader.innerHTML = `
        <div class="loader-backdrop">
            <div class="loader-content">
                <div class="spinner"></div>
                <div class="loader-text">${message}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // اضافه کردن استایل‌ها اگر وجود ندارند
    if (!document.getElementById('loader-styles')) {
        const style = document.createElement('style');
        style.id = 'loader-styles';
        style.textContent = `
            .global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .loader-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(2px);
            }
            
            .loader-content {
                position: relative;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                min-width: 200px;
            }
            
            .loader-content .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loader-text {
                font-size: 1rem;
                color: #333;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// مخفی کردن loading state
function hideLoadingState() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}

// نمایش دیالوگ تأیید
function showConfirmDialog(message, title = 'تأیید') {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="dialog-backdrop">
                <div class="dialog-content">
                    <h3 class="dialog-title">${title}</h3>
                    <p class="dialog-message">${message}</p>
                    <div class="dialog-actions">
                        <button class="btn-cancel">لغو</button>
                        <button class="btn-confirm">تأیید</button>
                    </div>
                </div>
            </div>
        `;
        
        // اضافه کردن استایل‌ها
        if (!document.getElementById('dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'dialog-styles';
            style.textContent = `
                .confirm-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .dialog-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                }
                
                .dialog-content {
                    position: relative;
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    min-width: 300px;
                }
                
                .dialog-title {
                    margin: 0 0 1rem 0;
                    color: #333;
                    font-size: 1.2rem;
                }
                
                .dialog-message {
                    margin: 0 0 1.5rem 0;
                    color: #666;
                    line-height: 1.5;
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }
                
                .dialog-actions button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                
                .btn-cancel {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-confirm {
                    background: #dc3545;
                    color: white;
                }
                
                .btn-cancel:hover {
                    background: #5a6268;
                }
                
                .btn-confirm:hover {
                    background: #c82333;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(dialog);
        
        // Event listeners
        const cancelBtn = dialog.querySelector('.btn-cancel');
        const confirmBtn = dialog.querySelector('.btn-confirm');
        const backdrop = dialog.querySelector('.dialog-backdrop');
        
        function cleanup() {
            dialog.remove();
        }
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                cleanup();
                resolve(false);
            }
        });
        
        // ESC key
        function handleEsc(e) {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
                document.removeEventListener('keydown', handleEsc);
            }
        }
        document.addEventListener('keydown', handleEsc);
    });
}

// نمایش progress bar
function showProgress(percentage, message = '') {
    let progressEl = document.getElementById('global-progress');
    
    if (!progressEl) {
        progressEl = document.createElement('div');
        progressEl.id = 'global-progress';
        progressEl.className = 'global-progress';
        progressEl.innerHTML = `
            <div class="progress-content">
                <div class="progress-message"></div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-percentage"></div>
            </div>
        `;
        
        // اضافه کردن استایل‌ها
        if (!document.getElementById('progress-styles')) {
            const style = document.createElement('style');
            style.id = 'progress-styles';
            style.textContent = `
                .global-progress {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    z-index: 9999;
                    min-width: 250px;
                }
                
                .progress-message {
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #333;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #f0f0f0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #007bff;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .progress-percentage {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(progressEl);
    }
    
    // بروزرسانی محتوا
    progressEl.querySelector('.progress-message').textContent = message;
    progressEl.querySelector('.progress-fill').style.width = `${percentage}%`;
    progressEl.querySelector('.progress-percentage').textContent = `${percentage}%`;
}

// مخفی کردن progress bar
function hideProgress() {
    const progressEl = document.getElementById('global-progress');
    if (progressEl) {
        progressEl.remove();
    }
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
        copyToClipboard,
        showLoadingState,
        hideLoadingState,
        showConfirmDialog,
        showProgress,
        hideProgress
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
