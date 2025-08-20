/**
 * ماژول تبدیل متن به گفتار (TTS) - نسخه بهینه شده
 * @author Agent ChatGPT
 * @version 2.0.0
 */

// تنظیمات و متغیرهای اصلی
let ttsSettings = { voice: 'alloy', speed: 1.0, gender: 'neutral', quality: 'standard', costTier: 'medium' };
let currentSpeech = null;
let isPaused = false;

// عناصر DOM
let ttsModal, ttsVoice, ttsSpeed, ttsSpeedValue, floatingControl;

// مقداردهی DOM
function initDOM() {
    try {
        ttsModal = document.getElementById('ttsSettingsModal');
        ttsVoice = document.getElementById('ttsVoice');
        ttsSpeed = document.getElementById('ttsSpeed');
        ttsSpeedValue = document.getElementById('ttsSpeedValue');
        floatingControl = document.getElementById('floatingTTSControl');
        
        // بارگیری تنظیمات محلی
        const savedVoice = localStorage.getItem('tts_voice');
        const savedSpeed = localStorage.getItem('tts_speed');
        if (savedVoice) ttsSettings.voice = savedVoice;
        if (savedSpeed) ttsSettings.speed = parseFloat(savedSpeed);
    } catch (error) {
        console.error('خطا در مقداردهی DOM:', error);
    }
}

// کنترل‌های شناور
function showFloat() {
    if (floatingControl) {
        floatingControl.style.display = 'flex';
        floatingControl.classList.add('visible', 'blinking');
    }
}

function hideFloat() {
    if (floatingControl) {
        floatingControl.style.display = 'none';
        floatingControl.classList.remove('visible', 'blinking', 'paused');
    }
}

function setPaused(paused) {
    isPaused = paused;
    if (floatingControl) {
        if (paused) floatingControl.classList.add('paused');
        else floatingControl.classList.remove('paused');
    }
}

// توقف پخش
function stopSpeech() {
    try {
        if (currentSpeech) {
            currentSpeech.pause();
            currentSpeech.currentTime = 0;
            currentSpeech = null;
        }
        isPaused = false;
        hideFloat();
    } catch (error) {
        console.error('خطا در توقف:', error);
    }
}

// تبدیل متن به گفتار
async function speakText(text, options = {}) {
    try {
        if (!text?.trim()) {
            showNotif('متنی برای پخش یافت نشد');
            return;
        }

        stopSpeech();
        const settings = { ...ttsSettings, ...options };
        
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.trim(), voice: settings.voice, speed: settings.speed })
        });

        if (!response.ok) throw new Error(`خطای سرور: ${response.status}`);

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        currentSpeech = audio;
        
        audio.onplay = () => { setPaused(false); showFloat(); };
        audio.onpause = () => setPaused(true);
        audio.onended = () => { URL.revokeObjectURL(audioUrl); hideFloat(); currentSpeech = null; };
        audio.onerror = () => { URL.revokeObjectURL(audioUrl); hideFloat(); currentSpeech = null; showNotif('خطا در پخش'); };

        await audio.play();
    } catch (error) {
        console.error('خطا در TTS:', error);
        showNotif('خطا در تبدیل متن به گفتار');
        hideFloat();
    }
}

// پخش محتوای عنصر
function speakElement(element) {
    try {
        if (!element) return;
        
        let text = '';
        if (element.classList.contains('user-message') || element.classList.contains('assistant-message')) {
            const content = element.querySelector('.message-content');
            text = content ? content.textContent : element.textContent;
        } else {
            text = element.textContent || element.innerText;
        }

        if (text?.trim()) speakText(text.trim());
        else showNotif('متنی یافت نشد');
    } catch (error) {
        console.error('خطا در پخش عنصر:', error);
    }
}

