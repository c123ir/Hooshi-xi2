// Admin Panel JavaScript - Enhanced Version

let currentUser = null;
let allUsers = [];

// Logging functions
function logInfo(message, data = null) {
  console.log(`[ADMIN-INFO] ${message}`, data);
}

function logError(message, error = null) {
  console.error(`[ADMIN-ERROR] ${message}`, error);
}

function logWarning(message, data = null) {
  console.warn(`[ADMIN-WARNING] ${message}`, data);
}

// DOM Elements
let adminNameEl, logoutBtn, addUserBtn, usersTable;
let totalUsersEl, totalChatsEl, totalMessagesEl, systemUptimeEl, lastUpdateEl;
let navItems, sections;

// Initialize DOM elements
function initializeElements() {
  adminNameEl = document.getElementById('adminName');
  logoutBtn = document.getElementById('logoutBtn');
  addUserBtn = document.getElementById('addUserBtn');
  usersTable = document.getElementById('usersTable');

  // Stats elements
  totalUsersEl = document.getElementById('totalUsers');
  totalChatsEl = document.getElementById('totalChats');
  totalMessagesEl = document.getElementById('totalMessages');
  systemUptimeEl = document.getElementById('systemUptime');
  lastUpdateEl = document.getElementById('lastUpdate');

  // Navigation elements
  navItems = document.querySelectorAll('.nav-item');
  sections = document.querySelectorAll('.admin-section');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  logInfo('DOM loaded, initializing admin panel...');
  
  // Initialize DOM elements
  initializeElements();
  
  // Initialize UI Module if available
  if (typeof UIModule !== 'undefined') {
    UIModule.init();
    logInfo('UI Module initialized');
  } else {
    logWarning('UI Module not available');
  }
  
  checkAuth();
  setupNavigation();
  setupEventListeners();
});

// Navigation setup
function setupNavigation() {
  logInfo('Setting up navigation...');
  if (navItems) {
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = item.dataset.section;
        logInfo(`Navigation clicked: ${sectionName}`);
        switchSection(sectionName);
      });
    });
  }
}

function switchSection(sectionName) {
  logInfo(`Switching to section: ${sectionName}`);
  
  // Remove active class from all nav items and sections
  if (navItems) {
    navItems.forEach(nav => nav.classList.remove('active'));
  }
  if (sections) {
    sections.forEach(section => section.classList.remove('active'));
  }
  
  // Add active class to current nav item and section
  const navItem = document.querySelector(`[data-section="${sectionName}"]`);
  const section = document.getElementById(`${sectionName}-section`);
  
  if (navItem) navItem.classList.add('active');
  if (section) section.classList.add('active');
  
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
    case 'settings':
      logInfo('Settings section - under development');
      break;
  }
}

// Authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(user => {
    if (user.role !== 'admin') {
      alert('دسترسی محدود به ادمین');
      window.location.href = '/';
      return;
    }
    
    currentUser = user;
    if (adminNameEl) {
      adminNameEl.textContent = user.firstName + ' ' + user.lastName;
    }
    
    // Load initial data
    loadDashboard();
  })
  .catch(error => {
    console.error('خطا در احراز هویت:', error);
    window.location.href = '/';
  });
}

function setupEventListeners() {
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/';
    });
  }
  
  // Add User button
  if (addUserBtn) {
    addUserBtn.addEventListener('click', showAddUserModal);
  }
}

// Dashboard functions
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
  try {
    if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers || 0;
    if (totalChatsEl) totalChatsEl.textContent = stats.totalChats || 0;
    if (totalMessagesEl) totalMessagesEl.textContent = stats.totalMessages || 0;
    if (systemUptimeEl) systemUptimeEl.textContent = stats.uptime || 0;
    
    if (stats.lastUpdate && lastUpdateEl) {
      const date = new Date(stats.lastUpdate);
      lastUpdateEl.textContent = date.toLocaleString('fa-IR');
    }
    
    logInfo('Dashboard stats updated', stats);
  } catch (error) {
    logError('Error updating dashboard stats', error);
  }
}

// Users management
async function loadUsers() {
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      allUsers = await res.json();
      renderUsersTable();
    } else {
      console.error('خطا در دریافت کاربران');
    }
  } catch (error) {
    console.error('خطا در بارگذاری کاربران:', error);
  }
}

function renderUsersTable() {
  if (!usersTable) return;
  
  usersTable.innerHTML = '';
  
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
  
  // Add event listeners for buttons
  const editBtns = usersTable.querySelectorAll('.edit-user-btn');
  const deleteBtns = usersTable.querySelectorAll('.delete-user-btn');
  
  editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const username = e.target.closest('button').dataset.username;
      editUser(username);
    });
  });
  
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const username = e.target.closest('button').dataset.username;
      deleteUser(username);
    });
  });
}

