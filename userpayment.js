// ===== MENU MODAL FUNCTIONS =====

function toggleMainMenu() {
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        modal.style.display = 'flex';
        playClickSound();
    }
}

function closeMainMenu() {
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        modal.style.display = 'none';
        playClickSound();
    }
}

function openSettings() {
    closeMainMenu();
    showNotification('Settings menu - Coming soon!', 'info');
}

function openHistory() {
    closeMainMenu();
    showNotification('Game history - Coming soon!', 'info');
}

// ===== PAYMENT STATE =====
let paymentState = {
    selectedAmount: 1000,
    selectedMethod: 'kbz',
    selectedFile: null,
    customAmount: '',
    senderPhone: '',
    transferId: '',
    
    // Accounts ကို localStorage ကနေ အမြဲယူမယ်
    get accounts() {
        try {
            const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];
            const mappedAccounts = {};

            bankAccounts.forEach(bank => {
                if (bank.status === 'active') {
                    const key = bank.bankName.toLowerCase().replace(' ', '');
                    mappedAccounts[key] = {
                        name: bank.accountHolder,
                        phone: bank.accountNumber,
                        refId: bank.id,
                        type: bank.bankName
                    };
                }
            });

            if (Object.keys(mappedAccounts).length === 0) {
                return {
                    'kbz': {
                        name: 'ဒေါ်အေးအေး',
                        phone: '09-123456789',
                        refId: 'KBZ12345',
                        type: 'KBZ Pay'
                    },
                    'wave': {
                        name: 'ဦးမောင်မောင်',
                        phone: '09-987654321',
                        refId: 'WAVE67890',
                        type: 'Wave Pay'
                    },
                    'cb': {
                        name: 'ကိုဇော်ဇော်',
                        phone: '09-555555555',
                        refId: 'CB54321',
                        type: 'CB Pay'
                    }
                };
            }
            return mappedAccounts;
        } catch(e) {
            console.error('Error loading bank accounts:', e);
            return {
                'kbzpay': { name: 'ဒေါ်အေးအေး', phone: '09-123456789', refId: 'KBZ12345', type: 'KBZ Pay' },
                'wavepay': { name: 'ဦးမောင်မောင်', phone: '09-987654321', refId: 'WAVE67890', type: 'Wave Pay' },
                'cbpay': { name: 'ကိုဇော်ဇော်', phone: '09-555555555', refId: 'CB54321', type: 'CB Pay' }
            };
        }
    },
    depositRequests: JSON.parse(localStorage.getItem('depositRequests')) || [],
    withdrawRequests: JSON.parse(localStorage.getItem('withdrawRequests')) || []
};

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function() {
    initPaymentMethods();
    initEventListeners();
    calculateWithdrawFee();
});

function initEventListeners() {
    const withdrawAmount = document.getElementById('withdrawAmount');
    if (withdrawAmount) {
        withdrawAmount.addEventListener('input', calculateWithdrawFee);
    }
}

// ========== DEPOSIT FUNCTIONS ==========

