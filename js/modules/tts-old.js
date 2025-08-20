/**
 * ماژول تبدیل متن به گفتار (TTS) - Text to Speech Module
 * 
 * این ماژول شامل تمامی عملکردهای مربوط به:
 * - تبدیل متن به گفتار
 * - کنترل‌های شناور صوتی
 * - تنظیمات صدا و کیفیت
 * - مدیریت پخش و توقف صدا
 * - ذخیره و بارگیری تنظیمات کاربری
 * 
 * @author Agent ChatGPT
 * @version 1.0.0
 * @requires OpenAI TTS API
 */

/**
 * تنظیمات پیش‌فرض TTS
 */
let ttsSettings = {
    voice: 'alloy',
    speed: 1.0,
    gender: 'neutral',
    quality: 'standard',
    costTier: 'medium'
};

/**
 * متغیرهای مربوط به پخش صدا
 */
let currentSpeech = null;
let isPaused = false;

/**
 * عناصر DOM مربوط به TTS
 */
let ttsSettingsModal = null;
let ttsVoiceEl = null;
let ttsSpeedEl = null;
let ttsSpeedValueEl = null;
let ttsTestBtn = null;
let ttsSaveBtn = null;
let ttsCloseBtn = null;
let floatingControl = null;
let floatingPlayPauseBtn = null;
let floatingStopBtn = null;

/**
 * مقداردهی اولیه عناصر DOM
 */
function initializeDOMElements() {
    try {
        ttsSettingsModal = document.getElementById('ttsSettingsModal');
        ttsVoiceEl = document.getElementById('ttsVoice');
        ttsSpeedEl = document.getElementById('ttsSpeed');
        ttsSpeedValueEl = document.getElementById('ttsSpeedValue');
        ttsTestBtn = document.getElementById('ttsTestBtn');
        ttsSaveBtn = document.getElementById('ttsSaveBtn');
        ttsCloseBtn = document.getElementById('ttsCloseBtn');
        floatingControl = document.getElementById('floatingTTSControl');
        floatingPlayPauseBtn = document.getElementById('floatingPlayPause');
        floatingStopBtn = document.getElementById('floatingStop');

        // بارگیری تنظیمات از localStorage در صورت عدم وجود کاربر
        const savedVoice = localStorage.getItem('tts_voice');
        const savedSpeed = localStorage.getItem('tts_speed');
        if (savedVoice) ttsSettings.voice = savedVoice;
        if (savedSpeed) ttsSettings.speed = parseFloat(savedSpeed);

        console.log('عناصر DOM ماژول TTS با موفقیت مقداردهی شدند');
    } catch (error) {
        console.error('خطا در مقداردهی عناصر DOM ماژول TTS:', error);
    }
}

/**
 * نمایش کنترل‌های شناور TTS
 */
function showFloatingControl() {
    try {
        if (floatingControl) {
            floatingControl.style.display = 'flex';
            updateFloatingButtons();
            console.log('کنترل‌های شناور TTS نمایش داده شدند');
        }
    } catch (error) {
        console.error('خطا در نمایش کنترل‌های شناور:', error);
    }
}

/**
 * مخفی کردن کنترل‌های شناور TTS
 */
function hideFloatingControl() {
    try {
        if (floatingControl) {
            floatingControl.style.display = 'none';
        }
    } catch (error) {
        console.error('خطا در مخفی کردن کنترل‌های شناور:', error);
    }
}

/**
 * تنظیم وضعیت مکث کنترل‌های شناور
 * @param {boolean} paused - وضعیت مکث
 */
function setFloatingPaused(paused) {
    try {
        isPaused = paused;
        updateFloatingButtons();
    } catch (error) {
        console.error('خطا در تنظیم وضعیت مکث:', error);
    }
}

/**
 * بروزرسانی دکمه‌های کنترل شناور
 */
