// Admin Panel JavaScript

let currentUser = null;
let allUsers = [];

// Logging function
function logInfo(message, data = null) {
  console.log(`[ADMIN-INFO] ${message}`, data);
}

function logError(message, error = null) {
  console.error(`[ADMIN-ERROR] ${message}`, error);
}

function logWarning(message, data = null) {
  console.warn(`[ADMIN-WARNING] ${message}`, data);
}

// عناصر DOM
const adminNameEl = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');
const addUserBtn = document.getElementById('addUserBtn');
const usersTable = document.getElementById('usersTable');

// آمار
const totalUsersEl = document.getElementById('totalUsers');
const totalChatsEl = document.getElementById('totalChats');
const totalMessagesEl = document.getElementById('totalMessages');
const systemUptimeEl = document.getElementById('systemUptime');
const lastUpdateEl = document.getElementById('lastUpdate');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.admin-section');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  logInfo('DOM loaded, initializing admin panel...');
  checkAuth();
  setupNavigation();
  setupEventListeners();
});

// Navigation Setup
function setupNavigation() {
  logInfo('Setting up navigation...');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = item.dataset.section;
      logInfo(`Navigation clicked: ${sectionName}`);
      switchSection(sectionName);
    });
  });
}

function switchSection(sectionName) {
  logInfo(`Switching to section: ${sectionName}`);
  // Remove active class from all nav items and sections
  navItems.forEach(nav => nav.classList.remove('active'));
  sections.forEach(section => section.classList.remove('active'));
  
  // Add active class to current nav item and section
  document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
  document.getElementById(`${sectionName}-section`).classList.add('active');
  
  // Load section data
  loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
  switch(sectionName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'users':
      loadUsers();
      break;
    case 'stats':
      loadStats();
      break;
    case 'system':
      loadSystemInfo();
      break;
  }
}

// Event Listeners
function setupEventListeners() {
  logInfo('Setting up event listeners...');
  
  if (logoutBtn) {
    logInfo('Logout button found, adding event listener');
    logoutBtn.addEventListener('click', logout);
  } else {
    logWarning('Logout button not found');
  }
  
  if (addUserBtn) {
    logInfo('Add user button found, adding event listener');
    addUserBtn.addEventListener('click', () => {
      logInfo('Add user button clicked');
      showAddUserModal();
    });
  } else {
    logWarning('Add user button not found');
  }
}

// Authentication
async function checkAuth() {
  logInfo('Checking authentication...');
  try {
    const res = await fetch('/api/auth/me');
    logInfo('Auth response received', { status: res.status });
    
    if (res.ok) {
      const data = await res.json();
      logInfo('User authenticated successfully', data);
      currentUser = data.username;
      adminNameEl.textContent = currentUser;
      loadDashboard();
    } else {
      logWarning('Authentication failed', { status: res.status });
      redirectToLogin();
    }
  } catch (error) {
    console.error('خطا در بررسی احراز هویت:', error);
    redirectToLogin();
  }
}

function redirectToLogin() {
  window.location.href = '/';
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    redirectToLogin();
  } catch (error) {
    console.error('خطا در خروج:', error);
    redirectToLogin();
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      const stats = await res.json();
      updateDashboardStats(stats);
    } else {
      console.error('خطا در دریافت آمار');
    }
  } catch (error) {
    console.error('خطا در بارگذاری داشبورد:', error);
  }
}

function updateDashboardStats(stats) {
  totalUsersEl.textContent = stats.totalUsers || 0;
  totalChatsEl.textContent = stats.totalChats || 0;
  totalMessagesEl.textContent = stats.totalMessages || 0;
  systemUptimeEl.textContent = stats.uptime || 0;
  
  if (stats.lastUpdate) {
    const date = new Date(stats.lastUpdate);
    lastUpdateEl.textContent = date.toLocaleString('fa-IR');
  }
}

// Users Management
async function loadUsers() {
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      allUsers = data.users;
      renderUsersTable();
    } else {
      console.error('خطا در دریافت لیست کاربران');
    }
  } catch (error) {
    console.error('خطا در بارگذاری کاربران:', error);
  }
}

