// Admin State
let adminState = {
    users: JSON.parse(localStorage.getItem('slotUsers')) || [],
    depositRequests: JSON.parse(localStorage.getItem('depositRequests')) || [],
    withdrawRequests: JSON.parse(localStorage.getItem('withdrawRequests')) || [],
    bankAccounts: JSON.parse(localStorage.getItem('bankAccounts')) || [
        {
            id: 'BANK001',
            bankName: 'KBZ Pay',
            accountHolder: 'ဒေါ်အေးအေး',
            accountNumber: '09-123456789',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
            id: 'BANK002',
            bankName: 'Wave Pay',
            accountHolder: 'ဦးမောင်မောင်',
            accountNumber: '09-987654321',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
            id: 'BANK003',
            bankName: 'CB Pay',
            accountHolder: 'ကိုဇော်ဇော်',
            accountNumber: '09-555555555',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z'
        }
    ],
    jackpotState: {
        totalPool: 2850000,
        mini: 50000,
        major: 200000,
        mega: 500000,
        todayWins: 3,
        todayContributions: 150000,
        avgWin: 50000,
        biggestWin: 100000
    },
    rtpState: {
        current: 92.5,
        min: 80,
        max: 98,
        history: []
    },
    lastUpdated: new Date().toISOString(),
    autoRefresh: true,
    refreshInterval: null
};

// ========== DOM READY ==========
/**
 * Initialize admin dashboard
 */
function initAdminDashboard() {
    console.log(' Initializing admin dashboard...');
    
    // Load data from localStorage
    loadAdminData();
    
    // Initialize tab listeners (ဒါကိုပြောင်း)
    initTabListeners();  // ဒါအရေးကြီးတယ်
    
    // Start auto refresh
    startAutoRefresh();
    
    console.log('✅ Admin dashboard initialized');
}

function loadAdminData() {
    adminState.users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    adminState.depositRequests = JSON.parse(localStorage.getItem('depositRequests')) || [];
    adminState.withdrawRequests = JSON.parse(localStorage.getItem('withdrawRequests')) || [];
    adminState.bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || adminState.bankAccounts;
}

    function loadAdminDashboard() {
    loadAdminData();
    updateStatsCards();
    loadPaymentRequests();
    loadWithdrawalRequests();
    loadUsersList();
    loadBankAccounts();
    loadJackpotControl();
    loadRTPControl();
    updateLastUpdatedTime();
}

function updateStatsCards() {
    // Calculate stats
    const totalUsers = adminState.users.length;
    const totalBalance = adminState.users.reduce((sum, user) => sum + (user.balance || 0), 0);
    const pendingPayments = adminState.depositRequests.filter(r => r.status === 'pending').length;
    const pendingWithdrawals = adminState.withdrawRequests.filter(r => r.status === 'pending').length;
    
    // New today
    const today = new Date().toDateString();
    const newPayments = adminState.depositRequests.filter(r => {
        return r.status === 'pending' && new Date(r.createdAt).toDateString() === today;
    }).length;
    
    const newWithdrawals = adminState.withdrawRequests.filter(r => {
        return r.status === 'pending' && new Date(r.createdAt).toDateString() === today;
    }).length;
    
    // Update UI
    document.getElementById('totalUsers').textContent = formatNumber(totalUsers);
    document.getElementById('totalBalance').textContent = formatNumber(totalBalance) + ' ကျပ်';
    document.getElementById('pendingPayments').textContent = pendingPayments;
    document.getElementById('pendingWithdrawals').textContent = pendingWithdrawals;
    
    const paymentBadge = document.getElementById('paymentNewBadge');
    if (paymentBadge) {
        if (newPayments > 0) {
            paymentBadge.textContent = `အသစ် ${newPayments}`;
            paymentBadge.style.display = 'inline-block';
        } else {
            paymentBadge.style.display = 'none';
        }
    }
    
    const withdrawBadge = document.getElementById('withdrawNewBadge');
    if (withdrawBadge) {
        if (newWithdrawals > 0) {
            withdrawBadge.textContent = `အသစ် ${newWithdrawals}`;
            withdrawBadge.style.display = 'inline-block';
        } else {
            withdrawBadge.style.display = 'none';
        }
    }
    
    // Update tab badges
    document.getElementById('paymentTabBadge').textContent = pendingPayments;
    document.getElementById('withdrawTabBadge').textContent = pendingWithdrawals;
    document.getElementById('userTabBadge').textContent = formatNumber(totalUsers);
    document.getElementById('bankTabBadge').textContent = adminState.bankAccounts.length;
}

// ========== TAB SWITCHING ==========
function switchAdminTab(tabId) {
    console.log(' Switching to tab:', tabId);
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab-slide');
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update panels - အကုန်အရင်ဖျောက်မယ်
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });
    
    // ရွေးထားတဲ့ panel ကိုပြမယ်
    const activePanel = document.getElementById(tabId + 'Panel');
    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.style.display = 'block';
        console.log('✅ Showing panel:', activePanel.id);
    } else {
        console.error('❌ Panel not found:', tabId + 'Panel');
        
        // Fallback - first panel ကိုပြမယ်
        const firstPanel = document.querySelector('.tab-panel');
        if (firstPanel) {
            firstPanel.classList.add('active');
            firstPanel.style.display = 'block';
        }
    }
    
    // Load data based on tab
    loadTabData(tabId);
}

function loadTabData(tabId) {
    switch(tabId) {
        case 'payments':
            if (typeof loadPaymentRequests === 'function') loadPaymentRequests();
            break;
        case 'withdrawals':
            if (typeof loadWithdrawalRequests === 'function') loadWithdrawalRequests();
            break;
        case 'users':
            if (typeof loadUsersList === 'function') loadUsersList();
            break;
        case 'banks':
            if (typeof loadBankAccounts === 'function') loadBankAccounts();
            break;
        case 'jackpot':
            if (typeof loadJackpotControl === 'function') loadJackpotControl();
            break;
        case 'rtp':
            if (typeof loadRTPControl === 'function') loadRTPControl();
            break;
       case 'surprise':
    loadSurpriseBoxControl();
               break;
    }
}

