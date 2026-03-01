// ============================================
// GAME.JS - COMPLETE ORGANIZED VERSION (FIXED)
// ============================================

// ============================================
// 1. GAME STATE & CONFIGURATION
// ============================================

let gameState = {
    balance: 10000,
    betAmount: 80,
    betMultiplier: 1,
    betType: '10C',
    winAmount: 0,
    isSpinning: false,
    autoSpin: false,
    jackpot: 100000,
    vipLevel: 0,
    userLevel: 1,
    pendingGift: null,
    spinCounter: 0,
    freeSpins: 0,
    isFreeSpinning: false,
    scatterCount: 0,
    totalScatter: 0,
    pendingGiftSpins: 3,
    spinCount: 0
};

// Reel Configuration - မြန်မာတိရစ္ဆာန်များ
const REELS = [
    ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin'],
    ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin'],
    ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin'],
    ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin'],
    ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin']
];

// Image paths for symbols
const IMAGE_PATHS = {
    'seven': 'images/seven.png',
    'lion': 'images/lion.png',
    'buffalo': 'images/buffalo.png',
    'ele': 'images/ele.png',
    'tha': 'images/tha.png',
    'zebra': 'images/zebra.png',
    'ayeaye': 'images/ayeaye.png',
    'wild': 'images/wild.png',
    'bonus': 'images/bonus.png',
    'coin': 'images/coin.png'
};

// Paytable (multipliers)
const PAYTABLE = {
    'seven': {3: 20, 4: 50, 5: 200},
    'lion': {3: 15, 4: 30, 5: 100},
    'buffalo': {3: 10, 4: 20, 5: 50},
    'ele': {3: 8, 4: 15, 5: 40},
    'tha': {3: 6, 4: 12, 5: 30},
    'zebra': {3: 5, 4: 10, 5: 25},
    'ayeaye': {3: 4, 4: 8, 5: 20},
    'coin': {3: 3, 4: 6, 5: 15}
};

// C MULTIPLIER SYSTEM
const C_MULTIPLIER_VALUES = {
    "1C": 0.1,
    "5C": 0.5,
    "10C": 1.0,
    "16C": 1.6,
    "20C": 2.0,
    "50C": 3.0
};

const BET_TABLE = {
    "1C": [80, 160, 320, 480, 800],
    "5C": [400, 800, 1600, 2400, 4000],
    "10C": [800, 1600, 3200, 4800, 8000],
    "20C": [1600, 3200, 6400, 9600, 16000],
    "50C": [4000, 8000, 16000, 24000, 40000]
};

// Grid dimensions
const GRID_ROWS = 4;
const GRID_COLS = 5;

// ============================================
// 2. DOM READY & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Game.js loaded - initializing...');
    initSlotGrid();
    initBetControls();
    initEventListeners();
    loadCurrentUserData();
    updateBalanceDisplay();
    updateJackpotDisplay();

    setTimeout(checkUserSurprise, 500);
    setInterval(checkUserSurprise, 3000);
});

function initSlotGrid() {
    const slotGrid = document.getElementById('slotGrid');
    if (!slotGrid) return;

    slotGrid.innerHTML = '';
    slotGrid.className = 'grid-5x4';

    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;

        const row = Math.floor(i / 5);
        const col = i % 5;
        cell.dataset.row = row;
        cell.dataset.col = col;

        const img = document.createElement('img');
        img.src = 'images/coin.png';
        img.alt = 'slot symbol';
        img.className = 'symbol-image';
        img.onerror = function() {
            this.style.display = 'none';
            cell.innerText = '';
        };

        cell.appendChild(img);
        slotGrid.appendChild(cell);
    }

    console.log('Slot grid initialized with 20 cells');
}

function initBetControls() {
    const betSelectBtn = document.getElementById('betSelectBtn');
    const betOptions = document.getElementById('betOptions');
    const decreaseBtn = document.getElementById('decreaseBetBtn');
    const increaseBtn = document.getElementById('increaseBetBtn');

    if (betSelectBtn && betOptions) {
        betSelectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            betOptions.style.display = betOptions.style.display === 'none' ? 'grid' : 'none';
        });

        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', function() {
                const cType = this.dataset.c + 'C';

                document.querySelectorAll('.bet-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                gameState.betType = cType;
                gameState.betMultiplier = parseFloat(this.dataset.c);
                gameState.betIndex = 2;

                gameState.betAmount = BET_TABLE[cType][gameState.betIndex];

                updateBetDisplay();
                betOptions.style.display = 'none';
            });
        });

        document.addEventListener('click', function(e) {
            if (!betSelectBtn.contains(e.target) && !betOptions.contains(e.target)) {
                betOptions.style.display = 'none';
            }
        });
    }

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            if (!gameState.betType) return;

            const betArray = BET_TABLE[gameState.betType];
            if (gameState.betIndex > 0) {
                gameState.betIndex--;
                gameState.betAmount = betArray[gameState.betIndex];
                updateBetDisplay();
                playButtonSound();
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            if (!gameState.betType) return;

            const betArray = BET_TABLE[gameState.betType];
            if (gameState.betIndex < betArray.length - 1) {
                gameState.betIndex++;
                gameState.betAmount = betArray[gameState.betIndex];
                updateBetDisplay();
                playButtonSound();
            }
        });
    }
}

function updateBetDisplay() {
    const betDisplay = document.getElementById('betAmountDisplay');
    const betSelectBtn = document.getElementById('betSelectBtn');

    if (betDisplay) {
        betDisplay.textContent = gameState.betAmount.toLocaleString();
    }

    if (betSelectBtn && gameState.betType) {
        betSelectBtn.textContent = gameState.betType;

        betSelectBtn.className = betSelectBtn.className.replace(/btn-\w+c/g, '');
        betSelectBtn.classList.add('btn-' + gameState.betType.toLowerCase());
    }

    document.querySelectorAll('.bet-option').forEach(opt => {
        if ((opt.dataset.c + 'C') === gameState.betType) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function initEventListeners() {
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', function() {
            if (!gameState.isSpinning) {
                spin();
            }
        });
    }

    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    if (gameContainer.style.display === 'flex' || gameContainer.style.display === 'block') {
                        loadCurrentUserData();
                    }
                }
            });
        });
        observer.observe(gameContainer, { attributes: true });
    }
}

function loadCurrentUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        gameState.balance = currentUser.balance || 10000;
        gameState.userLevel = currentUser.level || 1;
        gameState.vipLevel = currentUser.vip || 0;
        updateBalanceDisplay();
    }
}

// ============================================
// 3. SPIN FUNCTION & REEL ANIMATION
// ============================================

// spin() function ထဲက အပိုင်းကိုပြင်မယ်
function spin() {
    console.log('Spinning...');

    if (gameState.isSpinning) {
        console.log('⚠️ Already spinning, ignoring...');
        return;
    }

    // Play spin sound
    if (typeof SoundManager !== 'undefined') {
        SoundManager.spin();
    }

    // ===== FREE SPIN MODE CHECK =====
    if (gameState.isFreeSpinning) {
        gameState.freeSpins--;
        console.log(` Free Spins left: ${gameState.freeSpins}`);

        showFreeSpinIndicator();

        if (gameState.freeSpins <= 0) {
            endFreeSpins();
            return;
        }
    } else {
        if (gameState.balance < gameState.betAmount) {
            if (typeof SoundManager !== 'undefined') {
                SoundManager.noti();
            }
            showNotification('လက်ကျန်ငွေမလုံလောက်ပါ။', 'error');

            if (autoSpinActive) {
                stopAutoSpin('balance');
            }
            return;
        }

        gameState.balance -= gameState.betAmount;
        addJackpotContribution(gameState.betAmount);
    }

    gameState.isSpinning = true;
    console.log('isSpinning set to:', gameState.isSpinning);

    gameState.spinCount++;
    updateBalanceDisplay();
    updateUserBalanceInStorage();

    // ===== SPIN ANIMATION START =====
    const allSymbols = document.querySelectorAll('.grid-cell img');
allSymbols.forEach((symbol, index) => {
        // အရင် animation တွေကိုရှင်းမယ်
        symbol.classList.remove('spin-glow', 'spin-shine', 'winning-float', 'symbol-change');
        
        // လှလှပပ spin animation ထည့်မယ်
        setTimeout(() => {
            symbol.classList.add('spin-glow', 'spin-shine');
            
            // အချိန်တိုအတွင်း symbol တွေပြောင်းနေသလိုမျိုး
           let changeCount = 0;
        const changeInterval = setInterval(() => {
            if (gameState.isSpinning) {
                symbol.classList.add('symbol-change');
                setTimeout(() => {
                    symbol.classList.remove('symbol-change');
                }, 150);
                changeCount++;
                
                // နောက်ဆုံးအချိန်မှာ ပိုပြီးထင်ရှားအောင်
                if (changeCount > 8) {
                    symbol.style.transform = 'scale(1.6)';
                    symbol.style.filter = 'brightness(2.5) drop-shadow(0 0 30px gold) drop-shadow(0 0 60px magenta)';
                }
            } else {
                clearInterval(changeInterval);
                symbol.style.transform = '';
                symbol.style.filter = '';
            }
        }, 150);
    }, index * 15);
});

    const slotGrid = document.getElementById('slotGrid');
    if (slotGrid) {
        slotGrid.classList.add('grid-spinning');
    }

    animateReels();

    // Generate result after animation
    setTimeout(() => {
        console.log('⏰ Generating result');

        allSymbols.forEach(symbol => {
            symbol.classList.remove('spin-glow', 'spin-shine', 'symbol-change');
        });

        if (slotGrid) {
            slotGrid.classList.remove('grid-spinning');
        }

        // Generate result
        const result = generateSpinResult();
        displayResult(result);

        // ===== SCATTER CHECK =====
        const bonusCount = checkScatter(result);

        // Calculate winnings
        calculateWinnings(result);

        const hasWon = gameState.winAmount > 0;

        if (hasWon) {
            highlightWinningSymbols(result);
            // ✅ WINNING SYMBOLS FLOAT ANIMATION
            setTimeout(() => {
                animateWinningSymbols();
            }, 500); // displayResult ပြီးမှ animate လုပ်မယ်
        }

        // ===== FREE SPIN NEXT SPIN =====
        if (gameState.isFreeSpinning && gameState.freeSpins > 0) {
            console.log(`⏱️ Next free spin in 2 seconds...`);
            setTimeout(() => {
                spin();
            }, 2000);
        }

        onSpinComplete(hasWon, gameState.winAmount);
        checkPendingGiftOnSpin();

    }, 1500);
}

function generateSpinResult() {
    const result = [];

    for (let reel = 0; reel < 5; reel++) {
        const reelResult = [];

        for (let row = 0; row < 4; row++) {
            let symbol;

            if (reel === 0) {
                const withoutWild = REELS[reel].filter(s => s !== 'wild');
                symbol = withoutWild[Math.floor(Math.random() * withoutWild.length)];
            } else {
                symbol = REELS[reel][Math.floor(Math.random() * REELS[reel].length)];
            }

            reelResult.push(symbol);
        }
        result.push(reelResult);
    }

    console.log('Reel 1 (no wild):', result[0]);

    return result;
}

