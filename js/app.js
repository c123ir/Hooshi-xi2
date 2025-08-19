/* File: js/app.js */
/*
  منطق کلاینت برای تعامل با سرور:
  - بارگذاری و نمایش لیست چت‌ها در سایدبار
  - امکان ایجاد چت جدید، ویرایش عنوان و حذف چت
  - جستجوی چت‌ها
  - بارگذاری پیام‌ها و افزودن پیام جدید با فراخوانی سرور
  - قابلیت ویرایش پاسخ‌های دستیار
  - رسپانسیو بودن و مدیریت سایدبار در موبایل
*/

// متغیرهای سراسری
let chats = [];
let currentChatId = null;
let currentMessages = [];
let selectedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
let currentUser = null;
let currentUserInfo = null;
let currentSpeech = null; // برای کنترل TTS
let ttsSettings = {}; // تنظیمات TTS کاربر
let currentTTSButton = null;
let speechQueue = [];
let isPlayingAll = false;
let isFloatingVisible = false;
let isPausedByUser = false;

// عناصر DOM - ایمن برای دسترسی
let chatContainerEl, userInputEl, sendBtnEl, chatForm, chatListEl, searchInputEl;
let sidebarEl, sidebarOverlay, newChatBtn, menuToggleBtn, currentSubjectEl;
let copyAllBtn, speakAllBtn, ttsSettingsBtn, settingsBtn, settingsModal;
let saveModelBtn, closeSettingsBtn, adminPanelBtn, logoutBtn;
let ttsSettingsModal, ttsSettingsSaveBtn, ttsSettingsCloseBtn, ttsTestBtn;
let ttsSpeedEl, ttsSpeedValueEl;
let loginSubmitBtn, floatingTTSControl, floatingTTSIcon;
let ttsVoiceEl, ttsGenderEls, ttsQualityEl, ttsCostTierEl, ttsSampleEl;
let passwordSubmitBtn, passwordCancelBtn;
let openPasswordBtn, passwordModal, currentPasswordEl, newPasswordEl;

// مقداردهی عناصر DOM پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
  // عناصر اصلی چت
  chatContainerEl = document.getElementById('chat-container');
  userInputEl = document.getElementById('userInput');
  sendBtnEl = document.getElementById('sendBtn');
  chatForm = document.getElementById('chat-form');
  currentSubjectEl = document.getElementById('currentSubject');
  
  // عناصر سایدبار
  chatListEl = document.getElementById('chatList');
  searchInputEl = document.getElementById('searchInput');
  sidebarEl = document.getElementById('sidebar');
  sidebarOverlay = document.getElementById('sidebar-overlay');
  newChatBtn = document.getElementById('newChatBtn');
  menuToggleBtn = document.getElementById('menuToggle');
  copyAllBtn = document.getElementById('copyAllBtn');
  speakAllBtn = document.getElementById('speakAllBtn');
  ttsSettingsBtn = document.getElementById('ttsSettingsBtn');
  
  // عناصر تنظیمات
  settingsBtn = document.getElementById('settingsBtn');
  settingsModal = document.getElementById('settingsModal');
  saveModelBtn = document.getElementById('saveModelBtn');
  closeSettingsBtn = document.getElementById('closeSettingsBtn');
  adminPanelBtn = document.getElementById('adminPanelBtn');
  logoutBtn = document.getElementById('logoutBtn');
  
  // عناصر TTS
  ttsSettingsModal = document.getElementById('ttsSettingsModal');
  ttsSettingsSaveBtn = document.getElementById('ttsSettingsSave');
  ttsSettingsCloseBtn = document.getElementById('ttsSettingsClose');
  ttsTestBtn = document.getElementById('ttsTestBtn');
  ttsSpeedEl = document.getElementById('ttsSpeed');
  ttsSpeedValueEl = document.getElementById('ttsSpeedValue');
  ttsVoiceEl = document.getElementById('ttsVoice');
  ttsGenderEls = document.querySelectorAll('input[name="ttsGender"]');
  ttsQualityEl = document.getElementById('ttsQuality');
  ttsCostTierEl = document.getElementById('ttsCostTier');
  ttsSampleEl = document.getElementById('ttsSample');
  
  // عناصر کنترل شناور
  floatingTTSControl = document.getElementById('floatingTTSControl');
  floatingTTSIcon = document.getElementById('floatingTTSIcon');
  
  // عناصر ورود
  loginSubmitBtn = document.getElementById('loginSubmit');
  passwordSubmitBtn = document.getElementById('passwordSubmit');
  passwordCancelBtn = document.getElementById('passwordCancel');
  openPasswordBtn = document.getElementById('openPasswordBtn');
  passwordModal = document.getElementById('passwordModal');
  currentPasswordEl = document.getElementById('currentPassword');
  newPasswordEl = document.getElementById('newPassword');
  
  // راه‌اندازی event listeners بعد از مقداردهی عناصر
  setupEventListeners();
  
  // بررسی وضعیت ورود
  checkAuthStatus();
});

