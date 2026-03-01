// ===== USER CHAT SYSTEM (FIXED - NO DUPLICATE) =====
(function() {
    let currentUser = null;
    let checkInterval = null;
    let lastMessageCount = 0;
    let isInitialized = false;

    // DOM Elements
    const modal = document.getElementById('chatModal');
    const messagesContainer = document.getElementById('chatMessages');
    const badge = document.getElementById('chatBadge');
    const inputField = document.getElementById('chatInput');

  
    function initUserChat() {
        if (isInitialized) {
            console.log('Chat already initialized');
            return;
        }

        console.log('Initializing user chat...');
        
        setCurrentUser();
        
        if (!currentUser) {
            console.error('No user found');
            return;
        }

      
        loadMessages();
        
        
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkNewMessages, 2000);
        
       
        updateBadge();
        
        isInitialized = true;
    }

   
    function setCurrentUser() {
      
        const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
        
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        
        if (loggedInUserId) {
  
            currentUser = users.find(u => u.id === loggedInUserId) || null;
        }
        
        if (!currentUser && users.length > 0) {
            currentUser = users[0];
         
            currentUser.isGuest = false;
        }
        
        if (!currentUser) {
            currentUser = {
                id: 'guest_' + Date.now(),
                username: 'ဧည့်သည်',
                isGuest: true
            };
           
            localStorage.setItem('guestUser', JSON.stringify(currentUser));
        }
        
        console.log('Current user set:', currentUser);
    }

    function loadMessages() {
        if (!currentUser) return;
        
        const userKey = `chat_${currentUser.id}`;
        let messages = [];
        
        try {
            const saved = localStorage.getItem(userKey);
            messages = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(messages)) messages = [];
        } catch(e) {
            console.error('Error loading messages:', e);
            messages = [];
        }

        renderMessages(messages);
        
        lastMessageCount = messages.length;
        localStorage.setItem(`${userKey}_lastCount`, lastMessageCount);
    }

   
    function renderMessages(messages) {
        if (!messagesContainer) return;

        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">မင်္ဂလာပါ။ အက်ဒမင်ဆီ စာရိုက်နိုင်ပါတယ်။</div>';
            return;
        }

        let html = '';
        messages.forEach(msg => {
            if (!msg) return;
            const isUser = msg.sender === 'user';
            const time = msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            
            html += `
                <div style="max-width:80%; padding:8px 12px; border-radius:16px; 
                            background:${isUser ? '#1877f2' : 'white'}; 
                            color:${isUser ? 'white' : 'black'}; 
                            align-self:${isUser ? 'flex-end' : 'flex-start'}; 
                            margin-bottom:8px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                    ${escapeHtml(msg.message || '')}
                    <div style="font-size:0.6rem; opacity:0.7; text-align:right; margin-top:4px;">${time}</div>
                </div>
            `;
        });

        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
   }
    function sendChatMessage() {
        if (!inputField || !currentUser) return;
        
        const message = inputField.value.trim();
        if (!message) return;

        // Create new message
        const newMsg = {
            sender: 'user',
            message: message,
            time: new Date().toISOString(),
            read: false,
            id: Date.now() + '_' + Math.random().toString(36) 
        };

        const userKey = `chat_${currentUser.id}`;
        let messages = [];
        
        try {
            const saved = localStorage.getItem(userKey);
            messages = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(messages)) messages = [];
        } catch(e) {
            messages = [];
        }

       
        const isDuplicate = messages.some(m => 
            m.id === newMsg.id || 
            (m.message === newMsg.message && 
             Math.abs(new Date(m.time) - new Date(newMsg.time)) < 1000)
        );

        if (!isDuplicate) {
            messages.push(newMsg);
            localStorage.setItem(userKey, JSON.stringify(messages));
            console.log('Message sent:', newMsg);
        }

        // Clear input
        inputField.value = '';

        // Update UI
        loadMessages();
    }

  
    function checkNewMessages() {
        if (!currentUser) return;
        
        const userKey = `chat_${currentUser.id}`;
        let messages = [];
        
        try {
            const saved = localStorage.getItem(userKey);
            messages = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(messages)) messages = [];
        } catch(e) {
            return;
        }

        
        const lastCount = parseInt(localStorage.getItem(`${userKey}_lastCount`) || '0');
        
        if (messages.length > lastCount) {
            console.log('New message detected!');
            
            const uniqueMessages = removeDuplicates(messages);
            if (uniqueMessages.length !== messages.length) {
                localStorage.setItem(userKey, JSON.stringify(uniqueMessages));
                messages = uniqueMessages;
            }
            
            renderMessages(messages);
            localStorage.setItem(`${userKey}_lastCount`, messages.length);
            updateBadge();
            
            if (!modal || !modal.classList.contains('show')) {
                showNotification('အက်ဒမင်ထံမှ စာသစ်ရောက်ရှိပါသည်။');
            }
        }
    }

   
    function removeDuplicates(messages) {
        const seen = new Set();
        return messages.filter(msg => {
            if (!msg || !msg.id) {
                
                const key = `${msg.sender}_${msg.message}_${msg.time}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            if (seen.has(msg.id)) return false;
            seen.add(msg.id);
            return true;
        });
    }

   
    function updateBadge() {
        if (!currentUser || !badge) return;
        
        const userKey = `chat_${currentUser.id}`;
        let messages = [];
        
        try {
            const saved = localStorage.getItem(userKey);
            messages = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(messages)) messages = [];
        } catch(e) {
            messages = [];
        }

        
        const unreadCount = messages.filter(m => m && m.sender === 'admin' && !m.read).length;

        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.textContent = unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }

   
    function markMessagesAsRead() {
        if (!currentUser) return;
        
        const userKey = `chat_${currentUser.id}`;
        let messages = [];
        let changed = false;
        
        try {
            const saved = localStorage.getItem(userKey);
            messages = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(messages)) messages = [];
            
            messages.forEach(msg => {
                if (msg && msg.sender === 'admin' && !msg.read) {
                    msg.read = true;
                    changed = true;
                }
            });
            
            if (changed) {
                localStorage.setItem(userKey, JSON.stringify(messages));
                updateBadge();
            }
        } catch(e) {}
    }

   
    function showNotification(text) {
        if (Notification.permission === 'granted') {
            new Notification('စကားပြောခန်း', { body: text });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

   
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

   
    window.openChat = function() {
        if (modal) {
            modal.classList.add('show');
            loadMessages(); 
            markMessagesAsRead();
        }
    };

    window.closeChat = function() {
        if (modal) {
            modal.classList.remove('show');
        }
    };

    window.sendChatMessage = function() {
        sendChatMessage();
    };

    window.handleChatEnter = function(event) {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    };

   
    window.addEventListener('beforeunload', function() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    });

  
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUserChat);
    } else {
        initUserChat();
    }
})();