function updateFloatingButtons() {
    try {
        if (floatingPlayPauseBtn) {
            floatingPlayPauseBtn.textContent = isPaused ? '▶️' : '⏸️';
            floatingPlayPauseBtn.title = isPaused ? 'ادامه پخش' : 'مکث';
        }
    } catch (error) {
        console.error('خطا در بروزرسانی دکمه‌های شناور:', error);
    }
}

/**
 * توقف پخش فعلی صدا
 */
function stopCurrentSpeech() {
    try {
        if (currentSpeech) {
            currentSpeech.pause();
            currentSpeech.currentTime = 0;
            currentSpeech = null;
            isPaused = false;
            hideFloatingControl();
            console.log('پخش صدا متوقف شد');
        }
    } catch (error) {
        console.error('خطا در توقف پخش صدا:', error);
    }
}

/**
 * توقف تمامی پخش‌های صوتی
 */
function stopAllSpeech() {
    try {
        // توقف TTS فعلی
        stopCurrentSpeech();
        
        // توقف تمامی عناصر صوتی در صفحه
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        console.log('تمامی پخش‌های صوتی متوقف شدند');
    } catch (error) {
        console.error('خطا در توقف تمامی پخش‌های صوتی:', error);
    }
}

/**
 * تبدیل متن به گفتار
 * @param {string} text - متن مورد نظر برای تبدیل
 * @param {Object} options - تنظیمات اختیاری
 */