function showSurpriseContent() {
    const panel = document.getElementById('surprisePanel');
    if (panel) {
        panel.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-gift" style="font-size: 80px; color: #ffd700; margin-bottom: 20px;"></i>
                <h2 style="color: white; margin-bottom: 15px;"> Surprise! </h2>
                <p style="color: rgba(255,255,255,0.8);">This is a hidden panel!</p>
                <div style="margin-top: 30px; background: rgba(255,215,0,0.1); padding: 30px; border-radius: 20px;">
                    <i class="fas fa-heart" style="color: #ff6b6b;"></i>
                    <i class="fas fa-star" style="color: #ffd700;"></i>
                    <i class="fas fa-crown" style="color: #00c853;"></i>
                </div>
            </div>
        `;
    }
}
function initTabListeners() {
    console.log('Initializing tab listeners...');

    const tabs = document.querySelectorAll('.tab-slide');
    console.log('Found tabs:', tabs.length);

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const tabId = this.dataset.tab;
            console.log(`Tab ${index} clicked:`, tabId, this.textContent.trim());

            if (tabId) {
                switchAdminTab(tabId);
            } else {
                console.error('Tab has no data-tab attribute:', this);
            }
        });
    });
}

// Call this after admin dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is ready
    setTimeout(initTabListeners, 500);
});

// ========== PAYMENT REQUESTS ==========
function loadPaymentRequests() {
    const tbody = document.getElementById('paymentRequestsList');
    if (!tbody) return;
    
    const pendingRequests = adminState.depositRequests
        .filter(r => r.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (pendingRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    ငွေသွင်းတောင်းဆိုမှု မရှိသေးပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    pendingRequests.forEach(request => {
        html += `
            <tr>
                <td><span class="request-id">${request.id}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-circle" style="color: #ffd700;"></i>
                        ${request.username}
                    </div>
                </td>
                <td><span style="color: #00c853; font-weight: 700;">${formatNumber(request.amount)} ကျပ်</span></td>
                <td>${request.method.toUpperCase()}</td>
                <td>${request.transferId || '-'}</td>
                <td>${formatDate(request.createdAt)}</td>
                <td><span class="status-badge pending">စောင့်ဆိုင်း</span></td>
                <td>
                    <button class="action-btn view-screenshot" onclick="viewScreenshot('${request.id}')">
                        <i class="fas fa-image"></i>
                    </button>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn approve" onclick="approvePayment('${request.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn reject" onclick="rejectPayment('${request.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function filterPaymentRequests() {
    const searchTerm = document.getElementById('paymentSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('paymentFilter')?.value || 'all';
    
    const tbody = document.getElementById('paymentRequestsList');
    if (!tbody) return;
    
    let filtered = adminState.depositRequests;
    
    // Apply status filter
    if (filterValue !== 'all') {
        filtered = filtered.filter(r => r.status === filterValue);
    }
    
    // Apply search
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.username.toLowerCase().includes(searchTerm) ||
            r.id.toLowerCase().includes(searchTerm) ||
            r.transferId?.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Render
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    ရှာဖွေမှု ရလဒ်မရှိပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(request => {
        const statusClass = request.status;
        const statusText = request.status === 'pending' ? 'စောင့်ဆိုင်း' : 
                          request.status === 'approved' ? 'အတည်ပြု' : 'ပယ်ချ';
        
        html += `
            <tr>
                <td><span class="request-id">${request.id}</span></td>
                <td>${request.username}</td>
                <td><span style="color: #00c853; font-weight: 700;">${formatNumber(request.amount)} ကျပ်</span></td>
                <td>${request.method.toUpperCase()}</td>
                <td>${request.transferId || '-'}</td>
                <td>${formatDate(request.createdAt)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn view-screenshot" onclick="viewScreenshot('${request.id}')">
                        <i class="fas fa-image"></i>
                    </button>
                </td>
                <td>
                    ${request.status === 'pending' ? `
                        <div style="display: flex; gap: 8px;">
                            <button class="action-btn approve" onclick="approvePayment('${request.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="action-btn reject" onclick="rejectPayment('${request.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : `
                        <span style="color: rgba(255,255,255,0.5);">-</span>
                    `}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function approvePayment(requestId) {
    const request = adminState.depositRequests.find(r => r.id === requestId);
    if (!request) return;
    
    // Update request status
    request.status = 'approved';
    request.processedAt = new Date().toISOString();
    
    // Add balance to user
    const user = adminState.users.find(u => u.id === request.userId);
    if (user) {
        user.balance = (user.balance || 0) + request.amount;
        user.totalDeposit = (user.totalDeposit || 0) + request.amount;
        
        // Update current user if online
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id === user.id) {
            currentUser.balance = user.balance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update game balance
            if (typeof gameState !== 'undefined') {
                gameState.balance = user.balance;
            }
            
            // Update balance display
            const balanceEl = document.getElementById('balanceAmount');
            if (balanceEl) balanceEl.textContent = formatNumber(user.balance);
        }
    }
    
    // Save to storage
    localStorage.setItem('depositRequests', JSON.stringify(adminState.depositRequests));
    localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
    
    // Reload data
    loadPaymentRequests();
    updateStatsCards();
    
    showNotification(`#${requestId} ကို အတည်ပြုပြီးပါပြီ။`, 'success');
}

function rejectPayment(requestId) {
    const request = adminState.depositRequests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'rejected';
    request.processedAt = new Date().toISOString();
    
    localStorage.setItem('depositRequests', JSON.stringify(adminState.depositRequests));
    
    loadPaymentRequests();
    updateStatsCards();
    
    showNotification(`#${requestId} ကို ပယ်ချပြီးပါပြီ။`, 'info');
}

// ========== WITHDRAWAL REQUESTS ==========
function loadWithdrawalRequests() {
    const tbody = document.getElementById('withdrawalRequestsList');
    if (!tbody) return;
    
    const pendingRequests = adminState.withdrawRequests
        .filter(r => r.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (pendingRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    ငွေထုတ်တောင်းဆိုမှု မရှိသေးပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    pendingRequests.forEach(request => {
        html += `
            <tr>
                <td><span class="request-id">${request.id}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-circle" style="color: #ffd700;"></i>
                        ${request.username}
                    </div>
                </td>
                <td><span style="color: #ff6b6b; font-weight: 700;">${formatNumber(request.amount)} ကျပ်</span></td>
                <td>${request.bank}</td>
                <td>${request.accountNumber}<br><small style="color: rgba(255,255,255,0.5);">${request.accountName}</small></td>
                <td>${formatDate(request.createdAt)}</td>
                <td><span class="status-badge pending">စောင့်ဆိုင်း</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn approve" onclick="approveWithdraw('${request.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn reject" onclick="rejectWithdraw('${request.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function filterWithdrawRequests() {
    const searchTerm = document.getElementById('withdrawSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('withdrawFilter')?.value || 'all';
    
    const tbody = document.getElementById('withdrawalRequestsList');
    if (!tbody) return;
    
    let filtered = adminState.withdrawRequests;
    
    if (filterValue !== 'all') {
        filtered = filtered.filter(r => r.status === filterValue);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.username.toLowerCase().includes(searchTerm) ||
            r.id.toLowerCase().includes(searchTerm) ||
            r.accountNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    ရှာဖွေမှု ရလဒ်မရှိပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(request => {
        const statusClass = request.status;
        const statusText = request.status === 'pending' ? 'စောင့်ဆိုင်း' : 
                          request.status === 'approved' ? 'အတည်ပြု' : 'ပယ်ချ';
        
        html += `
            <tr>
                <td><span class="request-id">${request.id}</span></td>
                <td>${request.username}</td>
                <td><span style="color: ${request.status === 'approved' ? '#00c853' : '#ff6b6b'}; font-weight: 700;">${formatNumber(request.amount)} ကျပ်</span></td>
                <td>${request.bank}</td>
                <td>${request.accountNumber}<br><small>${request.accountName}</small></td>
                <td>${formatDate(request.createdAt)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${request.status === 'pending' ? `
                        <div style="display: flex; gap: 8px;">
                            <button class="action-btn approve" onclick="approveWithdraw('${request.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="action-btn reject" onclick="rejectWithdraw('${request.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : `
                        <span style="color: rgba(255,255,255,0.5);">-</span>
                    `}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function approveWithdraw(requestId) {
    const request = adminState.withdrawRequests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'approved';
    request.processedAt = new Date().toISOString();
    
    // Update user total withdraw
    const user = adminState.users.find(u => u.id === request.userId);
    if (user) {
        user.totalWithdraw = (user.totalWithdraw || 0) + request.amount;
    }
    
    localStorage.setItem('withdrawRequests', JSON.stringify(adminState.withdrawRequests));
    localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
    
    loadWithdrawalRequests();
    updateStatsCards();
    
    showNotification(`#${requestId} ငွေထုတ်တောင်းဆိုမှု အတည်ပြုပြီးပါပြီ။`, 'success');
}

function rejectWithdraw(requestId) {
    const request = adminState.withdrawRequests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'rejected';
    request.processedAt = new Date().toISOString();
    
    // Refund to user balance
    const user = adminState.users.find(u => u.id === request.userId);
    if (user) {
        user.balance = (user.balance || 0) + request.amount;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id === user.id) {
            currentUser.balance = user.balance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
    
    localStorage.setItem('withdrawRequests', JSON.stringify(adminState.withdrawRequests));
    localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
    
    loadWithdrawalRequests();
    updateStatsCards();
    
    showNotification(`#${requestId} ကို ပယ်ချပြီး ငွေပြန်အမ်းပြီးပါပြီ။`, 'info');
}

// ========== USERS MANAGEMENT ==========
function loadUsersList() {
    const tbody = document.getElementById('usersList');
    if (!tbody) return;
    
    const users = adminState.users.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    အသုံးပြုသူ မရှိသေးပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    users.forEach((user, index) => {
        const vipClass = user.vip > 0 ? 'vip-badge-mini' : '';
        const statusClass = user.status === 'blocked' ? 'status-blocked' : 'status-active';
        const statusText = user.status === 'blocked' ? 'ပိတ်ထား' : 'အကောင့်ဖွင့်';
        
        html += `
            <tr>
                <td>#${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-circle" style="color: #ffd700;"></i>
                        ${user.username}
                        ${user.vip > 0 ? `<span class="vip-mini"><i class="fas fa-crown"></i> VIP ${user.vip}</span>` : ''}
                    </div>
                </td>
                <td>${user.phone || '-'}</td>
                <td><span style="color: #00c853; font-weight: 700;">${formatNumber(user.balance || 0)} ကျပ်</span></td>
                <td>${user.vip || 0}</td>
                <td>${formatNumber(user.totalDeposit || 0)} ကျပ်</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" onclick="editUser('${user.id}')" title="ပြင်မည်">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ${user.status === 'blocked' ? 'approve' : 'reject'}" 
                                onclick="toggleUserStatus('${user.id}')" 
                                title="${user.status === 'blocked' ? 'ဖွင့်မည်' : 'ပိတ်မည်'}">
                            <i class="fas ${user.status === 'blocked' ? 'fa-check' : 'fa-ban'}"></i>
                        </button>
                        <button class="action-btn" onclick="addVipToUser('${user.id}')" title="VIP ပေးမည်">
                            <i class="fas fa-crown"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('userFilter')?.value || 'all';
    
    let filtered = adminState.users;
    
    if (filterValue === 'vip') {
        filtered = filtered.filter(u => u.vip > 0);
    } else if (filterValue === 'active') {
        filtered = filtered.filter(u => u.status !== 'blocked');
    } else if (filterValue === 'blocked') {
        filtered = filtered.filter(u => u.status === 'blocked');
    }
    
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.username.toLowerCase().includes(searchTerm) ||
            (u.phone && u.phone.includes(searchTerm))
        );
    }
    
    // Re-render
    const tbody = document.getElementById('usersList');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    ရှာဖွေမှု ရလဒ်မရှိပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach((user, index) => {
        html += `
            <tr>
                <td>#${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.phone || '-'}</td>
                <td>${formatNumber(user.balance || 0)} ကျပ်</td>
                <td>${user.vip || 0}</td>
                <td>${formatNumber(user.totalDeposit || 0)} ကျပ်</td>
                <td><span class="status-badge ${user.status === 'blocked' ? 'rejected' : 'approved'}">${user.status === 'blocked' ? 'ပိတ်ထား' : 'အကောင့်ဖွင့်'}</span></td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="toggleUserStatus('${user.id}')">
                            <i class="fas ${user.status === 'blocked' ? 'fa-check' : 'fa-ban'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function toggleUserStatus(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;
    
    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    
    localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
    
    // If current user is toggled, update current session
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === userId) {
        if (user.status === 'blocked') {
            localStorage.removeItem('currentUser');
            showNotification('သင့်အကောင့် ပိတ်ထားပါသည်။ ကျေးဇူးပြု၍ ဆက်သွယ်ပါ။', 'error');
            setTimeout(() => location.reload(), 2000);
        }
    }
    
    loadUsersList();
    showNotification(`${user.username} ၏အကောင့် ${user.status === 'blocked' ? 'ပိတ်ထားပါသည်။' : 'ပြန်ဖွင့်ပေးပြီးပါပြီ။'}`, 'success');
}

// ========== USER MANAGEMENT ADDITIONS ==========

/**
 * Edit user information
 */
function editUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;
    
    // Create and show edit modal
    showConfirmModal(
        'အသုံးပြုသူပြင်ဆင်ရန်',
        `
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">Username</label>
                <input type="text" id="editUsername" value="${user.username}" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;" readonly>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">ဖုန်းနံပါတ်</label>
                <input type="text" id="editPhone" value="${user.phone || ''}" placeholder="09-xxxxx" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">လက်ကျန်ငွေ</label>
                <input type="number" id="editBalance" value="${user.balance || 0}" min="0" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">Level</label>
                <input type="number" id="editLevel" value="${user.level || 1}" min="1" max="100" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">အခြေအနေ</label>
                <select id="editStatus" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
                    <option value="active" ${user.status === 'active' ? 'selected' : ''}>အကောင့်ဖွင့်</option>
                    <option value="blocked" ${user.status === 'blocked' ? 'selected' : ''}>ပိတ်ထား</option>
                </select>
            </div>
        `,
        function() {
            // Get values
            const phone = document.getElementById('editPhone').value;
            const balance = parseInt(document.getElementById('editBalance').value);
            const level = parseInt(document.getElementById('editLevel').value);
            const status = document.getElementById('editStatus').value;
            
            // Update user
            user.phone = phone;
            user.balance = balance;
            user.level = level;
            user.status = status;
            
            // Save to localStorage
            localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
            
            // Update current user if online
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id === user.id) {
                currentUser.phone = phone;
                currentUser.balance = balance;
                currentUser.level = level;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Update game balance
                if (typeof gameState !== 'undefined') {
                    gameState.balance = balance;
                    gameState.userLevel = level;
                }
                
                // Update display
                const balanceEl = document.getElementById('balanceAmount');
                if (balanceEl) balanceEl.textContent = formatNumber(balance);
                
                const levelEl = document.getElementById('userLevel');
                if (levelEl) levelEl.textContent = level;
            }
            
            // Reload users list
            loadUsersList();
            showNotification(`${user.username} ၏အချက်အလက်များ ပြင်ဆင်ပြီးပါပြီ။`, 'success');
        }
    );
}

/**
 * Add VIP to user
 */
function addVipToUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;
    
    // Create and show VIP modal
    showConfirmModal(
        'VIP အဆင့်သတ်မှတ်ရန်',
        `
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">အသုံးပြုသူ</label>
                <input type="text" value="${user.username}" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;" readonly>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">VIP အဆင့်</label>
                <select id="vipLevelSelect" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
                    <option value="0">VIP မဟုတ်</option>
                    <option value="1" ${user.vip === 1 ? 'selected' : ''}>VIP 1</option>
                    <option value="2" ${user.vip === 2 ? 'selected' : ''}>VIP 2</option>
                    <option value="3" ${user.vip === 3 ? 'selected' : ''}>VIP 3</option>
                    <option value="4" ${user.vip === 4 ? 'selected' : ''}>VIP 4</option>
                    <option value="5" ${user.vip === 5 ? 'selected' : ''}>VIP 5</option>
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 10px;">ထပ်မံဖြည့်ငွေ (Bonus)</label>
                <input type="number" id="vipBonus" value="0" min="0" step="10000" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
            </div>
        `,
        function() {
            const vipLevel = parseInt(document.getElementById('vipLevelSelect').value);
            const bonus = parseInt(document.getElementById('vipBonus').value) || 0;
            
            // Update user
            user.vip = vipLevel;
            user.balance = (user.balance || 0) + bonus;
            
            // Save to localStorage
            localStorage.setItem('slotUsers', JSON.stringify(adminState.users));
            
            // Update current user if online
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id === user.id) {
                currentUser.vip = vipLevel;
                currentUser.balance = user.balance;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Update game VIP
                if (typeof gameState !== 'undefined') {
                    gameState.vipLevel = vipLevel;
                    gameState.balance = user.balance;
                }
                
                // Update display
                const balanceEl = document.getElementById('balanceAmount');
                if (balanceEl) balanceEl.textContent = formatNumber(user.balance);
                
                const vipEl = document.getElementById('vipLevel');
                if (vipEl) vipEl.textContent = vipLevel;
                
                const vipBadge = document.getElementById('vipBadge');
                if (vipBadge) {
                    vipBadge.style.display = vipLevel > 0 ? 'flex' : 'none';
                }
            }
            
            // Reload users list
            loadUsersList();
            showNotification(`${user.username} အား VIP ${vipLevel} အဆင့်သတ်မှတ်ပြီးပါပြီ။`, 'success');
        }
    );
}

// Make sure these are exported globally
window.editUser = editUser;
window.addVipToUser =addVipToUser;

// ========== BANK ACCOUNTS - FULL IMPLEMENTATION ==========

// Load bank accounts
window.loadBankAccounts = function() {
    console.log(' Loading bank accounts...');
    
    const grid = document.getElementById('bankAccountsGrid');
    if (!grid) {
        console.error('❌ bankAccountsGrid not found!');
        return;
    }
    
    // Get from localStorage
    let banks = [];
    try {
        const saved = localStorage.getItem('bankAccounts');
        banks = saved ? JSON.parse(saved) : [];
    } catch(e) {
        console.error('Error parsing bank accounts:', e);
        banks = [];
    }
    
    // Default data if empty
    if (!banks || banks.length === 0) {
        banks = [
            {
                id: 'BANK001',
                bankName: 'KBZ Pay',
                accountHolder: 'ဒေါ်အေးအေး',
                accountNumber: '09-123456789',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'BANK002',
                bankName: 'Wave Pay',
                accountHolder: 'ဦးမောင်မောင်',
                accountNumber: '09-987654321',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'BANK003',
                bankName: 'CB Pay',
                accountHolder: 'ကိုဇော်ဇော်',
                accountNumber: '09-555555555',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('bankAccounts', JSON.stringify(banks));
    }
    
    // Store in adminState
    adminState.bankAccounts = banks;
    
    // Build HTML
    let html = '';
    banks.forEach(bank => {
        const isActive = bank.status === 'active';
        html += `
            <div class="bank-card" style="background: linear-gradient(145deg, #1e2332, #1a1e2c); border-radius: 24px; padding: 25px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: rgba(255,215,0,0.1); width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-university" style="color: #ffd700; font-size: 24px;"></i>
                        </div>
                        <h3 style="color: white; margin: 0; font-size: 20px;">${bank.bankName}</h3>
                    </div>
                    <span style="background: ${isActive ? 'rgba(0,200,83,0.1)' : 'rgba(255,59,48,0.1)'}; color: ${isActive ? '#00c853' : '#ff5252'}; padding: 6px 16px; border-radius: 30px; font-size: 14px; font-weight: 600;">
                        ${isActive ? 'ဖွင့်ထား' : 'ပိတ်ထား'}
                    </span>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <i class="fas fa-user" style="color: #ffd700; width: 20px;"></i>
                        <div>
                            <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px;">အကောင့်ပိုင်ရှင်</div>
                            <div style="color: white; font-size: 16px; font-weight: 600;">${bank.accountHolder}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-phone" style="color: #ffd700; width: 20px;"></i>
                        <div>
                            <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px;">အကောင့်နံပါတ်</div>
                            <div style="color: white; font-size: 16px; font-weight: 600;">${bank.accountNumber}</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="editBankAccount('${bank.id}')" style="flex: 1; padding: 14px; background: rgba(33,150,243,0.1); border: 1px solid #2196f3; border-radius: 16px; color: white; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                        <i class="fas fa-edit" style="color: #2196f3;"></i> ပြင်မည်
                    </button>
                    <button onclick="toggleBankStatus('${bank.id}')" style="flex: 1; padding: 14px; background: ${isActive ? 'rgba(255,59,48,0.1)' : 'rgba(0,200,83,0.1)'}; border: 1px solid ${isActive ? '#ff5252' : '#00c853'}; border-radius: 16px; color: white; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                        <i class="fas ${isActive ? 'fa-times' : 'fa-check'}" style="color: ${isActive ? '#ff5252' : '#00c853'};"></i>
                        ${isActive ? 'ပိတ်မည်' : 'ဖွင့်မည်'}
                    </button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    console.log(`✅ Loaded ${banks.length} bank accounts`);
};

// Open Add Bank Modal
window.openAddBankModal = function() {
    console.log('➕ Opening add bank modal...');
    
    const modal = document.getElementById('bankModal');
    if (!modal) {
        alert('Bank Modal not found! Please check HTML.');
        return;
    }
    
    // Reset form
    document.getElementById('bankModalTitle').innerHTML = '<i class="fas fa-university"></i> ဘဏ်အကောင့်အသစ်ထည့်ရန်';
    document.getElementById('bankNameSelect').value = '';
    document.getElementById('accountHolderInput').value = '';
    document.getElementById('accountNumberInput').value = '';
    document.getElementById('accountStatusSelect').value = 'active';
    
    // Remove edit ID
    delete modal.dataset.editId;
    
    modal.style.display = 'flex';
};

// Edit Bank Account
window.editBankAccount = function(accountId) {
    console.log('✏️ Editing bank account:', accountId);
    
    // Get latest data
    let banks = [];
    try {
        banks = JSON.parse(localStorage.getItem('bankAccounts')) || adminState.bankAccounts || [];
    } catch(e) {
        banks = adminState.bankAccounts || [];
    }
    
    const account = banks.find(b => b.id === accountId);
    if (!account) {
        alert('ဘဏ်အကောင့် မတွေ့ရှိပါ။');
        return;
    }
    
    const modal = document.getElementById('bankModal');
    if (!modal) return;
    
    // Fill form
    document.getElementById('bankModalTitle').innerHTML = '<i class="fas fa-edit"></i> ဘဏ်အကောင့်ပြင်မည်';
    document.getElementById('bankNameSelect').value = account.bankName || '';
    document.getElementById('accountHolderInput').value = account.accountHolder || '';
    document.getElementById('accountNumberInput').value = account.accountNumber || '';
    document.getElementById('accountStatusSelect').value = account.status || 'active';
    
    // Store edit ID
    modal.dataset.editId = accountId;
    
    modal.style.display = 'flex';
};

// Toggle Bank Status
window.toggleBankStatus = function(accountId) {
    console.log(' Toggling bank status:', accountId);
    
    let banks = [];
    try {
        banks = JSON.parse(localStorage.getItem('bankAccounts')) || adminState.bankAccounts || [];
    } catch(e) {
        banks = adminState.bankAccounts || [];
    }
    
    const account = banks.find(b => b.id === accountId);
    if (!account) return;
    
    // Toggle status
    account.status = account.status === 'active' ? 'inactive' : 'active';
    
    // Save
    localStorage.setItem('bankAccounts', JSON.stringify(banks));
    adminState.bankAccounts = banks;
    
    // Reload display
    loadBankAccounts();
    
    // Notify
    alert(`${account.bankName} ကို ${account.status === 'active' ? 'ဖွင့်ထားပါသည်' : 'ပိတ်ထားပါသည်'}`);
};

// Save Bank Account (Add or Edit)
window.saveBankAccount = function() {
    console.log(' Saving bank account...');
    
    // Get form values
    const bankName = document.getElementById('bankNameSelect')?.value;
    const accountHolder = document.getElementById('accountHolderInput')?.value.trim();
    const accountNumber = document.getElementById('accountNumberInput')?.value.trim();
    const status = document.getElementById('accountStatusSelect')?.value;
    const modal = document.getElementById('bankModal');
    const editId = modal?.dataset.editId;
    
    // Validation
    if (!bankName) {
        alert('ကျေးဇူးပြု၍ ဘဏ်အမည် ရွေးချယ်ပါ။');
        document.getElementById('bankNameSelect')?.focus();
        return;
    }
    
    if (!accountHolder) {
        alert('ကျေးဇူးပြု၍ အကောင့်ပိုင်ရှင်အမည် ထည့်ပါ။');
        document.getElementById('accountHolderInput')?.focus();
        return;
    }
    
    if (!accountNumber) {
        alert('ကျေးဇူးပြု၍ အကောင့်နံပါတ် ထည့်ပါ။');
        document.getElementById('accountNumberInput')?.focus();
        return;
    }
    
    // Get existing banks
    let banks = [];
    try {
        banks = JSON.parse(localStorage.getItem('bankAccounts')) || adminState.bankAccounts || [];
    } catch(e) {
        banks = adminState.bankAccounts || [];
    }
    
    if (editId) {
        // EDIT mode
        const index = banks.findIndex(b => b.id === editId);
        if (index !== -1) {
            banks[index] = {
                ...banks[index],
                bankName: bankName,
                accountHolder: accountHolder,
                accountNumber: accountNumber,
                status: status
            };
            alert('✅ ဘဏ်အကောင့် ပြင်ဆင်ပြီးပါပြီ။');
        } else {
            alert('❌ ဘဏ်အကောင့် မတွေ့ရှိပါ။');
            return;
        }
    } else {
        // ADD mode
        const newBank = {
            id: 'BANK' + Date.now() + Math.floor(Math.random() * 1000),
            bankName: bankName,
            accountHolder: accountHolder,
            accountNumber: accountNumber,
            status: status,
            createdAt: new Date().toISOString()
        };
        banks.push(newBank);
        alert('✅ ဘဏ်အကောင့်အသစ် ထည့်သွင်းပြီးပါပြီ။');
    }
    
    // Save to localStorage
    localStorage.setItem('bankAccounts', JSON.stringify(banks));
    adminState.bankAccounts = banks;
    
    // Close modal
    if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.editId;
    }
    
    // Reload bank list
    loadBankAccounts();
};

// After saving bank account, trigger update in userpayment
if (typeof window.updateBankInfo === 'function') {
    // Small delay to ensure localStorage is updated
    setTimeout(() => {
        // Update deposit modal if it's open
        if (document.getElementById('depositModal').style.display === 'flex') {
            const currentMethod = paymentState?.selectedMethod || 'kbzpay';
            window.updateBankInfo(currentMethod);
        }
    }, 200);
}
// ========== JACKPOT CONTROL ==========

function loadJackpotControl() {
    // Update jackpot pool display
    const poolEl = document.getElementById('totalJackpotPool');
    if (poolEl) poolEl.textContent = formatNumber(adminState.jackpotState.totalPool);

    // Load jackpot tiers
    const tiersContainer = document.getElementById('jackpotTiers');
    if (tiersContainer) {
        tiersContainer.innerHTML = `
            <div class="jackpot-tier mini">
                <div class="tier-header">
                    <i class="fas fa-star"></i>
                    <h3>Mini Jackpot</h3>
                </div>
                <div class="tier-amount">${formatNumber(adminState.jackpotState.mini)} ကျပ်</div>
                <div class="tier-progress">
                    <div class="progress-bar" style="width: 75%;"></div>
                </div>
                <div class="tier-controls">
                    <button class="btn-quick" onclick="adjustJackpot('mini', -5000)">-5k</button>
                    <button class="btn-quick" onclick="adjustJackpot('mini', 5000)">+5k</button>
                    <input type="number" id="miniJackpotInput" value="${adminState.jackpotState.mini}" min="10000" step="5000">
                    <button class="btn-primary" onclick="setJackpot('mini')">သတ်မှတ်</button>
                </div>
            </div>
            <div class="jackpot-tier major">
                <div class="tier-header">
                    <i class="fas fa-gem"></i>
                    <h3>Major Jackpot</h3>
                </div>
                <div class="tier-amount">${formatNumber(adminState.jackpotState.major)} ကျပ်</div>
                <div class="tier-progress">
                    <div class="progress-bar" style="width: 60%;"></div>
                </div>
                <div class="tier-controls">
                    <button class="btn-quick" onclick="adjustJackpot('major', -10000)">-10k</button>
                    <button class="btn-quick" onclick="adjustJackpot('major', 10000)">+10k</button>
                    <input type="number" id="majorJackpotInput" value="${adminState.jackpotState.major}" min="50000" step="10000">
                    <button class="btn-primary" onclick="setJackpot('major')">သတ်မှတ်</button>
                </div>
            </div>
            <div class="jackpot-tier mega">
                <div class="tier-header">
                    <i class="fas fa-crown"></i>
                    <h3>Mega Jackpot</h3>
                </div>
                <div class="tier-amount">${formatNumber(adminState.jackpotState.mega)} ကျပ်</div>
                <div class="tier-progress">
                    <div class="progress-bar" style="width: 45%;"></div>
                </div>
                <div class="tier-controls">
                    <button class="btn-quick" onclick="adjustJackpot('mega', -20000)">-20k</button>
                    <button class="btn-quick" onclick="adjustJackpot('mega', 20000)">+20k</button>
                    <input type="number" id="megaJackpotInput" value="${adminState.jackpotState.mega}" min="100000" step="20000">
                    <button class="btn-primary" onclick="setJackpot('mega')">သတ်မှတ်</button>
                </div>
            </div>
        `;
    }

    // Update statistics
    const todayWinsEl = document.getElementById('todayJackpotWins');
    if (todayWinsEl) todayWinsEl.textContent = adminState.jackpotState.todayWins || 0;
    
    const todayContributionsEl = document.getElementById('todayContributions');
    if (todayContributionsEl) todayContributionsEl.textContent = formatNumber(adminState.jackpotState.todayContributions || 0) + ' ကျပ်';
    
    const avgWinEl = document.getElementById('avgJackpotWin');
    if (avgWinEl) avgWinEl.textContent = formatNumber(adminState.jackpotState.avgWin || 0) + ' ကျပ်';
    
    const biggestWinEl = document.getElementById('biggestWinToday');
    if (biggestWinEl) biggestWinEl.textContent = formatNumber(adminState.jackpotState.biggestWin || 0) + ' ကျပ်';
}

function adjustJackpot(tier, amount) {
    adminState.jackpotState[tier] = Math.max(10000, (adminState.jackpotState[tier] || 0) + amount);
    adminState.jackpotState.totalPool = (adminState.jackpotState.mini || 0) + (adminState.jackpotState.major || 0) + (adminState.jackpotState.mega || 0);
    loadJackpotControl();
}

function setJackpot(tier) {
    const input = document.getElementById(`${tier}JackpotInput`);
    if (!input) return;
    
    const value = parseInt(input.value);
    if (value && value > 0) {
        adminState.jackpotState[tier] = value;
        adminState.jackpotState.totalPool = (adminState.jackpotState.mini || 0) + (adminState.jackpotState.major || 0) + (adminState.jackpotState.mega || 0);
        loadJackpotControl();
        if (typeof showNotification === 'function') {
            showNotification(`${tier.charAt(0).toUpperCase() + tier.slice(1)} Jackpot ကို ${formatNumber(value)} ကျပ်သို့သတ်မှတ်ပြီးပါပြီ။`, 'success');
        }
    }
}  // <-- ဒီမှာ setJackpot function ပြီးတယ်။
/**
 * Show jackpot send modal - COMPLETE FIXED VERSION
 */
window.showJackpotSendModal = function() {
    console.log('Showing jackpot send modal...');
    
    let existingUsers = [];
    try {
        existingUsers = JSON.parse(localStorage.getItem('slotUsers')) || adminState.users || [];
    } catch(e) {
        existingUsers = adminState.users || [];
    }
    
    const userSuggestions = existingUsers
        .slice(0, 5)
        .map(u => `<div onclick="document.getElementById('jackpotUsername').value='${u.username}'" 
                        style="padding:8px 15px; background:rgba(255,255,255,0.05); border-radius:10px; cursor:pointer; display:inline-block; margin:5px;">
                        <i class="fas fa-user"></i> ${u.username}
                    </div>`)
        .join('');
    
    const modalContent = `
        <div style="margin-bottom: 20px;">
            <label style="color: white; display: block; margin-bottom: 10px;">
                <i class="fas fa-user"></i> အသုံးပြုသူအမည်
            </label>
            <input type="text" id="jackpotUsername" placeholder="Username" 
                   style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white; font-size:16px;"
                   autocomplete="off">
            ${existingUsers.length > 0 ? `
                <div style="margin-top: 10px;">
                    <div style="color: rgba(255,255,255,0.6); margin-bottom: 8px; font-size: 13px;">
                        <i class="fas fa-history"></i> အကြံပြုအမည်များ:
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${userSuggestions}
                    </div>
                </div>
            ` : ''}
        </div>
        <div style="margin-bottom: 20px;">
            <label style="color: white; display: block; margin-bottom: 10px;">
                <i class="fas fa-trophy"></i> ဂျက်ကပ်အမျိုးအစား
            </label>
            <select id="jackpotTier" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;">
                <option value="mini">Mini - ${(adminState.jackpotState.mini || 50000).toLocaleString()} ကျပ်</option>
                <option value="major">Major - ${(adminState.jackpotState.major || 200000).toLocaleString()} ကျပ်</option>
                <option value="mega">Mega - ${(adminState.jackpotState.mega || 500000).toLocaleString()} ကျပ်</option>
                <option value="custom">သတ်မှတ်ပမာဏ</option>
            </select>
        </div>
        <div style="margin-bottom: 20px; display: none;" id="customJackpotContainer">
            <label style="color: white; display: block; margin-bottom: 10px;">
                <i class="fas fa-coins"></i> ပမာဏသတ်မှတ်ရန်
            </label>
            <input type="number" id="customJackpotAmount" placeholder="ကျပ်" 
                   style="width:100%; padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:15px; color:white;"
                   min="10000" step="10000">
        </div>
    `;  // <-- ဒီမှာ template string ကိုပိတ်တယ်။
    
    showConfirmModal('ဂျက်ကပ်ဆုငွေပေးပို့ရန်', modalContent, function() {
        sendJackpotToUser();
    });
    
    // Add event listener for tier change
    setTimeout(() => {
        const tierSelect = document.getElementById('jackpotTier');
        const customContainer = document.getElementById('customJackpotContainer');
        
        if (tierSelect && customContainer) {
            // Remove existing listeners
            const newTierSelect = tierSelect.cloneNode(true);
            tierSelect.parentNode.replaceChild(newTierSelect, tierSelect);
            
            newTierSelect.addEventListener('change', function() {
                customContainer.style.display = this.value === 'custom' ? 'block' : 'none';
            });
        }
    }, 100);
    
};  // <-- ဒီမှာ function ကိုပိတ်တယ်။
/**
 * Send jackpot to user - FINAL FIXED VERSION
 */
window.sendJackpotToUser = function() {
    console.log(' Sending jackpot to user...');

    const usernameInput = document.getElementById('jackpotUsername');
    const tierSelect = document.getElementById('jackpotTier');
    const customContainer = document.getElementById('customJackpotContainer');
    const customInput = document.getElementById('customJackpotAmount');

    if (!usernameInput || !tierSelect) {
        alert('Form elements not found!');
        return;
    }

    const username = usernameInput.value.trim();
    const tier = tierSelect.value;

    if (!username) {
        alert('ကျေးဇူးပြု၍ အသုံးပြုသူအမည် ထည့်ပါ။');
        usernameInput.focus();
        return;
    }

    // Get users from localStorage
    let allUsers = [];
    try {
        const savedUsers = localStorage.getItem('slotUsers');
        allUsers = savedUsers ? JSON.parse(savedUsers) : [];
        console.log(' Users from localStorage:', allUsers.length);
    } catch(e) {
        console.error('Error loading users:', e);
        allUsers = adminState.users || [];
    }

    // Find user
    const foundUser = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
    );

    if (!foundUser) {
        const userList = allUsers.map(u => u.username).join(', ');
        alert(`အသုံးပြုသူ "${username}" မတွေ့ရှိပါ။\n\nရှိသောအမည်များ: ${userList || '(မရှိသေး)'}`);
        return;
    }

    console.log('✅ User found:', foundUser.username);

    // Calculate amount
    let amount;
    if (tier === 'custom') {
        amount = parseInt(customInput?.value);
        if (!amount || amount < 10000) {
            alert('အနည်းဆုံး ၁၀၀၀၀ ကျပ် သတ်မှတ်ပါ။');
            return;
        }
    } else {
        amount = adminState.jackpotState[tier];
    }

    if (!confirm(`"${foundUser.username}" သို့ ${amount.toLocaleString()} ကျပ် ဂျက်ကပ်ဆုငွေ ပေးပို့ရန် သေချာပါသလား?`)) {
        return;
    }

    // ===== ချက်ချင်းမပေးတော့ဘူး - Pending Gift အနေနဲ့သိမ်းမယ် =====
    
    // Pending gift object ဆောက်
    const pendingGift = {
        type: 'credit',
        amount: amount,
        from: 'Admin',
        time: new Date().toISOString()
    };
    
    // Pending gift သိမ်း
    const pendingGiftKey = `pendingGift_${foundUser.id}`;
    localStorage.setItem(pendingGiftKey, JSON.stringify(pendingGift));
    
    // လက်ရှိ user ဆိုရင် spinCounter ကို 0 ပြန်ထား
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === foundUser.id) {
        if (typeof gameState !== 'undefined') {
            gameState.spinCounter = 0;
        }
        console.log('🔄 Spin counter reset to 0');
    }

    // ===== ဒီအောက်က ချက်ချင်းပေးတဲ့အပိုင်းတွေကို ဖြုတ်ပစ်မယ် =====
    /*
    foundUser.balance = (foundUser.balance || 0) + amount;
    foundUser.totalJackpot = (foundUser.totalJackpot || 0) + amount;
    localStorage.setItem('slotUsers', JSON.stringify(allUsers));
    adminState.users = allUsers;
    
    if (currentUser && currentUser.id === foundUser.id) {
        currentUser.balance = foundUser.balance;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        gameState.balance = foundUser.balance;
        updateBalanceDisplay();
    }
    */

    // ----- Update jackpot statistics (ဒါတော့ထားမယ်) -----
    adminState.jackpotState.totalPool = (adminState.jackpotState.totalPool || 0) - amount;
    adminState.jackpotState.todayWins = (adminState.jackpotState.todayWins || 0) + 1;
    adminState.jackpotState.todayContributions = (adminState.jackpotState.todayContributions || 0) + amount;

    const currentAvg = adminState.jackpotState.avgWin || 0;
    const currentCount = adminState.jackpotState.todayWins || 1;
    adminState.jackpotState.avgWin = Math.floor((currentAvg * (currentCount - 1) + amount) / currentCount);

    if (amount > (adminState.jackpotState.biggestWin || 0)) {
        adminState.jackpotState.biggestWin = amount;
    }

    localStorage.setItem('jackpotState', JSON.stringify(adminState.jackpotState));

    // ----- Close modal and reload -----
    closeModal('confirmModal');
    loadJackpotControl();
    loadUsersList();

    // Celebration (ဒါကတော့ Admin မှာပြဖို့)
    if (typeof showAdminJackpot === 'function') {
        showAdminJackpot(foundUser.username, amount);
    }

    alert(`✅ ${foundUser.username} သို့ ${amount.toLocaleString()} ကျပ် ဂျက်ကပ်ဆုငွေ စောင့်ဆိုင်းစနစ်ဖြင့် ပေးပို့ပြီးပါပြီ။ Spin ၃ ချက်ဆွဲပြီးပါက ရရှိမည်။`);

    // Clear input
    usernameInput.value = '';
    if (customInput) customInput.value = '';
};

function quickSendJackpot(tier, amount) {
    adminState.jackpotState.totalPool -= amount;
    adminState.jackpotState.todayWins++;
    adminState.jackpotState.avgWin = Math.floor((adminState.jackpotState.avgWin + amount) / 2);
    
    if (amount > adminState.jackpotState.biggestWin) {
        adminState.jackpotState.biggestWin = amount;
    }
    
    loadJackpotControl();
    showNotification(`${tier.charAt(0).toUpperCase() + tier.slice(1)} Jackpot ဆုငွေ ${formatNumber(amount)} ကျပ် ထုတ်ပေးပြီးပါပြီ။`, 'success');
}

function resetJackpotPool() {
    showConfirmModal(
        'ဂျက်ကပ်ပြန်သတ်မှတ်ရန်',
        'ဂျက်ကပ်ပမာဏအားလုံးကို မူလအတိုင်းပြန်သတ်မှတ်မှာ သေချာပါသလား?',
        function() {
            adminState.jackpotState = {
                ...adminState.jackpotState,
                mini: 50000,
                major: 200000,
                mega: 500000,
                totalPool: 750000
            };
            loadJackpotControl();
            showNotification('ဂျက်ကပ်ပမာဏများ ပြန်သတ်မှတ်ပြီးပါပြီ။', 'success');
        }
    );
}
// ========== RTP CONTROL ==========
function loadRTPControl() {
    const rtpDisplay = document.getElementById('currentRTP');
    const rtpSlider = document.getElementById('rtpSlider');
    const rtpValue = document.getElementById('rtpDisplay');
    
    if (rtpDisplay) rtpDisplay.textContent = adminState.rtpState.current + '%';
    if (rtpSlider) rtpSlider.value = adminState.rtpState.current;
    if (rtpValue) rtpValue.textContent = adminState.rtpState.current + '%';
}

function applyRTP() {
    const slider = document.getElementById('rtpSlider');
    const newRTP = parseFloat(slider.value);
    
    adminState.rtpState.current = newRTP;
    adminState.rtpState.history.push({
        value: newRTP,
        timestamp: new Date().toISOString()
    });
    
    loadRTPControl();
    showNotification(`RTP ကို ${newRTP}% သို့ ပြောင်းလဲပြီးပါပြီ။`, 'success');
}

function resetRTP() {
    adminState.rtpState.current = 92.5;
    loadRTPControl();
    showNotification('RTP ကို 92.5% သို့ ပြန်သတ်မှတ်ပြီးပါပြီ။', 'info');
}



// ========== SURPRISE BOX CONTROL - FULL IMPLEMENTATION ==========

// Surprise Box State
let surpriseState = {
    boxes: [],
    stats: {
        totalBoxes: 20,
        openedBoxes: 0,
        remainingBoxes: 20,
        totalSelectors: 0
    },
    config: {
        credit: { min: 5000, max: 500000, count: 5 },
        vip: { count: 1, benefit: 'VIP အဆင့်နှင့် နေ့စဉ် Bonus 20%' },
        freespin: { min: 5, max: 50, count: 4 },
        thankyou: { count: 10, message: 'ကျေးဇူးတင်ပါတယ်။ နောက်တစ်ကြိမ် ကံစမ်းပါ။' }
    },
    history: []
};

/**
 * Load Surprise Box Control
 */
function loadSurpriseBoxControl() {
    console.log(' Loading Surprise Box Control...');
    
    // Load saved data
    loadSurpriseData();
    
    // Update stats
    updateBoxStats();
    
    // Render box grid
    renderAdminBoxGrid();
    
    // Render history
    renderBoxHistory();
    
    // Update config inputs
    updateConfigInputs();
}

/**
 * Load surprise data from localStorage
 */
function loadSurpriseData() {
    // Load boxes
    const savedBoxes = localStorage.getItem('surpriseBoxes');
    if (savedBoxes) {
        surpriseState.boxes = JSON.parse(savedBoxes);
    } else {
        // Initialize default boxes
        initializeDefaultBoxes();
    }
    
    // Load stats
    const savedStats = localStorage.getItem('surpriseStats');
    if (savedStats) {
        surpriseState.stats = JSON.parse(savedStats);
    }
    
    // Load config
    const savedConfig = localStorage.getItem('surpriseConfig');
    if (savedConfig) {
        surpriseState.config = JSON.parse(savedConfig);
    }
    
    // Load history
    const savedHistory = localStorage.getItem('surpriseHistory');
    if (savedHistory) {
        surpriseState.history = JSON.parse(savedHistory);
    }
}

/**
 * Initialize default boxes
 */
function initializeDefaultBoxes() {
    surpriseState.boxes = [];
    
    // Credit boxes (5 boxes)
    for (let i = 0; i < 5; i++) {
        surpriseState.boxes.push({
            id: i + 1,
            type: 'credit',
            amount: getRandomAmount(5000, 500000),
            opened: false,
            openedBy: null,
            openedAt: null
        });
    }
    
    // VIP box (1 box)
    surpriseState.boxes.push({
        id: 6,
        type: 'vip',
        opened: false,
        openedBy: null,
        openedAt: null
    });
    
    // Free spin boxes (4 boxes)
    for (let i = 0; i < 4; i++) {
        surpriseState.boxes.push({
            id: 7 + i,
            type: 'freespin',
            spins: getRandomSpins(5, 50),
            opened: false,
            openedBy: null,
            openedAt: null
        });
    }
    
    // Thank you boxes (10 boxes)
    for (let i = 0; i < 10; i++) {
        surpriseState.boxes.push({
            id: 11 + i,
            type: 'thankyou',
            message: surpriseState.config.thankyou.message,
            opened: false,
            openedBy: null,
            openedAt: null
        });
    }
    
    // Shuffle boxes
    surpriseState.boxes = shuffleArray(surpriseState.boxes);
    
    // Update stats
    surpriseState.stats.totalBoxes = surpriseState.boxes.length;
    surpriseState.stats.remainingBoxes = surpriseState.boxes.filter(b => !b.opened).length;
    surpriseState.stats.openedBoxes = surpriseState.boxes.filter(b => b.opened).length;
    
    saveSurpriseData();
}

/**
 * Get random amount between min and max
 */
function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random spins between min and max
 */
function getRandomSpins(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Save all surprise data to localStorage
 */
function saveSurpriseData() {
    localStorage.setItem('surpriseBoxes', JSON.stringify(surpriseState.boxes));
    localStorage.setItem('surpriseStats', JSON.stringify(surpriseState.stats));
    localStorage.setItem('surpriseConfig', JSON.stringify(surpriseState.config));
    localStorage.setItem('surpriseHistory', JSON.stringify(surpriseState.history));
}

/**
 * Update box statistics display
 */
function updateBoxStats() {
    const totalEl = document.getElementById('totalBoxes');
    const openedEl = document.getElementById('openedBoxes');
    const remainingEl = document.getElementById('remainingBoxes');
    const selectorsEl = document.getElementById('totalSelectors');
    
    if (totalEl) totalEl.textContent = surpriseState.stats.totalBoxes;
    if (openedEl) openedEl.textContent = surpriseState.stats.openedBoxes;
    if (remainingEl) remainingEl.textContent = surpriseState.stats.remainingBoxes;
    if (selectorsEl) selectorsEl.textContent = surpriseState.stats.totalSelectors;
    
    // Update prize counts
    const creditCount = surpriseState.boxes.filter(b => b.type === 'credit').length;
    const vipCount = surpriseState.boxes.filter(b => b.type === 'vip').length;
    const freespinCount = surpriseState.boxes.filter(b => b.type === 'freespin').length;
    const thankyouCount = surpriseState.boxes.filter(b => b.type === 'thankyou').length;
    
    const creditEl = document.getElementById('creditCount');
    const vipEl = document.getElementById('vipCount');
    const freespinEl = document.getElementById('freespinCount');
    const thankyouEl = document.getElementById('thankyouCount');
    
    if (creditEl) creditEl.textContent = creditCount;
    if (vipEl) vipEl.textContent = vipCount;
    if (freespinEl) freespinEl.textContent = freespinCount;
    if (thankyouEl) thankyouEl.textContent = thankyouCount;
}

/**
 * Render admin box grid preview
 */
function renderAdminBoxGrid() {
    const grid = document.getElementById('adminBoxGrid');
    if (!grid) return;
    
    let html = '';
    surpriseState.boxes.forEach((box, index) => {
        const boxNumber = index + 1;
        let boxColor = '#9e9e9e'; // default gray
        let icon = 'fa-box';
        let status = box.opened ? 'opened' : 'closed';
        
        if (box.type === 'credit') {
            boxColor = '#00c853';
            icon = 'fa-coins';
        } else if (box.type === 'vip') {
            boxColor = '#ffd700';
            icon = 'fa-crown';
        } else if (box.type === 'freespin') {
            boxColor = '#2196f3';
            icon = 'fa-play-circle';
        }
        
        html += `
            <div class="box-preview-item ${status}" 
                 style="background: ${boxColor}20; border: 2px solid ${boxColor}; border-radius: 15px; padding: 15px; text-align: center; cursor: pointer;"
                 onclick="editBox(${index})"
                 title="${box.opened ? 'ဖွင့်ပြီး' : 'မဖွင့်ရသေး'}">
                <i class="fas ${icon}" style="color: ${boxColor}; font-size: 24px; margin-bottom: 8px;"></i>
                <div style="color: white; font-size: 14px;">Box ${boxNumber}</div>
                ${box.opened ? '<div style="color: #ff5252; font-size: 11px; margin-top: 5px;">✓ Opened</div>' : ''}
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

/**
 * Edit individual box
 */
function editBox(index) {
    const box = surpriseState.boxes[index];
    
    // Create edit modal
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="color: white; margin-bottom: 20px;">Box ${index + 1} ပြင်ဆင်ရန်</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="color: white; display: block; margin-bottom: 8px;">Box အမျိုးအစား</label>
                <select id="editBoxType" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                    <option value="credit" ${box.type === 'credit' ? 'selected' : ''}>Credit Box</option>
                    <option value="vip" ${box.type === 'vip' ? 'selected' : ''}>VIP Box</option>
                    <option value="freespin" ${box.type === 'freespin' ? 'selected' : ''}>Free Spin Box</option>
                    <option value="thankyou" ${box.type === 'thankyou' ? 'selected' : ''}>Thank You Box</option>
                </select>
            </div>
            
            ${box.type === 'credit' ? `
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 8px;">ပမာဏ</label>
                    <input type="number" id="editBoxAmount" value="${box.amount || 5000}" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid #00c853; border-radius:10px; color:white;">
                </div>
            ` : ''}
            
            ${box.type === 'freespin' ? `
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 8px;">အကြိမ်ရေ</label>
                    <input type="number" id="editBoxSpins" value="${box.spins || 10}" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid #2196f3; border-radius:10px; color:white;">
                </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
                <label style="color: white; display: block; margin-bottom: 8px;">အခြေအနေ</label>
                <select id="editBoxStatus" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                    <option value="closed" ${!box.opened ? 'selected' : ''}>မဖွင့်ရသေး</option>
                    <option value="opened" ${box.opened ? 'selected' : ''}>ဖွင့်ပြီး</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button onclick="saveBoxEdit(${index})" style="flex:2; padding:14px; background:#ffd700; border:none; border-radius:12px; color:#000; font-weight:700;">
                    <i class="fas fa-save"></i> သိမ်းမည်
                </button>
                <button onclick="closeModal('editBoxModal')" style="flex:1; padding:14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    ပိတ်မည်
                </button>
            </div>
        </div>
    `;
    
    showModal('editBoxModal', modalContent);
}

/**
 * Save box edit
 */
function saveBoxEdit(index) {
    const box = surpriseState.boxes[index];
    const newType = document.getElementById('editBoxType').value;
    const newStatus = document.getElementById('editBoxStatus').value;
    
    // Update box properties
    box.type = newType;
    box.opened = newStatus === 'opened';
    
    if (newType === 'credit') {
        box.amount = parseInt(document.getElementById('editBoxAmount').value) || 5000;
    } else if (newType === 'freespin') {
        box.spins = parseInt(document.getElementById('editBoxSpins').value) || 10;
    }
    
    // Update stats
    surpriseState.stats.openedBoxes = surpriseState.boxes.filter(b => b.opened).length;
    surpriseState.stats.remainingBoxes = surpriseState.boxes.filter(b => !b.opened).length;
    
    // Save and refresh
    saveSurpriseData();
    loadSurpriseBoxControl();
    closeModal('editBoxModal');
    
    showNotification('Box ပြင်ဆင်ပြီးပါပြီ။', 'success');
}

/**
 * Update config inputs from state
 */
function updateConfigInputs() {
    const creditMin = document.getElementById('creditMin');
    const creditMax = document.getElementById('creditMax');
    const freespinMin = document.getElementById('freespinMin');
    const freespinMax = document.getElementById('freespinMax');
    const thankyouMsg = document.getElementById('thankyouMessage');
    
    if (creditMin) creditMin.value = surpriseState.config.credit.min;
    if (creditMax) creditMax.value = surpriseState.config.credit.max;
    if (freespinMin) freespinMin.value = surpriseState.config.freespin.min;
    if (freespinMax) freespinMax.value = surpriseState.config.freespin.max;
    if (thankyouMsg) thankyouMsg.value = surpriseState.config.thankyou.message;
}

/**
 * Render box selection history
 */
function renderBoxHistory() {
    const tbody = document.getElementById('boxSelectionHistory');
    if (!tbody) return;
    
    if (surpriseState.history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    မှတ်တမ်း မရှိသေးပါ။
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    surpriseState.history.slice(0, 10).forEach(item => {
        html += `
            <tr>
                <td>${formatDate(item.time)}</td>
                <td>${item.username}</td>
                <td>Box ${item.boxNumber}</td>
                <td>${item.prize}</td>
                <td>${item.amount ? formatNumber(item.amount) + ' ကျပ်' : '-'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Reset all boxes
 */
function resetAllBoxes() {
    if (confirm('Box အားလုံးကို ပြန်ဖြည့်မှာ သေချာပါသလား?')) {
        initializeDefaultBoxes();
        showNotification('Box အားလုံး ပြန်ဖြည့်ပြီးပါပြီ။', 'success');
    }
}

/**
 * Randomize boxes
 */
function randomizeBoxes() {
    if (confirm('Box များကို ကျပန်းပြန်စီမှာ သေချာပါသလား?')) {
        surpriseState.boxes = shuffleArray(surpriseState.boxes);
        saveSurpriseData();
        renderAdminBoxGrid();
        showNotification('Box များ ကျပန်းပြန်စီပြီးပါပြီ။', 'success');
    }
}

/**
 * Clear all boxes
 */
function clearAllBoxes() {
    if (confirm('Box အားလုံးကို ရှင်းလင်းမှာ သေချာပါသလား?')) {
        surpriseState.boxes = [];
        surpriseState.stats.openedBoxes = 0;
        surpriseState.stats.remainingBoxes = 0;
        saveSurpriseData();
        loadSurpriseBoxControl();
        showNotification('Box အားလုံး ရှင်းလင်းပြီးပါပြီ။', 'warning');
    }
}

/**
 * Save box configuration
 */
function saveBoxConfiguration() {
    // Get credit settings
    surpriseState.config.credit.min = parseInt(document.getElementById('creditMin').value) || 5000;
    surpriseState.config.credit.max = parseInt(document.getElementById('creditMax').value) || 500000;
    
    // Get freespin settings
    surpriseState.config.freespin.min = parseInt(document.getElementById('freespinMin').value) || 5;
    surpriseState.config.freespin.max = parseInt(document.getElementById('freespinMax').value) || 50;
    
    // Get thank you message
    surpriseState.config.thankyou.message = document.getElementById('thankyouMessage').value;
    
    // Save
    saveSurpriseData();
    showNotification('ပြင်ဆင်မှုများ သိမ်းဆည်းပြီးပါပြီ။', 'success');
}

/**
 * Reset to default
 */
function resetToDefault() {
    if (confirm('မူလအတိုင်း ပြန်ထားမှာ သေချာပါသလား?')) {
        localStorage.removeItem('surpriseBoxes');
        localStorage.removeItem('surpriseConfig');
        localStorage.removeItem('surpriseStats');
        localStorage.removeItem('surpriseHistory');
        
        loadSurpriseBoxControl();
        showNotification('မူလအတိုင်း ပြန်ထားပြီးပါပြီ။', 'info');
    }
}

/**
 * Refresh box statistics
 */
function refreshBoxStats() {
    loadSurpriseBoxControl();
    showNotification('စာရင်းများ ပြန်လည်စတင်ပြီးပါပြီ။', 'info');
}

/**
 * Show modal helper
 */
function showModal(id, content) {
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.style.zIndex = '20000';  // ဒါထည့် (Admin Dashboard ထက်မြင့်အောင်)
        modal.innerHTML = `<div class="modal-content">${content}</div>`;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-content').innerHTML = content;
        modal.style.zIndex = '20000';  // ဒါထည့်
    }
    modal.style.display = 'flex';
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('my') + ' ' + date.toLocaleTimeString('my');
}

// ========== SURPRISE BOX SEND MODAL (FIXED) ==========

// Variables for send modal
let sendBoxType = 'credit';
let sendBoxAmount = 5000;
let sendBoxSpins = 10;

/**
 * Show Send Surprise Box Modal
 */
function showSendSurpriseBoxModal() {
    console.log(' Opening send surprise box modal...');
    
    // Get users from localStorage
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    } catch(e) {
        users = [];
    }
    
    // Create user suggestions
    const userSuggestions = users
        .slice(0, 8)
        .map(u => `
            <div onclick="selectSurpriseUser('${u.username}')" 
                 style="padding: 10px 15px; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; margin: 5px; border: 1px solid rgba(255,215,0,0.2);">
                <i class="fas fa-user-circle" style="color: #ffd700;"></i>
                <span style="color: white;">${u.username}</span>
                <span style="color: #00c853; font-size: 12px;">${formatNumber(u.balance || 0)}</span>
            </div>
        `)
        .join('');
        
    // Reset variables
    sendBoxType = 'credit';
    sendBoxAmount = 5000;
    sendBoxSpins = 10;
    
    // Box type options
    const boxTypes = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
            <div class="box-type-option" onclick="selectSendBoxType('credit')" id="sendBoxTypeCredit" style="background: rgba(0,200,83,0.1); border: 2px solid #00c853; border-radius: 20px; padding: 20px; text-align: center; cursor: pointer;">
                <i class="fas fa-coins" style="color: #00c853; font-size: 32px; margin-bottom: 10px;"></i>
                <h4 style="color: white; margin-bottom: 5px;">Credit Box</h4>
                <div style="color: #00c853; font-size: 18px; font-weight: 700;" id="sendCreditAmountDisplay">5,000</div>
            </div>
            
            <div class="box-type-option" onclick="selectSendBoxType('vip')" id="sendBoxTypeVip" style="background: rgba(255,215,0,0.1); border: 2px solid #ffd700; border-radius: 20px; padding: 20px; text-align: center; cursor: pointer;">
                <i class="fas fa-crown" style="color: #ffd700; font-size: 32px; margin-bottom: 10px;"></i>
                <h4 style="color: white; margin-bottom: 5px;">VIP Box</h4>
                <div style="color: #ffd700; font-size: 14px;">ရာထူးတိုးမည်</div>
            </div>
            
            <div class="box-type-option" onclick="selectSendBoxType('freespin')" id="sendBoxTypeFreespin" style="background: rgba(33,150,243,0.1); border: 2px solid #2196f3; border-radius: 20px; padding: 20px; text-align: center; cursor: pointer;">
                <i class="fas fa-play-circle" style="color: #2196f3; font-size: 32px; margin-bottom: 10px;"></i>
                <h4 style="color: white; margin-bottom: 5px;">Free Spin Box</h4>
                <div style="color: #2196f3; font-size: 18px; font-weight: 700;" id="sendFreespinAmountDisplay">10</div>
            </div>
            
            <div class="box-type-option" onclick="selectSendBoxType('thankyou')" id="sendBoxTypeThankyou" style="background: rgba(158,158,158,0.1); border: 2px solid #9e9e9e; border-radius: 20px; padding: 20px; text-align: center; cursor: pointer;">
                <i class="fas fa-smile" style="color: #9e9e9e; font-size: 32px; margin-bottom: 10px;"></i>
                <h4 style="color: white; margin-bottom: 5px;">Thank You Box</h4>
                <div style="color: #9e9e9e; font-size: 12px;">ကျေးဇူးတင်စကား</div>
            </div>
        </div>
    `;
    
    // Custom amount section
    const customSection = `
        <div id="sendCustomBoxSection" style="margin-bottom: 25px; display: none;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 20px; padding: 20px;">
                <label style="color: white; display: block; margin-bottom: 12px;">
                    <i class="fas fa-pen"></i> သတ်မှတ်ပမာဏ
                </label>
                <div style="display: flex; gap: 15px;">
                    <input type="number" id="sendCustomBoxAmount" placeholder="ပမာဏထည့်ပါ" 
                           style="flex: 2; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid #ffd700; border-radius: 15px; color: white; font-size: 16px;">
                    <button onclick="setSendCustomAmount()" 
                            style="flex: 1; padding: 15px; background: #ffd700; border: none; border-radius: 15px; color: #000; font-weight: 700;">
                        သုံးမည်
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Message section for thank you box
    const messageSection = `
        <div id="sendThankyouMessageSection" style="margin-bottom: 25px; display: none;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 20px; padding: 20px;">
                <label style="color: white; display: block; margin-bottom: 12px;">
                    <i class="fas fa-comment"></i> ကျေးဇူးတင်စကား
                </label>
                <textarea id="sendThankyouMessageText" rows="3" 
                          style="width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid #9e9e9e; border-radius: 15px; color: white; resize: none;">ကျေးဇူးတင်ပါတယ်။ နောက်တစ်ကြိမ် ကံစမ်းပါ။</textarea>
            </div>
        </div>
    `;
    
    const modalContent = `
        <div style="padding: 10px;">
            <h3 style="color: white; margin-bottom: 25px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-gift" style="color: #ffd700;"></i>
                Surprise Box ပေးပို့ရန်
            </h3>
            
            <!-- User Selection -->
            <div style="margin-bottom: 25px;">
                <label style="color: white; display: block; margin-bottom: 12px;">
                    <i class="fas fa-user"></i> လက်ခံမည့်သူ
                </label>
                <input type="text" id="sendSurpriseUsername" placeholder="Username ရိုက်ထည့်ပါ" 
                       style="width: 100%; padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; color: white; font-size: 16px; margin-bottom: 15px;">
                
                ${users.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <div style="color: rgba(255,255,255,0.6); margin-bottom: 10px; font-size: 13px;">
                            <i class="fas fa-history"></i> အကြံပြုအမည်များ:
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; padding: 5px;">
                            ${userSuggestions}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Box Type Selection -->
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 12px;">
                    <i class="fas fa-box"></i> Box အမျိုးအစား
                </label>
                ${boxTypes}
            </div>
            
            <!-- Custom Amount -->
            ${customSection}
            
            <!-- Thank You Message -->
            ${messageSection}
            
            <!-- Preview -->
            <div id="sendBoxPreview" style="background: linear-gradient(145deg, #ffd70020, #ffaa0020); border-radius: 20px; padding: 20px; margin-bottom: 25px; display: none;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <i id="sendPreviewIcon" class="fas fa-gift" style="font-size: 40px; color: #ffd700;"></i>
                    <div>
                        <div id="sendPreviewTitle" style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Credit Box</div>
                        <div id="sendPreviewDetail" style="color: #ffd700; font-size: 24px; font-weight: 800;">5,000 ကျပ်</div>
                    </div>
                </div>
            </div>
            
            // Actions - ဒီဟာနဲ့ အစားထိုး
<div style="display: flex; gap: 15px; flex-direction: column;">
    <div style="display: flex; gap: 15px;">
        <button onclick="sendSurpriseBox()" class="submit-btn" style="flex: 1; background: linear-gradient(145deg, #ffd700, #ffaa00);">
            <i class="fas fa-paper-plane"></i> တိုက်ရိုက်ပေး
        </button>
        <button onclick="sendSurpriseBoxGrid()" class="submit-btn" style="flex: 1; background: linear-gradient(145deg, #9c27b0, #7b1fa2);">
            <i class="fas fa-boxes"></i> Box 20 ပို့မည်
        </button>
    </div>
    <button onclick="closeModal('sendSurpriseBoxModal')" class="secondary-btn">
        ပိတ်မည်
    </button>
</div>
 `;
 
  showModal('sendSurpriseBoxModal', modalContent);
    
    // Initialize box type selection
    setTimeout(() => {
        selectSendBoxType('credit');
        
        // Add event listeners
        document.getElementById('sendSurpriseUsername')?.addEventListener('input', function() {
            updateSendBoxPreview();
        });
    }, 100);
}

/**
 * Select box type for send modal
 */
function selectSendBoxType(type) {
    sendBoxType = type;
    
    // Update UI
    document.querySelectorAll('.box-type-option').forEach(el => {
        el.style.opacity = '0.5';
        el.style.transform = 'scale(0.95)';
    });
    
    const selectedEl = document.getElementById(`sendBoxType${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (selectedEl) {
        selectedEl.style.opacity = '1';
        selectedEl.style.transform = 'scale(1)';
    }
    
    // Show/hide custom sections
    const customSection = document.getElementById('sendCustomBoxSection');
    const messageSection = document.getElementById('sendThankyouMessageSection');
    
    if (customSection && messageSection) {
        if (type === 'credit') {
            customSection.style.display = 'block';
            messageSection.style.display = 'none';
            sendBoxAmount = 5000;
        } else if (type === 'freespin') {
            customSection.style.display = 'block';
            messageSection.style.display = 'none';
            sendBoxSpins = 10;
        } else if (type === 'vip') {
            customSection.style.display = 'none';
            messageSection.style.display = 'none';
        } else if (type === 'thankyou') {
            customSection.style.display = 'none';
            messageSection.style.display = 'block';
        }
    }
    
    updateSendBoxPreview();
}

/**
 * Set custom amount for send modal
 */
function setSendCustomAmount() {
    const amount = parseInt(document.getElementById('sendCustomBoxAmount')?.value);
    
    if (sendBoxType === 'credit') {
        if (amount && amount >= 1000) {
            sendBoxAmount = amount;
            document.getElementById('sendCreditAmountDisplay').textContent = formatNumber(amount);
            showNotification(`Credit Box: ${formatNumber(amount)} ကျပ်`, 'success');
        } else {
            alert('အနည်းဆုံး ၁၀၀၀ ကျပ်ထည့်ပါ။');
        }
    } else if (sendBoxType === 'freespin') {
        if (amount && amount >= 1 && amount <= 500) {
            sendBoxSpins = amount;
            document.getElementById('sendFreespinAmountDisplay').textContent = amount;
            showNotification(`Free Spin: ${amount} ကြိမ်`, 'success');
        } else {
            alert('အနည်းဆုံး ၁ ကြိမ်၊ အများဆုံး ၅၀၀ ကြိမ်ထည့်ပါ။');
        }
    }
    
    updateSendBoxPreview();
}

/**
 * Update send box preview
 */
function updateSendBoxPreview() {
    const preview = document.getElementById('sendBoxPreview');
    const previewIcon = document.getElementById('sendPreviewIcon');
    const previewTitle = document.getElementById('sendPreviewTitle');
    const previewDetail = document.getElementById('sendPreviewDetail');
    
    if (!preview || !previewIcon || !previewTitle || !previewDetail) return;
    
    preview.style.display = 'block';
    
    const username = document.getElementById('sendSurpriseUsername')?.value || 'ရွေးချယ်ထားသူ';
    
    switch(sendBoxType) {
        case 'credit':
            previewIcon.className = 'fas fa-coins';
            previewIcon.style.color = '#00c853';
            previewTitle.textContent = `Credit Box → ${username}`;
            previewDetail.textContent = `${formatNumber(sendBoxAmount)} ကျပ်`;
            previewDetail.style.color = '#00c853';
            break;
        case 'vip':
            previewIcon.className = 'fas fa-crown';
            previewIcon.style.color = '#ffd700';
            previewTitle.textContent = `VIP Box → ${username}`;
            previewDetail.textContent = 'VIP အဆင့်တိုးမည်';
            previewDetail.style.color = '#ffd700';
            break;
        case 'freespin':
            previewIcon.className = 'fas fa-play-circle';
            previewIcon.style.color = '#2196f3';
            previewTitle.textContent = `Free Spin Box → ${username}`;
            previewDetail.textContent = `${sendBoxSpins} ကြိမ်`;
            previewDetail.style.color = '#2196f3';
            break;
        case 'thankyou':
            previewIcon.className = 'fas fa-smile';
            previewIcon.style.color = '#9e9e9e';
            previewTitle.textContent = `Thank You Box → ${username}`;
            previewDetail.textContent = 'ကျေးဇူးတင်စကား';
            previewDetail.style.color = '#9e9e9e';
            break;
    }
}


// ========== SURPRISE BOX GRID (20 BOXES) SEND FUNCTION ==========

// ========== SURPRISE BOX GRID (20 BOXES) SEND FUNCTION ==========

/**
 * Send 20 surprise boxes grid to user
 */
function sendSurpriseBoxGrid() {
    console.log(' Sending 20 boxes grid to user...');
    
    const username = document.getElementById('sendSurpriseUsername')?.value.trim();
    
    if (!username) {
        alert('ကျေးဇူးပြု၍ လက်ခံမည့်သူအမည် ထည့်ပါ။');
        return;
    }
    
    // Find user
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    } catch(e) {
        users = [];
    }
    
    const user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        alert(`အသုံးပြုသူ "${username}" မတွေ့ရှိပါ။`);
        return;
    }
    
    // Get current boxes from surpriseState
    // Clone boxes to avoid reference issues
    const boxes = surpriseState.boxes.map(box => ({
        id: box.id,
        type: box.type,
        amount: box.amount || 0,
        spins: box.spins || 0,
        message: box.message || 'ကျေးဇူးတင်ပါတယ်။',
        opened: false,  // Reset opened status
        openedBy: null,
        openedAt: null
    }));
    
    // Create user surprise data
    const userSurpriseKey = `userSurprise_${user.id}`;
    const userSurpriseData = {
        id: 'SUR' + Date.now(),
        userId: user.id,
        username: user.username,
        boxes: boxes,
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, completed, expired
        maxSelections: 5,
        selectedBoxes: []
    };
    
    // Save to localStorage (for user to pick up)
    localStorage.setItem(userSurpriseKey, JSON.stringify(userSurpriseData));
    
    // Add to admin history
    const history = JSON.parse(localStorage.getItem('surpriseHistory')) || [];
    history.push({
        time: new Date().toISOString(),
        username: user.username,
        userId: user.id,
        type: 'grid_sent',
        boxCount: 20,
        action: 'send_grid'
    });
    localStorage.setItem('surpriseHistory', JSON.stringify(history));
    
    // Show success message
    alert(`✅ ${user.username} (ID: ${user.id}) ဆီသို့ Box 20 ခု ပေးပို့ပြီးပါပြီ။\n\nသူဂိမ်းထဲရောက်ရင် ၅ ခုရွေးချယ်ခွင့်ရှိပါမယ်။`);
    
    // Close modal
    closeModal('sendSurpriseBoxModal');
    
    // Refresh surprise panel if open
    if (typeof loadSurpriseBoxControl === 'function') {
        loadSurpriseBoxControl();
    }
}

// Export function
window.sendSurpriseBoxGrid = sendSurpriseBoxGrid;
 /**
 * Send surprise box - STORE AS PENDING GIFT
 */
function sendSurpriseBox() {
    const username = document.getElementById('sendSurpriseUsername')?.value.trim();
    
    if (!username) {
        alert('ကျေးဇူးပြု၍ လက်ခံမည့်သူအမည် ထည့်ပါ။');
        return;
    }
    
    // Find user
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    } catch(e) {
        users = [];
    }
    
    const user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        alert(`အသုံးပြုသူ "${username}" မတွေ့ရှိပါ။`);
        return;
    }
    
    // Save current values
    const currentType = sendBoxType;
    const currentAmount = sendBoxAmount;
    const currentSpins = sendBoxSpins;
    
    // Update user balance/status immediately
    let message = '';
    let giftAmount = 0;
    
    switch(currentType) {
        case 'credit':
            giftAmount = currentAmount;
            user.balance = (user.balance || 0) + giftAmount;
            message = ` ငွေ ${formatNumber(giftAmount)} ကျပ်`;
            break;
            
        case 'vip':
            user.vip = (user.vip || 0) + 1;
            message = ' VIP အဆင့်';
            break;
            
        case 'freespin':
            giftAmount = currentSpins;
            user.freeSpins = (user.freeSpins || 0) + giftAmount;
            message = ` Free Spin ${giftAmount} ကြိမ်`;
            break;
            
        case 'thankyou':
            message = ' Thank You Box';
            break;
    }
    
    // Save to localStorage
    localStorage.setItem('slotUsers', JSON.stringify(users));
    
    // Add to surprise history
    const history = JSON.parse(localStorage.getItem('surpriseHistory')) || [];
    history.push({
        time: new Date().toISOString(),
        username: user.username,
        boxNumber: 'Admin Send',
        prize: currentType === 'credit' ? 'Credit' : 
               currentType === 'vip' ? 'VIP' :
               currentType === 'freespin' ? 'Free Spin' : 'Thank You',
        amount: currentType === 'credit' ? currentAmount :
                currentType === 'freespin' ? currentSpins : 0
    });
    localStorage.setItem('surpriseHistory', JSON.stringify(history));
    
    // ===== STORE AS PENDING GIFT (NOT SHOW IMMEDIATELY) =====
    const pendingGiftKey = `pendingGift_${user.id}`;
    const pendingGift = {
        type: currentType,
        amount: currentType === 'credit' ? currentAmount : 
                currentType === 'freespin' ? currentSpins : 0,
        message: message,
        username: user.username,
        timestamp: Date.now()
    };
    
    localStorage.setItem(pendingGiftKey, JSON.stringify(pendingGift));
    
    // Update current user if online (balance only, no notification)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === user.id) {
        currentUser.balance = user.balance;
        currentUser.vip = user.vip;
        currentUser.freeSpins = user.freeSpins;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update game state
        if (typeof window.gameState !== 'undefined') {
            window.gameState.balance = user.balance;
            window.gameState.vipLevel = user.vip;
        }
        
        // Update display
        const balanceEl = document.getElementById('balanceAmount');
        if (balanceEl) balanceEl.textContent = formatNumber(user.balance);
        
        const vipEl = document.getElementById('vipLevel');
        if (vipEl) vipEl.textContent = user.vip;
        
        // NO CELEBRATION HERE - just a small notice
        if (typeof showNotification === 'function') {
            showNotification('လက်ဆောင်တစ်ခုရောက်ရှိပါသည်။ ဂိမ်းဆက်ကစားပါ။', 'info');
        }
    }
    
    // Show admin success message
    alert(`✅ ${user.username} သို့${message} ပေးပို့ပြီးပါပြီ။\n\nသူဂိမ်းထဲမှာ Spin ၃ချက်နှိပ်ပြီးရင် ပြသပါမည်။`);
    
    // Close modal
    closeModal('sendSurpriseBoxModal');
    
    // Refresh surprise panel if open
    if (typeof loadSurpriseBoxControl === 'function') {
        loadSurpriseBoxControl();
    }
}

/**
 * Select user from suggestions
 */
function selectSurpriseUser(username) {
    document.getElementById('sendSurpriseUsername').value = username;
    updateSendBoxPreview();
}


// Export functions
window.loadSurpriseBoxControl = loadSurpriseBoxControl;
window.refreshBoxStats = refreshBoxStats;
window.resetAllBoxes = resetAllBoxes;
window.randomizeBoxes = randomizeBoxes;
window.clearAllBoxes = clearAllBoxes;
window.saveBoxConfiguration = saveBoxConfiguration;
window.resetToDefault = resetToDefault;
window.editBox = editBox;
window.showSendSurpriseBoxModal = showSendSurpriseBoxModal;
window.selectSendBoxType = selectSendBoxType;
window.setSendCustomAmount = setSendCustomAmount;
window.selectSurpriseUser = selectSurpriseUser;
window.sendSurpriseBox = sendSurpriseBox;
// ========== SCREENSHOT VIEW ==========
function viewScreenshot(requestId) {
    const request = adminState.depositRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modal = document.getElementById('screenshotModal');
    const img = document.getElementById('screenshotImage');
    const info = document.getElementById('screenshotInfo');
    const actions = document.getElementById('screenshotActions');
    
    // In real app, this would load actual image from server
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjgyYzM1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuc2hvdCBFeGFtcGxlPC90ZXh0Pjwvc3ZnPg==';
    
    info.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">ငွေပမာဏ</div>
                <div style="color: #ffd700; font-size: 20px; font-weight: 700;">${formatNumber(request.amount)} ကျပ်</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">ငွေလွှဲ ID</div>
                <div style="color: white; font-size: 18px;">${request.transferId || '-'}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">ပေးပို့သူ</div>
                <div style="color: white;">${request.senderPhone || '-'}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">ရက်စွဲ</div>
                <div style="color: white;">${formatDate(request.createdAt)}</div>
            </div>
        </div>
    `;
    
    actions.innerHTML = `
        <button class="btn-primary" onclick="approvePayment('${requestId}'); closeModal('screenshotModal');">
            <i class="fas fa-check"></i> အတည်ပြုမည်
        </button>
        <button class="btn-warning" onclick="rejectPayment('${requestId}'); closeModal('screenshotModal');">
            <i class="fas fa-times"></i> ပယ်ချမည်
        </button>
        <button class="btn-secondary" onclick="closeModal('screenshotModal')">
            ပိတ်မည်
        </button>
    `;
    
    modal.style.display = 'flex';
}

// ========== AUTO REFRESH ==========
function startAutoRefresh() {
    if (adminState.autoRefresh) {
        adminState.refreshInterval = setInterval(() => {
            refreshAllData();
        }, 30000); // Refresh every 30 seconds
    }
}

function toggleAutoRefresh() {
    adminState.autoRefresh = !adminState.autoRefresh;
    
    const toggleBtn = document.getElementById('autoRefreshToggle');
    const statusSpan = document.getElementById('autoRefreshStatus');
    
    if (toggleBtn && statusSpan) {
        if (adminState.autoRefresh) {
            statusSpan.textContent = 'Auto: ON';
            toggleBtn.style.background = 'rgba(0,200,83,0.1)';
            toggleBtn.style.borderColor = '#00c853';
            startAutoRefresh();
        } else {
            statusSpan.textContent = 'Auto: OFF';
            toggleBtn.style.background = 'rgba(255,59,48,0.1)';
            toggleBtn.style.borderColor = '#ff5252';
            clearInterval(adminState.refreshInterval);
        }
    }
}

function refreshAllData() {
    loadAdminData();
    updateStatsCards();
    
    // Refresh current active tab
    const activeTab = document.querySelector('.tab-slide.active');
    if (activeTab) {
        switchAdminTab(activeTab.dataset.tab);
    }
    
    updateLastUpdatedTime();
    showNotification('ဒေတာ အသစ်ပြန်လည် ရယူပြီးပါပြီ။', 'info');
}

function updateLastUpdatedTime() {
    const timeEl = document.getElementById('lastUpdateTime');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = formatTime(now);
    }
}

// ========== UTILITY FUNCTIONS ==========
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'ယနေ့ ' + date.toLocaleTimeString('my', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'မနေ့က ' + date.toLocaleTimeString('my', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return diffDays + ' ရက်အကြာ';
    } else {
        return date.toLocaleDateString('my');
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('my', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit' 
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    const iconEl = document.getElementById('notificationIcon');
    
    if (notification && messageEl) {
        messageEl.textContent = message;
        
        if (type === 'success') {
            iconEl.className = 'fas fa-check-circle';
            iconEl.style.color = '#00c853';
        } else if (type === 'error') {
            iconEl.className = 'fas fa-exclamation-circle';
            iconEl.style.color = '#ff5252';
        } else {
            iconEl.className = 'fas fa-info-circle';
            iconEl.style.color = '#2196f3';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');
    
    if (!modal || !messageEl || !yesBtn) return;
    
    messageEl.innerHTML = message;
    modal.style.display = 'flex';
    
    const confirmHandler = function() {
        onConfirm();
        modal.style.display = 'none';
        yesBtn.removeEventListener('click', confirmHandler);
    };
    
    yesBtn.addEventListener('click', confirmHandler);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function adminLogout() {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    showNotification('Admin အကောင့်မှ ထွက်ပြီးပါပြီ။', 'info');
}
// ========== EXPORT GLOBALS ==========
window.loadAdminDashboard = loadAdminDashboard;
window.switchAdminTab = switchAdminTab;
window.approvePayment = approvePayment;
window.rejectPayment = rejectPayment;
window.approveWithdraw = approveWithdraw;
window.rejectWithdraw = rejectWithdraw;
window.viewScreenshot = viewScreenshot;
window.toggleUserStatus = toggleUserStatus;
window.editUser = editUser;
window.addVipToUser = addVipToUser;
window.openAddBankModal = openAddBankModal;
window.editBankAccount = editBankAccount;
window.toggleBankStatus = toggleBankStatus;
window.saveBankAccount = saveBankAccount;
window.adjustJackpot = adjustJackpot;
window.setJackpot = setJackpot;
window.showJackpotSendModal = showJackpotSendModal;
window.resetJackpotPool = resetJackpotPool;
window.applyRTP = applyRTP;
window.resetRTP = resetRTP;
window.refreshAllData = refreshAllData;
window.toggleAutoRefresh = toggleAutoRefresh;
window.adminLogout = adminLogout;
window.closeModal = closeModal;

