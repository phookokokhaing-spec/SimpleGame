// ==================== USER LOGIN SYSTEM - COMPLETE ====================

// ===== GLOBAL VARIABLES =====
let currentUser = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login system initializing...');
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('User already logged in:', currentUser.username);
            
            // Hide login, show game
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';
            
            // Update UI
            updateUserUI(currentUser);
            updateGameState(currentUser);
            
        } catch (e) {
            console.error('Error loading user:', e);
            localStorage.removeItem('currentUser');
        }
    } else {
        console.log('No user logged in');
    }
    
    // Check orientation
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
});

// ===== ORIENTATION CHECK =====
function checkOrientation() {
    const warning = document.getElementById('orientationWarning');
    if (!warning) return;
    
    if (window.innerHeight > window.innerWidth) {
        warning.style.display = 'flex';
    } else {
        warning.style.display = 'none';
    }
}

// ===== TOGGLE PASSWORD VISIBILITY =====
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ===== TOGGLE FORMS =====
function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    clearMessages();
}

function showLoginForm() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    clearMessages();
}

function clearMessages() {
    const loginMsg = document.getElementById('loginMessage');
    const signupMsg = document.getElementById('signupMessage');
    if (loginMsg) loginMsg.textContent = '';
    if (signupMsg) signupMsg.textContent = '';
}

// ===== SHOW MESSAGE =====
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'message ' + type;
    
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 3000);
}

// ===== HANDLE LOGIN =====
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    // Validation
    if (!username || !password) {
        showMessage(messageEl, 'Please enter username and password', 'error');
        return;
    }

    // Get users from storage
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        
        // Save to storage
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update users list
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('slotUsers', JSON.stringify(users));
        }

        // Show success message
        showMessage(messageEl, 'Login successful!', 'success');
        
        // Hide login, show game
        setTimeout(() => {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';
            
            // Update UI
            updateUserUI(user);
            updateGameState(user);
            
            // Clear login fields
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }, 1000);
        
    } else {
        showMessage(messageEl, 'Invalid username or password', 'error');
    }
}

// ===== HANDLE SIGNUP =====
function handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const messageEl = document.getElementById('signupMessage');

    // Validation
    if (!username || !password) {
        showMessage(messageEl, 'Please enter username and password', 'error');
        return;
    }

    if (username.length < 3) {
        showMessage(messageEl, 'Username must be at least 3 characters', 'error');
        return;
    }

    if (password.length < 4) {
        showMessage(messageEl, 'Password must be at least 4 characters', 'error');
        return;
    }

    // Get users from storage
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];

    // Check if username exists
    if (users.some(u => u.username === username)) {
        showMessage(messageEl, 'Username already exists', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        password: password,
        balance: 10000,
        level: 1,
        vip: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Save to storage
    users.push(newUser);
    localStorage.setItem('slotUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    currentUser = newUser;

    // Show success message
    showMessage(messageEl, 'Account created successfully!', 'success');

    // Hide login, show game
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        
        // Update UI
        updateUserUI(newUser);
        updateGameState(newUser);
        
        // Clear signup fields
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupPassword').value = '';
    }, 1000);
}

// ===== UPDATE USER UI =====
function updateUserUI(user) {
    console.log('Updating UI for user:', user.username);
    
    // Update username
    const usernameEl = document.getElementById('usernameMini');
    if (usernameEl) {
        usernameEl.textContent = user.username;
    }
    
    // Update balance
    const balanceEl = document.getElementById('balanceAmount');
    if (balanceEl) {
        balanceEl.textContent = user.balance.toLocaleString();
    }
    
    // Update level
    const levelEl = document.getElementById('userLevel');
    if (levelEl) {
        levelEl.textContent = user.level;
    }
    
    // Update VIP
    const vipEl = document.getElementById('vipLevel');
    if (vipEl) {
        vipEl.textContent = user.vip;
    }
}

// ===== UPDATE GAME STATE =====
function updateGameState(user) {
    if (typeof gameState !== 'undefined') {
        gameState.balance = user.balance;
        gameState.userLevel = user.level;
        gameState.vipLevel = user.vip;
    }
}

// ===== LOGOUT =====
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Hide game, show login
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    
    // Reset forms
    showLoginForm();
}

// ===== EXPORT FUNCTIONS =====
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;
window.togglePassword = togglePassword;
window.logoutUser = logoutUser;


//========== ADMIN TRIGGER WITH VISUAL FEEDBACK ==========

let adminClickCount = 0;
let adminTimer;

