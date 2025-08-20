/* File: js/modules/auth.js */
/**
 * ماژول احراز هویت - مدیریت ورود، خروج و وضعیت کاربر
 * Authentication Module - Login, Logout, and User Status Management
 */

// متغیرهای مربوط به احراز هویت
let currentUser = null;
let currentUserInfo = null;

// عناصر DOM مربوط به احراز هویت
let loginSubmitBtn, logoutBtn, openPasswordBtn, passwordModal;
let currentPasswordEl, newPasswordEl, passwordSubmitBtn, passwordCancelBtn;
let loginUsernameEl, loginPasswordEl;

/**
 * مقداردهی عناصر DOM مربوط به احراز هویت
 * Initialize DOM elements related to authentication
 */
function initAuthElements() {
  // عناصر ورود
  loginSubmitBtn = document.getElementById('loginSubmit');
  loginUsernameEl = document.getElementById('loginUsername');
  loginPasswordEl = document.getElementById('loginPassword');
  
  // عناصر خروج
  logoutBtn = document.getElementById('logoutBtn');
  
  // عناصر تغییر رمز
  openPasswordBtn = document.getElementById('openPasswordBtn');
  passwordModal = document.getElementById('passwordModal');
  currentPasswordEl = document.getElementById('currentPassword');
  newPasswordEl = document.getElementById('newPassword');
  passwordSubmitBtn = document.getElementById('passwordSubmit');
  passwordCancelBtn = document.getElementById('passwordCancel');
}

/**
 * تنظیم Event Listeners مربوط به احراز هویت
 * Setup Authentication Event Listeners
 */
function setupAuthEventListeners() {
  // رویداد ورود
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', handleLogin);
  }

  // رویداد خروج
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // رویدادهای تغییر گذرواژه
  if (openPasswordBtn) {
    openPasswordBtn.addEventListener('click', () => {
      if (passwordModal) passwordModal.style.display = 'flex';
    });
  }

  if (passwordSubmitBtn) {
    passwordSubmitBtn.addEventListener('click', handlePasswordChange);
  }

  if (passwordCancelBtn) {
    passwordCancelBtn.addEventListener('click', () => {
      if (passwordModal) passwordModal.style.display = 'none';
      if (currentPasswordEl) currentPasswordEl.value = '';
      if (newPasswordEl) newPasswordEl.value = '';
    });
  }

  // بستن modal تغییر رمز با کلیک روی پس‌زمینه
  if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        passwordModal.style.display = 'none';
        if (currentPasswordEl) currentPasswordEl.value = '';
        if (newPasswordEl) newPasswordEl.value = '';
      }
    });
  }
}

/**
 * مدیریت رویداد ورود
 * Handle Login Event
 */
async function handleLogin() {
  const username = (loginUsernameEl?.value || '').trim();
  const password = (loginPasswordEl?.value || '').trim();
  
  if (!username || !password) {
    alert('نام کاربری و گذرواژه را وارد کنید');
    return;
  }

  try {
    console.log('کلاینت: تلاش برای ورود کاربر:', username);
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'خطا در ورود');
      return;
    }

    const data = await res.json();
    currentUser = data.username;

    // دریافت اطلاعات کامل کاربر
    const userRes = await fetch('/api/auth/me');
    if (userRes.ok) {
      const userInfo = await userRes.json();
      currentUserInfo = userInfo;
      
      // بروزرسانی متغیرهای global
      if (window) {
        window.currentUser = currentUser;
        window.currentUserInfo = currentUserInfo;
      }
      
      showUserInfo(userInfo);
      console.log('کلاینت: ورود موفقیت‌آمیز =>', currentUser, 'نقش:', userInfo.role);
      
      // بارگذاری تنظیمات کاربر پس از ورود
      if (window.TTSModule && typeof window.TTSModule.afterLoginSetup === 'function') {
        await window.TTSModule.afterLoginSetup();
      }
      
      // ارسال event برای اطلاع دیگر ماژول‌ها
      document.dispatchEvent(new CustomEvent('authStatusChanged', {
        detail: { isLoggedIn: true, username: currentUser, userInfo: currentUserInfo }
      }));
    } else {
      showUserInfo({ username: currentUser });
    }

    closeLogin();
    clearLoginFields();
    
    // بارگذاری چت‌ها
    if (window.ChatModule && typeof window.ChatModule.fetchChats === 'function') {
      await window.ChatModule.fetchChats();
      if (window.chats && window.chats.length && window.ChatModule.loadChat) {
        window.ChatModule.loadChat(window.chats[0].id);
      }
    }

  } catch (error) {
    console.error('خطا در ورود:', error);
    alert('خطا در ارتباط با سرور');
  }
}

