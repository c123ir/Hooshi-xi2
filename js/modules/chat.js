/**
 * ماژول مدیریت چت - نسخه بهینه شده
 * @author Agent ChatGPT  
 * @version 2.0.0
 */

// متغیرها - Sync با window برای backward compatibility
let chats = [];
let currentChatId = null;
let currentMessages = [];

// Sync with window objects
Object.defineProperty(window, 'chats', {
    get: () => chats,
    set: (value) => { chats = value; }
});
Object.defineProperty(window, 'currentChatId', {
    get: () => currentChatId,
    set: (value) => { currentChatId = value; }
});
Object.defineProperty(window, 'currentMessages', {
    get: () => currentMessages,
    set: (value) => { currentMessages = value; }
});

// عناصر DOM
let chatContainer, chatList, searchInput, currentSubject;

// مقداردهی
function initDOM() {
    // تلاش چندباره برای یافتن elements
    const tryInit = () => {
        chatContainer = document.getElementById('chat-container');
        chatList = document.getElementById('chatList');
        searchInput = document.getElementById('searchInput');
        currentSubject = document.getElementById('currentSubject');
        
        console.log('💬 مقداردهی DOM:', {
            chatContainer: !!chatContainer,
            chatList: !!chatList,
            searchInput: !!searchInput,
            currentSubject: !!currentSubject
        });
        
        // اگر chatList پیدا نشد، 100ms بعد دوباره تلاش کن
        if (!chatList) {
            console.log('💬 chatList هنوز آماده نیست - تلاش مجدد...');
            setTimeout(tryInit, 100);
        }
    };
    
    tryInit();
}

// بارگیری چت‌ها
async function fetchChats() {
    console.log('💬 شروع بارگیری چت‌ها...');
    
    try {
        const res = await fetch('/api/chats');
        console.log('💬 پاسخ API:', res.status, res.statusText);
        
        if (res.ok) {
            chats = await res.json();
            console.log('💬 چت‌های دریافتی:', chats.length, chats);
            renderChatList();
        } else {
            console.error('💬 خطا در API:', res.status);
        }
    } catch (error) {
        console.error('💬 خطا در بارگیری چت‌ها:', error);
    }
}

// رندر لیست چت‌ها
function renderChatList() {
    console.log('💬 رندر لیست چت‌ها:', {
        chatList: !!chatList,
        chats: chats.length,
        searchValue: searchInput?.value
    });
    
    // اگر chatList موجود نیست، دوباره DOM را init کن
    if (!chatList) {
        console.warn('💬 عنصر chatList پیدا نشد! تلاش مجدد...');
        chatList = document.getElementById('chatList');
        
        if (!chatList) {
            console.error('💬 هنوز chatList پیدا نشد - 500ms بعد تلاش مجدد');
            setTimeout(renderChatList, 500);
            return;
        }
    }
    
    const filteredChats = searchInput?.value ? 
        chats.filter(chat => chat.subject.includes(searchInput.value)) : chats;
    
    console.log('💬 چت‌های فیلتر شده:', filteredChats.length);
    
    chatList.innerHTML = filteredChats.map(chat => `
        <li class="${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
            <div class="chat-title">${chat.subject}</div>
            <div class="chat-date">${new Date(chat.createdAt).toLocaleDateString('fa-IR')}</div>
        </li>
    `).join('');
    
    console.log('💬 HTML تولید شد:', chatList.innerHTML.length, 'کاراکتر');
    
    // Event listeners
    const chatItems = chatList.querySelectorAll('li');
    console.log('💬 تعداد chat items برای event listener:', chatItems.length);
    
    chatItems.forEach((item, index) => {
        const chatId = item.dataset.id;
        console.log(`💬 اضافه کردن click event برای چت ${index}: ${chatId}`);
        item.addEventListener('click', () => {
            console.log('💬 کلیک روی چت:', chatId);
            loadChat(chatId);
        });
    });
}

// بارگیری چت
async function loadChat(chatId) {
    console.log('💬 شروع بارگیری چت:', chatId);
    try {
        console.log('💬 ارسال درخواست به API:', `/api/chats/${chatId}`);
        const res = await fetch(`/api/chats/${chatId}`);
        console.log('💬 پاسخ API برای چت:', res.status, res.ok);
        
        if (res.ok) {
            const chat = await res.json();
            console.log('💬 چت دریافت شد:', chat);
            currentChatId = chatId;
            currentMessages = chat.messages || [];
            console.log('💬 پیام‌های چت:', currentMessages.length);
            
            if (currentSubject) {
                currentSubject.textContent = chat.subject;
                console.log('💬 عنوان چت تنظیم شد:', chat.subject);
            }
            renderMessages();
            renderChatList();
        } else {
            console.error('💬 خطا در بارگیری چت:', res.status, await res.text());
        }
    } catch (error) {
        console.error('💬 خطا در بارگیری چت:', error);
    }
}

