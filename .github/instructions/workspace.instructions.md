# 🏗️ Copilot Workspace Configuration

## Project: Persian Chat Application with TTS

### 🎯 Project Context
- **Type**: Web Application (Node.js + Vanilla JavaScript)
- **Language**: Persian/Farsi (RTL Support)
- **Backend**: Express.js with OpenAI integration
- **Frontend**: Vanilla JavaScript ES6+
- **Database**: JSON file-based storage
- **Special Features**: OpenAI TTS with 6 voices

### 📁 File Structure
```
project-root/
├── server.js                 # Main Express server
├── js/
│   ├── app.js                # Main frontend entry (TARGET: <150 lines)
│   ├── modules/              # Modular JavaScript files
│   ├── components/           # UI components
│   └── utils/                # Utility functions
├── helpers/                  # Backend helper modules
├── css/                      # RTL-optimized stylesheets
├── admin/                    # Admin panel files
└── .copilot/                 # Copilot instructions
```

### 🚨 Critical Requirements

#### Code Style
- **File Size Limit**: 200 lines maximum per file
- **Language**: Persian comments and documentation
- **Pattern**: Modular ES6 imports/exports
- **Error Handling**: Required for every function

#### Persian Language Requirements
- All comments in Persian
- All console.log messages in Persian
- All error messages in Persian
- All user-facing text in Persian

#### File Header Template
Every file MUST start with:
```javascript
// =============================================================================
// 📄 مسیر: [exact path]
// 🎯 هدف: [Persian description]
// 📝 شامل: [features list]
// 🔗 وابستگی‌ها: [dependencies]
// 📅 آخرین بروزرسانی: [date]
// =============================================================================
```

### 🔧 Development Rules

#### When to Create New Files
1. Current file exceeds 200 lines
2. Multiple responsibilities in one file
3. Code becomes hard to maintain
4. User requests modularization

#### Module Naming Convention
- `auth.js` - Authentication & session management
- `chat.js` - Chat operations & messaging
- `tts.js` - Text-to-speech functionality
- `ui.js` - DOM manipulation & event handling
- `api.js` - API calls & HTTP requests
- `logger.js` - Logging system with Persian messages

### 🎨 UI/UX Guidelines
- **RTL Support**: All layouts must support right-to-left
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliance
- **Persian Fonts**: Use Vazirmatn or similar
- **Color Scheme**: Professional blue/white theme

### 🔊 TTS Integration
- **OpenAI Voices**: alloy, echo, fable, onyx, nova, shimmer
- **Controls**: play, pause, stop, speed control
- **Quality**: standard and hd options
- **Cost Calculation**: Real-time cost estimation
- **Error Handling**: Graceful fallbacks

### 📊 Logging Standards
```javascript
// Success operations
logger.info('عملیات با موفقیت انجام شد');

// Error conditions
logger.error('خطا در انجام عملیات:', error);

// Debug information
logger.debug('درحال بررسی شرایط');

// Warnings
logger.warn('هشدار: محدودیت نزدیک است');
```

### 🚀 Performance Targets
- **File Size**: Each file under 200 lines
- **Load Time**: Under 2 seconds
- **Memory Usage**: Efficient cleanup
- **Token Usage**: 70% reduction in Copilot tokens

### 🔒 Security Requirements
- Input validation for all user inputs
- XSS protection
- CSRF protection via sessions
- Rate limiting
- Error message sanitization

### 🧪 Testing Guidelines
- Every function should be testable
- Error conditions must be handled
- Edge cases considered
- Persian error messages for users

### 📱 Mobile Optimization
- Touch-friendly interface
- Responsive breakpoints
- Performance optimization
- RTL layout support

---

## 🤖 Copilot Behavior Instructions

### Always Do:
✅ Add Persian file headers
✅ Split files over 200 lines
✅ Add Persian JSDoc comments
✅ Include error handling
✅ Use modular imports/exports
✅ Add Persian logging messages
✅ Follow RTL design principles
✅ Validate user inputs

### Never Do:
❌ Create files over 200 lines
❌ Use English comments
❌ Skip error handling
❌ Forget file path in headers
❌ Ignore modularization opportunities
❌ Create functions without docs
❌ Use blocking operations without async

### Quick Response to User Commands:
- `!split` → Immediately suggest file splitting
- `!header` → Add Persian header template
- `!docs` → Add Persian JSDoc
- `!modular` → Suggest modularization approach
- `!persian` → Convert English to Persian comments