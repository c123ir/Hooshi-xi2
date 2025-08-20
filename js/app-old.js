/* File: js/app.js */
/*
  منطق کلاینت برای تعامل با سرور - Entry Point ساده
  تعامل با ماژول‌ها: AuthModule, ChatModule, TTSModule, SettingsModule, UIModule
*/

// عناصر DOM  
let userInputEl, sendBtnEl, chatForm;
let sidebarEl, sidebarOverlay, newChatBtn, menuToggleBtn, settingsBtn;

// مقداردهی عناصر DOM پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  setupEventListeners();
  initModules();
});

function initDOM() {
  userInputEl = document.getElementById('userInput');
  sendBtnEl = document.getElementById('sendBtn');
  chatForm = document.getElementById('chat-form');
  sidebarEl = document.getElementById('sidebar');
  sidebarOverlay = document.getElementById('sidebar-overlay');
  newChatBtn = document.getElementById('newChatBtn');
  menuToggleBtn = document.getElementById('menuToggle');
  settingsBtn = document.getElementById('settingsBtn');
}

function initModules() {
  if (window.AuthModule) {
    window.AuthModule.initAuthModule();
    window.AuthModule.checkAuthStatus();
  }
  
  if (window.SettingsModule) {
    window.SettingsModule.init();
  }
}

function setupEventListeners() {
  // چت
  if (chatForm) chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });
  
  if (userInputEl) {
    userInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    userInputEl.addEventListener('input', () => {
      if (window.UIModule) window.UIModule.autoResizeTextarea(userInputEl);
    });
  }
  
  // سایدبار
  if (newChatBtn) newChatBtn.addEventListener('click', () => {
    if (window.ChatModule) window.ChatModule.createNewChat();
  });
  
  if (menuToggleBtn) menuToggleBtn.addEventListener('click', () => {
    if (window.UIModule) window.UIModule.toggleSidebar(sidebarEl, sidebarOverlay);
  });
  
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => {
    if (window.UIModule) window.UIModule.closeSidebar(sidebarEl, sidebarOverlay);
  });
  
  // تنظیمات
  if (settingsBtn) settingsBtn.addEventListener('click', () => {
    if (window.SettingsModule) window.SettingsModule.openSettings();
  });
}



async function sendMessage() {
  try {
    const text = userInputEl.value.trim();
    const currentChatId = window.ChatModule ? window.ChatModule.getCurrentChatId() : null;
    const selectedModel = window.SettingsModule ? window.SettingsModule.getSelectedModel() : 'gpt-4o-mini';
    
    if (!text || !currentChatId) return;
    
    sendBtnEl.disabled = true;
    userInputEl.value = '';
    autoResizeTextarea();
    
    // اضافه کردن پیام کاربر
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    if (window.ChatModule) {
      window.ChatModule.addMessage(userMessage);
      
      // نمایش وضعیت "در حال فکر کردن..."
      const thinkingMsg = {
        role: 'assistant',
        content: 'در حال فکر کردن...',
        timestamp: new Date().toISOString()
      };
      window.ChatModule.addMessage(thinkingMsg);
    }
    
    // ارسال به سرور
    const res = await fetch(`/api/chats/${currentChatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, model: selectedModel })
    });
    
    if (res.ok) {
      const data = await res.json();
      
      if (window.ChatModule) {
        // حذف پیام "در حال فکر کردن..."
        const messages = window.ChatModule.getCurrentMessages().filter(msg => msg.content !== 'در حال فکر کردن...');
        window.ChatModule.setCurrentMessages(messages);
        
        // اضافه کردن پاسخ دستیار
        window.ChatModule.addMessage(data.assistantMessage);
        
        // بروزرسانی لیست چت‌ها
        const chats = window.ChatModule.getChats();
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) chat.updatedAt = new Date().toISOString();
        window.ChatModule.renderChatList();
      }
      
    } else {
      // حذف پیام "در حال فکر کردن..."
      if (window.ChatModule) {
        const messages = window.ChatModule.getCurrentMessages().filter(msg => msg.content !== 'در حال فکر کردن...');
        window.ChatModule.setCurrentMessages(messages);
        window.ChatModule.renderMessages();
      }
      
      if (res.status === 401 && window.AuthModule) {
        window.AuthModule.openLogin();
        return;
      }
      
      if (res.status === 403) {
        const error = await res.json();
        if (window.UIModule) window.UIModule.showLimitNotification(error.error);
        return;
      }
      
      alert('خطا در ارسال پیام');
    }
    
  } catch (error) {
    console.error('خطا در ارسال پیام:', error);
    
    // حذف پیام "در حال فکر کردن..."
    if (window.ChatModule) {
      const messages = window.ChatModule.getCurrentMessages().filter(msg => msg.content !== 'در حال فکر کردن...');
      window.ChatModule.setCurrentMessages(messages);
      window.ChatModule.renderMessages();
    }
    
    alert('خطا در ارتباط با سرور');
    
  } finally {
    sendBtnEl.disabled = false;
  }
}