document.addEventListener('DOMContentLoaded', function() {
    const adminTrigger = document.getElementById('adminTrigger');
    if (!adminTrigger) return;
    
    // Clear existing content and set up premium design
    adminTrigger.innerHTML = '';
    adminTrigger.style.cssText = `
        width: 60px;
        height: 60px;
        background: linear-gradient(145deg, #2a2f3f, #252a38);
        border: 2px solid rgba(255,215,0,0.3);
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        overflow: visible;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: adminPulse 3s infinite;
    `;
    
    // Add style for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes adminPulse {
            0%, 100% { box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 5px 30px rgba(255,215,0,0.3); }
        }
        
        @keyframes triggerFlash {
            0% { background: linear-gradient(145deg, #2a2f3f, #252a38); }
            25% { background: linear-gradient(145deg, #ffd700, #ffaa00); }
            50% { background: linear-gradient(145deg, #ff6b6b, #ff5252); }
            75% { background: linear-gradient(145deg, #2196f3, #1976d2); }
            100% { background: linear-gradient(145deg, #00c853, #00a844); }
        }
        
        @keyframes rotateGradient {
            0% { transform: rotate(0deg); opacity: 1; }
            100% { transform: rotate(360deg); opacity: 1; }
        }
        
        @keyframes iconWiggle {
            0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
            25% { transform: translate(-50%, -50%) rotate(-15deg); }
            75% { transform: translate(-50%, -50%) rotate(15deg); }
        }
        
        @keyframes readyPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 30px #00c853; }
            50% { transform: scale(1.1); box-shadow: 0 0 50px #00c853; }
        }
        
        @keyframes msgFade {
            0% { opacity: 0; transform: translate(-50%, 30px); }
            20% { opacity: 1; transform: translate(-50%, -50%); }
            80% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -80px); }
        }
        
        @keyframes tooltipFade {
            from { opacity: 0; transform: translate(-50%, 10px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `;
    document.head.appendChild(style);
    
    // Create inner glow effect
    const glow = document.createElement('div');
    glow.style.cssText = `
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(145deg, #ffd700, #ff6b6b, #2196f3, #00c853);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    `;
    adminTrigger.appendChild(glow);
    
    // Create icon
    const icon = document.createElement('span');
    icon.innerHTML = '⚡';
    icon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: rgba(255,215,0,0.7);
        transition: all 0.3s ease;
        text-shadow: 0 0 10px rgba(255,215,0,0.5);
        z-index: 2;
    `;
    adminTrigger.appendChild(icon);
    
    // Create click counter badge
    const clickBadge = document.createElement('span');
    clickBadge.className = 'click-count';
    clickBadge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        width: 22px;
        height: 22px;
        background: #ffd700;
        border-radius: 50%;
        color: #000;
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0);
        transition: all 0.3s ease;
        box-shadow: 0 0 15px #ffd700;
        z-index: 10;
    `;
    clickBadge.textContent = '0';
    adminTrigger.appendChild(clickBadge);
    
    // Create SVG progress ring
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '60');
    svg.setAttribute('height', '60');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        z-index: 1;
    `;
    
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '30');
    circle.setAttribute('cy', '30');
    circle.setAttribute('r', '27');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#ffd700');
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('stroke-dasharray', '170');
    circle.setAttribute('stroke-dashoffset', '170');
    circle.style.transition = 'stroke-dashoffset 0.3s linear';
    
    svg.appendChild(circle);
    adminTrigger.appendChild(svg);
    
    // Add title attribute
    adminTrigger.title = 'Click 12 times for admin access';
    
    // ===== CLICK HANDLER =====
    adminTrigger.addEventListener('click', function(e) {
        adminClickCount++;
        
        // Update click count badge
        clickBadge.textContent = adminClickCount;
        clickBadge.style.opacity = '1';
        clickBadge.style.transform = 'scale(1)';
        adminTrigger.classList.add('clicked');
        
        // Update progress ring (170 is full circle)
        const progress = 170 - (adminClickCount / 12) * 170;
        circle.setAttribute('stroke-dashoffset', Math.max(0, progress));
        
        // Visual feedback based on click count
        if (adminClickCount === 3) {
            adminTrigger.style.background = 'linear-gradient(145deg, #ffd700, #ffaa00)';
            glow.style.opacity = '0.5';
            icon.style.color = '#000';
            showClickMessage('3 clicks - Keep going! ');
        } 
        else if (adminClickCount === 6) {
            adminTrigger.style.background = 'linear-gradient(145deg, #ff6b6b, #ff5252)';
            glow.style.opacity = '0.7';
            icon.style.color = 'white';
            showClickMessage('6 clicks - Almost there! ⚡');
        } 
        else if (adminClickCount === 9) {
            adminTrigger.style.background = 'linear-gradient(145deg, #2196f3, #1976d2)';
            glow.style.opacity = '0.9';
            icon.style.color = 'white';
            showClickMessage('9 clicks - Getting close! ');
        } 
        else if (adminClickCount >= 12) {
            adminTrigger.style.background = 'linear-gradient(145deg, #00c853, #00a844)';
            glow.style.opacity = '1';
            icon.style.color = 'white';
            icon.style.transform = 'translate(-50%, -50%) scale(1.2)';
            adminTrigger.style.animation = 'readyPulse 0.5s infinite';
            circle.setAttribute('stroke', '#00c853');
            showClickMessage(' Admin Access Unlocked! ');
        }
        
        // Icon wiggle animation
        icon.style.animation = 'iconWiggle 0.5s ease';
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
        
        // Clear previous timer
        clearTimeout(adminTimer);
        
        // Set timer to reset counter
        adminTimer = setTimeout(() => {
            adminClickCount = 0;
            clickBadge.textContent = '0';
            clickBadge.style.opacity = '0';
            clickBadge.style.transform = 'scale(0)';
            circle.setAttribute('stroke-dashoffset', '170');
            circle.setAttribute('stroke', '#ffd700');
            adminTrigger.style.background = 'linear-gradient(145deg, #2a2f3f, #252a38)';
            glow.style.opacity = '0';
            icon.style.color = 'rgba(255,215,0,0.7)';
            icon.style.transform = 'translate(-50%, -50%)';
            adminTrigger.style.animation = 'adminPulse 3s infinite';
            adminTrigger.classList.remove('clicked', 'ready');
        }, 3000);
        
        // Check for admin access
        if (adminClickCount >= 12) {
            adminClickCount = 0; // Reset counter
            clickBadge.textContent = '0';
            clickBadge.style.opacity = '0';
            clickBadge.style.transform = 'scale(0)';
            circle.setAttribute('stroke-dashoffset', '170');
            
            // Open admin login
            setTimeout(() => {
                openAdminLogin();
            }, 500);
        }
    });
    
    // Hover effects
    adminTrigger.addEventListener('mouseenter', function() {
        adminTrigger.style.transform = 'translateY(-3px)';
        adminTrigger.style.borderColor = '#ffd700';
        adminTrigger.style.boxShadow = '0 0 30px rgba(255,215,0,0.5)';
        icon.style.color = '#ffd700';
        icon.style.textShadow = '0 0 20px #ffd700';
    });
    
    adminTrigger.addEventListener('mouseleave', function() {
        if (adminClickCount < 12) {
            adminTrigger.style.transform = '';
            adminTrigger.style.borderColor = 'rgba(255,215,0,0.3)';
            adminTrigger.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            icon.style.color = adminClickCount >= 12 ? 'white' : 'rgba(255,215,0,0.7)';
        }
    });
});

// ===== SHOW CLICK FEEDBACK MESSAGE =====
function showClickMessage(text) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        color: #ffd700;
        padding: 18px 35px;
        border-radius: 50px;
        font-size: 20px;
        font-weight: bold;
        border: 2px solid #ffd700;
        box-shadow: 0 0 50px rgba(255,215,0,0.5);
        z-index: 99999;
        animation: msgFade 1.5s ease forwards;
        white-space: nowrap;
        pointer-events: none;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 1500);
}

// ===== OPEN ADMIN LOGIN MODAL =====
function openAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'flex';
        const remainingEl = document.getElementById('remainingAttempts');
        if (remainingEl) {
            remainingEl.textContent = '3 attempts remaining';
        }
        
        // Auto focus password input
        setTimeout(() => {
            const passInput = document.getElementById('adminAccessPassword');
            if (passInput) passInput.focus();
        }, 300);
    }
}

// ===== VERIFY ADMIN ACCESS =====
function verifyAdminAccess() {
    const password = document.getElementById('adminAccessPassword').value;
    const remainingEl = document.getElementById('remainingAttempts');
    let attempts = parseInt(remainingEl?.textContent || '3');
    
    if (password === 'admin123') { // Demo password
        // Success - close modal and open admin
        closeModal('adminLoginModal');
        
        // Show success message
        showClickMessage('✅ Admin access granted!');
        
        // Open admin dashboard
        setTimeout(() => {
            document.getElementById('adminDashboard').style.display = 'block';
            document.getElementById('gameContainer').style.display = 'none';
            
            // Load admin dashboard data
            if (typeof loadAdminDashboard === 'function') {
                loadAdminDashboard();
            }
            
            // Reset password field
            document.getElementById('adminAccessPassword').value = '';
        }, 500);
    } else {
        // Wrong password
        attempts--;
        
        if (remainingEl) {
            if (attempts > 0) {
                remainingEl.textContent = attempts + ' attempts remaining';
                showClickMessage(`❌ Wrong password! ${attempts} attempts left`);
            } else {
                remainingEl.textContent = '0 attempts remaining - Closing';
                showClickMessage('❌ Too many failed attempts!');
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeModal('adminLoginModal');
                    document.getElementById('adminAccessPassword').value = '';
                }, 2000);
            }
        } else {
            alert('မှားယွင်းနေပါသည်။');
        }
    }
}

// ===== CLOSE MODAL FUNCTION =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== ADMIN LOGOUT FUNCTION =====
function adminLogout() {
    // Hide admin dashboard
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        adminDashboard.style.display = 'none';
    }
    
    // Show game container with FLEX (ဒါအရေးကြီးတယ်)
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
    }
    
    // Reset admin indicator
    const indicator = document.getElementById('adminIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
    
    // Reset admin trigger style
    const trigger = document.getElementById('adminTrigger');
    if (trigger) {
        trigger.style.background = '';
    }
    
    // Reset password field
    const passwordField = document.getElementById('adminAccessPassword');
    if (passwordField) {
        passwordField.value = '';
    }
    
    console.log('Admin logged out successfully');
}

// Make it globally available
window.adminLogout = adminLogout;