/**
 * مدیریت رویداد خروج
 * Handle Logout Event
 */
async function handleLogout() {
  try {
    console.log('کلاینت: تلاش برای خروج کاربر');
    
    await fetch('/api/auth/logout', { method: 'POST' });
    
    // پاک کردن اطلاعات کاربر
    currentUser = null;
    currentUserInfo = null;
    
    // بروزرسانی متغیرهای global
    if (window) {
      window.currentUser = null;
      window.currentUserInfo = null;
    }
    
    // مخفی کردن اطلاعات کاربر
    hideUserInfo();
    
    // پاک کردن چت‌ها
    if (window.chats) window.chats = [];
    if (window.currentChatId) window.currentChatId = null;
    if (window.currentMessages) window.currentMessages = [];
    
    // رندر مجدد رابط
    if (window.ChatModule && typeof window.ChatModule.renderChatList === 'function') {
      window.ChatModule.renderChatList();
    }
    if (window.ChatModule && typeof window.ChatModule.renderMessages === 'function') {
      window.ChatModule.renderMessages();
    }
    
    // نمایش modal ورود
    openLogin();
    
    // ارسال event برای اطلاع دیگر ماژول‌ها
    document.dispatchEvent(new CustomEvent('authStatusChanged', {
      detail: { isLoggedIn: false, username: null, userInfo: null }
    }));
    
    console.log('کلاینت: خروج موفقیت‌آمیز');
    
  } catch (error) {
    console.error('خطا در خروج:', error);
    // حتی در صورت خطا، کاربر را خارج کن
    currentUser = null;
    currentUserInfo = null;
    hideUserInfo();
    openLogin();
  }
}

/**
 * مدیریت تغییر رمز عبور
 * Handle Password Change
 */
async function handlePasswordChange() {
  const currentPassword = (currentPasswordEl?.value || '').trim();
  const newPassword = (newPasswordEl?.value || '').trim();
  
  if (!currentPassword || !newPassword) {
    alert('هر دو گذرواژه را وارد کنید');
    return;
  }

  if (newPassword.length < 8) {
    alert('گذرواژه جدید باید حداقل ۸ کاراکتر باشد');
    return;
  }

  try {
    console.log('کلاینت: تلاش برای تغییر رمز عبور');
    
    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'خطا در تغییر گذرواژه');
      return;
    }

    alert('گذرواژه با موفقیت تغییر یافت');
    
    // بستن modal و پاک کردن فیلدها
    if (passwordModal) passwordModal.style.display = 'none';
    if (currentPasswordEl) currentPasswordEl.value = '';
    if (newPasswordEl) newPasswordEl.value = '';
    
    console.log('کلاینت: تغییر رمز موفقیت‌آمیز');

  } catch (error) {
    console.error('خطا در تغییر رمز:', error);
    alert('خطا در ارتباط با سرور');
  }
}

/**
 * بررسی وضعیت ورود کاربر
 * Check User Authentication Status
 */
async function checkAuthStatus() {
  console.log('کلاینت: بررسی وضعیت ورود');
  
  try {
    const response = await fetch('/api/auth/me');
    
    if (response.ok) {
      const userInfo = await response.json();
      currentUser = userInfo.username;
      currentUserInfo = userInfo;
      
      // بروزرسانی متغیرهای global
      if (window) {
        window.currentUser = currentUser;
        window.currentUserInfo = currentUserInfo;
      }
      
      showUserInfo(userInfo);
      console.log('کلاینت: کاربر وارد شده است =>', currentUser, 'نقش:', userInfo.role);
      
      // بارگذاری چت‌ها
      if (window.ChatModule && typeof window.ChatModule.fetchChats === 'function') {
        await window.ChatModule.fetchChats();
        if (window.chats && window.chats.length && window.ChatModule.loadChat) {
          window.ChatModule.loadChat(window.chats[0].id);
        }
      }
      
      // بارگذاری تنظیمات کاربر
      if (window.TTSModule && typeof window.TTSModule.afterLoginSetup === 'function') {
        await window.TTSModule.afterLoginSetup();
      }
      
      // ارسال event برای اطلاع دیگر ماژول‌ها
      document.dispatchEvent(new CustomEvent('authStatusChanged', {
        detail: { isLoggedIn: true, username: currentUser, userInfo: currentUserInfo }
      }));
      
    } else {
      hideUserInfo();
      openLogin();
      
      // ارسال event برای خروج
      document.dispatchEvent(new CustomEvent('authStatusChanged', {
        detail: { isLoggedIn: false, username: null, userInfo: null }
      }));
    }
    
  } catch (error) {
    console.error('خطا در بررسی وضعیت ورود:', error);
    hideUserInfo();
    openLogin();
    
    // ارسال event برای خروج
    document.dispatchEvent(new CustomEvent('authStatusChanged', {
      detail: { isLoggedIn: false, username: null, userInfo: null }
    }));
  }
}