function selectAmount(element, amount) {
    document.querySelectorAll('.amount-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    paymentState.selectedAmount = amount;
    paymentState.customAmount = '';
    const customInput = document.getElementById('customAmount');
    if (customInput) customInput.value = '';
}

function useCustomAmount() {
    const customInput = document.getElementById('customAmount');
    const amount = parseInt(customInput.value);

    if (!amount || amount < 1000) {
        showNotification('အနည်းဆုံး ၁,၀၀၀ ကျပ်ထည့်ပါ။', 'error');
        return;
    }
    if (amount > 1000000) {
        showNotification('တစ်ကြိမ်လျှင် အများဆုံး ၁၀၀၀၀၀၀ ကျပ်သာ ငွေသွင်းနိုင်ပါသည်။', 'error');
        return;
    }
    document.querySelectorAll('.amount-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    paymentState.selectedAmount = amount;
    paymentState.customAmount = amount;
    showNotification(amount + ' ကျပ် ကိုရွေးချယ်ပြီးပါပြီ။', 'success');
}

function selectPaymentMethod(element, method) {
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');
    paymentState.selectedMethod = method;
    updateBankInfo(method);
}

function updateBankInfo(method) {
    console.log('Updating bank info for method:', method);
    const accounts = paymentState.accounts;
    let account = null;

    if (accounts[method]) {
        account = accounts[method];
    } else {
        const methodLower = method.toLowerCase();
        for (let key in accounts) {
            if (key.includes(methodLower) || methodLower.includes(key)) {
                account = accounts[key];
                break;
            }
        }
    }
    if (!account) {
        const firstKey = Object.keys(accounts)[0];
        account = accounts[firstKey];
    }
    if (!account) {
        console.error('No bank account found!');
        return;
    }
    console.log('Selected account:', account);

    const bankNameEl = document.getElementById('bankName');
    const accountNameEl = document.getElementById('accountName');
    const accountPhoneEl = document.getElementById('accountPhone');
    const accountRefEl = document.getElementById('accountRef');

    if (bankNameEl) bankNameEl.textContent = account.type || account.bankName || 'KBZ Pay';
    if (accountNameEl) accountNameEl.textContent = account.name || account.accountHolder || '';
    if (accountPhoneEl) accountPhoneEl.textContent = account.phone || account.accountNumber || '';
    if (accountRefEl) accountRefEl.textContent = account.refId || account.id || 'N/A';
}

function triggerFileUpload() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showNotification('ဖိုင်အရွယ်အစား 5MB ထက်မကြီးရပါ။', 'error');
        return;
    }
    if (!file.type.startsWith('image/')) {
        showNotification('ပုံဖိုင်သာ တင်နိုင်ပါသည်။', 'error');
        return;
    }
    paymentState.selectedFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImage');
        const previewContainer = document.getElementById('previewContainer');
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    paymentState.selectedFile = null;
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('previewImage').src = '#';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
}

function submitDeposit() {
    const senderPhone = document.getElementById('senderPhone').value.trim();
    const transferId = document.getElementById('transferId').value.trim();

    if (!paymentState.selectedAmount) {
        showNotification('ငွေပမာဏ ရွေးချယ်ပါ။', 'error');
        return;
    }
    if (!senderPhone) {
        showNotification('သင့်ဖုန်းနံပါတ် ထည့်ပါ။', 'error');
        return;
    }
    if (senderPhone.length < 9) {
        showNotification('ဖုန်းနံပါတ် မှန်ကန်စွာထည့်ပါ။', 'error');
        return;
    }
    if (!transferId) {
        showNotification('ငွေလွှဲ ID ထည့်ပါ။', 'error');
        return;
    }
    if (transferId.length !== 5) {
        showNotification('ငွေလွှဲ ID သည် ၅လုံး ဖြစ်ရပါမည်။', 'error');
        return;
    }
    if (!paymentState.selectedFile) {
        showNotification('Screenshot တင်ပေးပါ။', 'error');
        return;
    }

    const depositRequest = {
        id: 'DEP' + Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        amount: paymentState.selectedAmount,
        method: paymentState.selectedMethod,
        bankInfo: paymentState.accounts[paymentState.selectedMethod],
        senderPhone: senderPhone,
        transferId: transferId,
        screenshot: paymentState.selectedFile.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        processedAt: null,
        note: ''
    };

    paymentState.depositRequests.push(depositRequest);
    localStorage.setItem('depositRequests', JSON.stringify(paymentState.depositRequests));

    showSuccessModal(
        'ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။',
        'သင်၏တောင်းဆိုမှုကို စီစစ်ပြီးပါက ငွေဖြည့်သွင်းပေးပါမည်။',
        [
            'ငွေပမာဏ: ' + formatNumber(paymentState.selectedAmount) + ' ကျပ်',
            'ငွေလွှဲ ID: ' + transferId,
            'အခြေအနေ: စောင့်ဆိုင်းဆဲ'
        ]
    );
    resetDepositForm();
    setTimeout(() => {
        closeModal('depositModal');
    }, 2000);
}

