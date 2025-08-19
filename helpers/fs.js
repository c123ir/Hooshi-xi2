const fs = require('fs').promises;
const path = require('path');
const BASE_CHAT_DIR = path.join(process.cwd(), 'chats');

async function ensureChatDir(username) {
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

async function readChatFile(id, username) {
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  const filePath = path.join(dir, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function writeChatFile(id, chatData, username) {
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  await ensureChatDir(username);
  const filePath = path.join(dir, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(chatData, null, 2), 'utf-8');
}

async function listChats(username) {
  await ensureChatDir(username);
  const dir = username ? path.join(BASE_CHAT_DIR, username) : BASE_CHAT_DIR;
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));
  const items = [];
  for (const file of files) {
    const id = path.basename(file, '.json');
    const chat = await readChatFile(id, username);
    if (chat) {
      // Migration: اطمینان از وجود فیلدهای isPinned و isArchived
      let needsUpdate = false;
      if (chat.isPinned === undefined) {
        chat.isPinned = false;
        needsUpdate = true;
      }
      if (chat.isArchived === undefined) {
        chat.isArchived = false;
        needsUpdate = true;
      }
      
      // اگر فیلدهای جدید اضافه شدند، فایل را بروزرسانی کن
      if (needsUpdate) {
        await writeChatFile(id, chat, username);
      }
      
      items.push({ 
        id, 
        subject: chat.subject || 'بدون عنوان', 
        updatedAt: chat.updatedAt,
        isPinned: chat.isPinned,
        isArchived: chat.isArchived
      });
    }
  }
  return items;
}

module.exports = { ensureChatDir, readChatFile, writeChatFile, listChats, BASE_CHAT_DIR };