// animateReels function ကို ဒီလိုမျိုး ပြင်မယ်
function animateReels() {
    console.log(' animateReels started');
    
    const cells = document.querySelectorAll('.grid-cell');
    
    if (cells.length === 0) {
        console.error('No grid cells found!');
        return;
    }

    // အရင် animations တွေကို ရှင်းမယ်
    cells.forEach(cell => {
        if (cell.dataset.interval) {
            clearInterval(parseInt(cell.dataset.interval));
            delete cell.dataset.interval;
        }
        
        // 3D effect အတွက် class ထည့်မယ်
        cell.classList.add('spin-3d');
    });

    const symbols = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'wild', 'bonus', 'coin'];

    // 3D effect နဲ့ spin လုပ်မယ်
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.classList.add('spinning-advanced');
            
            const interval = setInterval(() => {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const img = cell.querySelector('img');
                if (img) {
                    img.src = `images/${randomSymbol}.png`;
                    
                    // 3D spin effect
                    img.style.transform = 'rotateX(360deg) rotateY(180deg) scale(1.2)';
                    img.style.filter = 'brightness(1.8) drop-shadow(0 0 25px gold) drop-shadow(0 0 50px magenta)';
                    img.style.transition = 'all 0.15s cubic-bezier(0.1, 0.9, 0.3, 1.2)';
                    
                    setTimeout(() => {
                        img.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                        img.style.filter = 'brightness(1) drop-shadow(0 0 0 gold)';
                    }, 100);
                }
            }, 120); // speed နည်းနည်းမြန်အောင်

            cell.dataset.interval = interval;
        }, index * 25); // တစ်ခုချင်းစီ နည်းနည်းစီနောက်ကျမယ်
    });

    // ရပ်တဲ့အခါ လှုပ်ပြီးရပ်မယ်
    setTimeout(() => {
        console.log('⏰ Stopping animation with bounce effect');
        
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.remove('spinning-advanced', 'spin-3d');
                
                if (cell.dataset.interval) {
                    clearInterval(parseInt(cell.dataset.interval));
                    delete cell.dataset.interval;
                }
                
                // ရပ်တဲ့အခါ bounce effect
                const img = cell.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.4) rotate(10deg)';
                    img.style.filter = 'brightness(1.5) drop-shadow(0 0 20px gold)';
                    
                    setTimeout(() => {
                        img.style.transform = 'scale(1.2) rotate(-5deg)';
                        
                        setTimeout(() => {
                            img.style.transform = 'scale(1) rotate(0deg)';
                            img.style.filter = 'brightness(1) drop-shadow(0 0 0 gold)';
                        }, 80);
                    }, 100);
                }
            }, index * 15); // တစ်ခုချင်းစီ ရပ်တဲ့အခါ နည်းနည်းစီနောက်ကျမယ်
        });
    }, 1500);
}
 // ============================================
// 4. WIN CALCULATION & PAYOUT (FIXED)
// ============================================

function calculateWinnings(result) {
    console.log(' RESULT DATA:', JSON.stringify(result));
    console.log('Row 1:', result[0][0], result[1][0], result[2][0], result[3][0], result[4][0]);
    console.log('Row 2:', result[0][1], result[1][1], result[2][1], result[3][1], result[4][1]);
    console.log('Row 3:', result[0][2], result[1][2], result[2][2], result[3][2], result[4][2]);
    console.log('Row 4:', result[0][3], result[1][3], result[2][3], result[3][3], result[4][3]);

    let totalWin = 0;
    let buffaloCount = 0;
    let winLines = [];
    const cells = document.querySelectorAll('.grid-cell');

    cells.forEach(cell => {
        cell.classList.remove('win', 'buffalo-win', 'winning-cell-highlight');
        const img = cell.querySelector('img');
        if (img) {
            img.classList.remove('winning-pulse');
        }
    });

    // C multiplier ကိုယူမယ်
    const cMultiplier = C_MULTIPLIER_VALUES[gameState.betType] || 1.0;
    console.log(` C Multiplier for ${gameState.betType}: ${cMultiplier}`);

    const col0Symbols = [
        result[0][0],
        result[0][1],
        result[0][2],
        result[0][3]
    ];

    const col1Symbols = [
        result[1][0],
        result[1][1],
        result[1][2],
        result[1][3]
    ];

    console.log('Col0:', col0Symbols);
    console.log('Col1:', col1Symbols);

    let commonSymbols = [];

    for (let i = 0; i < 4; i++) {
        const sym = col0Symbols[i];
        if (sym === 'wild') continue;

        for (let j = 0; j < 4; j++) {
            if (col1Symbols[j] === sym || col1Symbols[j] === 'wild') {
                commonSymbols.push(sym);
                break;
            }
        }
    }

    commonSymbols = [...new Set(commonSymbols)];
    console.log(' Common symbols found in Col0 & Col1:', commonSymbols);

    for (const sym of commonSymbols) {
        let consecutiveCols = 2;
        let wildCount = 0;

        for (let row = 0; row < 4; row++) {
            if (result[0][row] === 'wild') wildCount++;
            if (result[1][row] === 'wild') wildCount++;
        }

        console.log(`\n Checking ${sym} for consecutive columns...`);

        let found = false;
        for (let row = 0; row < 4; row++) {
            if (result[2][row] === sym || result[2][row] === 'wild') {
                found = true;
                if (result[2][row] === 'wild') wildCount++;
                break;
            }
        }
        if (found) {
            consecutiveCols++;
            console.log(`  Col2: ✅ found`);

            found = false;
            for (let row = 0; row < 4; row++) {
                if (result[3][row] === sym || result[3][row] === 'wild') {
                    found = true;
                    if (result[3][row] === 'wild') wildCount++;
                    break;
                }
            }
            if (found) {
                consecutiveCols++;
                console.log(`  Col3: ✅ found`);

                found = false;
                for (let row = 0; row < 4; row++) {
                    if (result[4][row] === sym || result[4][row] === 'wild') {
                        found = true;
                        if (result[4][row] === 'wild') wildCount++;
                        break;
                    }
                }
                if (found) {
                    consecutiveCols++;
                    console.log(`  Col4: ✅ found`);
                } else {
                    console.log(`  Col4: ❌ not found`);
                }
            } else {
                console.log(`  Col3: ❌ not found`);
            }
        } else {
            console.log(`  Col2: ❌ not found`);
        }

        console.log(`${sym}: ${consecutiveCols} consecutive columns, Wild count: ${wildCount}`);

        // Line 527 လောက်မှာ ဒီလိုပြင်မယ်
if (consecutiveCols >= 3 && PAYTABLE[sym] && PAYTABLE[sym][consecutiveCols]) {
    const multiplier = PAYTABLE[sym][consecutiveCols];
    
    // Wild multiplier
    let wildMultiplier = 1;
    if (wildCount > 0) {
        wildMultiplier = 1 + (wildCount * 0.1);
        wildMultiplier = Math.min(wildMultiplier, 1.3);
    }
    
    const cMultiplier = C_MULTIPLIER_VALUES[gameState.betType] || 1.0;
    
    // Win တွက်မယ်
    let winAmount = gameState.betAmount * multiplier * wildMultiplier * cMultiplier;
    
    // ✅ အောက်ကိုဝိုင်းမယ်
    winAmount = Math.floor(winAmount);
    
    // MAX WIN LIMIT - Bet ရဲ့ 50x
    const maxWin = gameState.betAmount * 50;
    let capped = false;  // ✅ ဒီမှာ capped ကိုသတ်မှတ်ပေးရမယ်
    if (winAmount > maxWin) {
        winAmount = maxWin;
        capped = true;   // capped ဖြစ်သွားရင် true ထားမယ်
        console.log(`⚠️ Win capped at ${maxWin} (50x bet)`);
    }
    
    totalWin += winAmount;

    winLines.push({
        line: `${sym} ${consecutiveCols} Columns`,
        symbol: sym,
        count: consecutiveCols,
        wilds: wildCount,
        win: winAmount,
        multiplier: multiplier,
        wildMultiplier: wildMultiplier,
        cMultiplier: cMultiplier,
        capped: capped  // ✅ ဒီမှာသုံးလို့ရသွားမယ်
    });

    console.log(`✅ WIN: ${sym} x${consecutiveCols} columns = ${winAmount} (Base: ${multiplier}x, Wild: ${wildMultiplier.toFixed(1)}x, C: ${cMultiplier}x)${capped ? ' [CAPPED]' : ''}`);

    // Highlight winning cells
    for (let col = 0; col < consecutiveCols; col++) {
        for (let row = 0; row < 4; row++) {
            if (result[col][row] === sym || result[col][row] === 'wild') {
                const cellIndex = row * 5 + col;
                if (cells[cellIndex]) {
                    cells[cellIndex].classList.add('win');

                    if (result[col][row] === 'wild') {
                        cells[cellIndex].classList.add('wild-win');
                    }
                }
            }
        }
    }
}
 else {
            console.log(`❌ No win for ${sym}`);
        }
    }

    // ===== COUNT BUFFALO FOR JACKPOT =====
    buffaloCount = countBuffalo(result);
    console.log(` Buffalo count: ${buffaloCount}`);

    if (buffaloCount >= 12) {
        // Jackpot ကိုလည်း limit ထည့်ချင်ရင် ဒီမှာထည့်လို့ရတယ်
        let jackpotWin = gameState.jackpot;
        
        // Jackpot ကို limit ထည့်ချင်ရင် ဒီနေရာမှာ
        // const maxJackpot = gameState.betAmount * 100;  // ဥပမာ 100x
        // if (jackpotWin > maxJackpot) {
        //     jackpotWin = maxJackpot;
        // }
        
        totalWin += jackpotWin;
        
        winLines.push({
            line: 'JACKPOT',
            symbol: 'buffalo',
            count: buffaloCount,
            win: jackpotWin
        });

        // Highlight all buffalo
        for (let reel = 0; reel < 5; reel++) {
            for (let row = 0; row < 4; row++) {
                if (result[reel][row] === 'buffalo') {
                    const cellIndex = row * 5 + reel;
                    if (cells[cellIndex]) {
                        cells[cellIndex].classList.add('buffalo-win');
                    }
                }
            }
        }

        console.log(` JACKPOT! ${buffaloCount} buffaloes = ${jackpotWin}`);
    }

    console.log(` Total win calculated: ${totalWin}`);

    if (totalWin > 0) {
        gameState.balance += totalWin;
        gameState.winAmount = totalWin;

        updateBalanceDisplay();
        updateUserBalanceInStorage();
        updateWinDisplay(totalWin);

        playWinSounds(totalWin, winLines);
        showWinLinesInfo(winLines);
        addWinToHistory(totalWin);

        // ===== ဒီနေရာမှာ Multiple Animations ထည့်မယ် =====
if (typeof WinAnimations !== 'undefined') {
    const winMultiplier = totalWin / gameState.betAmount;

    console.log(` Win multiplier: ${winMultiplier.toFixed(1)}x (Bet: ${gameState.betAmount}, Win: ${totalWin})`);

    // WinAnimations တွေကို ခေါ်မယ်
    if (winMultiplier >= 1000) {
        console.log(' MEGA WIN (1000x bet)');
        WinAnimations.mega();
        
        // ကိုယ်ပိုင် effect တွေလည်း ထည့်မယ်
        setTimeout(() => {
            if (typeof startCoinRain === 'function') startCoinRain(200);
            if (typeof createFireworks === 'function') createFireworks(50);
        }, 500);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.victory();
            SoundManager.congratulations();
            SoundManager.coinRain();
        }
    } else if (winMultiplier >= 500) {
        console.log(' SUPER WIN (500x bet)');
        WinAnimations.super();
        
        setTimeout(() => {
            if (typeof startCoinRain === 'function') startCoinRain(100);
            if (typeof createFireworks === 'function') createFireworks(30);
        }, 500);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.victory();
            SoundManager.congratulations();
        }
    } else if (winMultiplier >= 100) {
        console.log(' BIG WIN (100x bet)');
        WinAnimations.big();
        
        setTimeout(() => {
            if (typeof startCoinRain === 'function') startCoinRain(60);
            if (typeof createFireworks === 'function') createFireworks(15);
        }, 500);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.win();
            SoundManager.congratulations();
        }
    } else if (winMultiplier >= 10) {
        console.log(' WIN (10x bet)');
        
        // WinAnimations.big မခေါ်တော့ဘူး၊ ကိုယ်ပိုင် effect ပဲထည့်မယ်
        setTimeout(() => {
            if (typeof startCoinRain === 'function') startCoinRain(30);
        }, 500);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.win();
        }
    } else if (winMultiplier >= 5) {
        console.log(' SMALL WIN (5x bet)');
        
        // နည်းနည်းပဲနိုင်ရင် coin rain နည်းနည်းပဲထည့်
        setTimeout(() => {
            if (typeof startCoinRain === 'function') startCoinRain(15);
        }, 500);
    }
}