function renderUsersTable() {
  if (!usersTable) return;
  
  usersTable.innerHTML = '';
  
  if (allUsers.length === 0) {
    usersTable.innerHTML = '<tr><td colspan="6">کاربری یافت نشد</td></tr>';
    return;
  }
  
  allUsers.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>${formatDate(user.stats?.lastLoginAt)}</td>
      <td>${user.stats?.totalChats || 0}</td>
      <td>
        <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
          ${user.isActive ? 'فعال' : 'غیرفعال'}
        </span>
      </td>
      <td>
        <button class="btn btn-warning edit-user-btn" data-username="${user.username}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger delete-user-btn" data-username="${user.username}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    usersTable.appendChild(row);
  });
  
  // Add event delegation for user action buttons
  if (usersTable) {
    usersTable.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-user-btn');
      const deleteBtn = e.target.closest('.delete-user-btn');
      
      if (editBtn) {
        const username = editBtn.dataset.username;
        logInfo(`Edit user button clicked for: ${username}`);
        editUser(username);
      }
      
      if (deleteBtn) {
        const username = deleteBtn.dataset.username;
        logInfo(`Delete user button clicked for: ${username}`);
        deleteUser(username);
      }
    });
  }
}

// User Modals
function showAddUserModal() {
  logInfo('Showing add user modal...');
  try {
    const modal = createUserModal();
    logInfo('Modal created successfully', modal);
    
    if (!modal) {
      logError('Modal is null or undefined');
      return;
    }
    
    document.body.appendChild(modal);
    logInfo('Modal appended to body');
    
    modal.style.display = 'flex';
    logInfo('Modal display set to flex');
    
    // اضافه کردن چک برای نمایش مودال
    setTimeout(() => {
      const modalInDOM = document.querySelector('.modal');
      logInfo('Modal in DOM check', modalInDOM);
    }, 100);
    
  } catch (error) {
    logError('Error showing add user modal', error);
  }
}