function resetDepositForm() {
    paymentState.selectedAmount = 1000;
    paymentState.selectedMethod = 'kbz';
    paymentState.selectedFile = null;
    paymentState.customAmount = '';

    document.querySelectorAll('.amount-chip').forEach((chip, index) => {
        if (index === 0) chip.classList.add('active');
        else chip.classList.remove('active');
    });
    document.querySelectorAll('.method-btn').forEach((btn, index) => {
        if (index === 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    document.getElementById('customAmount').value = '';
    document.getElementById('senderPhone').value = '';
    document.getElementById('transferId').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    updateBankInfo('kbz');
}

// ========== WITHDRAW FUNCTIONS ==========

function calculateWithdrawFee() {
    const amountInput = document.getElementById('withdrawAmount');
    const feeEl = document.getElementById('feeAmount');
    const netEl = document.getElementById('netAmount');
    if (!amountInput || !feeEl || !netEl) return;

    let amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount < 5000) {
        feeEl.textContent = '0 ကျပ်';
        netEl.textContent = '0 ကျပ်';
        return;
    }
    if (amount > 500000) {
        amount = 500000;
        amountInput.value = 500000;
    }
    const fee = Math.floor(amount * 0.05);
    const net = amount - fee;
    feeEl.textContent = formatNumber(fee) + ' ကျပ်';
    netEl.textContent = formatNumber(net) + ' ကျပ်';
}

function submitWithdraw() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const bank = document.getElementById('withdrawBank').value;
    const account = document.getElementById('withdrawAccount').value.trim();
    const accountName = document.getElementById('withdrawName').value.trim();

    if (!amount || amount < 5000) {
        showNotification('အနည်းဆုံး ၅၀၀၀ ကျပ် ထုတ်ယူနိုင်ပါသည်။', 'error');
        return;
    }
    if (amount > 500000) {
        showNotification('တစ်ကြိမ်လျှင် အများဆုံး ၅၀၀၀၀၀ ကျပ်သာ ထုတ်ယူနိုင်ပါသည်။', 'error');
        return;
    }
    if (!account) {
        showNotification('အကောင့်နံပါတ် / ဖုန်းနံပါတ် ထည့်ပါ။', 'error');
        return;
    }
    if (!accountName) {
        showNotification('အကောင့်အမည် ထည့်ပါ။', 'error');
        return;
    }
    if (currentUser.balance < amount) {
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
        return;
    }

    const fee = Math.floor(amount * 0.05);
    const netAmount = amount - fee;

    const withdrawRequest = {
        id: 'WDR' + Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        amount: amount,
        fee: fee,
        netAmount: netAmount,
        bank: bank,
        accountNumber: account,
        accountName: accountName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        processedAt: null,
        note: ''
    };

    paymentState.withdrawRequests.push(withdrawRequest);
    localStorage.setItem('withdrawRequests', JSON.stringify(paymentState.withdrawRequests));

    currentUser.balance -= amount;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        localStorage.setItem('slotUsers', JSON.stringify(users));
    }
    if (typeof gameState !== 'undefined') {
        gameState.balance = currentUser.balance;
    }
    const balanceEl = document.getElementById('balanceAmount');
    if (balanceEl) {
        balanceEl.textContent = formatNumber(currentUser.balance);
    }

    showSuccessModal(
        'ငွေထုတ်တောင်းဆိုမှု အောင်မြင်ပါသည်။',
        'သင်၏တောင်းဆိုမှုကို စီစစ်ပြီးပါက ငွေလွှဲပေးပါမည်။',
        [
            'ထုတ်ယူငွေ: ' + formatNumber(amount) + ' ကျပ်',
            'ဝန်ဆောင်ခ (5%): ' + formatNumber(fee) + ' ကျပ်',
            'လက်ခံရရှိမည့်ငွေ: ' + formatNumber(netAmount) + ' ကျပ်',
            'ဘဏ်: ' + bank,
            'အခြေအနေ: စောင့်ဆိုင်းဆဲ'
        ]
    );
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAccount').value = '';
    document.getElementById('withdrawName').value = '';
    calculateWithdrawFee();
    setTimeout(() => {
        closeModal('withdrawModal');
    }, 2000);
}