// Buffalo Stampede က သူ့ဟာနဲ့သူ
if (buffaloCount >= 5 && typeof buffaloStampede !== 'undefined') {
    buffaloStampede.startStampede(totalWin, buffaloCount);
}

checkLevelUp();
    } else {
        gameState.winAmount = 0;
        updateWinDisplay(0);
        console.log('❌ No wins this spin');
    }

    return totalWin;
}

// ===== COUNT BUFFALO FUNCTION =====
function countBuffalo(result) {
    let count = 0;
    for (let reel = 0; reel < 5; reel++) {
        for (let row = 0; row < 4; row++) {
            if (result[reel][row] === 'buffalo') {
                count++;
            }
        }
    }
    return count;
}


// ဒီ function ကို ထည့်ပါ
function animateWinningSymbols() {
    const winningCells = document.querySelectorAll('.grid-cell.win, .grid-cell.winning-cell-highlight');
    
    winningCells.forEach((cell, index) => {
        const img = cell.querySelector('img');
        if (img) {
            // နည်းနည်းစီ နောက်ကျပြီး animate လုပ်မယ်
            setTimeout(() => {
                img.classList.add('winning-float');
                
                // animation ပြီးရင် remove လုပ်မယ်
                setTimeout(() => {
                    img.classList.remove('winning-float');
                }, 2400); // 1.2s * 2 = 2.4s
            }, index * 100); // cell တစ်ခုချင်းစီကို 0.1s စီနောက်ကျမယ်
        }
    });
}
// ============================================
// DISPLAY RESULT FUNCTION (တစ်ခုတည်းပဲထား)
// ============================================

function displayResult(result) {
    const cells = document.querySelectorAll('.grid-cell');
    console.log('Displaying result, cells found:', cells.length);

    if (cells.length === 0) {
        console.error('No grid cells found for display!');
        return;
    }

    cells.forEach(cell => {
        if (cell.dataset.winTimeout) {
            clearTimeout(parseInt(cell.dataset.winTimeout));
            delete cell.dataset.winTimeout;
        }

        const img = cell.querySelector('img');
        if (img) {
            img.classList.remove('winning-pulse', 'buffalo-glow', 'buffalo-pulse', 'buffola-bounce', 'win-pulse');
            img.style.animation = '';
        }
        cell.classList.remove('winning-cell-highlight', 'buffalo-win', 'win', 'win-flash');
        cell.style.animation = '';
        cell.style.borderColor = '';
        cell.style.boxShadow = '';
    });

    const winningPositions = new Array(20).fill(false);

    for (let row = 0; row < 4; row++) {
        const rowSymbols = result.map(reel => reel[row]);

        for (let i = 0; i <= 2; i++) {
            if (rowSymbols[i] && rowSymbols[i+1] && rowSymbols[i+2] &&
                rowSymbols[i] === rowSymbols[i+1] && rowSymbols[i] === rowSymbols[i+2]) {

                for (let j = 0; j < 3; j++) {  // ဒီမှာ ) ထည့်ပေးပြီ
                    const pos = row * 5 + i + j;
                    if (pos < 20) winningPositions[pos] = true;
                }
            }
        }

        for (let i = 0; i <= 1; i++) {
            if (rowSymbols[i] && rowSymbols[i+1] && rowSymbols[i+2] && rowSymbols[i+3] &&
                rowSymbols[i] === rowSymbols[i+1] &&
                rowSymbols[i] === rowSymbols[i+2] &&
                rowSymbols[i] === rowSymbols[i+3]) {

                for (let j = 0; j < 4; j++) {
                    const pos = row * 5 + i + j;
                    if (pos < 20) winningPositions[pos] = true;
                }
            }
        }

        if (rowSymbols[0] && rowSymbols[1] && rowSymbols[2] && rowSymbols[3] && rowSymbols[4] &&
            rowSymbols[0] === rowSymbols[1] &&
            rowSymbols[0] === rowSymbols[2] &&
            rowSymbols[0] === rowSymbols[3] &&
            rowSymbols[0] === rowSymbols[4]) {

            for (let j = 0; j < 5; j++) {
                const pos = row * 5 + j;
                if (pos < 20) winningPositions[pos] = true;
            }
        }
    }

    for (let row = 0; row < 4; row++) {
        for (let reel = 0; reel < 5; reel++) {
            const cellIndex = row * 5 + reel;
            if (cellIndex < cells.length) {
                const cell = cells[cellIndex];
                const symbol = result[reel][row];
                const img = cell.querySelector('img');

                if (img) {
                    img.src = `images/${symbol}.png`;
                    cell.dataset.symbol = symbol;

                    if (winningPositions[cellIndex]) {
                        // ===== WINNING ANIMATION START =====
                        cell.classList.add('winning-cell-highlight', 'win-flash');
                        img.classList.add('winning-pulse', 'win-pulse');

                        const timeoutId = setTimeout(() => {
                            if (cell) {
                                cell.classList.remove('winning-cell-highlight', 'win-flash');
                                img.classList.remove('winning-pulse', 'win-pulse');
                            }
                        }, 2000);  // 1.5s ကနေ 2s တိုးလိုက်တယ်

                        cell.dataset.winTimeout = timeoutId;
                    }
                }
            }
        }
    }

    console.log('Display complete, winning positions:', winningPositions.filter(v => v).length);

    // ===== ဒီနေရာမှာ ရွှေဒင်္ဂါးတွေရွာဖို့ ထည့်မယ် =====
    const hasWin = winningPositions.filter(v => v).length > 0;
    
    if (hasWin && gameState.winAmount > 0) {
        const winMultiplier = gameState.winAmount / gameState.betAmount;
        
        // နည်းနည်းစောင့်ပြီးမှ effect စမယ်
        setTimeout(() => {
            if (winMultiplier >= 100) {
                // MEGA WIN - မီးရှူးတန်းနဲ့ ရွှေဒင်္ဂါးအများကြီး
                if (typeof createFireworks === 'function') createFireworks(30);
                if (typeof startCoinRain === 'function') startCoinRain(150);
            } else if (winMultiplier >= 50) {
                // SUPER WIN
                if (typeof createFireworks === 'function') createFireworks(15);
                if (typeof startCoinRain === 'function') startCoinRain(80);
            } else if (winMultiplier >= 10) {
                // BIG WIN
                if (typeof startCoinRain === 'function') startCoinRain(40);
            } else if (winMultiplier >= 5) {
                // WIN
                if (typeof startCoinRain === 'function') startCoinRain(20);
            }
        }, 500);  // နည်းနည်းစောင့်ပြီးမှ effect စမယ်
    }
}


function highlightWinningSymbols(result) {
    const cells = document.querySelectorAll('.grid-cell');

    cells.forEach(cell => {
        cell.classList.remove('win-pulse');
    });

    for (let row = 0; row < 4; row++) {
        const symbol1 = result[0][row];
        const symbol2 = result[1][row];
        const symbol3 = result[2][row];

        if (symbol1 && symbol2 && symbol3 && symbol1 === symbol2 && symbol2 === symbol3) {
            [0,1,2].forEach(col => {
                const cellIndex = row * 5 + col;
                if (cells[cellIndex]) {
                    cells[cellIndex].classList.add('win-pulse');
                }
            });
        }
    }
}

// ============================================
// SCATTER FREE SYSTEM
// ============================================

function checkScatter(result) {
    let bonusCount = 0;

    for (let reel = 0; reel < 5; reel++) {
        for (let row = 0; row < 4; row++) {
            if (result[reel][row] === 'bonus') {
                bonusCount++;
            }
        }
    }

    console.log(` Bonus count: ${bonusCount}`);

    if (gameState.isFreeSpinning && bonusCount > 0) {
        gameState.scatterCount += bonusCount;
        gameState.totalScatter += bonusCount;
    }

    if (!gameState.isFreeSpinning && bonusCount >= 6) {
        startFreeSpins(bonusCount);
    }

    return bonusCount;
}

function startFreeSpins(bonusCount) {
    console.log(' Starting Free Spins!');

    gameState.isFreeSpinning = true;
    gameState.freeSpins = 10;
    gameState.scatterCount = bonusCount - 6;
    gameState.totalScatter = bonusCount;

    showFreeSpinStartAnimation(gameState.freeSpins);
    showFreeSpinIndicator();

    disableButtons(true);
    showNotification(`Free Spin ${gameState.freeSpins} ကြိမ် ရရှိပါသည်။`, 'success');

    performFreeSpin();
}

function performFreeSpin() {
    if (gameState.freeSpins > 0) {
        spin();
    } else {
        endFreeSpins();
    }
}