// پخش همه پیام‌ها
async function speakAll() {
    try {
        const messages = document.querySelectorAll('.user-message, .assistant-message');
        if (messages.length === 0) {
            showNotif('پیامی یافت نشد');
            return;
        }

        let allText = '';
        messages.forEach(msg => {
            const content = msg.querySelector('.message-content');
            const text = content ? content.textContent : msg.textContent;
            if (text?.trim()) {
                const speaker = msg.classList.contains('user-message') ? 'کاربر: ' : 'دستیار: ';
                allText += speaker + text.trim() + '. ';
            }
        });

        if (allText.trim()) await speakText(allText.trim());
        else showNotif('محتوایی یافت نشد');
    } catch (error) {
        console.error('خطا در پخش همه:', error);
    }
}

// نوتیفیکیشن
function showNotif(message) {
    try {
        const existing = document.querySelector('.tts-notification');
        if (existing) existing.remove();
        
        const notif = document.createElement('div');
        notif.className = 'tts-notification';
        notif.textContent = message;
        notif.style.cssText = `position:fixed;top:20px;right:20px;background:#333;color:white;padding:10px 15px;border-radius:5px;z-index:10000;opacity:0;transition:opacity 0.3s`;
        
        document.body.appendChild(notif);
        setTimeout(() => notif.style.opacity = '1', 10);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error('خطا در نوتیف:', error);
    }
}

// مودال تنظیمات
function openSettings() {
    try {
        if (ttsVoice) ttsVoice.value = ttsSettings.voice;
        if (ttsSpeed) {
            ttsSpeed.value = ttsSettings.speed;
            if (ttsSpeedValue) ttsSpeedValue.textContent = `${ttsSettings.speed}x`;
        }
        
        const gender = document.querySelector(`input[name="ttsGender"][value="${ttsSettings.gender}"]`);
        if (gender) gender.checked = true;
        
        const quality = document.getElementById('ttsQuality');
        if (quality) quality.value = ttsSettings.quality;
        
        const cost = document.getElementById('ttsCostTier');
        if (cost) cost.value = ttsSettings.costTier;
        
        estimateCost();
        if (ttsModal) ttsModal.style.display = 'flex';
    } catch (error) {
        console.error('خطا در باز کردن تنظیمات:', error);
    }
}

function closeSettings() {
    if (ttsModal) ttsModal.style.display = 'none';
}