function setupEventListeners() {
  // رویدادهای چت
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      console.log('کلاینت: ارسال فرم چت');
      e.preventDefault();
      sendMessage();
    });
  }
  
  if (userInputEl) {
    userInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('کلاینت: ارسال پیام با Enter');
        e.preventDefault();
        sendMessage();
      }
    });
    
    userInputEl.addEventListener('input', () => {
      console.log('کلاینت: تغییر متن ورودی کاربر');
      autoResizeTextarea();
    });
  }
  
  // رویدادهای سایدبار
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      console.log('کلاینت: کلیک روی دکمه چت جدید');
      createNewChat();
    });
  }
  
  if (searchInputEl) {
    searchInputEl.addEventListener('input', () => {
      console.log('کلاینت: جستجو در لیست چت‌ها');
      renderChatList();
    });
  }
  
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      console.log('کلاینت: کلیک روی دکمه منوی موبایل');
      sidebarEl.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      console.log('کلاینت: کلیک روی overlay، بستن سایدبار');
      sidebarEl.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }
  
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      console.log('کلاینت: کلیک روی کپی کل گفتگو از سایدبار');
      copyCurrentChatToClipboard();
    });
  }
  
  if (speakAllBtn) {
    speakAllBtn.addEventListener('click', () => {
      console.log('کلاینت: کلیک روی پخش صوتی کل گفتگو');
      speakAllMessages();
    });
  }
  
  if (ttsSettingsBtn) {
    ttsSettingsBtn.addEventListener('click', () => {
      console.log('کلاینت: باز کردن تنظیمات TTS');
      openTTSSettings();
    });
  }
  
  // رویدادهای تنظیمات
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings);
  }
  
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
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        hideUserInfo();
        chats = [];
        currentChatId = null;
        currentMessages = [];
        renderChatList();
        renderMessages();
        openLogin();
      } catch {}
    });
  }
  
  // رویدادهای TTS
  if (ttsSettingsSaveBtn) {
    ttsSettingsSaveBtn.addEventListener('click', saveTTSSettings);
  }
  
  if (ttsSettingsCloseBtn) {
    ttsSettingsCloseBtn.addEventListener('click', closeTTSSettings);
  }
  
  if (ttsTestBtn) {
    ttsTestBtn.addEventListener('click', testTTSSettings);
  }
  
  if (ttsSpeedEl && ttsSpeedValueEl) {
    ttsSpeedEl.addEventListener('input', (e) => {
      ttsSpeedValueEl.textContent = `${e.target.value}x`;
    });
  }
  
  if (ttsSettingsModal) {
    ttsSettingsModal.addEventListener('click', (e) => {
      if (e.target === ttsSettingsModal) {
        closeTTSSettings();
      }
    });
  }
  
  // رویدادهای تغییر گذرواژه
  if (openPasswordBtn) {
    openPasswordBtn.addEventListener('click', () => {
      if (passwordModal) passwordModal.style.display = 'flex';
    });
  }
  
  if (passwordSubmitBtn) {
    passwordSubmitBtn.addEventListener('click', async () => {
      const currentPassword = (currentPasswordEl.value || '').trim();
      const newPassword = (newPasswordEl.value || '').trim();
      if (!currentPassword || !newPassword) return alert('هر دو گذرواژه را وارد کنید');
      try {
        const res = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return alert(err.error || 'خطا در تغییر گذرواژه');
        }
        alert('گذرواژه با موفقیت تغییر کرد');
        if (currentPasswordEl) currentPasswordEl.value = '';
        if (newPasswordEl) newPasswordEl.value = '';
        if (passwordModal) passwordModal.style.display = 'none';
      } catch (err) {
        console.error('خطا در تغییر گذرواژه:', err);
        alert('خطا در ارتباط با سرور');
      }
    });
  }
  
  if (passwordCancelBtn) {
    passwordCancelBtn.addEventListener('click', () => {
      if (passwordModal) passwordModal.style.display = 'none';
      if (currentPasswordEl) currentPasswordEl.value = '';
      if (newPasswordEl) newPasswordEl.value = '';
    });
  }
  
  // رویداد کنترل شناور TTS
  if (floatingTTSControl) {
    floatingTTSControl.addEventListener('click', () => {
      if (currentSpeech) {
        if (currentSpeech.paused) {
          currentSpeech.play();
          setFloatingPaused(false);
        } else {
          currentSpeech.pause();
          setFloatingPaused(true);
        }
      }
    });
  }
}

async function checkAuthStatus() {
  console.log('کلاینت: بررسی وضعیت ورود');
  try {
    const r = await fetch('/api/auth/me');
    if (r.ok) {
      const userInfo = await r.json();
      currentUser = userInfo.username;
      currentUserInfo = userInfo;
      showUserInfo(userInfo);
      console.log('کلاینت: کاربر وارد شده است =>', currentUser, 'نقش:', userInfo.role);
      await fetchChats();
      if (chats.length > 0) loadChat(chats[0].id);
      await afterLoginSetup();
    } else {
      hideUserInfo();
      openLogin();
    }
  } catch {
    hideUserInfo();
    openLogin();
  }
}

// توابع مدیریت نمایش اطلاعات کاربر
function showUserInfo(userInfo) {
  const userInfoEl = document.getElementById('userInfo');
  const usernameEl = document.getElementById('currentUsername');
  if (userInfoEl) userInfoEl.style.display = 'flex';
  if (usernameEl) usernameEl.textContent = userInfo.username || 'کاربر';
}

function hideUserInfo() {
  const userInfoEl = document.getElementById('userInfo');
  if (userInfoEl) userInfoEl.style.display = 'none';
}

function openLogin() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.style.display = 'flex';
}