function endFreeSpins() {
    console.log(' Free Spins ended');

    showFreeSpinEndAnimation(gameState.totalScatter * gameState.betAmount);

    hideFreeSpinIndicator();

    gameState.isFreeSpinning = false;
    gameState.freeSpins = 0;
    gameState.scatterCount = 0;
    gameState.totalScatter = 0;

    disableButtons(false);
    showNotification('Free Spin ပြီးဆုံးပါသည်။', 'info');
}

function disableButtons(disable) {
    const spinBtn = document.getElementById('spinBtn');
    const betButtons = document.querySelectorAll('.bet-option, #decreaseBetBtn, #increaseBetBtn');

    if (spinBtn) {
        spinBtn.disabled = disable;
        spinBtn.style.opacity = disable ? '0.5' : '1';
        spinBtn.style.pointerEvents = disable ? 'none' : 'auto';
    }

    betButtons.forEach(btn => {
        btn.disabled = disable;
        btn.style.opacity = disable ? '0.5' : '1';
        btn.style.pointerEvents = disable ? 'none' : 'auto';
    });
}

function showFreeSpinStartAnimation(spins) {
    const overlay = document.createElement('div');
    overlay.id = 'freeSpinStartOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #2196f3aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: popIn 0.8s;">
            <div style="font-size: 100px; margin-bottom: 20px;"></div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd700;
                        text-shadow: 0 0 30px #ffaa00; margin-bottom: 20px;">
                FREE SPINS
            </div>
            <div style="font-size: 120px; font-weight: 900; color: #00ff00;
                        text-shadow: 0 0 40px #00ff00; margin-bottom: 30px;">
                ${spins}
            </div>
            <div style="font-size: 40px; color: white;">
                ကြိမ် ရရှိပါသည်။
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    if (typeof SoundManager !== 'undefined') {
        SoundManager.congratulations();
    }

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

function showFreeSpinIndicator() {
    let indicator = document.getElementById('freeSpinIndicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'freeSpinIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #2196f3, #1976d2);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: bold;
            z-index: 100000;
            box-shadow: 0 0 20px #2196f3;
            animation: pulse 1s infinite;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        document.body.appendChild(indicator);
    }

    indicator.innerHTML = `
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>FREE SPIN ${gameState.freeSpins}</span>
    `;
}

function hideFreeSpinIndicator() {
    const indicator = document.getElementById('freeSpinIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function showFreeSpinEndAnimation(totalWin) {
    const overlay = document.createElement('div');
    overlay.id = 'freeSpinEndOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #4caf50aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: popIn 0.8s;">
            <div style="font-size: 80px; margin-bottom: 20px;"></div>
            <div style="font-size: 60px; font-weight: 900; color: #ffd700; margin-bottom: 20px;">
                FREE SPINS ENDED
            </div>
            <div style="font-size: 80px; font-weight: 900; color: #00ff00;">
                +${formatNumber(totalWin)} ကျပ်
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

// ============================================
// 5. BALANCE & JACKPOT FUNCTIONS
// ============================================

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balanceAmount');
    const creditDisplay = document.getElementById('credit-display');

    if (balanceEl) {
        balanceEl.textContent = formatNumber(gameState.balance);
    }
    if (creditDisplay) {
        creditDisplay.textContent = formatNumber(gameState.balance);
    }
}

function updateWinDisplay(amount) {
    const winEl = document.getElementById('winAmount');
    if (winEl) {
        winEl.textContent = formatNumber(amount);
        winEl.classList.add('win-animation');
        setTimeout(() => {
            winEl.classList.remove('win-animation');
        }, 500);
    }
}

function updateUserBalanceInStorage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.balance = gameState.balance;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].balance = gameState.balance;
            localStorage.setItem('slotUsers', JSON.stringify(users));
        }
    }
}

function addJackpotContribution(amount) {
    try {
        const contribution = Math.floor(amount * 0.02);
        gameState.jackpot += contribution;

        const jackpotState = JSON.parse(localStorage.getItem('jackpotState')) || {
            totalPool: gameState.jackpot
        };
        jackpotState.totalPool = gameState.jackpot;
        localStorage.setItem('jackpotState', JSON.stringify(jackpotState));

        updateJackpotDisplay();
    } catch(e) {
        console.error('Error adding jackpot contribution:', e);
    }
}

function updateJackpotDisplay() {
    const jackpotEl = document.getElementById('jackpot-val');
    if (jackpotEl) {
        jackpotEl.textContent = formatNumber(gameState.jackpot);
    }
}

function loadJackpotFromAdmin() {
    try {
        const jackpotState = JSON.parse(localStorage.getItem('jackpotState'));
        if (jackpotState) {
            gameState.jackpot = jackpotState.totalPool || 100000;
            updateJackpotDisplay();
        }
    } catch(e) {
        console.error('Error loading jackpot:', e);
    }
}

function updateJackpotStats(winAmount) {
    try {
        const jackpotState = JSON.parse(localStorage.getItem('jackpotState')) || {
            totalPool: gameState.jackpot,
            mini: 50000,
            major: 200000,
            mega: 500000,
            todayWins: 0,
            todayContributions: 0,
            avgWin: 0,
            biggestWin: 0
        };

        jackpotState.totalPool = (jackpotState.totalPool || 0) - winAmount;
        jackpotState.todayWins = (jackpotState.todayWins || 0) + 1;
        jackpotState.todayContributions = (jackpotState.todayContributions || 0) + winAmount;

        const currentAvg = jackpotState.avgWin || 0;
        const currentCount = jackpotState.todayWins || 1;
        jackpotState.avgWin = Math.floor((currentAvg * (currentCount - 1) + winAmount) / currentCount);

        if (winAmount > (jackpotState.biggestWin || 0)) {
            jackpotState.biggestWin = winAmount;
        }

        localStorage.setItem('jackpotState', JSON.stringify(jackpotState));
    } catch(e) {
        console.error('Error updating jackpot stats:', e);
    }
}

function showBuffaloJackpot(amount, count) {
    const overlay = document.createElement('div');
    overlay.className = 'jackpot-overlay';
    overlay.id = 'buffaloJackpotOverlay';

    overlay.innerHTML = `
        <div class="jackpot-content">
            <h2>JACKPOT!</h2>
            <div class="jackpot-buffaloes"></div>
            <div class="jackpot-amount">${formatNumber(amount)} ကျပ်</div>
            <div class="jackpot-message">ကျော် ${count} ကောင် ဆုကြီးရရှိပါသည်။</div>
            <button class="jackpot-button" onclick="closeBuffaloJackpot()">ဝမ်းသာပါတယ်</button>
        </div>
    `;

    document.body.appendChild(overlay);
    createBuffaloConfetti();
}

function closeBuffaloJackpot() {
    const overlay = document.getElementById('buffaloJackpotOverlay');
    if (overlay) {
        overlay.classList.add('hide');
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }
}

function createBuffaloConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-explosion';
    container.id = 'buffaloConfetti';

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece-buffalo';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        container.appendChild(confetti);
    }

    document.body.appendChild(container);

    setTimeout(() => {
        const confettiEl = document.getElementById('buffaloConfetti');
        if (confettiEl) confettiEl.remove();
    }, 3000);
}

// ============================================
// 6. BUFFALO STAMPEDE ANIMATION
// ============================================

class BuffaloStampede {
    constructor() {
        this.container = null;
        this.stampedeCount = 0;
        this.maxStampedes = 3;
        this.interval = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'buffaloStampede';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99999;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    startStampede(winAmount, buffaloCount) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.stampedeCount = 0;
        this.winAmount = winAmount;
        this.buffaloCount = buffaloCount;

        this.runStampede();

        this.interval = setInterval(() => {
            this.stampedeCount++;

            if (this.stampedeCount < this.maxStampedes) {
                this.runStampede();
            } else {
                clearInterval(this.interval);
                this.interval = null;
            }
        }, 3000);
    }