async function speakText(text, options = {}) {
    try {
        if (!text || text.trim() === '') {
            showTTSNotification('متنی برای تبدیل به گفتار یافت نشد');
            return;
        }

        // توقف پخش قبلی
        stopCurrentSpeech();

        const settings = { ...ttsSettings, ...options };
        
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text.trim(),
                voice: settings.voice,
                speed: settings.speed
            })
        });

        if (!response.ok) {
            throw new Error(`خطای سرور: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        currentSpeech = audio;
        
        // تنظیم event listeners
        audio.onloadstart = () => {
            console.log('شروع بارگیری صدا...');
        };
        
        audio.oncanplay = () => {
            console.log('صدا آماده پخش است');
        };
        
        audio.onplay = () => {
            setFloatingPaused(false);
            showFloatingControl();
            console.log('پخش صدا شروع شد');
        };
        
        audio.onpause = () => {
            setFloatingPaused(true);
            console.log('پخش صدا متوقف شد');
        };
        
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            hideFloatingControl();
            currentSpeech = null;
            isPaused = false;
            console.log('پخش صدا به پایان رسید');
        };
        
        audio.onerror = (error) => {
            console.error('خطا در پخش صدا:', error);
            URL.revokeObjectURL(audioUrl);
            hideFloatingControl();
            currentSpeech = null;
            isPaused = false;
            showTTSNotification('خطا در پخش صدا');
        };

        await audio.play();
        
    } catch (error) {
        console.error('خطا در تبدیل متن به گفتار:', error);
        showTTSNotification('خطا در تبدیل متن به گفتار');
        hideFloatingControl();
        currentSpeech = null;
    }
}

/**
 * تبدیل محتوای متنی یک عنصر به گفتار
 * @param {HTMLElement} element - عنصر حاوی متن
 */
function speakTextContent(element) {
    try {
        if (!element) {
            console.warn('عنصر مورد نظر یافت نشد');
            return;
        }

        let text = '';
        
        // استخراج متن بر اساس نوع عنصر
        if (element.classList.contains('user-message') || element.classList.contains('assistant-message')) {
            // برای پیام‌های چت
            const messageContent = element.querySelector('.message-content');
            text = messageContent ? messageContent.textContent : element.textContent;
        } else {
            text = element.textContent || element.innerText;
        }

        if (text && text.trim()) {
            speakText(text.trim());
        } else {
            showTTSNotification('متنی برای خواندن یافت نشد');
        }
    } catch (error) {
        console.error('خطا در تبدیل محتوای عنصر به گفتار:', error);
        showTTSNotification('خطا در تبدیل محتوا به گفتار');
    }
}

/**
 * خواندن تمامی پیام‌های چت
 */
async function speakAllMessages() {
    try {
        const messages = document.querySelectorAll('.user-message, .assistant-message');
        
        if (messages.length === 0) {
            showTTSNotification('پیامی برای خواندن یافت نشد');
            return;
        }

        // توقف پخش قبلی
        stopCurrentSpeech();

        let allText = '';
        messages.forEach((msg, index) => {
            const messageContent = msg.querySelector('.message-content');
            const text = messageContent ? messageContent.textContent : msg.textContent;
            if (text && text.trim()) {
                const speaker = msg.classList.contains('user-message') ? 'کاربر می‌گوید: ' : 'دستیار می‌گوید: ';
                allText += speaker + text.trim() + '\n\n';
            }
        });

        if (allText.trim()) {
            await speakText(allText.trim());
        } else {
            showTTSNotification('محتوای قابل خواندنی یافت نشد');
        }
    } catch (error) {
        console.error('خطا در خواندن تمامی پیام‌ها:', error);
        showTTSNotification('خطا در خواندن پیام‌ها');
    }
}

/**
 * نمایش نوتیفیکیشن TTS
 * @param {string} message - پیام نوتیفیکیشن
 */
function showTTSNotification(message) {
    try {
        // حذف نوتیفیکیشن قبلی اگر وجود دارد
        const existing = document.querySelector('.tts-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'tts-notification';
        notification.textContent = message;
        
        // اضافه کردن استایل‌های inline در صورت عدم وجود CSS
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(notification);
        
        // نمایش با انیمیشن
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // حذف بعد از 2 ثانیه
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
        
    } catch (error) {
        console.error('خطا در نمایش نوتیفیکیشن:', error);
    }
}

/**
 * باز کردن مودال تنظیمات TTS
 */
function openTTSSettings() {
    try {
        // مقداردهی کنترل‌ها بر اساس تنظیمات فعلی
        if (ttsVoiceEl) ttsVoiceEl.value = ttsSettings.voice;
        if (ttsSpeedEl) {
            ttsSpeedEl.value = ttsSettings.speed;
            if (ttsSpeedValueEl) ttsSpeedValueEl.textContent = `${ttsSettings.speed}x`;
        }
        
        // تنظیم جنسیت صدا
        const gender = ttsSettings.gender || 'neutral';
        const genderInput = document.querySelector(`input[name="ttsGender"][value="${gender}"]`);
        if (genderInput) genderInput.checked = true;
        
        // تنظیم کیفیت و هزینه
        const qualityEl = document.getElementById('ttsQuality');
        if (qualityEl) qualityEl.value = ttsSettings.quality || 'standard';
        
        const costTierEl = document.getElementById('ttsCostTier');
        if (costTierEl) costTierEl.value = ttsSettings.costTier || 'medium';
        
        // بروزرسانی تخمین هزینه
        estimateCost();

        // نمایش مودال
        if (ttsSettingsModal) {
            ttsSettingsModal.style.display = 'flex';
        }
        
        console.log('مودال تنظیمات TTS باز شد');
    } catch (error) {
        console.error('خطا در باز کردن تنظیمات TTS:', error);
        showTTSNotification('خطا در باز کردن تنظیمات');
    }
}

/**
 * بستن مودال تنظیمات TTS
 */
function closeTTSSettings() {
    try {
        if (ttsSettingsModal) {
            ttsSettingsModal.style.display = 'none';
        }
        console.log('مودال تنظیمات TTS بسته شد');
    } catch (error) {
        console.error('خطا در بستن تنظیمات TTS:', error);
    }
}

/**
 * ذخیره تنظیمات TTS
 */
async function saveTTSSettings() {
    try {
        // جمع‌آوری مقادیر جدید
        const newSettings = {};
        newSettings.voice = ttsVoiceEl?.value || ttsSettings.voice;
        newSettings.rate = parseFloat(ttsSpeedEl?.value || ttsSettings.speed);
        
        const genderInput = document.querySelector('input[name="ttsGender"]:checked');
        newSettings.gender = genderInput?.value || ttsSettings.gender || 'neutral';
        
        newSettings.quality = document.getElementById('ttsQuality')?.value || ttsSettings.quality || 'standard';
        newSettings.costTier = document.getElementById('ttsCostTier')?.value || ttsSettings.costTier || 'medium';
        newSettings.updatedAt = new Date().toISOString();

        // بروزرسانی cache محلی
        ttsSettings = {
            ...ttsSettings,
            voice: newSettings.voice,
            speed: newSettings.rate,
            gender: newSettings.gender,
            quality: newSettings.quality,
            costTier: newSettings.costTier
        };

        // ذخیره در سرور اگر کاربر وارد شده باشد
        const currentAuth = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (currentAuth && currentAuth.username) {
            const response = await fetch(`/api/users/${encodeURIComponent(currentAuth.username)}/tts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ttsSettings: newSettings })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'خطا در ذخیره تنظیمات');
            }
            
            showTTSNotification('تنظیمات با موفقیت ذخیره شد');
        } else {
            // ذخیره در localStorage به عنوان پشتیبان
            localStorage.setItem('tts_voice', ttsSettings.voice);
            localStorage.setItem('tts_speed', ttsSettings.speed.toString());
            localStorage.setItem('tts_gender', ttsSettings.gender);
            localStorage.setItem('tts_quality', ttsSettings.quality);
            localStorage.setItem('tts_costTier', ttsSettings.costTier);
            
            showTTSNotification('تنظیمات ذخیره شد (محلی)');
        }

        // بستن مودال
        closeTTSSettings();
        
    } catch (error) {
        console.error('خطا در ذخیره تنظیمات TTS:', error);
        showTTSNotification(error.message || 'خطا در ذخیره تنظیمات');
    }
}