function openSettings() {
  console.log('کلاینت: باز کردن پنجره تنظیمات');
  // مقداردهی رادیوها از localStorage
  const radios = document.querySelectorAll('input[name="model"]');
  const modelToSelect = selectedModel || 'gpt-4o-mini';
  radios.forEach(r => {
    r.checked = r.value === modelToSelect;
    // بهبود نمایش انتخاب شده
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
  if (adminPanelBtn && currentUserInfo && currentUserInfo.role === 'admin') {
    adminPanelBtn.style.display = 'flex';
  } else if (adminPanelBtn) {
    adminPanelBtn.style.display = 'none';
  }
  
  settingsModal.style.display = 'flex';
}

function closeSettings() {
  console.log('کلاینت: بستن پنجره تنظیمات');
  settingsModal.style.display = 'none';
}

function saveSettings() {
  const checked = document.querySelector('input[name="model"]:checked');
  const value = checked ? checked.value : null;
  if (value) {
    selectedModel = value;
    localStorage.setItem('openai_model', value);
    console.log('کلاینت: مدل انتخاب شد =>', value);
    alert('تنظیمات ذخیره شد');
  }
  closeSettings();
}

/**
 * ارتفاع textarea را با توجه به محتوای آن تنظیم می‌کند
 */
function autoResizeTextarea() {
  userInputEl.style.height = 'auto';
  userInputEl.style.height = `${userInputEl.scrollHeight}px`;
}

/**
 * گرفتن لیست چت‌ها از سرور
 */
async function fetchChats() {
  console.log('کلاینت: درخواست لیست چت‌ها');
  const res = await fetch('/api/chats');
  if (!res.ok) {
  if (res.status === 401) { openLogin(); return; }
    console.error('کلاینت: خطا در دریافت لیست چت‌ها');
    return;
  }
  chats = await res.json();
  
  // اطمینان از وجود فیلدهای isPinned و isArchived در همه چت‌ها
  chats.forEach(chat => {
    if (chat.isPinned === undefined) chat.isPinned = false;
    if (chat.isArchived === undefined) chat.isArchived = false;
  });
  
  console.log(`کلاینت: ${chats.length} چت دریافت شد`);
  renderChatList();
}

/**
 * نمایش لیست چت‌ها در سایدبار
 */
function renderChatList() {
  // فیلتر بر اساس عبارت جستجو
  const query = searchInputEl.value.trim().toLowerCase();
  chatListEl.innerHTML = '';
  
  // مرتب‌سازی چت‌ها: ویژه‌ها در بالا، آرشیو شده‌ها در پایین، بقیه بر اساس تاریخ
  const sortedChats = chats
    .filter((chat) => chat.subject.toLowerCase().includes(query))
    .sort((a, b) => {
      // اولویت 1: چت‌های ویژه
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // اولویت 2: چت‌های آرشیو شده در پایین
      if (a.isArchived && !b.isArchived) return 1;
      if (!a.isArchived && b.isArchived) return -1;
      
      // اولویت 3: تاریخ آخرین بروزرسانی
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  sortedChats.forEach((chat) => {
    const li = document.createElement('li');
    li.dataset.id = chat.id;
    li.classList.toggle('active', chat.id === currentChatId);
    li.classList.toggle('pinned', chat.isPinned);
    li.classList.toggle('archived', chat.isArchived);
    
    // عنوان
    const titleSpan = document.createElement('span');
    titleSpan.className = 'chat-title';
    titleSpan.textContent = chat.subject;
    li.appendChild(titleSpan);
    
    // اکشن‌ها (ویژه/آرشیو/ویرایش/حذف)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'chat-actions';
    
    // دکمه ویژه (ستاره)
    const pinBtn = document.createElement('button');
    pinBtn.className = `action-btn ${chat.isPinned ? 'active' : ''}`;
    pinBtn.innerHTML = '<i class="fa fa-star"></i>';
    pinBtn.title = chat.isPinned ? 'حذف از ویژه' : 'اضافه به ویژه';
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePinChat(chat.id);
    });
    
    // دکمه آرشیو (تیک)
    const archiveBtn = document.createElement('button');
    archiveBtn.className = `action-btn ${chat.isArchived ? 'active' : ''}`;
    archiveBtn.innerHTML = '<i class="fa fa-check"></i>';
    archiveBtn.title = chat.isArchived ? 'خروج از آرشیو' : 'آرشیو کردن';
    archiveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleArchiveChat(chat.id);
    });
    
    // دکمه ویرایش
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.innerHTML = '<i class="fa fa-pen"></i>';
    editBtn.title = 'ویرایش عنوان';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editChatSubject(chat.id, chat.subject);
    });
    
    // دکمه حذف
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete';
    deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
    deleteBtn.title = 'حذف گفتگو';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });
    
    actionsDiv.appendChild(pinBtn);
    actionsDiv.appendChild(archiveBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
    
    // رویداد کلیک برای بارگذاری چت
    li.addEventListener('click', () => {
      if (chat.id !== currentChatId) {
        loadChat(chat.id);
      }
      // در حالت موبایل، پس از انتخاب چت سایدبار بسته شود
      if (window.innerWidth <= 768) {
        sidebarEl.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      }
    });
    
    chatListEl.appendChild(li);
  });
}

/**
 * ایجاد چت جدید
 */
async function createNewChat() {
  console.log('کلاینت: درخواست ایجاد چت جدید');
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'گفتگوی جدید' })
    });
    if (!res.ok) {
      if (res.status === 401) { openLogin(); return; }
      if (res.status === 403) {
        const error = await res.json();
        showLimitNotification(error.error);
        return;
      }
      console.error('کلاینت: خطا در ایجاد چت جدید');
      return;
    }
    const { id, subject } = await res.json();
    chats.unshift({ 
      id, 
      subject, 
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false
    });
    currentChatId = id;
    currentSubjectEl.textContent = subject;
    currentMessages = [];
    console.log(`کلاینت: چت جدید با شناسه ${id} ایجاد شد`);
    renderChatList();
    renderMessages();
  } catch (error) {
    console.error('کلاینت: خطا در ایجاد چت جدید', error);
    alert('خطا در ایجاد چت جدید');
  }
}

/**
 * بارگذاری یک چت خاص
 * @param {string} id
 */
async function loadChat(id) {
  console.log(`کلاینت: درخواست دریافت چت با شناسه ${id}`);
  try {
    const res = await fetch(`/api/chats/${id}`);
    if (!res.ok) {
      if (res.status === 401) { openLogin(); return; }
      console.error(`کلاینت: خطا در دریافت چت با شناسه ${id}`);
      alert('خطا در دریافت چت');
      return;
    }
    const chat = await res.json();
    currentChatId = chat.id;
    currentMessages = chat.messages || [];
    currentSubjectEl.textContent = chat.subject || 'گفتگوی بدون عنوان';
    console.log(`کلاینت: چت با شناسه ${id} دریافت شد`);
    renderChatList();
    renderMessages();
  } catch (error) {
    console.error(`کلاینت: خطا در ارتباط با سرور برای چت ${id}`, error);
    alert('خطا در ارتباط با سرور');
  }
}

/**
 * ویرایش عنوان چت
 */