// Stats functions
async function loadStats() {
  console.log('بارگذاری آمار پیشرفته...');
  
  const statsSection = document.querySelector('#stats-section');
  if (!statsSection) {
    console.error('Stats section not found');
    return;
  }
  
  // Show loading
  statsSection.innerHTML = `
    <div class="loading-stats">
      <div class="spinner"></div>
      <p>در حال بارگذاری آمار...</p>
    </div>
  `;
  
  try {
    // Get cache stats
    let cacheStats = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      memoryUsage: '0 B'
    };
    
    // Get users data
    const usersResponse = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const users = usersResponse.ok ? await usersResponse.json() : [];
    const totalUsers = users.length;
    
    // Build HTML
    const statsHTML = `
      <div class="section-header">
        <h2>آمار و گزارش</h2>
        <button class="btn btn-primary" onclick="loadStats()">🔄 بروزرسانی</button>
      </div>
      
      <div class="stats-overview">
        <h3>📊 داشبورد آمار سیستم</h3>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>کاربران</h3>
              <div class="stat-number">${totalUsers}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-content">
              <h3>کل چت‌ها</h3>
              <div class="stat-number">0</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <h3>کل پیام‌ها</h3>
              <div class="stat-number">0</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <h3>حجم داده</h3>
              <div class="stat-number">0 B</div>
            </div>
          </div>
        </div>
        
        <div class="cache-stats">
          <h3>🧠 آمار کش سیستم</h3>
          <div class="cache-grid">
            <div class="cache-item">
              <label>نرخ بازدید:</label>
              <span class="cache-value success">${cacheStats.hitRate}%</span>
            </div>
            <div class="cache-item">
              <label>تعداد موارد:</label>
              <span class="cache-value">${cacheStats.totalEntries}</span>
            </div>
            <div class="cache-item">
              <label>موفق/ناموفق:</label>
              <span class="cache-value">${cacheStats.totalHits}/${cacheStats.totalMisses}</span>
            </div>
            <div class="cache-item">
              <label>حافظه مصرفی:</label>
              <span class="cache-value">${cacheStats.memoryUsage}</span>
            </div>
          </div>
          
          <div class="cache-actions">
            <button class="btn btn-warning" onclick="clearCache()">
              🗑️ پاکسازی کش
            </button>
          </div>
        </div>
      </div>
    `;
    
    statsSection.innerHTML = statsHTML;
    console.log('آمار پیشرفته بارگذاری شد');
    
  } catch (error) {
    console.error('خطا در بارگذاری آمار:', error);
    statsSection.innerHTML = `
      <div class="error-message">
        خطا در بارگذاری آمار: ${error.message}
        <button onclick="loadStats()">تلاش مجدد</button>
      </div>
    `;
  }
}

// Cache management
async function clearCache() {
  let confirmed = false;
  
  if (typeof UIModule !== 'undefined' && UIModule.showConfirmDialog) {
    confirmed = await UIModule.showConfirmDialog(
      'آیا مطمئن هستید که می‌خواهید کش سیستم را پاک کنید؟',
      'تأیید پاکسازی کش'
    );
  } else {
    confirmed = confirm('آیا مطمئن هستید که می‌خواهید کش سیستم را پاک کنید؟');
  }
  
  if (!confirmed) {
    return;
  }
  
  if (typeof UIModule !== 'undefined' && UIModule.showLoadingState) {
    UIModule.showLoadingState('در حال پاکسازی کش...');
  }
  
  try {
    const response = await fetch('/api/cache/clear', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (typeof UIModule !== 'undefined' && UIModule.hideLoadingState) {
      UIModule.hideLoadingState();
    }
    
    if (response.ok) {
      const result = await response.json();
      const message = `کش با موفقیت پاک شد. ${result.clearedCount} مورد حذف شد.`;
      
      if (typeof UIModule !== 'undefined' && UIModule.showNotification) {
        UIModule.showNotification(message, 'success');
      } else {
        alert(message);
      }
      
      loadStats();
    } else {
      throw new Error('خطا در پاکسازی کش');
    }
  } catch (error) {
    if (typeof UIModule !== 'undefined' && UIModule.hideLoadingState) {
      UIModule.hideLoadingState();
    }
    
    console.error('خطا در پاکسازی کش:', error);
    const message = 'خطا در پاکسازی کش: ' + error.message;
    
    if (typeof UIModule !== 'undefined' && UIModule.showNotification) {
      UIModule.showNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'هرگز';
  const date = new Date(dateString);
  return date.toLocaleString('fa-IR');
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Placeholder functions for future implementation
function loadSystemInfo() {
  console.log('اطلاعات سیستم در حال توسعه...');
  const systemSection = document.querySelector('#system-section');
  if (systemSection) {
    systemSection.innerHTML = `
      <div class="section-header">
        <h2>وضعیت سیستم</h2>
      </div>
      <div class="info-message">
        این بخش در حال توسعه است...
      </div>
    `;
  }
}

function showAddUserModal() {
  console.log('افزودن کاربر جدید - در حال توسعه');
  if (typeof UIModule !== 'undefined' && UIModule.showNotification) {
    UIModule.showNotification('قابلیت افزودن کاربر در حال توسعه است', 'info');
  } else {
    alert('قابلیت افزودن کاربر در حال توسعه است');
  }
}

function editUser(username) {
  console.log('ویرایش کاربر:', username);
  if (typeof UIModule !== 'undefined' && UIModule.showNotification) {
    UIModule.showNotification(`ویرایش کاربر ${username} در حال توسعه است`, 'info');
  } else {
    alert(`ویرایش کاربر ${username} در حال توسعه است`);
  }
}

function deleteUser(username) {
  console.log('حذف کاربر:', username);
  if (typeof UIModule !== 'undefined' && UIModule.showNotification) {
    UIModule.showNotification(`حذف کاربر ${username} در حال توسعه است`, 'info');
  } else {
    alert(`حذف کاربر ${username} در حال توسعه است`);
  }
}