// ذخیره تنظیمات
async function saveSettings() {
    try {
        const newSettings = {
            voice: ttsVoice?.value || ttsSettings.voice,
            rate: parseFloat(ttsSpeed?.value || ttsSettings.speed),
            gender: document.querySelector('input[name="ttsGender"]:checked')?.value || 'neutral',
            quality: document.getElementById('ttsQuality')?.value || 'standard',
            costTier: document.getElementById('ttsCostTier')?.value || 'medium',
            updatedAt: new Date().toISOString()
        };

        ttsSettings = { ...ttsSettings, voice: newSettings.voice, speed: newSettings.rate, gender: newSettings.gender, quality: newSettings.quality, costTier: newSettings.costTier };

        const auth = window.AuthModule?.getCurrentUser();
        if (auth?.username) {
            const res = await fetch(`/api/users/${encodeURIComponent(auth.username)}/tts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ttsSettings: newSettings })
            });
            
            if (!res.ok) throw new Error('خطا در ذخیره');
            showNotif('تنظیمات ذخیره شد');
        } else {
            localStorage.setItem('tts_voice', ttsSettings.voice);
            localStorage.setItem('tts_speed', ttsSettings.speed.toString());
            showNotif('تنظیمات محلی ذخیره شد');
        }
        closeSettings();
    } catch (error) {
        console.error('خطا در ذخیره:', error);
        showNotif('خطا در ذخیره تنظیمات');
    }
}

// بارگیری تنظیمات کاربر
async function loadUserSettings() {
    try {
        const auth = window.AuthModule?.getCurrentUser();
        if (!auth?.username) return;
        
        const res = await fetch(`/api/users/${encodeURIComponent(auth.username)}/tts`);
        if (!res.ok) return;
        
        const data = await res.json();
        const s = data.ttsSettings || {};
        
        ttsSettings = {
            ...ttsSettings,
            voice: s.voice || ttsSettings.voice,
            speed: s.rate || ttsSettings.speed,
            gender: s.gender || 'neutral',
            quality: s.quality || 'standard',
            costTier: s.costTier || 'medium'
        };
    } catch (error) {
        console.error('خطا در بارگیری:', error);
    }
}

// تخمین هزینه
function estimateCost() {
    try {
        const quality = document.getElementById('ttsQuality')?.value || ttsSettings.quality;
        const tier = document.getElementById('ttsCostTier')?.value || ttsSettings.costTier;
        
        let cost = quality === 'high' ? 0.06 : 0.02;
        if (tier === 'low') cost *= 0.7;
        if (tier === 'high') cost *= 1.6;
        
        const el = document.getElementById('costEstimate');
        if (el) el.textContent = `$${cost.toFixed(3)}`;
    } catch (error) {
        console.error('خطا در تخمین:', error);
    }
}

// تست تنظیمات
async function testSettings() {
    try {
        const sample = document.getElementById('ttsSample')?.value || 'این تست صدا است';
        const tempSettings = {
            voice: ttsVoice?.value || ttsSettings.voice,
            speed: parseFloat(ttsSpeed?.value || ttsSettings.speed)
        };
        await speakText(sample, tempSettings);
    } catch (error) {
        console.error('خطا در تست:', error);
        showNotif('خطا در تست');
    }
}

// راه‌اندازی Event Listeners
function setupEvents() {
    try {
        document.getElementById('ttsTestBtn')?.addEventListener('click', testSettings);
        document.getElementById('ttsSettingsSave')?.addEventListener('click', saveSettings);
        document.getElementById('ttsSettingsClose')?.addEventListener('click', closeSettings);
        
        if (ttsSpeed && ttsSpeedValue) {
            ttsSpeed.addEventListener('input', (e) => {
                ttsSpeedValue.textContent = `${e.target.value}x`;
            });
        }

        floatingControl?.addEventListener('click', () => {
            if (currentSpeech) {
                if (isPaused) {
                    currentSpeech.play();
                    setPaused(false);
                } else {
                    currentSpeech.pause();
                    setPaused(true);
                }
            }
        });

        ttsModal?.addEventListener('click', (e) => {
            if (e.target === ttsModal) closeSettings();
        });

        document.getElementById('ttsQuality')?.addEventListener('change', estimateCost);
        document.getElementById('ttsCostTier')?.addEventListener('change', estimateCost);
    } catch (error) {
        console.error('خطا در راه‌اندازی events:', error);
    }
}

// مقداردهی اصلی
function init() {
    try {
        initDOM();
        setupEvents();
        console.log('ماژول TTS آماده است');
    } catch (error) {
        console.error('خطا در مقداردهی TTS:', error);
    }
}

// Export
window.TTSModule = {
    speakText,
    speakTextContent: speakElement,
    speakAllMessages: speakAll,
    stopCurrentSpeech: stopSpeech,
    stopAllSpeech: stopSpeech,
    showFloatingControl: showFloat,
    hideFloatingControl: hideFloat,
    setFloatingPaused: setPaused,
    openTTSSettings: openSettings,
    closeTTSSettings: closeSettings,
    saveTTSSettings: saveSettings,
    loadUserTTSSettings: loadUserSettings,
    testTTSSettings: testSettings,
    initializeTTS: init,
    afterLoginSetup: loadUserSettings,
    getCurrentSettings: () => ({ ...ttsSettings }),
    isPlaying: () => currentSpeech !== null,
    isPaused: () => isPaused
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📦 ماژول TTS بهینه شده بارگیری شد - TTSModule در window قرار گرفت');