async function editChatSubject(id, currentSubject) {
  console.log(`کلاینت: درخواست ویرایش عنوان چت ${id}`);
  const newSubject = prompt('موضوع جدید را وارد کنید:', currentSubject);
  if (newSubject && newSubject.trim() !== '') {
    const res = await fetch(`/api/chats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubject.trim() })
    });
    if (res.ok) {
      const chat = chats.find((c) => c.id === id);
      if (chat) chat.subject = newSubject.trim();
      if (id === currentChatId) {
        currentSubjectEl.textContent = newSubject.trim();
      }
      console.log(`کلاینت: عنوان چت ${id} ویرایش شد`);
      renderChatList();
    } else {
  if (res.status === 401) { openLogin(); return; }
      console.error(`کلاینت: خطا در ویرایش عنوان چت ${id}`);
    }
  }
}

/**
 * حذف یک چت
 */
async function deleteChat(id) {
  console.log(`کلاینت: درخواست حذف چت ${id}`);
  if (!confirm('آیا مطمئن هستید که می‌خواهید این گفتگو را حذف کنید؟')) return;
  const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
  if (res.ok) {
    chats = chats.filter((c) => c.id !== id);
    if (id === currentChatId) {
      currentChatId = null;
      currentMessages = [];
      currentSubjectEl.textContent = 'گفتگوی جدید';
    }
    console.log(`کلاینت: چت ${id} حذف شد`);
    await fetchChats();
    renderMessages();
  } else {
  if (res.status === 401) { openLogin(); return; }
    console.error(`کلاینت: خطا در حذف چت ${id}`);
    await fetchChats();
    renderMessages();
    alert('چت موردنظر وجود ندارد یا قبلاً حذف شده است. لیست به‌روز شد.');
  }
}

/**
 * نمایش پیام‌ها در چت کنونی
 */
function renderMessages() {
  console.log('کلاینت: نمایش پیام‌های چت');
  chatContainerEl.innerHTML = '';
  currentMessages.forEach((msg, index) => {
    const msgEl = document.createElement('div');
    msgEl.classList.add('message', msg.role);
    // مجموعه اکشن‌ها: کپی، ویرایش، حذف، TTS (نمایش هنگام هاور)
    if (msg.role === 'assistant' || msg.role === 'user') {
      const actions = document.createElement('div');
      actions.className = 'message-actions';

      // دکمه تبدیل متن به گفتار
      const ttsBtn = document.createElement('button');
      ttsBtn.className = 'action-btn tts-btn';
      ttsBtn.title = 'پخش صوتی متن';
      ttsBtn.innerHTML = '<i class="fa fa-volume-up"></i>';
      ttsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(msg.content, ttsBtn);
      });
      actions.appendChild(ttsBtn);

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.title = msg.role === 'assistant' ? 'ویرایش پاسخ' : 'ویرایش پیام شما';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editMessage(index);
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.title = 'حذف پیام';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteMessage(index);
      });
      actions.appendChild(deleteBtn);

      msgEl.appendChild(actions);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = msg.content;
    
    // اضافه کردن قابلیت دوبار کلیک برای کپی
    let clickCount = 0;
    let clickTimer = null;
    
    contentDiv.addEventListener('click', (e) => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        copyMessage(index);
      }
    });
    
    msgEl.appendChild(contentDiv);
// حذف یک پیام از چت
function deleteMessage(index) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟')) return;
  currentMessages.splice(index, 1);
  fetch(`/api/chats/${currentChatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: currentMessages })
  }).then((r) => {
    if (r && r.status === 401) { openLogin(); return; }
    renderMessages();
  });
}
// کپی یک پیام به کلیپ‌بورد
async function copyMessage(index) {
  try {
    const msg = currentMessages[index];
    if (!msg) return;
    const who = msg.role === 'user' ? 'کاربر' : msg.role === 'assistant' ? 'دستیار' : msg.role;
    const time = new Date(msg.timestamp).toLocaleString('fa-IR');
    const text = `[${who} | ${time}]\n${msg.content}`;
    await navigator.clipboard.writeText(text);
    console.log(`کلاینت: پیام شماره ${index} کپی شد`);
    showCopyNotification();
  } catch (e) {
    console.error('کلاینت: خطا در کپی پیام', e);
    showCopyNotification('خطا در کپی');
  }
}

// نمایش نوتیفیکیشن ساده برای کپی
function showCopyNotification(text = 'کپی شد') {
  // حذف نوتیفیکیشن قبلی اگر وجود دارد
  const existing = document.querySelector('.copy-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = text;
  document.body.appendChild(notification);
  
  // نمایش با انیمیشن
  setTimeout(() => notification.classList.add('show'), 10);
  
  // حذف بعد از 2 ثانیه
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// نمایش نوتیفیکیشن محدودیت
function showLimitNotification(message) {
  // حذف نوتیفیکیشن قبلی اگر وجود دارد
  const existing = document.querySelector('.limit-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'limit-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // نمایش با انیمیشن
  setTimeout(() => notification.classList.add('show'), 10);
  
  // حذف بعد از 4 ثانیه
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// حذف یک پیام از چت
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const time = new Date(msg.timestamp);
    timeDiv.textContent = time.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    msgEl.appendChild(timeDiv);
    chatContainerEl.appendChild(msgEl);
  });
  chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
  console.log('کلاینت: پیام‌ها نمایش داده شد');
}

/**
 * کپی کل محتوای چت جاری در کلیپ‌بورد
 */
async function copyCurrentChatToClipboard() {
  try {
    if (!currentMessages || currentMessages.length === 0) {
      alert('هیچ پیامی برای کپی وجود ندارد');
      return;
    }
    const subject = currentSubjectEl.textContent || 'گفتگو';
    const lines = [];
    lines.push('————————————————————————');
    lines.push(`عنوان گفتگو: ${subject}`);
    lines.push('————————————————————————');
    lines.push('');
    currentMessages.forEach((m, i) => {
      const time = new Date(m.timestamp).toLocaleString('fa-IR');
      const who = m.role === 'user' ? 'کاربر' : m.role === 'assistant' ? 'دستیار' : m.role;
      lines.push(`${i + 1}. ${who} — ${time}`);
      lines.push(m.content);
      lines.push('');
    });
    lines.push('————————————————————————');
    const text = '\u202B' + lines.join('\n'); // RLE برای راست به چپ
    await navigator.clipboard.writeText(text);
    console.log('کلاینت: محتوای گفتگو در کلیپ‌بورد کپی شد');
    alert('محتوای گفتگو کپی شد');
  } catch (e) {
    console.error('کلاینت: خطا در کپی به کلیپ‌بورد', e);
    alert('خطا در کپی به کلیپ‌بورد');
  }
}

/**
 * ویرایش یک پیام دستیار
 * @param {number} index
 */
function editMessage(index) {
  const msg = currentMessages[index];
  if (!msg || (msg.role !== 'assistant' && msg.role !== 'user')) return;
  console.log(`کلاینت: ویرایش پیام شماره ${index}`);
  const msgEl = chatContainerEl.children[index];
  const contentEl = msgEl.querySelector('.message-content');
  const textarea = document.createElement('textarea');
  textarea.value = msg.content;
  textarea.style.width = '100%';
  textarea.style.minHeight = '3rem';
  contentEl.replaceWith(textarea);
  const saveBtn = document.createElement('button');
  saveBtn.className = 'icon-btn';
  saveBtn.style.marginTop = '0.25rem';
  saveBtn.innerHTML = '<i class="fa fa-check"></i>';
  msgEl.appendChild(saveBtn);
  saveBtn.addEventListener('click', async () => {
    try {
      const newContent = textarea.value.trim();
      if (!newContent) return;
      currentMessages[index].content = newContent;
      const r = await fetch(`/api/chats/${currentChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      });
      if (!r.ok) {
        if (r.status === 401) { 
          openLogin(); 
          return; 
        }
        alert('خطا در ذخیره ویرایش');
        return;
      }
      console.log(`کلاینت: پیام شماره ${index} ویرایش شد`);
      renderMessages();
    } catch (err) {
      console.error('خطا در ویرایش پیام:', err);
      alert('خطا در ویرایش پیام');
    }
  });
}

// ایمپورت فایل جیسون چت - محافظت شده
function setupImportHandler() {
  const importInputEl = document.getElementById('importInput');
  if (!importInputEl) return;

  importInputEl.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const chatData = JSON.parse(text);
      if (!chatData || !chatData.subject || !Array.isArray(chatData.messages)) {
        alert('فرمت فایل جیسون معتبر نیست');
        return;
      }
      // ارسال به سرور
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: chatData.subject })
      });
      if (!res.ok) {
        if (res.status === 401) { openLogin(); return; }
        alert('خطا در ایمپورت چت');
        return;
      }
      const { id } = await res.json();
      // ذخیره پیام‌ها
      const updateRes = await fetch(`/api/chats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatData.messages, subject: chatData.subject })
      });
      if (!updateRes.ok) {
        if (updateRes.status === 401) { openLogin(); return; }
        alert('خطا در ذخیره پیام‌های ایمپورت شده');
        return;
      }
      chats.unshift({ 
        id, 
        subject: chatData.subject, 
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isArchived: false
      });
      renderChatList();
      loadChat(id);
      alert('چت با موفقیت ایمپورت شد');
    } catch (err) {
      console.error('خطا در ایمپورت:', err);
      alert('خطا در خواندن فایل جیسون');
    } finally {
      // پاک کردن انتخاب فایل
      e.target.value = '';
    }
  });
}

