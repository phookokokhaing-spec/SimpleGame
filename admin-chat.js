// ===== ADMIN CHAT SYSTEM (FIXED) =====
let adminChatSessions = {};
let activeChatUserId = null;

// Initialize Admin Chat
function initAdminChat() {
    console.log('Initializing admin chat...');
    loadAdminChatSessions();
    renderUserList();
    
    // Check for new messages every 3 seconds
    setInterval(checkNewUserMessages, 3000);
}

// Load chat sessions
function loadAdminChatSessions() {
    const saved = localStorage.getItem('admin_chat_messages');
    if (saved) {
        try {
            adminChatSessions = JSON.parse(saved) || {};
        } catch(e) {
            console.error('Error parsing admin chat:', e);
            adminChatSessions = {};
        }
    } else {
        adminChatSessions = {};
    }
}

// Save chat sessions
function saveAdminChatSessions() {
    localStorage.setItem('admin_chat_messages', JSON.stringify(adminChatSessions));
}

// Render user list
function renderUserList() {
    const container = document.getElementById('userListItems');
    if (!container) {
        console.error('userListItems not found');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    
    if (users.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:rgba(255,255,255,0.5);">အသုံးပြုသူ မရှိသေးပါ။</div>';
        return;
    }
    
    let html = '';
    users.forEach(user => {
        if (user.status === 'blocked') return;
        
        const userMessages = adminChatSessions[user.id] || [];
        // FIX: Check if userMessages is array
        const unreadCount = Array.isArray(userMessages) ? 
            userMessages.filter(m => m && m.sender === 'user' && !m.read).length : 0;
        const lastMsg = (Array.isArray(userMessages) && userMessages.length > 0) ? 
            userMessages[userMessages.length - 1].message : 'စကားစမြည်မရှိသေး';
        
        html += `
            <div class="user-item ${activeChatUserId === user.id ? 'active' : ''}" 
                 onclick="selectChatUser('${user.id}')">
                <div class="user-item-avatar">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-item-info">
                    <div class="user-item-name">${user.username}</div>
                    <div class="user-item-preview">${lastMsg.substring(0, 20)}...</div>
                </div>
                ${unreadCount > 0 ? `<div class="user-item-badge">${unreadCount}</div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update total badge
    updateAdminChatBadge();
}

// Select user to chat
function selectChatUser(userId) {
    activeChatUserId = userId;
    
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Update UI
    const placeholder = document.getElementById('chatPlaceholder');
    const chatActive = document.getElementById('chatActive');
    const chatUserAvatar = document.getElementById('chatUserAvatar');
    const chatUserName = document.getElementById('chatUserName');
    
    if (placeholder) placeholder.style.display = 'none';
    if (chatActive) chatActive.style.display = 'flex';
    if (chatUserAvatar) chatUserAvatar.textContent = user.username.charAt(0).toUpperCase();
    if (chatUserName) chatUserName.textContent = user.username;
    
    // Mark messages as read
    if (adminChatSessions[userId] && Array.isArray(adminChatSessions[userId])) {
        adminChatSessions[userId].forEach(msg => {
            if (msg && msg.sender === 'user') msg.read = true;
        });
        saveAdminChatSessions();
    }
    
    // Render messages
    renderChatMessages(userId);
    renderUserList();
}

// Render chat messages
function renderChatMessages(userId) {
    const container = document.getElementById('chatMessagesArea');
    if (!container) return;
    
    const messages = (adminChatSessions[userId] && Array.isArray(adminChatSessions[userId])) ? 
        adminChatSessions[userId] : [];
    
    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.5);">စာမရှိသေးပါ။</div>';
        return;
    }
    
    let html = '';
    messages.forEach(msg => {
        if (!msg) return;
        const isAdmin = msg.sender === 'admin';
        const time = msg.time ? new Date(msg.time).toLocaleTimeString('my', { hour: '2-digit', minute: '2-digit' }) : '';
        
        html += `
            <div class="admin-message ${isAdmin ? 'admin' : ''}">
                <div class="avatar">${isAdmin ? 'A' : 'U'}</div>
                <div class="content">
                    ${escapeHtml(msg.message || '')}
                    <div class="time">${time}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

// Send admin message
function sendAdminMessage() {
    const input = document.getElementById('adminChatInput');
    const message = input ? input.value.trim() : '';
    
    if (!message || !activeChatUserId) return;
    
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const user = users.find(u => u.id === activeChatUserId);
    if (!user) return;
    
    // Create message
    const msg = {
        sender: 'admin',
        message: message,
        time: new Date().toISOString(),
        read: false
    };
    
    // Save to admin session
    if (!adminChatSessions[activeChatUserId] || !Array.isArray(adminChatSessions[activeChatUserId])) {
        adminChatSessions[activeChatUserId] = [];
    }
    adminChatSessions[activeChatUserId].push(msg);
    saveAdminChatSessions();
    
    // Save to user session
    const userKey = `chat_${activeChatUserId}`;
    let userMessages = JSON.parse(localStorage.getItem(userKey)) || [];
    if (!Array.isArray(userMessages)) userMessages = [];
    userMessages.push({
        sender: 'admin',
        message: message,
        time: new Date().toISOString(),
        read: false
    });
    localStorage.setItem(userKey, JSON.stringify(userMessages));
    
    // Clear input
    if (input) input.value = '';
    
    // Update UI
    renderChatMessages(activeChatUserId);
}

// Check for new messages from users (FIXED VERSION)
function checkNewUserMessages() {
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    let hasNew = false;
    
    users.forEach(user => {
        const userKey = `chat_${user.id}`;
        let userMessages = [];
        
        try {
            const saved = localStorage.getItem(userKey);
            userMessages = saved ? JSON.parse(saved) : [];
            // FIX: Ensure it's array
            if (!Array.isArray(userMessages)) userMessages = [];
        } catch(e) {
            console.error('Error parsing user messages:', e);
            userMessages = [];
        }
        
        // FIX: Check if userMessages is array before forEach
        if (Array.isArray(userMessages)) {
            userMessages.forEach(msg => {
                if (msg && msg.sender === 'user') {
                    // Check if we already have this message
                    const adminSession = adminChatSessions[user.id] || [];
                    if (!Array.isArray(adminSession)) {
                        adminChatSessions[user.id] = [];
                    }
                    
                    const exists = adminChatSessions[user.id].some(m => 
                        m && m.sender === 'user' && m.time === msg.time
                    );
                    
                    if (!exists) {
                        // New message!
                        adminChatSessions[user.id].push({
                            ...msg,
                            read: false
                        });
                        hasNew = true;
                    }
                }
            });
        }
    });
    
    if (hasNew) {
        saveAdminChatSessions();
        
        // If currently chatting, refresh messages
        if (activeChatUserId) {
            renderChatMessages(activeChatUserId);
        }
        
        // Update user list
        renderUserList();
        
        // Show notification
        showAdminNotification('အသုံးပြုသူထံမှ စာသစ်ရောက်ရှိပါသည်။');
    }
}

// Update admin chat badge
function updateAdminChatBadge() {
    const badge = document.getElementById('adminChatBadge');
    if (!badge) return;
    
    let totalUnread = 0;
    Object.values(adminChatSessions).forEach(messages => {
        if (Array.isArray(messages)) {
            totalUnread += messages.filter(m => m && m.sender === 'user' && !m.read).length;
        }
    });
    
    if (totalUnread > 0) {
        badge.style.display = 'flex';
        badge.textContent = totalUnread;
    } else {
        badge.style.display = 'none';
    }
}

// Toggle admin chat panel
function toggleAdminChat() {
    const panel = document.getElementById('adminChatPanel');
    if (!panel) return;
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'flex';
        initAdminChat();
    } else {
        panel.style.display = 'none';
    }
}

// Close active chat
function closeActiveChat() {
    activeChatUserId = null;
    
    const placeholder = document.getElementById('chatPlaceholder');
    const chatActive = document.getElementById('chatActive');
    
    if (placeholder) placeholder.style.display = 'flex';
    if (chatActive) chatActive.style.display = 'none';
}

// Show notification
function showAdminNotification(message) {
    let notif = document.getElementById('adminNotification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'adminNotification';
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffd700;
            color: #000;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 20002;
            animation: slideIn 0.3s;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notif);
    }
    
    notif.textContent = message;
    notif.style.display = 'block';
    
    setTimeout(() => {
        notif.style.display = 'none';
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is ready
    setTimeout(initAdminChat, 500);
});

// Export functions
window.toggleAdminChat = toggleAdminChat;
window.selectChatUser = selectChatUser;
window.sendAdminMessage = sendAdminMessage;
window.closeActiveChat = closeActiveChat;

