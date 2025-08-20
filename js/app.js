/**
 * نقطه ورود اصلی اپلیکیشن - Main Entry Point
 * @author Agent ChatGPT
 * @version 3.0.0
 */

// متغیرهای اصلی
let selectedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
let userInput, sendBtn, chatForm;

// مقداردهی DOM
function initializeApp() {
    userInput = document.getElementById('userInput');
    sendBtn = document.getElementById('sendBtn');
    chatForm = document.getElementById('chat-form');
    
    setupMainEventListeners();
    updateUserInfo();
}

// Event listeners اصلی
function setupMainEventListeners() {
    console.log('🔧 تنظیم event listeners اصلی...');
    
    // بررسی و تنظیم elements
    if (!chatForm) chatForm = document.getElementById('chatForm');
    if (!userInput) userInput = document.getElementById('userInput');
    if (!sendBtn) sendBtn = document.getElementById('sendBtn');
    
    console.log('🔧 وضعیت elements:', {
        chatForm: !!chatForm,
        userInput: !!userInput,
        sendBtn: !!sendBtn
    });
    
    // فرم چت
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
        console.log('✅ Event listener فرم چت اضافه شد');
    } else {
        console.warn('⚠️ chatForm پیدا نشد!');
    }
    
    // Auto-resize textarea
    if (userInput) {
        userInput.addEventListener('input', autoResizeTextarea);
        userInput.addEventListener('keydown', handleKeyDown);
        console.log('✅ Event listeners textarea اضافه شدند');
    } else {
        console.warn('⚠️ userInput پیدا نشد!');
    }
}

// مدیریت ارسال پیام
async function handleChatSubmit(e) {
    e.preventDefault();
    
    const message = userInput?.value?.trim();
    if (!message || sendBtn?.disabled) return;
    
    // Clear input
    userInput.value = '';
    autoResizeTextarea();
    
    // Disable send button
    sendBtn.disabled = true;
    
    try {
        // ارسال پیام به ماژول چت
        if (window.ChatModule) {
            await window.ChatModule.sendMessage(message);
        }
    } catch (error) {
        console.error('خطا در ارسال:', error);
        if (window.UIModule) {
            window.UIModule.showNotification('خطا در ارسال پیام', 'error');
        }
    } finally {
        sendBtn.disabled = false;
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    if (userInput) {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
    }
}

// مدیریت کلیدها
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm?.dispatchEvent(new Event('submit'));
    }
}

// بروزرسانی اطلاعات کاربر
function updateUserInfo() {
    const currentAuth = window.AuthModule?.getCurrentUser();
    const userInfo = document.getElementById('userInfo');
    const username = document.getElementById('currentUsername');
    const adminPanel = document.getElementById('adminPanelBtn');
    
    if (currentAuth?.username) {
        if (userInfo) userInfo.style.display = 'flex';
        if (username) username.textContent = currentAuth.username;
        
        // نمایش پنل ادمین برای ادمین
        if (adminPanel && currentAuth.userInfo?.role === 'admin') {
            adminPanel.style.display = 'flex';
        }
        
        // بارگیری تنظیمات TTS
        if (window.TTSModule) {
            window.TTSModule.afterLoginSetup();
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'none';
    }
}

// مقداردهی اولیه
async function initApp() {
    console.log('🚀 شروع مقداردهی اپلیکیشن...');
    
    try {
        // صبر برای بارگیری ماژول‌ها
        console.log('⏳ انتظار برای بارگیری ماژول‌ها...');
        await waitForModules();
        
        // مقداردهی اصلی
        console.log('🔧 مقداردهی اصلی...');
        initializeApp();
        
        // مقداردهی ماژول‌ها
        if (window.AuthModule) {
            console.log('🔑 مقداردهی AuthModule...');
            window.AuthModule.initAuthModule();
            await window.AuthModule.checkAuthStatus();
        }
        if (window.ChatModule) {
            console.log('💬 مقداردهی ChatModule...');
            window.ChatModule.init();
        }
        if (window.UIModule) {
            console.log('🎨 مقداردهی UIModule...');
            window.UIModule.init();
        }
        if (window.TTSModule) {
            console.log('🔊 مقداردهی TTSModule...');
            window.TTSModule.initializeTTS();
        }
        
        console.log('🚀 اپلیکیشن آماده است');
    } catch (error) {
        console.error('❌ خطا در مقداردهی اپلیکیشن:', error);
    }
}

// انتظار برای بارگیری ماژول‌ها
function waitForModules() {
    return new Promise((resolve) => {
        const checkModules = () => {
            console.log('🔍 چک کردن ماژول‌ها:', {
                AuthModule: !!window.AuthModule,
                ChatModule: !!window.ChatModule,
                UIModule: !!window.UIModule,
                TTSModule: !!window.TTSModule
            });
            
            if (window.AuthModule && window.ChatModule && window.UIModule && window.TTSModule) {
                console.log('✅ همه ماژول‌ها بارگیری شدند');
                resolve();
            } else {
                setTimeout(checkModules, 50);
            }
        };
        checkModules();
    });
}

// شروع اپلیکیشن
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Event listener برای تغییرات auth
document.addEventListener('authStatusChanged', updateUserInfo);

console.log('📱 اپلیکیشن اصلی بارگیری شد');

// تست سریع DOM
setTimeout(() => {
    console.log('🔍 تست DOM:', {
        chatList: !!document.getElementById('chatList'),
        userInput: !!document.getElementById('userInput'), 
        sendBtn: !!document.getElementById('sendBtn'),
        chatContainer: !!document.getElementById('chat-container')
    });
    
    // تست manual فراخوانی
    if (window.ChatModule && typeof window.ChatModule.fetchChats === 'function') {
        console.log('🔄 فراخوانی manual fetchChats...');
        window.ChatModule.fetchChats();
    }
}, 2000);
