/* File: js/modules/settings.js */
/* ماژول مدیریت تنظیمات و settings modal */

window.SettingsModule = (function() {
  'use strict';
  
  let selectedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
  let settingsModal, saveModelBtn, closeSettingsBtn, adminPanelBtn;
  
  function init() {
    // دریافت عناصر DOM
    settingsModal = document.getElementById('settingsModal');
    saveModelBtn = document.getElementById('saveModelBtn');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    adminPanelBtn = document.getElementById('adminPanelBtn');
    
    // راه‌اندازی event listeners
    setupEventListeners();
  }
  
  function setupEventListeners() {
    if (saveModelBtn) {
      saveModelBtn.addEventListener('click', saveSettings);
    }
    
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', closeSettings);
    }
    
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
      });
    }
    
    // دکمه پنل ادمین
    if (adminPanelBtn) {
      adminPanelBtn.addEventListener('click', () => {
        window.open('/admin/dashboard.html', '_blank');
      });
    }
  }
  
  function openSettings() {
    // مقداردهی رادیوها از localStorage
    const radios = document.querySelectorAll('input[name="model"]');
    const modelToSelect = selectedModel || 'gpt-4o-mini';
    radios.forEach(r => {
      r.checked = r.value === modelToSelect;
      const option = r.closest('.model-option');
      if (option) {
        option.classList.toggle('selected', r.checked);
      }
    });
    
    // اضافه کردن event listener برای رادیو باتن‌ها
    radios.forEach(r => {
      r.addEventListener('change', () => {
        document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
        const option = r.closest('.model-option');
        if (option) option.classList.add('selected');
      });
    });
    
    // نمایش دکمه ادمین اگر کاربر ادمین است
    const currentAuth = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (adminPanelBtn && currentAuth && currentAuth.userInfo && currentAuth.userInfo.role === 'admin') {
      adminPanelBtn.style.display = 'flex';
    } else if (adminPanelBtn) {
      adminPanelBtn.style.display = 'none';
    }
    
    settingsModal.style.display = 'flex';
  }
  
  function closeSettings() {
    settingsModal.style.display = 'none';
  }
  
  function saveSettings() {
    const checked = document.querySelector('input[name="model"]:checked');
    const value = checked ? checked.value : null;
    if (value) {
      selectedModel = value;
      localStorage.setItem('openai_model', value);
      alert('تنظیمات ذخیره شد');
    }
    closeSettings();
  }
  
  function getSelectedModel() {
    return selectedModel;
  }
  
  function setSelectedModel(model) {
    selectedModel = model;
    localStorage.setItem('openai_model', model);
  }
  
  // API عمومی
  return {
    init,
    openSettings,
    closeSettings,
    saveSettings,
    getSelectedModel,
    setSelectedModel
  };
})();