function createUserModal(user = null) {
  const isEdit = !!user;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${isEdit ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</h3>
      
      <label>نام:</label>
      <input type="text" id="firstName" value="${user?.firstName || ''}" required>
      
      <label>نام خانوادگی:</label>
      <input type="text" id="lastName" value="${user?.lastName || ''}" required>
      
      <label>شماره موبایل:</label>
      <input type="text" id="mobile" value="${user?.mobile || ''}" required>
      
      <label>نام کاربری:</label>
      <input type="text" id="username" value="${user?.username || ''}" ${isEdit ? 'disabled' : 'required'}>
      
      ${!isEdit ? '<label>گذرواژه:</label><input type="password" id="password" required>' : ''}
      
      <label>ایمیل (اختیاری):</label>
      <input type="email" id="email" value="${user?.email || ''}">
      
      <hr>
      
      <label>نقش:</label>
      <select id="role">
        <option value="user" ${!user || user.role === 'user' ? 'selected' : ''}>کاربر عادی</option>
        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>مدیر</option>
      </select>
      
      <label>
        <input type="checkbox" id="isActive" ${!user || user.isActive ? 'checked' : ''}>
        فعال
      </label>
      
      <label>حداکثر تعداد چت (خالی = نامحدود):</label>
      <input type="number" id="maxChats" value="${user?.maxChats || ''}" min="1">
      
      <label>حداکثر پیام در هر چت (خالی = نامحدود):</label>
      <input type="number" id="maxMessagesPerChat" value="${user?.maxMessagesPerChat || ''}" min="1">
      
      <label>تاریخ انقضا (خالی = نامحدود):</label>
      <input type="date" id="expiryDate" value="${user?.expiryDate ? user.expiryDate.split('T')[0] : ''}">
      
      <div class="modal-buttons">
        <button class="btn btn-primary" id="saveUserBtn">
          <i class="fas fa-save"></i> ${isEdit ? 'ویرایش' : 'ایجاد'} کاربر
        </button>
        <button class="btn btn-secondary" id="cancelBtn">
          <i class="fas fa-times"></i> انصراف
        </button>
      </div>
    </div>
  `;
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
  
  // Add event listeners to buttons
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'saveUserBtn' || e.target.closest('#saveUserBtn')) {
      logInfo(`Save button clicked - isEdit: ${isEdit}`);
      if (isEdit) {
        saveUser(user.username);
      } else {
        createUser();
      }
    }
    
    if (e.target.id === 'cancelBtn' || e.target.closest('#cancelBtn')) {
      logInfo('Cancel button clicked');
      closeModal(modal);
    }
  });
  
  return modal;
}

// Make functions global for debugging
window.createUser = createUser;
window.editUser = editUser;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.closeModal = closeModal;
window.showAddUserModal = showAddUserModal;

async function createUser() {
  logInfo('Creating user...');
  
  try {
    // گرفتن عناصر DOM
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const mobileEl = document.getElementById('mobile');
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const emailEl = document.getElementById('email');
    const roleEl = document.getElementById('role');
    const isActiveEl = document.getElementById('isActive');
    const maxChatsEl = document.getElementById('maxChats');
    const maxMessagesPerChatEl = document.getElementById('maxMessagesPerChat');
    const expiryDateEl = document.getElementById('expiryDate');
    
    // بررسی وجود عناصر
    if (!firstNameEl) logError('firstName element not found');
    if (!lastNameEl) logError('lastName element not found');
    if (!mobileEl) logError('mobile element not found');
    if (!usernameEl) logError('username element not found');
    if (!passwordEl) logError('password element not found');
    
    const userData = {
      firstName: firstNameEl?.value.trim() || '',
      lastName: lastNameEl?.value.trim() || '',
      mobile: mobileEl?.value.trim() || '',
      username: usernameEl?.value.trim() || '',
      password: passwordEl?.value || '',
      email: emailEl?.value.trim() || '',
      role: roleEl?.value || 'user',
      isActive: isActiveEl?.checked || true,
      maxChats: maxChatsEl?.value || null,
      maxMessagesPerChat: maxMessagesPerChatEl?.value || null,
      expiryDate: expiryDateEl?.value || null
    };
    
    logInfo('User data collected', userData);
    
    if (!userData.firstName || !userData.lastName || !userData.mobile || !userData.username || !userData.password) {
      logWarning('Required fields missing', userData);
      alert('لطفاً فیلدهای اجباری را کامل کنید');
      return;
    }
    
    logInfo('Sending create user request...');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    logInfo('Create user response received', { status: res.status });
    
    if (res.ok) {
      logInfo('User created successfully');
      alert('کاربر با موفقیت ایجاد شد');
      closeModal();
      loadUsers();
    } else {
      const error = await res.json();
      logError('Create user failed', { status: res.status, error });
      alert(error.error || 'خطا در ایجاد کاربر');
    }
  } catch (error) {
    logError('Exception in createUser', error);
    alert('خطا در ایجاد کاربر');
  }
}

async function editUser(username) {
  logInfo(`Editing user: ${username}`);
  try {
    const user = allUsers.find(u => u.username === username);
    if (!user) {
      logError(`User not found: ${username}`);
      return;
    }
    
    logInfo('Creating edit modal for user', user);
    const modal = createUserModal(user);
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    logInfo('Edit modal displayed');
  } catch (error) {
    logError('Error in editUser', error);
  }
}

async function saveUser(username) {
  const userData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    email: document.getElementById('email').value.trim(),
    role: document.getElementById('role').value,
    isActive: document.getElementById('isActive').checked,
    maxChats: document.getElementById('maxChats').value || null,
    maxMessagesPerChat: document.getElementById('maxMessagesPerChat').value || null,
    expiryDate: document.getElementById('expiryDate').value || null
  };
  
  try {
    const res = await fetch(`/api/admin/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (res.ok) {
      alert('کاربر با موفقیت ویرایش شد');
      closeModal();
      loadUsers();
    } else {
      const error = await res.json();
      alert(error.error || 'خطا در ویرایش کاربر');
    }
  } catch (error) {
    console.error('خطا در ویرایش کاربر:', error);
    alert('خطا در ویرایش کاربر');
  }
}

async function deleteUser(username) {
  if (!confirm(`آیا مطمئن هستید که می‌خواهید کاربر "${username}" را حذف کنید؟`)) {
    return;
  }
  
  try {
    const res = await fetch(`/api/admin/users/${username}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      alert('کاربر با موفقیت حذف شد');
      loadUsers();
    } else {
      const error = await res.json();
      alert(error.error || 'خطا در حذف کاربر');
    }
  } catch (error) {
    console.error('خطا در حذف کاربر:', error);
    alert('خطا در حذف کاربر');
  }
}

function closeModal(element) {
  logInfo('Closing modal...');
  try {
    const modal = element?.closest('.modal') || document.querySelector('.modal');
    if (modal) {
      modal.remove();
      logInfo('Modal closed successfully');
    } else {
      logWarning('No modal found to close');
    }
  } catch (error) {
    logError('Error closing modal', error);
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'هرگز';
  const date = new Date(dateString);
  return date.toLocaleString('fa-IR');
}

// Placeholder functions for other sections
function loadStats() {
  console.log('آمار و گزارش در حال توسعه...');
}

function loadSystemInfo() {
  console.log('اطلاعات سیستم در حال توسعه...');
}