/**
 * بارگیری تنظیمات TTS مخصوص کاربر از سرور
 */
async function loadUserTTSSettings() {
    try {
        const currentAuth = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!currentAuth || !currentAuth.username) {
            console.log('کاربری وارد نشده، از تنظیمات محلی استفاده می‌شود');
            return;
        }
        
        const response = await fetch(`/api/users/${encodeURIComponent(currentAuth.username)}/tts`);
        if (!response.ok) {
            console.warn('خطا در خواندن تنظیمات TTS کاربر از سرور');
            return;
        }
        
        const data = await response.json();
        const serverSettings = data.ttsSettings || {};
        
        // ادغام تنظیمات سرور با تنظیمات محلی
        ttsSettings = {
            ...ttsSettings,
            voice: serverSettings.voice || ttsSettings.voice,
            speed: serverSettings.rate || ttsSettings.speed,
            gender: serverSettings.gender || ttsSettings.gender || 'neutral',
            quality: serverSettings.quality || ttsSettings.quality || 'standard',
            costTier: serverSettings.costTier || ttsSettings.costTier || 'medium'
        };
        
        // بروزرسانی کنترل‌های مودال اگر باز است
        updateModalControls();
        
        console.log('تنظیمات TTS کاربر از سرور بارگیری شد:', ttsSettings);
        
    } catch (error) {
        console.error('خطا در بارگیری تنظیمات TTS کاربر:', error);
    }
}

/**
 * بروزرسانی کنترل‌های مودال بر اساس تنظیمات فعلی
 */