// فراخوانی setup برای import handler
document.addEventListener('DOMContentLoaded', setupImportHandler);

/**
 * ارسال پیام کاربر
 */
async function sendMessage() {
  const text = userInputEl.value.trim();
  if (!text || !currentChatId) return;
  console.log('کلاینت: ارسال پیام کاربر');
  sendBtnEl.disabled = true;
  const userMessage = {
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
  };
  currentMessages.push(userMessage);
  renderMessages();
  // نمایش وضعیت "در حال فکر کردن..."
  const thinkingMsg = {
    role: 'assistant',
    content: 'در حال فکر کردن...',
    timestamp: new Date().toISOString()
  };
  currentMessages.push(thinkingMsg);
  renderMessages();
  userInputEl.value = '';
  autoResizeTextarea();
  try {
  const res = await fetch(`/api/chats/${currentChatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: text, model: selectedModel })
    });
    if (res.ok) {
      const data = await res.json();
      // حذف پیام "در حال فکر کردن..."
      currentMessages = currentMessages.filter(msg => msg.content !== 'در حال فکر کردن...');
      const assistantMessage = data.assistantMessage;
      currentMessages.push(assistantMessage);
      console.log('کلاینت: پاسخ دستیار دریافت شد');
      renderMessages();
      const chat = chats.find((c) => c.id === currentChatId);
      if (chat) chat.updatedAt = new Date().toISOString();
      renderChatList();
    } else {
      // حذف پیام "در حال فکر کردن..."
      currentMessages = currentMessages.filter(msg => msg.content !== 'در حال فکر کردن...');
      renderMessages();
      
      if (res.status === 401) { openLogin(); return; }
      if (res.status === 403) {
        const error = await res.json();
        showLimitNotification(error.error);
        return;
      }
      console.error('کلاینت: خطا در ارسال پیام');
      alert('خطا در ارسال پیام');
    }
  } catch (err) {
    // حذف پیام "در حال فکر کردن..." در صورت خطا
    currentMessages = currentMessages.filter(msg => msg.content !== 'در حال فکر کردن...');
    console.error('کلاینت: خطا در ارتباط با سرور', err);
    alert('خطا در ارتباط با سرور');
    renderMessages();
  } finally {
    sendBtnEl.disabled = false;
  }
}

/**
 * تغییر وضعیت ویژه بودن چت
 */
async function togglePinChat(chatId) {
  try {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    chat.isPinned = !chat.isPinned;
    chat.updatedAt = new Date().toISOString();
    
    // ارسال به سرور - فقط فیلدهای مورد نیاز
    const res = await fetch(`/api/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        isPinned: chat.isPinned,
        isArchived: chat.isArchived 
      })
    });
    
    if (!res.ok) {
      if (res.status === 401) { openLogin(); return; }
      alert('خطا در به‌روزرسانی وضعیت چت');
      return;
    }
    
    // انیمیشن ظریف برای حرکت چت
    const chatElement = document.querySelector(`li[data-id="${chatId}"]`);
    if (chatElement) {
      chatElement.style.transform = 'translateX(-10px)';
      chatElement.style.opacity = '0.7';
      setTimeout(() => {
        renderChatList();
      }, 400);
    } else {
      renderChatList();
    }
    
    console.log(`کلاینت: چت ${chatId} ${chat.isPinned ? 'ویژه شد' : 'از ویژه حذف شد'}`);
  } catch (err) {
    console.error('خطا در تغییر وضعیت ویژه:', err);
    alert('خطا در تغییر وضعیت ویژه');
  }
}

/**
 * تغییر وضعیت آرشیو بودن چت
 */