// ========== SUCCESS MODAL ==========

function showSuccessModal(title, message, details = []) {
    const modal = document.getElementById('successModal');
    const titleEl = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');
    const detailsEl = document.getElementById('modalDetails');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (detailsEl && details.length > 0) {
        let html = '';
        details.forEach(detail => {
            html += `<div style="color: white; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">${detail}</div>`;
        });
        detailsEl.innerHTML = html;
    }
    if (modal) modal.style.display = 'flex';
}

function initPaymentMethods() {
    console.log('Initializing payment methods...');
    const savedDeposits = localStorage.getItem('depositRequests');
    if (savedDeposits) {
        paymentState.depositRequests = JSON.parse(savedDeposits);
    }
    const savedWithdrawals = localStorage.getItem('withdrawRequests');
    if (savedWithdrawals) {
        paymentState.withdrawRequests = JSON.parse(savedWithdrawals);
    }
    generatePaymentMethodButtons();
    setTimeout(() => {
        updateBankInfo('kbzpay');
    }, 100);
}

function generatePaymentMethodButtons() {
    const methodGrid = document.querySelector('.method-grid');
    if (!methodGrid) return;

    const accounts = paymentState.accounts;
    let html = '';
    let firstMethod = '';

    Object.keys(accounts).forEach((key, index) => {
        const account = accounts[key];
        const isActive = index === 0;
        if (index === 0) firstMethod = key;

        html += `
            <div class="method-btn ${isActive ? 'active' : ''}" onclick="selectPaymentMethod(this, '${key}')">
                <i class="fas ${getBankIcon(account.type)}"></i>
                <span>${account.type || key}</span>
            </div>
        `;
    });
    methodGrid.innerHTML = html;
    if (firstMethod) {
        paymentState.selectedMethod = firstMethod;
    }
}

function getBankIcon(bankName) {
    const name = (bankName || '').toLowerCase();
    if (name.includes('kbz')) return 'fa-mobile-alt';
    if (name.includes('wave')) return 'fa-wave-square';
    if (name.includes('cb')) return 'fa-university';
    if (name.includes('aya')) return 'fa-building';
    return 'fa-university';
}

// ========== UTILITY ==========
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function playClickSound() {
    const click = document.getElementById('clickSound');
    if (click) {
        click.currentTime = 0;
        click.play().catch(e => console.log('Audio play failed:', e));
    }
}

// ========== MODAL CONTROLS ==========
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        playClickSound();
    }
}

// ===== MODAL FUNCTIONS =====
function openDepositModal() {
    console.log('Opening deposit modal');
    const modal = document.getElementById('depositModal');
    if (modal) {
        modal.style.display = 'flex';
        resetDepositForm();
        playClickSound();
    }
}

function openWithdrawModal() {
    console.log('Opening withdraw modal');
    const modal = document.getElementById('withdrawModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Update balance display
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const displayBalance = document.getElementById('displayBalance');
            if (displayBalance) {
                displayBalance.textContent = formatNumber(currentUser.balance) + ' ကျပ်';
            }
        }
        
        calculateWithdrawFee();
        playClickSound();
    }
}
// ========== EXPORT GLOBALS ==========
window.selectAmount = selectAmount;
window.useCustomAmount = useCustomAmount;
window.selectPaymentMethod = selectPaymentMethod;
window.triggerFileUpload = triggerFileUpload;
window.handleFileSelect = handleFileSelect;
window.removeImage = removeImage;
window.submitDeposit = submitDeposit;
window.submitWithdraw = submitWithdraw;
window.closeModal = closeModal;
window.toggleMainMenu = toggleMainMenu;
window.closeMainMenu = closeMainMenu;
window.openSettings = openSettings;
window.openHistory = openHistory;
window.openDepositModal = openDepositModal;
window.openWithdrawModal = openWithdrawModal;