    runStampede() {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        const stampedeNumber = this.stampedeCount + 1;

        const herd = document.createElement('div');
        herd.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 0;
            width: 100%;
            height: 200px;
            overflow: hidden;
        `;
        this.container.appendChild(herd);

        const totalBuffalo = Math.min(this.buffaloCount + this.stampedeCount, 12);

        for (let i = 0; i < totalBuffalo; i++) {
            const buffalo = document.createElement('div');

            const size = 70 + Math.random() * 30;
            const bottom = 10 + (i * 6);
            const delay = i * 0.1;
            const duration = 2 + Math.random() * 1.5;

            buffalo.style.cssText = `
                position: absolute;
                left: -150px;
                bottom: ${bottom}px;
                width: ${size}px;
                height: ${size * 0.7}px;
                background: ${this.stampedeCount === 2 ? '#DAA520' : '#8B4513'};
                border-radius: 50% 20% 20% 10%;
                animation: buffaloRun_${Date.now()}_${i} ${duration}s linear ${delay}s forwards;
                opacity: ${0.9 - (i * 0.03)};
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            `;

            buffalo.innerHTML = `
                <div style="position:absolute; top:-8px; left:15px; width:20px; height:25px; background:#654321; border-radius:50% 50% 0 0; transform:rotate(-20deg);"></div>
                <div style="position:absolute; top:-8px; right:15px; width:20px; height:25px; background:#654321; border-radius:50% 50% 0 0; transform:rotate(20deg);"></div>
                <div style="position:absolute; bottom:5px; left:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
                <div style="position:absolute; bottom:5px; right:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
            `;

            herd.appendChild(buffalo);

            const style = document.createElement('style');
            style.textContent = `
                @keyframes buffaloRun_${Date.now()}_${i} {
                    0% { left: -150px; transform: scale(0.8); }
                    100% { left: 120%; transform: scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }

        const dustCount = 30 + (this.stampedeCount * 10);
        for (let i = 0; i < dustCount; i++) {
            const dust = document.createElement('div');
            const size = 20 + Math.random() * 50;
            const left = Math.random() * 100;

            dust.style.cssText = `
                position: absolute;
                left: ${left}%;
                bottom: 30px;
                width: ${size}px;
                height: ${size * 0.5}px;
                background: rgba(139, 69, 19, ${0.2 + Math.random() * 0.5});
                border-radius: 50%;
                filter: blur(${3 + Math.random() * 8}px);
                animation: dustFloat_${Date.now()} ${1 + Math.random()}s ease-out forwards;
            `;
            this.container.appendChild(dust);
        }

        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100000;
            animation: messagePop 0.5s ease;
        `;

        let stampedeText = '';
        if (stampedeNumber === 1) stampedeText = '၁ ကြိမ်';
        else if (stampedeNumber === 2) stampedeText = '၂ ကြိမ်';
        else stampedeText = '၃ ကြိမ်';

        message.innerHTML = `
            <div style="font-size: 50px; font-weight: 900; color: #ffd700; text-shadow: 0 0 30px #ffaa00;">
                 STAMPEDE! x${stampedeNumber}
            </div>
            <div style="font-size: 40px; font-weight: 700; color: white; margin-top: 10px;">
                +${formatNumber(this.winAmount)} ကျပ်
            </div>
            <div style="font-size: 24px; color: #ffd700; margin-top: 5px;">
                ${stampedeText} ပြေး
            </div>
        `;
        this.container.appendChild(message);

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = `gameShake_${stampedeNumber} 0.2s linear`;
        }

        if (typeof SoundManager !== 'undefined') {
            SoundManager.buffalo();

            if (stampedeNumber === 2) {
                if (SoundManager.coinRain) SoundManager.coinRain();
            }
            if (stampedeNumber === 3) {
                if (SoundManager.victory) SoundManager.victory();
                if (SoundManager.sixCoin) SoundManager.sixCoin();
            }
        }

        setTimeout(() => {
            if (this.container) {
                this.container.innerHTML = '';
            }
        }, 2000);
    }

    stopStampede() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.container) {
            this.container.style.display = 'none';
            this.container.innerHTML = '';
        }
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = '';
        }
    }
}

const buffaloStampede = new BuffaloStampede();

// ============================================
// 7. AUTO SPIN (LONG PRESS)
// ============================================

let pressTimer;
let isLongPress = false;
let autoSpinActive = false;
let autoSpinCount = 0;
let autoSpinMax = 0;
let autoSpinInterval;
let isWaitingForWin = false;
const longPressDuration = 500;

const spinBtn = document.getElementById('spinBtn');

if (spinBtn) {
    spinBtn.removeEventListener('mousedown', startPress);
    spinBtn.removeEventListener('mouseup', cancelPress);
    spinBtn.removeEventListener('mouseleave', cancelPress);
    spinBtn.removeEventListener('touchstart', startPress);
    spinBtn.removeEventListener('touchend', cancelPress);
    spinBtn.removeEventListener('touchcancel', cancelPress);

    spinBtn.addEventListener('mousedown', startPress);
    spinBtn.addEventListener('mouseup', cancelPress);
    spinBtn.addEventListener('mouseleave', cancelPress);
    spinBtn.addEventListener('touchstart', startPress, { passive: false });
    spinBtn.addEventListener('touchend', cancelPress);
    spinBtn.addEventListener('touchcancel', cancelPress);
}

function startPress(e) {
    e.preventDefault();
    console.log(' mousedown/touchstart detected');

    if (autoSpinActive) {
        console.log('⏸️ Auto spin active, ignoring long press');
        return;
    }

    if (gameState.isSpinning) {
        console.log('⏸️ Already spinning, ignoring press');
        return;
    }

    isLongPress = false;

    if (pressTimer) {
        clearTimeout(pressTimer);
    }

    pressTimer = setTimeout(() => {
        console.log('⏰ Long press TRIGGERED after 500ms!');
        isLongPress = true;
        showAutoSpinModal();
    }, longPressDuration);
}

function cancelPress(e) {
    console.log(' mouseup/touchend detected');

    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }

    if (!isLongPress && !autoSpinActive && !gameState.isSpinning && !isWaitingForWin) {
        console.log(' Short press - calling spin()');
        spin();
    }

    isLongPress = false;
}

function showAutoSpinModal() {
    let modal = document.getElementById('autoSpinModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'autoSpinModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-sync-alt"></i> Auto Spin</h3>
                    <button class="close-btn" onclick="closeModal('autoSpinModal')">×</button>
                </div>
                <div class="modal-body">
                    <p style="color: white; margin-bottom: 20px;">အကြိမ်ရေ ရွေးချယ်ပါ</p>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        <button class="auto-spin-option" onclick="startAutoSpin(10)">၁၀ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(25)">၂၅ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(50)">၅၀ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(100)">၁၀၀ ကြိမ်</button>
                    </div>
                    <button class="secondary-btn" onclick="closeModal('autoSpinModal')">မလုပ်တော့ပါ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        if (!document.getElementById('auto-spin-styles')) {
            const style = document.createElement('style');
            style.id = 'auto-spin-styles';
            style.textContent = `
                .auto-spin-option {
                    padding: 15px;
                    background: linear-gradient(145deg, #ffd700, #ffaa00);
                    border: none;
                    border-radius: 15px;
                    color: #000;
                    font-weight: 700;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .auto-spin-option:active {
                    transform: scale(0.95);
                }
                .spin-btn.stop-mode {
                    background: linear-gradient(145deg, #ff4444, #cc0000) !important;
                    box-shadow: 0 10px 0 #880000 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    modal.style.display = 'flex';
}

function startAutoSpin(count) {
    closeModal('autoSpinModal');

    if (autoSpinActive) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < gameState.betAmount) {
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
        return;
    }

    if (gameState.isSpinning) {
        console.log('⏸️ Waiting for current spin to finish...');
        setTimeout(() => startAutoSpin(count), 500);
        return;
    }

    autoSpinActive = true;
    autoSpinCount = 0;
    autoSpinMax = count;
    isWaitingForWin = false;

    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-stop"></i> STOP';
        spinBtn.classList.add('stop-mode');
        spinBtn.onclick = stopAutoSpin;
    }

    showNotification(`Auto Spin စတင်ပါပြီ။ (${count} ကြိမ်)`, 'info');

    performAutoSpin();
}

function performAutoSpin() {
    if (!autoSpinActive) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < gameState.betAmount) {
        stopAutoSpin('balance');
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။ Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'error');
        return;
    }

    if (gameState.isSpinning) {
        console.log('⏸️ Already spinning, waiting...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    if (isWaitingForWin) {
        console.log('⏸️ Waiting for win animation...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    console.log(` Auto Spin #${autoSpinCount + 1}/${autoSpinMax}`);

    isWaitingForWin = true;

    spin();
}

function onSpinComplete(hasWon = false, winAmount = 0) {
    console.log('✅ Spin complete, checking auto spin...');
    console.log(`   Has won: ${hasWon}, Win amount: ${winAmount}`);

    gameState.isSpinning = false;

    if (autoSpinActive) {
        autoSpinCount++;

        console.log(` Auto spin progress: ${autoSpinCount}/${autoSpinMax}`);

        if (autoSpinCount >= autoSpinMax) {
            stopAutoSpin('completed');
            showNotification(`Auto Spin ပြီးဆုံးပါသည်။ (${autoSpinCount} ကြိမ်)`, 'success');
        } else {
            let delay = 2000;

            if (hasWon) {
                if (winAmount >= 50000) {
                    delay = 6000;
                } else if (winAmount >= 15000) {
                    delay = 5000;
                } else if (winAmount >= 5000) {
                    delay = 4000;
                } else {
                    delay = 3000;
                }
            }

            console.log(`⏱️ Next spin in ${delay}ms (win amount: ${winAmount})`);

            if (autoSpinInterval) {
                clearTimeout(autoSpinInterval);
            }

            autoSpinInterval = setTimeout(() => {
                isWaitingForWin = false;
                performAutoSpin();
            }, delay);
        }
    } else {
        isWaitingForWin = false;
    }
}

function stopAutoSpin(reason = 'manual') {
    console.log(` Stopping auto spin: ${reason}`);

    autoSpinActive = false;
    isWaitingForWin = false;

    if (autoSpinInterval) {
        clearTimeout(autoSpinInterval);
        autoSpinInterval = null;
    }

    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN';
        spinBtn.classList.remove('stop-mode');
        spinBtn.onclick = null;
        spinBtn.onclick = function() {
            if (!gameState.isSpinning && !autoSpinActive) {
                spin();
            }
        };
    }

    if (reason === 'manual') {
        showNotification('Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'info');
    }

    console.log(`Auto spin stopped: ${reason}`);
}

// ============================================
// 8. USER SURPRISE BOX
// ============================================

let userSurpriseData = null;
let selectedBoxIndices = [];
const MAX_USER_SELECTIONS = 5;

function checkUserSurprise() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const userSurpriseKey = `userSurprise_${currentUser.id}`;
    const surpriseJson = localStorage.getItem(userSurpriseKey);

    if (surpriseJson) {
        try {
            const data = JSON.parse(surpriseJson);
            if (data.status === 'pending') {
                userSurpriseData = data;
                showUserSurpriseModal();
            }
        } catch(e) {
            console.error('Error parsing surprise data:', e);
        }
    }
}

function showUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (!modal || !userSurpriseData) return;

    selectedBoxIndices = [];
    document.getElementById('userSurpriseResult').style.display = 'none';
    document.getElementById('claimUserSurpriseBtn').disabled = true;

    renderUserBoxGrid();
    updateUserSelectionDisplay();

    modal.style.display = 'flex';
}

function renderUserBoxGrid() {
    const grid = document.getElementById('userBoxGrid');
    if (!grid || !userSurpriseData) return;

    let html = '';

    userSurpriseData.boxes.forEach((box, index) => {
        const isSelected = selectedBoxIndices.includes(index);
        const isOpened = box.opened;

        let bgColor = '#9e9e9e';
        let borderColor = '#9e9e9e';
        let icon = 'fa-box';
        let iconColor = '#9e9e9e';

        if (box.type === 'credit') {
            bgColor = '#00c85320';
            borderColor = '#00c853';
            icon = 'fa-coins';
            iconColor = '#00c853';
        } else if (box.type === 'vip') {
            bgColor = '#ffd70020';
            borderColor = '#ffd700';
            icon = 'fa-crown';
            iconColor = '#ffd700';
        } else if (box.type === 'freespin') {
            bgColor = '#2196f320';
            borderColor = '#2196f3';
            icon = 'fa-play-circle';
            iconColor = '#2196f3';
        } else {
            bgColor = '#9e9e9e20';
            borderColor = '#9e9e9e';
            icon = 'fa-smile';
            iconColor = '#9e9e9e';
        }

        html += `
            <div onclick="${!isOpened ? `selectUserBox(${index})` : ''}"
                 style="background: ${bgColor};
                        border: 2px solid ${borderColor};
                        border-radius: 12px;
                        padding: 10px 5px;
                        text-align: center;
                        cursor: ${!isOpened ? 'pointer' : 'default'};
                        opacity: ${isOpened ? '0.5' : '1'};
                        ${isSelected ? 'box-shadow: 0 0 15px ' + borderColor + '; transform: scale(1.05);' : ''}
                        transition: all 0.2s;">
                <i class="fas ${icon}" style="color: ${iconColor}; font-size: 24px;"></i>
                <div style="color: white; font-size: 12px; margin-top: 5px;">Box ${index + 1}</div>
                ${isOpened ? '<div style="color: #ff5252; font-size: 10px;"><i class="fas fa-check-circle"></i> ဖွင့်ပြီး</div>' : ''}
                ${isSelected ? '<div style="color: #ffd700; font-size: 10px;"><i class="fas fa-check"></i> ရွေးပြီး</div>' : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

function selectUserBox(index) {
    if (selectedBoxIndices.includes(index)) {
        selectedBoxIndices = selectedBoxIndices.filter(i => i !== index);
    } else {
        if (selectedBoxIndices.length >= MAX_USER_SELECTIONS) {
            alert(`သင်ရွေးချယ်ခွင့် အများဆုံး ${MAX_USER_SELECTIONS} ခုသာရှိပါသည်။`);
            return;
        }
        selectedBoxIndices.push(index);
    }

    renderUserBoxGrid();
    updateUserSelectionDisplay();

    document.getElementById('claimUserSurpriseBtn').disabled = selectedBoxIndices.length === 0;
}

function updateUserSelectionDisplay() {
    const remaining = MAX_USER_SELECTIONS - selectedBoxIndices.length;
    const countEl = document.getElementById('userSelectionCount');
    const progressEl = document.getElementById('selectionProgress');
    const selectedContainer = document.getElementById('userSelectedBoxes');

    if (countEl) {
        countEl.textContent = `သင်ရွေးချယ်ရန် ကျန် ${remaining} ခု`;
    }

    if (progressEl) {
        const percent = (selectedBoxIndices.length / MAX_USER_SELECTIONS) * 100;
        progressEl.style.width = percent + '%';
    }
    
    if (selectedContainer) {
        if (selectedBoxIndices.length === 0) {
            selectedContainer.innerHTML = '<span style="color: rgba(255,255,255,0.5);">Box မရွေးရသေးပါ။</span>';
        } else {
            let html = '';
            selectedBoxIndices.forEach(idx => {
                const box = userSurpriseData.boxes[idx];
                let color = '#9e9e9e';
                if (box.type === 'credit') color = '#00c853';
                else if (box.type === 'vip') color = '#ffd700';
                else if (box.type === 'freespin') color = '#2196f3';
                html += `
                    <span style="background: ${color}20; border: 1px solid ${color}; border-radius: 15px; padding:5px 12px; color: white; font-size: 13px;">
                        Box ${idx + 1}
                    </span>
                `;
            });
            selectedContainer.innerHTML = html;
        }
    }
}

function claimUserSurprise() {
    if (selectedBoxIndices.length === 0 || !userSurpriseData) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('User data not found!');
        return;
    }

    let totalCredits = 0;
    let vipUpgrade = 0;
    let totalSpins = 0;
    let thankYouCount = 0;

    selectedBoxIndices.forEach(index => {
        const box = userSurpriseData.boxes[index];

        if (!box.opened) {
            box.opened = true;
            box.openedBy = currentUser.username;
            box.openedAt = new Date().toISOString();

            if (box.type === 'credit') {
                totalCredits += box.amount;
                currentUser.balance = (currentUser.balance || 0) + box.amount;
            } else if (box.type === 'vip') {
                vipUpgrade++;
                currentUser.vip = (currentUser.vip || 0) + 1;
            } else if (box.type === 'freespin') {
                totalSpins += box.spins;
                currentUser.freeSpins = (currentUser.freeSpins || 0) + box.spins;
            } else {
                thankYouCount++;
            }
        }
    });

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInUsersList(currentUser);

    userSurpriseData.status = 'completed';
    userSurpriseData.completedAt = new Date().toISOString();
    userSurpriseData.selectedBoxes = selectedBoxIndices;

    saveUserSurpriseHistory(currentUser, userSurpriseData, selectedBoxIndices);

    const userSurpriseKey = `userSurprise_${currentUser.id}`;
    localStorage.removeItem(userSurpriseKey);

    gameState.balance = currentUser.balance;
    updateBalanceDisplay();

    showUserSurpriseResult(totalCredits, vipUpgrade, totalSpins, thankYouCount);

    document.getElementById('claimUserSurpriseBtn').disabled = true;
}

function updateUserInUsersList(updatedUser) {
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('slotUsers', JSON.stringify(users));
    }
}

function saveUserSurpriseHistory(user, surpriseData, selectedIndices) {
    const history = JSON.parse(localStorage.getItem('surpriseHistory')) || [];

    const selectedPrizes = selectedIndices.map(index => {
        const box = surpriseData.boxes[index];
        return {
            boxNumber: index + 1,
            type: box.type,
            value: box.amount || box.spins || 0
        };
    });

    history.push({
        time: new Date().toISOString(),
        username: user.username,
        userId: user.id,
        type: 'user_claimed',
        selectedBoxes: selectedIndices.map(i => i + 1),
        prizes: selectedPrizes,
        totalCredits: selectedPrizes.filter(p => p.type === 'credit').reduce((sum, p) => sum + p.value, 0),
        totalSpins: selectedPrizes.filter(p => p.type === 'freespin').reduce((sum, p) => sum + p.value, 0),
        vipUpgrades: selectedPrizes.filter(p => p.type === 'vip').length
    });

    localStorage.setItem('surpriseHistory', JSON.stringify(history));
}

function showUserSurpriseResult(credits, vip, spins, thankYou) {
    const resultDiv = document.getElementById('userSurpriseResult');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');

    resultDiv.style.display = 'block';

    if (credits > 0) {
        icon.className = 'fas fa-coins';
        icon.style.color = '#00c853';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = `ငွေ ${formatNumber(credits)} ကျပ် ရရှိပါသည်။`;
    } else if (vip > 0) {
        icon.className = 'fas fa-crown';
        icon.style.color = '#ffd700';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = 'VIP အဆင့်တိုးပါသည်။';
    } else if (spins > 0) {
        icon.className = 'fas fa-play-circle';
        icon.style.color = '#2196f3';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = `Free Spin ${spins} ကြိမ် ရရှိပါသည်။`;
    } else {
        icon.className = 'fas fa-smile';
        icon.style.color = '#9e9e9e';
        title.textContent = 'ကံကောင်းပါစေ။';
        message.textContent = 'ကျေးဇူးတင်ပါတယ်။ နောက်တစ်ကြိမ် ကံစမ်းပါ။';
    }

    renderUserBoxGrid();

    setTimeout(() => {
        if (resultDiv.style.display === 'block') {
            closeUserSurpriseModal();
        }
    }, 5000);
}

function closeUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (modal) {
        modal.style.display = 'none';
    }

    if (userSurpriseData && userSurpriseData.boxes.every(b => b.opened)) {
        userSurpriseData = null;
    }
}

// ============================================
// 9. WIN HISTORY & CELEBRATION
// ============================================

function addWinToHistory(amount) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (historyList.innerHTML.includes('No wins')) {
        historyList.innerHTML = '';
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const winItem = document.createElement('div');
    winItem.className = 'win-item';
    winItem.innerHTML = `<span>${time}</span><span>+${formatNumber(amount)}</span>`;

    historyList.prepend(winItem);

    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

function showCelebration(type, amount, username = 'Admin') {
    const notification = document.getElementById('celebrationNotification');
    const icon = document.getElementById('celebrationIcon').querySelector('i');
    const title = document.getElementById('celebrationTitle');
    const message = document.getElementById('celebrationMessage');
    const amountEl = document.getElementById('celebrationAmount');

    let iconClass = 'fa-gift';
    let iconColor = '#ffd700';
    let titleText = 'ဆုလက်ဆောင်';
    let messageText = '';
    let amountText = '';

    switch(type) {
        case 'credit':
            iconClass = 'fa-coins';
            iconColor = '#00c853';
            titleText = 'ငွေလက်ဆောင်';
            messageText = `${username} ထံမှ`;
            amountText = `${formatNumber(amount)} ကျပ်`;
            break;
        case 'vip':
            iconClass = 'fa-crown';
            iconColor = '#ffd700';
            titleText = 'VIP လက်ဆောင်';
            messageText = `${username} က သင့်အား`;
            amountText = 'VIP အဆင့်တိုးပေးခဲ့သည်';
            break;
        case 'freespin':
            iconClass = 'fa-play-circle';
            iconColor = '#2196f3';
            titleText = 'Free Spin လက်ဆောင်';
            messageText = `${username} ထံမှ`;
            amountText = `Free Spin ${amount} ကြိမ်`;
            break;
    }

    icon.className = 'fas ' + iconClass;
    icon.style.color = iconColor;
    title.textContent = titleText;
    title.style.color = iconColor;
    message.textContent = messageText;
    amountEl.textContent = amountText;
    amountEl.style.color = iconColor;

    notification.classList.add('show');
    createConfetti();

    if (type === 'credit') {
        createFloatingNumbers(amount);
    }

    setTimeout(() => {
        closeCelebration();
    }, 5000);
}

function createConfetti() {
    const container = document.getElementById('celebrationConfetti');
    if (!container) return;

    container.innerHTML = '';
    const colors = ['#ffd700', '#00c853', '#2196f3', '#ff5252', '#ffaa00'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        container.appendChild(confetti);
    }
}

function createFloatingNumbers(amount) {
    const container = document.getElementById('floatingNumbers');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        const num = document.createElement('div');
        num.className = 'floating-number';
        num.style.left = Math.random() * 100 + '%';
        num.style.top = Math.random() * 100 + '%';
        num.style.animationDelay = Math.random() * 0.5 + 's';
        num.textContent = '+' + formatNumber(amount);
        container.appendChild(num);

        setTimeout(() => {
            num.remove();
        }, 2000);
    }
}

function closeCelebration() {
    const notification = document.getElementById('celebrationNotification');
    if (notification) {
        notification.classList.remove('show');
    }
    const confetti = document.getElementById('celebrationConfetti');
    if (confetti) {
        confetti.innerHTML = '';
    }
}

// ============================================
// 10. PENDING GIFT FUNCTIONS
// ============================================

function checkPendingGiftOnSpin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const pendingGiftKey = `pendingGift_${currentUser.id}`;
    const pendingGiftJson = localStorage.getItem(pendingGiftKey);

    if (pendingGiftJson) {
        try {
            const pendingGift = JSON.parse(pendingGiftJson);

            gameState.spinCounter = (gameState.spinCounter || 0) + 1;
            console.log(`Spin counter: ${gameState.spinCounter}/${gameState.pendingGiftSpins}`);

            if (gameState.spinCounter >= gameState.pendingGiftSpins) {
                console.log(' Gift triggered!');

                if (typeof showCelebration === 'function') {
                    showCelebration(pendingGift.type, pendingGift.amount, 'Admin');
                }

                if (pendingGift.type === 'credit') {
                    currentUser.balance = (currentUser.balance || 0) + pendingGift.amount;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    gameState.balance = currentUser.balance;
                    updateBalanceDisplay();
                }

                localStorage.removeItem(pendingGiftKey);
                gameState.spinCounter = 0;
            } else {
                const remaining = gameState.pendingGiftSpins - gameState.spinCounter;
                if (remaining === 2 || remaining === 1) {
                    showNotification(`လက်ဆောင်ပေါ်ရန် နောက်ထပ် ${remaining} ချက်`, 'info');
                }
            }
        } catch(e) {
            console.error('Error checking pending gift:', e);
        }
    } else {
        gameState.spinCounter = 0;
    }
}

function showAdminJackpot(username, amount) {
    console.log(` Admin Jackpot to ${username}: ${amount}`);

    const overlay = document.createElement('div');
    overlay.id = 'adminJackpotOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #ffd70022);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    content.innerHTML = `
        <div style="font-size: 80px; font-weight: 900; color: #ffd700;
                    text-shadow: 0 0 30px #ffaa00, 0 0 60px #ff5500;
                    margin-bottom: 20px;">
             JACKPOT 
        </div>
        <div style="font-size: 50px; color: white; margin-bottom: 30px;">
            ${username} ရှင့်
        </div>
        <div style="font-size: 120px; font-weight: 900; color: #00ff00;
                    text-shadow: 0 0 40px #00ff00, 0 0 80px #00aa00;
                    margin-bottom: 40px;
                    animation: pulse 1s infinite;">
            +${amount.toLocaleString()} ကျပ်
        </div>
        <div style="font-size: 40px; color: #ffd700;">
            ကျေးဇူးတင်ပါသည်။
        </div>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    if (typeof SoundManager !== 'undefined') {
        SoundManager.congratulations();
        SoundManager.sixCoin();
        SoundManager.victory();
    }

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${30 + Math.random() * 30}px;
                color: ${['#ffd700', '#c0c0c0', '#cd7f32'][Math.floor(Math.random() * 3)]};
                z-index: 1000001;
                animation: coinFall ${2 + Math.random() * 3}s linear forwards;
                text-shadow: 0 0 10px gold;
            `;
            coin.innerHTML = ['', '', '', ''][Math.floor(Math.random() * 4)];
            document.body.appendChild(coin);
            setTimeout(() => coin.remove(), 5000);
        }, i * 50);
    }

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 8000);
}

// ============================================
// 11. LEVEL UP FUNCTIONS
// ============================================

function checkLevelUp() {
    if (gameState.spinCount > 0 && gameState.spinCount % 100 === 0) {
        gameState.userLevel++;

        const levelEl = document.getElementById('userLevel');
        if (levelEl) {
            levelEl.textContent = gameState.userLevel;
        }

        showNotification('✨ Level Up! Level ' + gameState.userLevel + ' သို့တက်ရောက်ပါသည်။ ✨', 'success');

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            currentUser.level = gameState.userLevel;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
}

// ============================================
// 12. UTILITY FUNCTIONS
// ============================================

function formatNumber(num) {
    if (num === undefined || num === null) return '0';
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

function playButtonSound() {
    if (typeof SoundManager !== 'undefined') {
        SoundManager.button();
    }
}

function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`⚠️ Element "${id}" not found`);
        return null;
    }
    return el;
}

function setStyle(id, property, value) {
    const el = getElement(id);
    if (el) {
        el.style[property] = value;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function playWinSounds(totalWin, winLines) {
    if (typeof SoundManager === 'undefined') return;

    SoundManager.win();

    if (totalWin > gameState.betAmount * 50) {
        SoundManager.victory();
    }

    winLines.forEach(line => {
        switch(line.symbol) {
            case 'buffalo':
                SoundManager.buffalo();
                break;
            case 'coin':
                if (totalWin > 10000) {
                    SoundManager.coinRain();
                } else {
                    SoundManager.coin();
                }
                break;
        }
    });

    if (winLines.some(l => l.line === 'JACKPOT')) {
        SoundManager.sixCoin();
        SoundManager.victory();
    }
}

function showWinLinesInfo(winLines) {
    if (winLines.length === 0) return;

    showWinSummary(winLines);

    const winAmount = document.getElementById('winAmount');
    if (winAmount) {
        let message = '';
        winLines.forEach(line => {
            if (line.line === 'JACKPOT') {
                message += ` ${line.name}: ${formatNumber(line.win)} ကျပ်\n`;
            } else {
                const emoji = getSymbolEmoji(line.symbol);
                message += `${emoji} ${line.symbol} ${line.count} လုံး = ${formatNumber(line.win)} ကျပ် (${line.multiplier}x, C: ${line.cMultiplier}x)\n`;
            }
        });
        winAmount.setAttribute('title', message);
    }
}

function getSymbolEmoji(symbol) {
    const emojiMap = {
        'seven': '7️⃣',
        'lion': '',
        'buffalo': '',
        'ele': '',
        'tha': '',
        'zebra': '',
        'ayeaye': '️',
        'bonus': '',
        'wild': '',
        'coin': ''
    };
    return emojiMap[symbol] || '';
}

function showWinSummary(winLines) {
    if (winLines.length === 0) return;

    const oldPanel = document.getElementById('winSummaryPanel');
    if (oldPanel) oldPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'winSummaryPanel';
    panel.className = 'win-summary-panel show';

    let totalWin = 0;
    let itemsHtml = '';

    winLines.forEach(line => {
        totalWin += line.win || 0;

        const emoji = getSymbolEmoji(line.symbol) || '';

        itemsHtml += `
            <div class="win-combination-item">
                <div class="win-symbol">${emoji}</div>
                <div class="win-details">
                    <div style="font-weight: bold; color: ${getSymbolColor(line.symbol)}; text-transform: capitalize;">
                        ${line.symbol}
                    </div>
                    <div style="font-size: 12px; opacity: 0.8;">
                        ${line.count} လုံး x ${line.multiplier || 1}
                        ${line.wilds ? '• Wild ' + line.wilds + 'ခု' : ''}
                        ${line.cMultiplier ? '• C ' + line.cMultiplier + 'x' : ''}
                    </div>
                </div>
                <div style="color: #00ff00; font-weight: bold;">
                    +${formatNumber(line.win)}
                </div>
            </div>
        `;
    });

    panel.innerHTML = `
        <div class="win-summary-header">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-trophy" style="color: gold; font-size: 24px;"></i>
                <span style="font-size: 20px; font-weight: bold;">WINNER</span>
            </div>
            <span style="color: gold; font-size: 14px;">✨</span>
        </div>
        <div class="win-items">
            ${itemsHtml}
        </div>
        <div class="win-total">
            <div>စုစုပေါင်း</div>
            <div style="font-size: 24px;">${formatNumber(totalWin)} ကျပ်</div>
        </div>
    `;

    document.body.appendChild(panel);
    
    function getSymbolColor(symbolName) {
        const colorMap = {
            'seven': '#FFD700',
            'lion': '#FFA500',
            'buffalo': '#8B4513',
            'ele': '#808080',
            'tha': '#FF69B4',
            'zebra': '#000000',
            'ayeaye': '#9ACD32',
            'bonus': '#FF00FF',
            'wild': '#FF0000',
            'coin': '#FFD700',
            'jackpot': '#FF4081'
        };
        return colorMap[symbolName.toLowerCase()] || '#FF5252';
    }

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin-fall';
            coin.style.left = Math.random() * 100 + '%';
            coin.style.animationDuration = 2 + Math.random() * 2 + 's';
            coin.style.fontSize = (20 + Math.random() * 30) + 'px';
            coin.innerHTML = ['', '', ''][Math.floor(Math.random() * 3)];
            coin.style.color = ['#FFD700', '#C0C0C0', '#FF69B4'][Math.floor(Math.random() * 3)];
            document.body.appendChild(coin);
            setTimeout(() => coin.remove(), 3000);
        }, i * 100);
    }

    setTimeout(() => {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 500);
    }, 5000);
}

// ============================================
// 13. CSS ANIMATIONS
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes winPulse {
        0%, 100% { transform: scale(1); border-color: #ffd700; box-shadow: 0 0 20px #ffd700; }
        50% { transform: scale(1.1); border-color: #00c853; box-shadow: 0 0 40px #00c853; }
    }

    @keyframes jackpotPulse {
        0%, 100% { transform: scale(1); border-color: #ffd700; box-shadow: 0 0 30px #ffd700; }
        50% { transform: scale(1.05); border-color: #ff6b6b; box-shadow: 0 0 60px #ff6b6b; }
    }

    .grid-cell.spinning {
        animation: spinShake 0.1s linear infinite;
    }

    @keyframes spinShake {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px); }
        75% { transform: translateY(5px); }
    }

    .grid-cell.buffalo-win {
        animation: buffaloGlow 0.5s ease infinite;
    }

    @keyframes buffaloGlow {
        0%, 100% { border-color: #8B4513; box-shadow: 0 0 20px #8B4513; }
        50% { border-color: #ffd700; box-shadow: 0 0 40px #ffd700; }
    }

    @keyframes dustFloat {
        0% { opacity: 0.8; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-150px) scale(2); }
    }

    @keyframes messagePop {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    @keyframes gameShake_1 {
        0%,100% { transform: translate(0,0); }
        25% { transform: translate(-5px,-2px); }
        75% { transform: translate(5px,2px); }
    }

    @keyframes gameShake_2 {
        0%,100% { transform: translate(0,0); }
        25% { transform: translate(-8px,-4px); }
        75% { transform: translate(8px,4px); }
    }

    @keyframes gameShake_3 {
        0%,100% { transform: translate(0,0); }
        25% { transform: translate(-12px,-6px); }
        75% { transform: translate(12px,6px); }
    }

    .spin-btn.stop-mode {
        background: linear-gradient(145deg, #ff4444, #cc0000) !important;
        box-shadow: 0 10px 0 #880000 !important;
    }
`;
document.head.appendChild(style);

// ============================================
// 14. WIN ANIMATIONS
// ============================================

const WinAnimations = (function() {
    function addWinStyles() {
        if (document.getElementById('win-animation-styles')) return;

        const style = document.createElement('style');
        style.id = 'win-animation-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&family=Rubik+Glitch&display=swap');

            .win-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 999999;
                width: 100%;
                pointer-events: none;
            }

            .big-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 20px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #ff6600;
                text-shadow:
                    1px 1px 0 #993300,
                    2px 2px 0 #993300,
                    3px 3px 0 #993300,
                    4px 4px 0 #993300,
                    5px 5px 0 #993300,
                    6px 6px 0 #993300,
                    7px 7px 0 #993300,
                    8px 8px 0 #993300,
                    9px 9px 0 #993300,
                    10px 10px 0 #993300,
                    11px 11px 0 #993300,
                    12px 12px 0 #993300,
                    13px 13px 0 #663300,
                    14px 14px 0 #663300,
                    15px 15px 0 #663300,
                    16px 16px 0 #663300,
                    17px 17px 0 #663300,
                    18px 18px 0 #663300,
                    19px 19px 0 #663300,
                    20px 20px 0 #663300,
                    0 0 30px #ff6600,
                    0 0 60px #ff3300,
                    0 0 90px #ff0000;
                animation: bigSpinAndStop 4s ease-in-out forwards;
            }

            @keyframes bigSpinAndStop {
                0% { transform: rotate(0deg) scale(1); filter: brightness(1); }
                10% { transform: rotate(360deg) scale(1.2); filter: brightness(1.5); }
                20% { transform: rotate(720deg) scale(1.1); filter: brightness(1.3); }
                30% { transform: rotate(1080deg) scale(1.2); filter: brightness(1.5); }
                40% { transform: rotate(1440deg) scale(1.1); filter: brightness(1.3); }
                50% { transform: rotate(1800deg) scale(1.2); filter: brightness(1.5); }
                60% { transform: rotate(2160deg) scale(1.1); filter: brightness(1.3); }
                70% { transform: rotate(2520deg) scale(1); filter: brightness(1); }
                80%, 100% { transform: rotate(2520deg) scale(1); filter: brightness(1); }
            }

            .mega-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 25px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #00ffcc;
                text-shadow:
                    1px 1px 0 #0088aa,
                    2px 2px 0 #0088aa,
                    3px 3px 0 #0088aa,
                    4px 4px 0 #0088aa,
                    5px 5px 0 #0088aa,
                    6px 6px 0 #0088aa,
                    7px 7px 0 #0088aa,
                    8px 8px 0 #0088aa,
                    9px 9px 0 #0088aa,
                    10px 10px 0 #0088aa,
                    11px 11px 0 #006688,
                    12px 12px 0 #006688,
                    13px 13px 0 #006688,
                    14px 14px 0 #006688,
                    15px 15px 0 #006688,
                    16px 16px 0 #006688,
                    17px 17px 0 #006688,
                    18px 18px 0 #006688,
                    19px 19px 0 #006688,
                    20px 20px 0 #006688,
                    21px 21px 0 #004466,
                    22px 22px 0 #004466,
                    23px 23px 0 #004466,
                    24px 24px 0 #004466,
                    25px 25px 0 #004466,
                    26px 26px 0 #004466,
                    27px 27px 0 #004466,
                    28px 28px 0 #004466,
                    29px 29px 0 #004466,
                    30px 30px 0 #004466,
                    0 0 30px #00ffff,
                    0 0 60px #ff00ff,
                    0 0 90px #00ffff,
                    0 0 120px #ff00ff,
                    0 0 150px #ffff00;
                animation: megaColorChange 3s linear forwards, megaMove 0.2s ease-in-out 3, megaPulse 0.5s ease-in-out 3;
            }

            @keyframes megaColorChange {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }

            @keyframes megaMove {
                0% { transform: translate(0, 0); }
                25% { transform: translate(20px, -20px); }
                50% { transform: translate(-20px, 20px); }
                75% { transform: translate(20px, 20px); }
                100% { transform: translate(0, 0); }
            }

            @keyframes megaPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .super-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 25px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #ffdd00;
                text-shadow:
                    1px 1px 0 #aa8800,
                    2px 2px 0 #aa8800,
                    3px 3px 0 #aa8800,
                    4px 4px 0 #aa8800,
                    5px 5px 0 #aa8800,
                    6px 6px 0 #aa8800,
                    7px 7px 0 #aa8800,
                    8px 8px 0 #aa8800,
                    9px 9px 0 #aa8800,
                    10px 10px 0 #aa8800,
                    11px 11px 0 #886600,
                    12px 12px 0 #886600,
                    13px 13px 0 #886600,
                    14px 14px 0 #886600,
                    15px 15px 0 #886600,
                    16px 16px 0 #886600,
                    17px 17px 0 #886600,
                    18px 18px 0 #886600,
                    19px 19px 0 #886600,
                    20px 20px 0 #886600,
                    21px 21px 0 #664400,
                    22px 22px 0 #664400,
                    23px 23px 0 #664400,
                    24px 24px 0 #664400,
                    25px 25px 0 #664400,
                    26px 26px 0 #664400,
                    27px 27px 0 #664400,
                    28px 28px 0 #664400,
                    29px 29px 0 #664400,
                    30px 30px 0 #664400,
                    0 0 30px #ffaa00,
                    0 0 60px #ff5500,
                    0 0 90px #ff0000,
                    0 0 120px #ff00ff,
                    0 0 150px #00ffff;
                animation: superColorChange 2.5s linear forwards, superMove 0.15s ease-in-out 3, superPulse 0.4s ease-in-out 3;
            }

            @keyframes superColorChange {
                0% { filter: hue-rotate(0deg) brightness(1); }
                50% { filter: hue-rotate(180deg) brightness(1.5); }
                100% { filter: hue-rotate(360deg) brightness(1); }
            }

            @keyframes superMove {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -30px) rotate(5deg); }
                66% { transform: translate(-30px, 30px) rotate(-5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }

            @keyframes superPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }

            .coin-particle {
                position: fixed;
                top: -10vh;
                font-size: 35px;
                pointer-events: none;
                z-index: 999998;
                animation: coinFall linear forwards;
                text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
            }

            @keyframes coinFall {
                0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                100% { transform: translateY(110vh) rotate(1080deg) scale(0.1); opacity: 0; }
            }

            .splash-effect {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999997;
            }

            .splash {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: splashExpand 1.5s ease-out forwards;
                filter: blur(15px);
                mix-blend-mode: screen;
            }

            @keyframes splashExpand {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(5); opacity: 0; }
            }

            .dj-lights {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999996;
                pointer-events: none;
            }

            .light-beam {
                position: absolute;
                width: 30%;
                height: 30%;
                filter: blur(40px);
                opacity: 0.5;
                mix-blend-mode: screen;
                animation: beamMove 8s ease-in-out infinite;
            }

            @keyframes beamMove {
                0% { transform: rotate(0deg) scale(1); opacity: 0.5; }
                50% { transform: rotate(180deg) scale(1.5); opacity: 0.8; }
                100% { transform: rotate(360deg) scale(1); opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Win animation CSS added');
    }

    function removeAllWinElements() {
        const container = document.getElementById('win-animation-container');
        if (container) container.remove();

        document.querySelectorAll('div').forEach(el => {
            if (el.innerHTML && (
                el.innerHTML.includes('BIG WIN') ||
                el.innerHTML.includes('MEGA WIN') ||
                el.innerHTML.includes('SUPER WIN')
            )) {
                if (el.parentNode) el.remove();
            }
        });

        document.querySelectorAll('[class*="win-text"], [class*="WIN"], .big-win-text, .mega-win-text, .super-win-text').forEach(el => {
            if (el && el.parentNode) el.remove();
        });

        document.querySelectorAll('.coin-particle, #splash-container, #dj-lights-container, .splash-effect, .dj-lights').forEach(el => {
            if (el && el.parentNode) el.remove();
        });
    }

    function createDJLights() {
        const lightsContainer = document.createElement('div');
        lightsContainer.id = 'dj-lights-container';
        lightsContainer.className = 'dj-lights';
        document.body.appendChild(lightsContainer);

        const positions = [
            { top: '10%', left: '10%', bg: 'rgba(0, 255, 255, 0.7), rgba(255, 0, 255, 0.4)' },
            { top: '60%', right: '10%', bg: 'rgba(255, 0, 255, 0.7), rgba(0, 255, 255, 0.4)' },
            { bottom: '20%', left: '20%', bg: 'rgba(255, 255, 0, 0.7), rgba(0, 255, 255, 0.4)' },
            { top: '30%', right: '30%', bg: 'rgba(0, 255, 0, 0.7), rgba(255, 0, 255, 0.4)' },
            { bottom: '40%', right: '40%', bg: 'rgba(255, 165, 0, 0.7), rgba(255, 0, 255, 0.4)' }
        ];

        positions.forEach((pos, index) => {
            const beam = document.createElement('div');
            beam.className = 'light-beam';
            beam.style.background = `radial-gradient(ellipse at center, ${pos.bg}, transparent 80%)`;
            beam.style.animation = `beamMove ${8 + index * 2}s ease-in-out infinite`;

            Object.keys(pos).forEach(key => {
                if (key !== 'bg') {
                    beam.style[key] = pos[key];
                }
            });

            lightsContainer.appendChild(beam);
        });
    }

    function createSplash(count = 30) {
        const splashContainer = document.createElement('div');
        splashContainer.id = 'splash-container';
        splashContainer.className = 'splash-effect';
        document.body.appendChild(splashContainer);

        const colors = [
            'rgba(0, 255, 255, 0.9)',
            'rgba(255, 0, 255, 0.9)',
            'rgba(255, 255, 0, 0.9)',
            'rgba(0, 255, 0, 0.9)',
            'rgba(255, 102, 0, 0.9)',
            'rgba(255, 51, 153, 0.9)'
        ];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const splash = document.createElement('div');
                splash.className = 'splash';

                const color = colors[Math.floor(Math.random() * colors.length)];
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const size = Math.random() * 400 + 200;

                splash.style.background = `radial-gradient(circle, ${color} 0%, transparent 80%)`;
                splash.style.left = x + 'px';
                splash.style.top = y + 'px';
                splash.style.width = size + 'px';
                splash.style.height = size + 'px';
                splash.style.marginLeft = -size/2 + 'px';
                splash.style.marginTop = -size/2 + 'px';

                splashContainer.appendChild(splash);
            }, i * 40);
        }
    }

    function createCoins(count = 50) {
        const symbols = ['', '', '', '⭐', '✨', '', '', ''];
        const colors = ['#00ffcc', '#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600', '#ff3388'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'coin-particle';
                coin.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                coin.style.color = colors[Math.floor(Math.random() * colors.length)];
                coin.style.left = Math.random() * 100 + '%';
                coin.style.animationDuration = (Math.random() * 4 + 2) + 's';
                coin.style.fontSize = (Math.random() * 40 + 20) + 'px';
                document.body.appendChild(coin);
            }, i * 30);
        }
    }

    function showAnimation(type, text) {
        console.log(` ${type} animation starting`);

        removeAllWinElements();
        addWinStyles();

        const container = document.createElement('div');
        container.id = 'win-animation-container';
        container.className = 'win-container';
        document.body.appendChild(container);

        const div = document.createElement('div');
        div.className = `${type}-win-text`;
        div.textContent = text;
        container.appendChild(div);

        if (type === 'big') {
            createCoins(60);
            createSplash(25);
        } else if (type === 'mega') {
            createDJLights();
            createCoins(80);
            createSplash(30);
        } else if (type === 'super') {
            createDJLights();
            createCoins(100);
            createSplash(40);
        }

        console.log(`✨ ${type} animation displayed`);

        setTimeout(() => {
            console.log(`⏰ Removing ${type} animation`);
            removeAllWinElements();
        }, 5000);
    }

    return {
        big: () => showAnimation('big', 'BIG WIN'),
        mega: () => showAnimation('mega', 'MEGA WIN'),
        super: () => showAnimation('super', 'SUPER WIN'),
        clear: removeAllWinElements
    };
})();

// ============================================
// 15. EXPORT GLOBALS
// ============================================

window.spin = spin;
window.closeUserSurpriseModal = closeUserSurpriseModal;
window.selectUserBox = selectUserBox;
window.claimUserSurprise = claimUserSurprise;
window.closeBuffaloJackpot = closeBuffaloJackpot;
window.showCelebration = showCelebration;
window.closeModal = closeModal;
window.stopAutoSpin = stopAutoSpin;
window.startAutoSpin = startAutoSpin;
window.WinAnimations = WinAnimations;

console.log('✅ game.js loaded with organized sections (FIXED)');