// رندر پیام‌ها
function renderMessages() {
    console.log('💬 شروع renderMessages...', {
        chatContainer: !!chatContainer,
        currentMessages: currentMessages?.length || 0,
        currentChatId
    });
    
    if (!chatContainer) {
        console.warn('💬 chatContainer پیدا نشد! تلاش مجدد...');
        chatContainer = document.getElementById('chat-container');
        
        if (!chatContainer) {
            console.error('💬 هنوز chatContainer پیدا نشد - 500ms بعد تلاش مجدد');
            setTimeout(renderMessages, 500);
            return;
        }
    }
    
    console.log('💬 پیام‌های فعلی:', currentMessages);
    
    chatContainer.innerHTML = currentMessages.map((msg, index) => {
        const content = msg.content || '';
        console.log(`💬 رندر پیام ${index}:`, msg.role, content.substring(0, 50) + '...');
        return `
        <div class="message ${msg.role}">
            <div class="message-content">${content}</div>
            <div class="message-actions">
                <button class="action-btn tts-btn" onclick="window.TTSModule?.speakText('${content.replace(/'/g, '\\\'')}')" title="پخش صوتی">
                    <i class="fa fa-volume-up"></i>
                </button>
                <button class="action-btn copy-btn" onclick="window.UIModule?.copyToClipboard('${content.replace(/'/g, '\\\'')}', this)" title="کپی">
                    <i class="fa fa-copy"></i>
                </button>
                <button class="action-btn edit-btn" onclick="window.ChatModule?.editMessage(${index})" title="ویرایش">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="window.ChatModule?.deleteMessage(${index})" title="حذف">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
    
    console.log('💬 HTML پیام‌ها تولید شد:', chatContainer.innerHTML.length, 'کاراکتر');
    scrollToBottom();
}

// اسکرول به پایین
function scrollToBottom() {
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// پیام جدید
async function sendMessage(content) {
    if (!content?.trim()) return;
    
    try {
        // اگر چت جدید است
        if (!currentChatId) {
            const newChatRes = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: content.slice(0, 50) })
            });
            
            if (newChatRes.ok) {
                const newChat = await newChatRes.json();
                currentChatId = newChat.id;
                chats.unshift(newChat);
            }
        }
        
        // افزودن پیام کاربر
        currentMessages.push({ role: 'user', content });
        renderMessages();
        
        // افزودن پیام "در حال فکر کردن..."
        currentMessages.push({ role: 'assistant', content: 'در حال فکر کردن...' });
        renderMessages();
        
        // ارسال به API
        const res = await fetch(`/api/chats/${currentChatId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: content,
                model: localStorage.getItem('openai_model') || 'gpt-4o-mini'
            })
        });
        
        if (res.ok) {
            const data = await res.json();
            currentMessages[currentMessages.length - 1] = { role: 'assistant', content: data.response };
            renderMessages();
        } else {
            currentMessages.pop(); // حذف "در حال فکر کردن..."
            renderMessages();
            throw new Error('خطا در دریافت پاسخ');
        }
    } catch (error) {
        console.error('خطا در ارسال پیام:', error);
        if (window.UIModule) window.UIModule.showNotification('خطا در ارسال پیام');
    }
}

// چت جدید
function newChat() {
    currentChatId = null;
    currentMessages = [];
    if (currentSubject) currentSubject.textContent = 'چت جدید';
    if (chatContainer) chatContainer.innerHTML = '';
    renderChatList();
}

// ویرایش پیام
function editMessage(index) {
    const message = currentMessages[index];
    if (!message) return;
    
    const newContent = prompt('ویرایش پیام:', message.content);
    if (newContent !== null) {
        currentMessages[index].content = newContent;
        renderMessages();
        saveChat();
    }
}

// حذف پیام
function deleteMessage(index) {
    if (confirm('آیا از حذف این پیام مطمئن هستید؟')) {
        currentMessages.splice(index, 1);
        renderMessages();
        saveChat();
    }
}

// تنظیم Event Listeners
function setupEventListeners() {
    // جستجو در چت‌ها
    if (searchInput) {
        searchInput.addEventListener('input', renderChatList);
    }
    
    // چت جدید
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', newChat);
    }
    
    // گوش دادن به تغییرات auth
    document.addEventListener('authStatusChanged', (e) => {
        console.log('💬 وضعیت auth تغییر کرد:', e.detail);
        if (e.detail?.isLoggedIn) {
            fetchChats();
        } else {
            // پاک کردن چت‌ها
            chats = [];
            currentChatId = null;
            currentMessages = [];
            if (chatList) chatList.innerHTML = '';
            if (chatContainer) chatContainer.innerHTML = '';
        }
    });
}

// ذخیره چت
async function saveChat() {
    if (!currentChatId) return;
    
    try {
        await fetch(`/api/chats/${currentChatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: currentMessages })
        });
    } catch (error) {
        console.error('خطا در ذخیره چت:', error);
    }
}

// مقداردهی ماژول چت
function init() {
    console.log('💬 شروع مقداردهی ماژول چت...');
    
    // انتظار برای آماده شدن کامل DOM
    const waitForDOM = () => {
        return new Promise((resolve) => {
            const checkDOM = () => {
                const chatListEl = document.getElementById('chatList');
                const chatContainerEl = document.getElementById('chat-container');
                
                if (chatListEl && chatContainerEl) {
                    console.log('💬 DOM آماده است!');
                    resolve();
                } else {
                    console.log('💬 انتظار برای آماده شدن DOM...');
                    setTimeout(checkDOM, 50);
                }
            };
            checkDOM();
        });
    };
    
    // انتظار برای DOM و سپس ادامه
    waitForDOM().then(() => {
        initDOM();
        setupEventListeners();
        
        // بارگیری چت‌ها
        if (window.AuthModule?.getCurrentUser()) {
            console.log('💬 کاربر وارد است - بارگیری چت‌ها...');
            fetchChats();
        } else {
            console.log('💬 کاربر وارد نیست - انتظار ورود...');
        }
        
        console.log('💬 ماژول چت مقداردهی شد');
    });
}

// Export کردن توابع
if (typeof window !== 'undefined') {
    window.ChatModule = {
        init,
        fetchChats,
        renderChatList,
        loadChat,
        renderMessages,
        sendMessage,
        newChat,
        editMessage,
        deleteMessage,
        saveChat,
        scrollToBottom
    };
}

console.log('📦 ماژول چت بارگذاری شد - ChatModule در window قرار گرفت');