async function toggleArchiveChat(chatId) {
  try {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    chat.isArchived = !chat.isArchived;
    chat.updatedAt = new Date().toISOString();
    
    // ارسال به سرور - فقط فیلدهای مورد نیاز
    const res = await fetch(`/api/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        isPinned: chat.isPinned,
        isArchived: chat.isArchived 
      })
    });
    
    if (!res.ok) {
      if (res.status === 401) { openLogin(); return; }
      alert('خطا در به‌روزرسانی وضعیت چت');
      return;
    }
    
    // انیمیشن ظریف برای حرکت چت
    const chatElement = document.querySelector(`li[data-id="${chatId}"]`);
    if (chatElement) {
      chatElement.style.transform = 'translateX(10px)';
      chatElement.style.opacity = '0.7';
      setTimeout(() => {
        renderChatList();
      }, 400);
    } else {
      renderChatList();
    }
    
    console.log(`کلاینت: چت ${chatId} ${chat.isArchived ? 'آرشیو شد' : 'از آرشیو خارج شد'}`);
  } catch (err) {
    console.error('خطا در تغییر وضعیت آرشیو:', err);
    alert('خطا در تغییر وضعیت آرشیو');
  }
}

// ورود
if (loginSubmitBtn) {
  loginSubmitBtn.addEventListener('click', async () => {
    const username = (loginUsernameEl.value || '').trim();
    const password = (loginPasswordEl.value || '').trim();
    if (!username || !password) return alert('نام کاربری و گذرواژه را وارد کنید');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(err.error || 'خطا در ورود');
      }
      const data = await res.json();
      currentUser = data.username;
      
      // دریافت اطلاعات کامل کاربر
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userInfo = await userRes.json();
        currentUserInfo = userInfo; // ذخیره اطلاعات کامل کاربر
        showUserInfo(userInfo);
        console.log('کلاینت: ورود موفقیت‌آمیز =>', currentUser, 'نقش:', userInfo.role);
  // load user settings after login
  await afterLoginSetup();
      } else {
        showUserInfo({ username: currentUser });
      }
      
      closeLogin();
      // پاک کردن فیلدهای ورود
      if (loginUsernameEl) loginUsernameEl.value = '';
      if (loginPasswordEl) loginPasswordEl.value = '';
      await fetchChats();
      if (chats.length) loadChat(chats[0].id);
    } catch (e) {
      alert('خطا در ارتباط با سرور');
    }
  });
}

// دکمه پنل ادمین
if (adminPanelBtn) {
  adminPanelBtn.addEventListener('click', () => {
    console.log('کلاینت: کلیک روی دکمه مدیریت سرور');
    // باز کردن پنل ادمین در تب جدید
    window.open('/admin/dashboard.html', '_blank');
  });
}

function showFloatingControl() {
  if (!floatingTTSControl) return;
  floatingTTSControl.classList.add('visible','blinking');
  floatingTTSControl.classList.remove('paused');
  isFloatingVisible = true;
}

function hideFloatingControl() {
  if (!floatingTTSControl) return;
  floatingTTSControl.classList.remove('visible','blinking','paused');
  isFloatingVisible = false;
  isPausedByUser = false;
}

function setFloatingPaused(paused) {
  if (!floatingTTSControl) return;
  if (paused) {
    floatingTTSControl.classList.add('paused');
    floatingTTSControl.classList.remove('blinking');
    isPausedByUser = true;
  } else {
    floatingTTSControl.classList.remove('paused');
    floatingTTSControl.classList.add('blinking');
    isPausedByUser = false;
  }
}

function setFloatingPaused(paused) {
  if (!floatingTTSControl) return;
  isPausedByUser = paused;
  if (paused) {
    floatingTTSControl.classList.add('paused');
    floatingTTSControl.classList.remove('blinking');
    if (floatingTTSIcon) floatingTTSIcon.className = 'fa fa-pause';
  } else {
    floatingTTSControl.classList.remove('paused');
    floatingTTSControl.classList.add('blinking');
    if (floatingTTSIcon) floatingTTSIcon.className = 'fa fa-volume-up';
  }
}

// click toggles pause/resume
if (floatingTTSControl) {
  floatingTTSControl.addEventListener('click', () => {
    if (!currentSpeech) return;
    if (currentSpeech.paused) {
      // resume
      currentSpeech.play().then(() => setFloatingPaused(false)).catch(() => {});
    } else {
      // pause
      currentSpeech.pause();
      setFloatingPaused(true);
    }
  });
}

/**
 * پخش صوتی تمام پیام‌های چت فعلی
 */
function speakAllMessages() {
  try {
    // اگر در حال پخش است، متوقف کن
    if (isPlayingAll || (currentSpeech && !currentSpeech.ended)) {
      stopAllSpeech();
      return;
    }

    if (!currentMessages || currentMessages.length === 0) {
      showTTSNotification('پیامی برای پخش وجود ندارد');
      return;
    }

    // تغییر وضعیت دکمه
    updateSpeakAllButton('playing');
    isPlayingAll = true;

    // ایجاد متن کامل برای پخش
    const allText = currentMessages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => {
        const sender = msg.role === 'user' ? 'کاربر گفت' : 'دستیار گفت';
        return `${sender}: ${msg.content}`;
      })
      .join('. ');

    if (!allText.trim()) {
      showTTSNotification('متنی برای پخش یافت نشد');
      resetSpeakAllButton();
      return;
    }

    // پخش متن کامل
    speakTextContent(allText, null, true);

  } catch (error) {
    console.error('خطا در پخش همه پیام‌ها:', error);
    showTTSNotification('خطا در پخش کل گفتگو');
    resetSpeakAllButton();
  }
}

/**
 * متوقف کردن تمام پخش‌های صوتی
 */
function stopAllSpeech() {
  stopCurrentSpeech();
  speechQueue = [];
  isPlayingAll = false;
}

/**
 * به‌روزرسانی وضعیت دکمه پخش کل گفتگو
 */
function updateSpeakAllButton(state) {
  if (!speakAllBtn) return;
  
  if (state === 'playing') {
    speakAllBtn.innerHTML = '<i class="fa fa-stop"></i>';
    speakAllBtn.title = 'توقف پخش کل گفتگو';
    speakAllBtn.classList.add('speaking-all');
  } else {
    speakAllBtn.innerHTML = '<i class="fa fa-volume-up"></i>';
    speakAllBtn.title = 'پخش صوتی کل گفتگو';
    speakAllBtn.classList.remove('speaking-all');
  }
}

/**
 * بازنشانی دکمه پخش کل گفتگو
 */
function resetSpeakAllButton() {
  isPlayingAll = false;
  updateSpeakAllButton('idle');
}

/**
 * تبدیل متن به گفتار فارسی
 * @param {string} text - متن مورد نظر برای تبدیل به گفتار
 * @param {HTMLElement} button - دکمه TTS که کلیک شده (برای پیام‌های تکی)
 * @param {boolean} isAllMessages - آیا برای کل گفتگو است یا خیر
 */
function speakText(text, button) {
  speakTextContent(text, button, false);
}

/**
 * تابع اصلی تبدیل متن به گفتار با OpenAI TTS
 * @param {string} text - متن مورد نظر برای تبدیل به گفتار
 * @param {HTMLElement} button - دکمه TTS که کلیک شده (اختیاری)
 * @param {boolean} isAllMessages - آیا برای کل گفتگو است یا خیر
 */
async function speakTextContent(text, button = null, isAllMessages = false) {
  try {
    // اگر در حال پخش است، متوقف کن (و اجازه بده ضبط جدید پخش شود)
    if (currentSpeech) {
      stopCurrentSpeech();
    }

    if (!text || !text.trim()) {
      showTTSNotification('متنی برای پخش وجود ندارد');
      return;
    }

    // تنظیم وضعیت دکمه‌ها
    if (button) {
      currentTTSButton = button;
      updateTTSButtonState(button, 'playing');
    }
    
    if (isAllMessages) {
      updateSpeakAllButton('playing');
    }

    console.log('شروع درخواست TTS به OpenAI...');

    // ارسال درخواست به سرور
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: ttsSettings.voice,
        speed: ttsSettings.speed
      }),
    });

    if (!response.ok) {
      throw new Error(`خطا در TTS: ${response.status}`);
    }

  // دریافت فایل صوتی
  const audioBlob = await response.blob();
  // پخش مستقیم بدون blob URL
  // stop any previous audio created elsewhere
  if (currentSpeech) stopCurrentSpeech();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  currentSpeech = audio;

    audio.onended = () => {
      console.log('پایان پخش TTS');
  URL.revokeObjectURL(audioUrl); // آزادسازی حافظه
  hideFloatingControl();
      if (isAllMessages) {
        resetSpeakAllButton();
      } else {
        resetTTSButton();
      }
    };

    audio.onerror = (error) => {
      console.error('خطا در پخش صوت:', error);
      URL.revokeObjectURL(audioUrl);
      if (isAllMessages) {
        resetSpeakAllButton();
      } else {
        resetTTSButton();
      }
      showTTSNotification('خطا در پخش صوت');
    };

    audio.onloadeddata = async () => {
      try {
        // شروع پخش
  await audio.play();
  console.log('پخش صوت آغاز شد');
  // show floating control
  showFloatingControl();
  setFloatingPaused(false);
      } catch (playError) {
        console.error('خطا در شروع پخش:', playError);
        if (isAllMessages) {
          resetSpeakAllButton();
        } else {
          resetTTSButton();
        }
        showTTSNotification('خطا در شروع پخش');
      }
    };
    
  } catch (error) {
    console.error('خطا در تابع speakTextContent:', error);
    if (isAllMessages) {
      resetSpeakAllButton();
    } else {
      resetTTSButton();
    }
    
    // نمایش پیام خطای مناسب
    if (error.message.includes('401')) {
      showTTSNotification('خطا در احراز هویت');
    } else if (error.message.includes('403')) {
      showTTSNotification('دسترسی غیرمجاز');
    } else {
      showTTSNotification('خطا در تولید صدا');
    }
  }
}

/**
 * متوقف کردن پخش صوتی فعلی
 */
function stopCurrentSpeech() {
  if (currentSpeech) {
    if (currentSpeech.pause) {
      currentSpeech.pause();
      currentSpeech.currentTime = 0;
    }
    try { if (currentSpeech.src) URL.revokeObjectURL(currentSpeech.src); } catch(e){}
    currentSpeech = null;
  }
  resetTTSButton();
  resetSpeakAllButton();
  hideFloatingControl();
}

/**
 * به‌روزرسانی وضعیت ظاهری دکمه TTS
 * @param {HTMLElement} button 
 * @param {string} state - 'playing' یا 'idle'
 */
function updateTTSButtonState(button, state) {
  if (!button) return;
  
  if (state === 'playing') {
    button.innerHTML = '<i class="fa fa-stop"></i>';
    button.title = 'توقف پخش';
    button.classList.add('tts-playing');
  } else {
    button.innerHTML = '<i class="fa fa-volume-up"></i>';
    button.title = 'پخش صوتی متن';
    button.classList.remove('tts-playing');
  }
}

/**
 * بازنشانی وضعیت دکمه TTS فعلی
 */
function resetTTSButton() {
  if (currentTTSButton) {
    updateTTSButtonState(currentTTSButton, 'idle');
    currentTTSButton = null;
  }
  currentSpeech = null;
}

/**
 * باز کردن پنجره تنظیمات TTS
 */
function openTTSSettings() {
  // تنظیم مقادیر فعلی
  if (ttsVoiceEl) {
    ttsVoiceEl.value = ttsSettings.voice;
  }
  if (ttsSpeedEl) {
    ttsSpeedEl.value = ttsSettings.speed;
    ttsSpeedValueEl.textContent = `${ttsSettings.speed}x`;
  }
  
  // نمایش modal
  if (ttsSettingsModal) {
    ttsSettingsModal.style.display = 'flex';
  }
}

/**
 * بستن پنجره تنظیمات TTS
 */
function closeTTSSettings() {
  if (ttsSettingsModal) {
    ttsSettingsModal.style.display = 'none';
  }
}

/**
 * ذخیره تنظیمات TTS
 */
function saveTTSSettings() {
  // دریافت مقادیر جدید
  if (ttsVoiceEl) {
    ttsSettings.voice = ttsVoiceEl.value;
    localStorage.setItem('tts_voice', ttsSettings.voice);
  }
  if (ttsSpeedEl) {
    ttsSettings.speed = parseFloat(ttsSpeedEl.value);
    localStorage.setItem('tts_speed', ttsSettings.speed);
  }
  
  console.log('تنظیمات TTS ذخیره شد:', ttsSettings);
  showTTSNotification('تنظیمات ذخیره شد');
  closeTTSSettings();
}

/**
 * تست تنظیمات TTS
 */
async function testTTSSettings() {
  const testText = 'سلام! این یک تست برای تنظیمات صوت است. کیفیت صدا چطور است؟';
  
  // تنظیمات موقتی برای تست
  const tempSettings = {
    voice: ttsVoiceEl?.value || ttsSettings.voice,
    speed: parseFloat(ttsSpeedEl?.value || ttsSettings.speed)
  };
  
  try {
    console.log('تست TTS با تنظیمات:', tempSettings);
    
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        voice: tempSettings.voice,
        speed: tempSettings.speed
      }),
    });

    if (!response.ok) {
      throw new Error(`خطا در TTS: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      showTTSNotification('خطا در پخش تست');
    };

    await audio.play();
    
  } catch (error) {
    console.error('خطا در تست TTS:', error);
    showTTSNotification('خطا در تست صدا');
  }
}
function showTTSNotification(message) {
  // حذف نوتیفیکیشن قبلی اگر وجود دارد
  const existing = document.querySelector('.tts-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'tts-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // نمایش با انیمیشن
  setTimeout(() => notification.classList.add('show'), 10);
  
  // حذف بعد از 2 ثانیه
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// بارگیری تنظیمات TTS زمانی که صفحه لود می‌شود
document.addEventListener('DOMContentLoaded', () => {
  console.log('تنظیمات TTS بارگیری شد:', ttsSettings);
});

/**
 * Load per-user TTS settings from server (if logged in)
 */
async function loadUserTTSSettings() {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(currentUser)}/tts`);
    if (!res.ok) {
      console.warn('خطا در خواندن تنظیمات TTS کاربر');
      return;
    }
    const data = await res.json();
    const s = data.ttsSettings || {};
    // merge into ttsSettings
    ttsSettings = Object.assign({}, ttsSettings, {
      voice: s.voice || ttsSettings.voice,
      speed: s.rate || ttsSettings.speed,
      gender: s.gender || 'neutral',
      quality: s.quality || 'standard',
      costTier: s.costTier || 'medium'
    });
    // populate modal controls if open
    if (ttsVoiceEl) ttsVoiceEl.value = ttsSettings.voice;
    if (ttsSpeedEl) ttsSpeedEl.value = ttsSettings.speed;
    if (ttsSpeedValueEl) ttsSpeedValueEl.textContent = `${ttsSettings.speed}x`;
    if (document.querySelector(`input[name="ttsGender"][value="${ttsSettings.gender}"]`)) {
      document.querySelector(`input[name="ttsGender"][value="${ttsSettings.gender}"]`).checked = true;
    }
    const qEl = document.getElementById('ttsQuality');
    if (qEl) qEl.value = ttsSettings.quality || 'standard';
    const costEl = document.getElementById('ttsCostTier');
    if (costEl) costEl.value = ttsSettings.costTier || 'medium';
    estimateCost();
  } catch (err) {
    console.error('خطا در loadUserTTSSettings:', err);
  }
}

// Call load when auth known
// After successful login we set currentUser then call loadUserTTSSettings in login flow above

/**
 * Estimate cost display (very rough): show cost per 1000 chars based on quality/cost tier
 */
function estimateCost() {
  const quality = document.getElementById('ttsQuality')?.value || ttsSettings.quality || 'standard';
  const tier = document.getElementById('ttsCostTier')?.value || ttsSettings.costTier || 'medium';
  let base = quality === 'high' ? 0.06 : 0.02; // dollars per 1000 chars (example)
  if (tier === 'low') base *= 0.7;
  if (tier === 'high') base *= 1.6;
  const el = document.getElementById('costEstimate');
  if (el) el.textContent = `$${base.toFixed(3)}`;
}

// Wire controls to update estimate in real-time
const qElWatch = document.getElementById('ttsQuality');
if (qElWatch) qElWatch.addEventListener('change', estimateCost);
const costWatch = document.getElementById('ttsCostTier');
if (costWatch) costWatch.addEventListener('change', estimateCost);

// Open settings now also loads from server
function openTTSSettings() {
  // set current modal values from ttsSettings
  if (ttsVoiceEl) ttsVoiceEl.value = ttsSettings.voice;
  if (ttsSpeedEl) {
    ttsSpeedEl.value = ttsSettings.speed;
    ttsSpeedValueEl.textContent = `${ttsSettings.speed}x`;
  }
  // gender
  const g = ttsSettings.gender || 'neutral';
  const genderInput = document.querySelector(`input[name="ttsGender"][value="${g}"]`);
  if (genderInput) genderInput.checked = true;
  // quality & cost
  const q = ttsSettings.quality || 'standard';
  const qEl = document.getElementById('ttsQuality'); if (qEl) qEl.value = q;
  const cEl = document.getElementById('ttsCostTier'); if (cEl) cEl.value = ttsSettings.costTier || 'medium';
  estimateCost();

  if (ttsSettingsModal) ttsSettingsModal.style.display = 'flex';
}

// Save per-user settings to server
async function saveTTSSettings() {
  // collect values
  const newSettings = {};
  newSettings.voice = ttsVoiceEl?.value || ttsSettings.voice;
  newSettings.rate = parseFloat(ttsSpeedEl?.value || ttsSettings.speed);
  const genderInput = document.querySelector('input[name="ttsGender"]:checked');
  newSettings.gender = genderInput?.value || ttsSettings.gender || 'neutral';
  newSettings.quality = document.getElementById('ttsQuality')?.value || ttsSettings.quality || 'standard';
  newSettings.costTier = document.getElementById('ttsCostTier')?.value || ttsSettings.costTier || 'medium';
  newSettings.updatedAt = new Date().toISOString();

  // update local cache
  ttsSettings = Object.assign({}, ttsSettings, {
    voice: newSettings.voice,
    speed: newSettings.rate,
    gender: newSettings.gender,
    quality: newSettings.quality,
    costTier: newSettings.costTier
  });

  // if user logged in, persist to server
  if (currentUser) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(currentUser)}/tts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttsSettings: newSettings })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showTTSNotification(err.error || 'خطا در ذخیره تنظیمات');
        return;
      }
      showTTSNotification('تنظیمات با موفقیت ذخیره شد');
    } catch (err) {
      console.error('خطا در ذخیره تنظیمات TTS:', err);
      showTTSNotification('خطا در ذخیره تنظیمات');
    }
  } else {
    // save to localStorage as fallback
    localStorage.setItem('tts_voice', ttsSettings.voice);
    localStorage.setItem('tts_speed', ttsSettings.speed);
    showTTSNotification('تنظیمات ذخیره شد (محلی)');
  }

  // close modal
  closeTTSSettings();
}

// Override test handler to use ttsSample text if provided
if (ttsTestBtn) {
  ttsTestBtn.addEventListener('click', async () => {
    const sample = document.getElementById('ttsSample')?.value || 'این یک تست صدا است.';
    // temporarily set voice/speed params from modal
    const tempSettings = {
      voice: document.getElementById('ttsVoice')?.value || ttsSettings.voice,
      speed: parseFloat(document.getElementById('ttsSpeed')?.value || ttsSettings.speed)
    };

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sample, voice: tempSettings.voice, speed: tempSettings.speed })
      });
      if (!response.ok) throw new Error('tts_failed');
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      // ensure previous audio stopped
      if (currentSpeech) stopCurrentSpeech();

      const audio = new Audio(url);
      currentSpeech = audio;
      setFloatingPaused(false);
      showFloatingControl();

      audio.onended = () => { URL.revokeObjectURL(url); hideFloatingControl(); currentSpeech = null; };
      audio.onerror = () => { URL.revokeObjectURL(url); hideFloatingControl(); currentSpeech = null; showTTSNotification('خطا در پخش تست'); };
      await audio.play();
    } catch (err) {
      console.error('خطا در پخش تست TTS:', err);
      showTTSNotification('خطا در پخش تست');
    }
  });
}

// Load user settings after login is confirmed
async function afterLoginSetup() {
  if (currentUser) {
    await loadUserTTSSettings();
  }
}