function updateModalControls() {
    try {
        if (ttsVoiceEl) ttsVoiceEl.value = ttsSettings.voice;
        if (ttsSpeedEl) ttsSpeedEl.value = ttsSettings.speed;
        if (ttsSpeedValueEl) ttsSpeedValueEl.textContent = `${ttsSettings.speed}x`;
        
        const genderInput = document.querySelector(`input[name="ttsGender"][value="${ttsSettings.gender}"]`);
        if (genderInput) genderInput.checked = true;
        
        const qualityEl = document.getElementById('ttsQuality');
        if (qualityEl) qualityEl.value = ttsSettings.quality || 'standard';
        
        const costTierEl = document.getElementById('ttsCostTier');
        if (costTierEl) costTierEl.value = ttsSettings.costTier || 'medium';
        
        estimateCost();
    } catch (error) {
        console.error('خطا در بروزرسانی کنترل‌های مودال:', error);
    }
}

/**
 * تخمین هزینه بر اساس تنظیمات کیفیت
 */
function estimateCost() {
    try {
        const quality = document.getElementById('ttsQuality')?.value || ttsSettings.quality || 'standard';
        const tier = document.getElementById('ttsCostTier')?.value || ttsSettings.costTier || 'medium';
        
        // محاسبه تخمینی هزینه (دلار به ازای 1000 کاراکتر)
        let baseCost = quality === 'high' ? 0.06 : 0.02;
        
        switch(tier) {
            case 'low':
                baseCost *= 0.7;
                break;
            case 'high':
                baseCost *= 1.6;
                break;
            default: // medium
                baseCost *= 1.0;
        }
        
        const costElement = document.getElementById('costEstimate');
        if (costElement) {
            costElement.textContent = `$${baseCost.toFixed(3)}`;
        }
        
    } catch (error) {
        console.error('خطا در محاسبه تخمین هزینه:', error);
    }
}

/**
 * تست تنظیمات TTS
 */
async function testTTSSettings() {
    try {
        const sampleTextEl = document.getElementById('ttsSample');
        const sampleText = sampleTextEl?.value || 'این یک تست صدا است.';
        
        // استفاده از تنظیمات موقت از مودال
        const tempSettings = {
            voice: document.getElementById('ttsVoice')?.value || ttsSettings.voice,
            speed: parseFloat(document.getElementById('ttsSpeed')?.value || ttsSettings.speed)
        };

        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: sampleText, 
                voice: tempSettings.voice, 
                speed: tempSettings.speed 
            })
        });
        
        if (!response.ok) {
            throw new Error('خطا در دریافت صدای تست');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // توقف پخش قبلی
        if (currentSpeech) stopCurrentSpeech();

        const audio = new Audio(audioUrl);
        currentSpeech = audio;
        setFloatingPaused(false);
        showFloatingControl();

        audio.onended = () => { 
            URL.revokeObjectURL(audioUrl); 
            hideFloatingControl(); 
            currentSpeech = null; 
        };
        
        audio.onerror = () => { 
            URL.revokeObjectURL(audioUrl); 
            hideFloatingControl(); 
            currentSpeech = null; 
            showTTSNotification('خطا در پخش تست'); 
        };

        await audio.play();
        
    } catch (error) {
        console.error('خطا در تست TTS:', error);
        showTTSNotification('خطا در تست صدا');
    }
}

/**
 * بروزرسانی وضعیت دکمه TTS
 * @param {boolean} enabled - وضعیت فعال بودن
 */
function updateTTSButtonState(enabled = true) {
    try {
        const ttsButtons = document.querySelectorAll('[onclick*="speakText"], [onclick*="speakAllMessages"]');
        ttsButtons.forEach(button => {
            if (enabled) {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            }
        });
    } catch (error) {
        console.error('خطا در بروزرسانی وضعیت دکمه‌های TTS:', error);
    }
}

/**
 * ریست کردن دکمه TTS
 */
function resetTTSButton() {
    try {
        updateTTSButtonState(true);
        console.log('دکمه‌های TTS ریست شدند');
    } catch (error) {
        console.error('خطا در ریست دکمه‌های TTS:', error);
    }
}

