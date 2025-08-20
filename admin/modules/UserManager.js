/**
 * User Management Module
 * ماژول مدیریت کاربران - شامل تمام عملیات CRUD کاربران
 */

class UserManager {
    constructor() {
        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.filterStatus = 'all';
        this.isLoading = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    // تابع helper برای درخواست‌های معتبر
    async makeAuthenticatedRequest(url, options = {}) {
        const defaultOptions = {
            credentials: 'include', // ارسال کوکی‌ها
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        return fetch(url, defaultOptions);
    }
    
    // شناسایی المنت‌های DOM
    initializeElements() {
        this.elements = {
            // Table elements
            usersTable: document.getElementById('usersTable'),
            usersTableBody: document.getElementById('usersTableBody'),
            
            // Action buttons
            addUserBtn: document.getElementById('addUserBtn'),
            refreshUsersBtn: document.getElementById('refreshUsersBtn'),
            exportUsersBtn: document.getElementById('exportUsersBtn'),
            
            // Search and filters
            userSearchInput: document.getElementById('userSearchInput'),
            statusFilter: document.getElementById('statusFilter'),
            
            // Pagination
            paginationContainer: document.getElementById('usersPagination'),
            
            // Modal elements
            userModal: document.getElementById('userModal'),
            userForm: document.getElementById('userForm'),
            modalTitle: document.getElementById('modalTitle'),
            
            // Form fields
            userIdField: document.getElementById('userId'),
            firstNameField: document.getElementById('firstName'),
            lastNameField: document.getElementById('lastName'),
            usernameField: document.getElementById('username'),
            passwordField: document.getElementById('password'),
            emailField: document.getElementById('email'),
            phoneField: document.getElementById('phone'),
            profileImageField: document.getElementById('profileImage'),
            isActiveField: document.getElementById('isActive'),
            expiryDateField: document.getElementById('expiryDate'),
            maxChatsField: document.getElementById('maxChats'),
            maxResponsesField: document.getElementById('maxResponses'),
            roleField: document.getElementById('role')
        };
        
        console.log('👥 UserManager elements initialized');
    }
    
    // راه‌اندازی Event Listeners
    setupEventListeners() {
        // دکمه افزودن کاربر
        if (this.elements.addUserBtn) {
            this.elements.addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }
        
        // دکمه تازه‌سازی
        if (this.elements.refreshUsersBtn) {
            this.elements.refreshUsersBtn.addEventListener('click', () => this.loadUsers());
        }
        
        // دکمه صادر کردن
        if (this.elements.exportUsersBtn) {
            this.elements.exportUsersBtn.addEventListener('click', () => this.exportUsers());
        }
        
        // جستجو
        if (this.elements.userSearchInput) {
            this.elements.userSearchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.searchUsers();
            });
        }
        
        // فیلتر وضعیت
        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.filterUsers();
            });
        }
        
        // فرم کاربر
        if (this.elements.userForm) {
            this.elements.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        console.log('👥 UserManager event listeners setup completed');
    }
    
    // بارگذاری لیست کاربران
    async loadUsers() {
        console.log('👥 بارگذاری لیست کاربران...');
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            const response = await this.makeAuthenticatedRequest('/api/admin/users');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
            
            console.log('👤 کاربران دریافت شد:', this.users.length);
            this.renderUsers();
            this.updatePagination();
            
        } catch (error) {
            console.error('❌ خطا در بارگذاری کاربران:', error);
            this.showErrorState(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    // نمایش کاربران در جدول
    renderUsers() {
        if (!this.elements.usersTableBody) {
            console.error('❌ usersTableBody element not found');
            return;
        }
        
        if (this.users.length === 0) {
            this.elements.usersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">
                        <i class="fas fa-users"></i>
                        <p>هیچ کاربری یافت نشد</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // صفحه‌بندی
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUsers = this.users.slice(startIndex, endIndex);
        
        let html = '';
        paginatedUsers.forEach(user => {
            const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '---';
            const lastActivity = user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('fa-IR') : '---';
            const expiryDate = user.expiryDate ? new Date(user.expiryDate).toLocaleDateString('fa-IR') : 'نامحدود';
            
            const statusClass = user.isActive ? 'status-active' : 'status-inactive';
            const statusText = user.isActive ? 'فعال' : 'غیرفعال';
            
            const roleClass = user.role === 'admin' ? 'role-admin' : 'role-user';
            const roleText = user.role === 'admin' ? 'ادمین' : 'کاربر';
            
            html += `
                <tr data-user-id="${user.username}">
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">
                                <img src="${user.profileImage || '/default-avatar.svg'}" alt="${user.firstName || user.username}" onerror="this.src='/default-avatar.svg'">
                            </div>
                            <div class="user-details">
                                <strong>${user.firstName || ''} ${user.lastName || ''}</strong>
                                <small>@${user.username}</small>
                            </div>
                        </div>
                    </td>
                    <td>${user.email || '---'}</td>
                    <td>${user.phone || '---'}</td>
                    <td>${joinDate}</td>
                    <td>${lastActivity}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td><span class="role ${roleClass}">${roleText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="window.userManager.editUser('${user.username}')" title="ویرایش">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="window.userManager.viewUser('${user.username}')" title="مشاهده جزئیات">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="window.userManager.toggleUserStatus('${user.username}')" title="تغییر وضعیت">
                                <i class="fas fa-toggle-${user.isActive ? 'on' : 'off'}"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="window.userManager.deleteUser('${user.username}')" title="حذف" ${user.username === 'admin' ? 'disabled' : ''}>
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        this.elements.usersTableBody.innerHTML = html;
        console.log('✅ کاربران در جدول نمایش داده شدند');
    }
    
    // نمایش وضعیت بارگذاری
    showLoadingState() {
        if (this.elements.usersTableBody) {
            this.elements.usersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>در حال بارگذاری...</p>
                    </td>
                </tr>
            `;
        }
    }
    
    // نمایش وضعیت خطا
    showErrorState(message) {
        if (this.elements.usersTableBody) {
            this.elements.usersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>خطا در بارگذاری: ${message}</p>
                        <button class="btn btn-sm btn-primary" onclick="window.userManager.loadUsers()">تلاش مجدد</button>
                    </td>
                </tr>
            `;
        }
    }
    
    // نمایش مودال افزودن کاربر
    showAddUserModal() {
        this.clearForm();
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = 'افزودن کاربر جدید';
        }
        this.showModal();
    }
    
    // ویرایش کاربر
    async editUser(username) {
        console.log('✏️ ویرایش کاربر:', username);
        
        const user = this.users.find(u => u.username === username);
        if (!user) {
            alert('کاربر یافت نشد!');
            return;
        }
        
        this.fillForm(user);
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = `ویرایش کاربر: ${user.username}`;
        }
        this.showModal();
    }
    
    // مشاهده جزئیات کاربر
    viewUser(username) {
        console.log('👁️ مشاهده جزئیات کاربر:', username);
        
        const user = this.users.find(u => u.username === username);
        if (!user) {
            alert('کاربر یافت نشد!');
            return;
        }
        
        // اینجا می‌توانید مودال جزئیات کاربر را نمایش دهید
        this.showUserDetailsModal(user);
    }
    
    // تغییر وضعیت کاربر (فعال/غیرفعال)
    async toggleUserStatus(username) {
        console.log('🔄 تغییر وضعیت کاربر:', username);
        
        if (username === 'admin') {
            alert('امکان تغییر وضعیت کاربر ادمین وجود ندارد!');
            return;
        }
        
        const user = this.users.find(u => u.username === username);
        if (!user) {
            alert('کاربر یافت نشد!');
            return;
        }
        
        const newStatus = !user.isActive;
        const statusText = newStatus ? 'فعال' : 'غیرفعال';
        
        if (confirm(`آیا مطمئن هستید که می‌خواهید وضعیت کاربر "${username}" را به "${statusText}" تغییر دهید؟`)) {
            try {
                const response = await this.makeAuthenticatedRequest(`/api/admin/users/${username}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: newStatus })
                });
                
                if (response.ok) {
                    user.isActive = newStatus;
                    this.renderUsers();
                    alert(`وضعیت کاربر "${username}" با موفقیت به "${statusText}" تغییر یافت.`);
                } else {
                    throw new Error(`خطا در تغییر وضعیت: ${response.status}`);
                }
            } catch (error) {
                console.error('❌ خطا در تغییر وضعیت:', error);
                alert(`خطا در تغییر وضعیت: ${error.message}`);
            }
        }
    }
    
    // حذف کاربر
    async deleteUser(username) {
        console.log('🗑️ درخواست حذف کاربر:', username);
        
        if (username === 'admin') {
            alert('امکان حذف کاربر ادمین وجود ندارد!');
            return;
        }
        
        if (confirm(`آیا مطمئن هستید که می‌خواهید کاربر "${username}" را حذف کنید؟\n\nاین عملیات غیرقابل برگشت است و تمام چت‌ها و داده‌های این کاربر نیز حذف خواهد شد.`)) {
            try {
                const response = await this.makeAuthenticatedRequest(`/api/admin/users/${username}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    this.users = this.users.filter(u => u.username !== username);
                    this.renderUsers();
                    this.updatePagination();
                    alert(`کاربر "${username}" با موفقیت حذف شد.`);
                } else {
                    throw new Error(`خطا در حذف کاربر: ${response.status}`);
                }
            } catch (error) {
                console.error('❌ خطا در حذف کاربر:', error);
                alert(`خطا در حذف کاربر: ${error.message}`);
            }
        }
    }
    
    // جستجوی کاربران
    searchUsers() {
        if (!this.searchQuery.trim()) {
            this.loadUsers();
            return;
        }
        
        const filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            (user.firstName && user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
            (user.lastName && user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
        );
        
        this.users = filteredUsers;
        this.currentPage = 1;
        this.renderUsers();
        this.updatePagination();
    }
    
    // فیلتر کاربران بر اساس وضعیت
    filterUsers() {
        this.loadUsers(); // بارگذاری مجدد از سرور و اعمال فیلتر
    }
    
    // به‌روزرسانی صفحه‌بندی
    updatePagination() {
        const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
        
        if (!this.elements.paginationContainer || totalPages <= 1) {
            if (this.elements.paginationContainer) {
                this.elements.paginationContainer.style.display = 'none';
            }
            return;
        }
        
        this.elements.paginationContainer.style.display = 'block';
        
        let html = '';
        
        // دکمه قبلی
        html += `<button class="btn btn-sm ${this.currentPage === 1 ? 'disabled' : ''}" onclick="window.userManager.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
        
        // شماره صفحات
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                html += `<button class="btn btn-sm btn-primary active">${i}</button>`;
            } else {
                html += `<button class="btn btn-sm" onclick="window.userManager.goToPage(${i})">${i}</button>`;
            }
        }
        
        // دکمه بعدی
        html += `<button class="btn btn-sm ${this.currentPage === totalPages ? 'disabled' : ''}" onclick="window.userManager.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
        
        this.elements.paginationContainer.innerHTML = html;
    }
    
    // رفتن به صفحه مشخص
    goToPage(page) {
        const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderUsers();
        this.updatePagination();
    }
    
    // مدیریت مودال
    showModal() {
        if (this.elements.userModal) {
            this.elements.userModal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }
    
    hideModal() {
        if (this.elements.userModal) {
            this.elements.userModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // پاک کردن فرم
    clearForm() {
        if (this.elements.userForm) {
            this.elements.userForm.reset();
        }
        if (this.elements.userIdField) {
            this.elements.userIdField.value = '';
        }
    }
    
    // پر کردن فرم با اطلاعات کاربر
    fillForm(user) {
        if (this.elements.userIdField) this.elements.userIdField.value = user.username || '';
        if (this.elements.firstNameField) this.elements.firstNameField.value = user.firstName || '';
        if (this.elements.lastNameField) this.elements.lastNameField.value = user.lastName || '';
        if (this.elements.usernameField) this.elements.usernameField.value = user.username || '';
        if (this.elements.emailField) this.elements.emailField.value = user.email || '';
        if (this.elements.phoneField) this.elements.phoneField.value = user.phone || '';
        if (this.elements.profileImageField) this.elements.profileImageField.value = user.profileImage || '';
        if (this.elements.isActiveField) this.elements.isActiveField.checked = user.isActive !== false;
        if (this.elements.expiryDateField) this.elements.expiryDateField.value = user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : '';
        if (this.elements.maxChatsField) this.elements.maxChatsField.value = user.maxChats || '';
        if (this.elements.maxResponsesField) this.elements.maxResponsesField.value = user.maxResponses || '';
        if (this.elements.roleField) this.elements.roleField.value = user.role || 'user';
    }
    
    // ذخیره/به‌روزرسانی کاربر
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.elements.userForm);
        const userData = Object.fromEntries(formData.entries());
        
        // تبدیل checkbox به boolean
        userData.isActive = this.elements.isActiveField?.checked || false;
        
        // حذف فیلدهای خالی
        Object.keys(userData).forEach(key => {
            if (!userData[key] || userData[key].trim() === '') {
                delete userData[key];
            }
        });
        
        const isEditing = !!this.elements.userIdField?.value;
        const url = isEditing ? `/api/admin/users/${this.elements.userIdField.value}` : '/api/admin/users';
        const method = isEditing ? 'PUT' : 'POST';
        
        try {
            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ کاربر ذخیره شد:', result);
                
                this.hideModal();
                this.loadUsers(); // بارگذاری مجدد لیست
                
                const actionText = isEditing ? 'به‌روزرسانی' : 'ایجاد';
                alert(`کاربر با موفقیت ${actionText} شد.`);
            } else {
                throw new Error(`خطا در ذخیره کاربر: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ خطا در ذخیره کاربر:', error);
            alert(`خطا در ذخیره کاربر: ${error.message}`);
        }
    }
    
    // صادر کردن لیست کاربران
    exportUsers() {
        console.log('📤 صادر کردن لیست کاربران...');
        
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        alert('فایل CSV با موفقیت دانلود شد.');
    }
    
    // تولید محتوای CSV
    generateCSV() {
        const headers = ['نام کاربری', 'نام', 'نام خانوادگی', 'ایمیل', 'شماره همراه', 'وضعیت', 'نقش', 'تاریخ عضویت'];
        let csv = headers.join(',') + '\n';
        
        this.users.forEach(user => {
            const row = [
                user.username || '',
                user.firstName || '',
                user.lastName || '',
                user.email || '',
                user.phone || '',
                user.isActive ? 'فعال' : 'غیرفعال',
                user.role === 'admin' ? 'ادمین' : 'کاربر',
                user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : ''
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });
        
        return csv;
    }
    
    // نمایش مودال جزئیات کاربر
    showUserDetailsModal(user) {
        // این تابع را می‌توانید برای نمایش جزئیات کامل کاربر پیاده‌سازی کنید
        console.log('👁️ نمایش جزئیات کاربر:', user);
        
        const details = `
نام کاربری: ${user.username}
نام: ${user.firstName || '---'}
نام خانوادگی: ${user.lastName || '---'}
ایمیل: ${user.email || '---'}
شماره همراه: ${user.phone || '---'}
وضعیت: ${user.isActive ? 'فعال' : 'غیرفعال'}
نقش: ${user.role === 'admin' ? 'ادمین' : 'کاربر'}
تاریخ عضویت: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '---'}
آخرین فعالیت: ${user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('fa-IR') : '---'}
تعداد چت: ${user.chatCount || 0}
        `.trim();
        
        alert(details);
    }
}

// ایجاد instance از UserManager
let userManager;

// صادر کردن کلاس
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
} else {
    window.UserManager = UserManager;
}