/**
 * نمایش اطلاعات کاربر
 * Show User Information
 */
function showUserInfo(userInfo) {
  const userInfoEl = document.getElementById('userInfo');
  const usernameEl = document.getElementById('currentUsername');
  
  if (userInfoEl) {
    userInfoEl.style.display = 'flex';
  }
  
  if (usernameEl) {
    usernameEl.textContent = userInfo.username || 'کاربر';
  }
  
  // نمایش دکمه پنل ادمین برای ادمین‌ها
  const adminPanelBtn = document.getElementById('adminPanelBtn');
  if (adminPanelBtn && userInfo.role === 'admin') {
    adminPanelBtn.style.display = 'block';
  }
  
  console.log('کلاینت: اطلاعات کاربر نمایش داده شد');
}

/**
 * مخفی کردن اطلاعات کاربر
 * Hide User Information
 */
function hideUserInfo() {
  const userInfoEl = document.getElementById('userInfo');
  const adminPanelBtn = document.getElementById('adminPanelBtn');
  
  if (userInfoEl) {
    userInfoEl.style.display = 'none';
  }
  
  if (adminPanelBtn) {
    adminPanelBtn.style.display = 'none';
  }
  
  console.log('کلاینت: اطلاعات کاربر مخفی شد');
}

/**
 * باز کردن modal ورود
 * Open Login Modal
 */
function openLogin() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'flex';
    console.log('کلاینت: modal ورود باز شد');
  }
}

/**
 * بستن modal ورود
 * Close Login Modal
 */
function closeLogin() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'none';
    console.log('کلاینت: modal ورود بسته شد');
  }
}

/**
 * پاک کردن فیلدهای ورود
 * Clear Login Fields
 */
function clearLoginFields() {
  if (loginUsernameEl) loginUsernameEl.value = '';
  if (loginPasswordEl) loginPasswordEl.value = '';
}

/**
 * دریافت اطلاعات کاربر فعلی
 * Get Current User Information
 */
function getCurrentUser() {
  return {
    username: currentUser,
    userInfo: currentUserInfo
  };
}

/**
 * بررسی اینکه آیا کاربر ادمین است
 * Check if Current User is Admin
 */
function isCurrentUserAdmin() {
  return currentUserInfo && currentUserInfo.role === 'admin';
}

/**
 * مقداردهی ماژول احراز هویت
 * Initialize Authentication Module
 */
function initAuthModule() {
  initAuthElements();
  setupAuthEventListeners();
  console.log('ماژول احراز هویت مقداردهی شد');
}

// Export کردن توابع برای استفاده در سایر بخش‌ها
if (typeof window !== 'undefined') {
  // Browser environment
  window.AuthModule = {
    initAuthModule,
    checkAuthStatus,
    showUserInfo,
    hideUserInfo,
    openLogin,
    closeLogin,
    getCurrentUser,
    isCurrentUserAdmin,
    handleLogin,
    handleLogout,
    handlePasswordChange
  };
  
  // Sync متغیرهای global برای backward compatibility
  Object.defineProperty(window, 'currentUser', {
    get: function() {
      return currentUser;
    }
  });
  
  Object.defineProperty(window, 'currentUserInfo', {
    get: function() {
      return currentUserInfo;
    }
  });
}

console.log('📦 ماژول احراز هویت بارگذاری شد - AuthModule در window قرار گرفت');