/**
 * راه‌اندازی event listeners برای TTS
 */
function setupTTSEventListeners() {
    try {
        // دکمه تست
        if (ttsTestBtn) {
            ttsTestBtn.addEventListener('click', testTTSSettings);
        }

        // دکمه ذخیره
        if (ttsSaveBtn) {
            ttsSaveBtn.addEventListener('click', saveTTSSettings);
        }

        // دکمه بستن
        if (ttsCloseBtn) {
            ttsCloseBtn.addEventListener('click', closeTTSSettings);
        }

        // کنترل سرعت
        if (ttsSpeedEl && ttsSpeedValueEl) {
            ttsSpeedEl.addEventListener('input', (e) => {
                ttsSpeedValueEl.textContent = `${e.target.value}x`;
            });
        }

        // کنترل‌های شناور
        if (floatingPlayPauseBtn) {
            floatingPlayPauseBtn.addEventListener('click', () => {
                if (currentSpeech) {
                    if (isPaused) {
                        currentSpeech.play();
                        setFloatingPaused(false);
                    } else {
                        currentSpeech.pause();
                        setFloatingPaused(true);
                    }
                }
            });
        }

        if (floatingStopBtn) {
            floatingStopBtn.addEventListener('click', stopCurrentSpeech);
        }

        // تخمین هزینه
        const qualityEl = document.getElementById('ttsQuality');
        const costTierEl = document.getElementById('ttsCostTier');
        
        if (qualityEl) {
            qualityEl.addEventListener('change', estimateCost);
        }
        
        if (costTierEl) {
            costTierEl.addEventListener('change', estimateCost);
        }

        // بستن مودال با کلیک خارج از آن
        if (ttsSettingsModal) {
            ttsSettingsModal.addEventListener('click', (e) => {
                if (e.target === ttsSettingsModal) {
                    closeTTSSettings();
                }
            });
        }

        console.log('Event listeners ماژول TTS راه‌اندازی شدند');
        
    } catch (error) {
        console.error('خطا در راه‌اندازی event listeners TTS:', error);
    }
}

/**
 * راه‌اندازی بعد از لاگین
 */
async function afterLoginSetup() {
    try {
        const currentAuth = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (currentAuth && currentAuth.username) {
            await loadUserTTSSettings();
            console.log('تنظیمات TTS بعد از لاگین بارگیری شد');
        }
    } catch (error) {
        console.error('خطا در راه‌اندازی TTS بعد از لاگین:', error);
    }
}

/**
 * مقداردهی اولیه ماژول TTS
 */
function initializeTTS() {
    try {
        initializeDOMElements();
        setupTTSEventListeners();
        console.log('ماژول TTS با موفقیت مقداردهی شد');
    } catch (error) {
        console.error('خطا در مقداردهی ماژول TTS:', error);
    }
}

// Export برای استفاده در سایر فایل‌ها
window.TTSModule = {
    // توابع اصلی
    speakText,
    speakTextContent,
    speakAllMessages,
    stopCurrentSpeech,
    stopAllSpeech,
    
    // مدیریت UI
    showFloatingControl,
    hideFloatingControl,
    setFloatingPaused,
    updateTTSButtonState,
    resetTTSButton,
    
    // تنظیمات
    openTTSSettings,
    closeTTSSettings,
    saveTTSSettings,
    loadUserTTSSettings,
    testTTSSettings,
    
    // مدیریت
    initializeTTS,
    afterLoginSetup,
    
    // متغیرهای عمومی (فقط خواندنی)
    getCurrentSettings: () => ({ ...ttsSettings }),
    isPlaying: () => currentSpeech !== null,
    isPaused: () => isPaused
};

// مقداردهی خودکار زمانی که DOM آماده است
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTTS);
} else {
    initializeTTS();
}

console.log('ماژول TTS بارگیری شد');
