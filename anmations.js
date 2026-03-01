// ============================================
// WIN ANIMATIONS - FIXED WITH REMOVE() METHOD
// ============================================

const WinAnimations = (function() {

// ၁။ CSS ကို ထည့်မယ်
function addWinStyles() { 
    if (document.getElementById('win-animation-styles')) return; 
    const style = document.createElement('style'); 
    style.id = 'win-animation-styles'; 
    style.textContent = ` 
        /* ========== FONTS ========== */ 
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&family=Rubik+Glitch&display=swap'); 

        /* ========== BASE STYLES ========== */ 
        .win-container { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            text-align: center; 
            z-index: 9999; 
            width: 100%; 
            perspective: 1000px; 
            pointer-events: none; 
        }

        /* ========== BIG WIN ========== */
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

        /* ========== MEGA WIN ========== */
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
            0% { color: #00ffcc; }
            20% { color: #ff00ff; }
            40% { color: #ffff00; }
            60% { color: #00ff00; }
            80% { color: #ff6600; }
            100% { color: #00ffcc; }
        }

        @keyframes megaMove {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(2px, -2px) rotate(0.5deg) scale(1.02); }
            50% { transform: translate(-2px, 2px) rotate(-0.5deg) scale(0.98); }
            75% { transform: translate(2px, 2px) rotate(0.5deg) scale(1.01); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }

        @keyframes megaPulse {
            0%, 100% { filter: brightness(1) contrast(1); }
            50% { filter: brightness(1.5) contrast(1.2); }
        }

        /* ========== SUPER WIN ========== */
        .super-win-text {
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
            animation: superColorChange 2.5s linear forwards, superMove 0.15s ease-in-out 3, superPulse 0.4s ease-in-out 3;
        }

        @keyframes superColorChange {
            0% { color: #00ffcc; }
            20% { color: #ff00ff; }
            40% { color: #ffff00; }
            60% { color: #00ff00; }
            80% { color: #ff6600; }
            100% { color: #00ffcc; }
        }

        @keyframes superMove {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(3px, -3px) rotate(0.8deg) scale(1.03); }
            50% { transform: translate(-3px, 3px) rotate(-0.8deg) scale(0.97); }
            75% { transform: translate(3px, 3px) rotate(0.8deg) scale(1.02); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }

        @keyframes superPulse {
            0%, 100% { filter: brightness(1) contrast(1); }
            50% { filter: brightness(1.6) contrast(1.3); }
        }

        /* ========== COINS & PARTICLES ========== */
        .coin-particle {
            position: fixed;
            top: -10vh;
            font-size: 35px;
            pointer-events: none;
            z-index: 9998;
            animation: coinFall linear forwards;
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
        }

        @keyframes coinFall {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(110vh) rotate(1080deg) scale(0.1); opacity: 0; }
        }

        /* ========== SPLASH EFFECT ========== */
        .splash-effect {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9997;
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

        /* ========== DJ LIGHTS ========== */
        .dj-lights {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9996;
            pointer-events: none;
        }

        .light-beam {
            position: absolute;
            width: 30%;
            height: 30%;
            filter: blur(40px);
            animation: beamMove 8s ease-in-out infinite;
            opacity: 0.5;
            mix-blend-mode: screen;
        }

        @keyframes beamMove1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            33% { transform: translate(10%, 10%) rotate(120deg) scale(1.2); }
            66% { transform: translate(-10%, -10%) rotate(240deg) scale(0.8); }
        }

        @keyframes beamMove2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(-15%, 15%) rotate(90deg) scale(1.3); }
            50% { transform: translate(15%, -15%) rotate(180deg) scale(0.7); }
            75% { transform: translate(-15%, -15%) rotate(270deg) scale(1.1); }
        }
    `; 
    document.head.appendChild(style); 
    console.log('✅ Win animation CSS added'); 
}

// ၂။ Container ဖန်တီးမယ်
function createContainer() { 
    let container = document.getElementById('win-animation-container'); 
    if (!container) { 
        container = document.createElement('div'); 
        container.id = 'win-animation-container'; 
        container.className = 'win-container'; 
        document.body.appendChild(container); 
    } 
    return container; 
}

// ၃။ ပိုက်ဆံပြားတွေ ဖန်တီးမယ်
function createCoins(count = 50) { 
    const symbols = ['🪙', '💰', '💎', '⭐', '✨', '💫']; 
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
            coin.style.opacity = Math.random() * 0.9 + 0.1; 
            document.body.appendChild(coin); 
            setTimeout(() => coin.remove(), 6000); 
        }, i * 30); 
    } 
}

// ၄။ ရေပန်းပက်တာ ဖန်တီးမယ်
function createSplash(count = 30) { 
    let splashContainer = document.getElementById('splash-container'); 
    if (!splashContainer) { 
        splashContainer = document.createElement('div'); 
        splashContainer.id = 'splash-container'; 
        splashContainer.className = 'splash-effect'; 
        document.body.appendChild(splashContainer); 
    } 
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
            setTimeout(() => splash.remove(), 1500); 
        }, i * 40); 
    } 
}

// ၅။ DJ မီးတန်းတွေ ဖန်တီးမယ်
function createDJLights() { 
    let lightsContainer = document.getElementById('dj-lights-container'); 
    if (!lightsContainer) { 
        lightsContainer = document.createElement('div'); 
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
            beam.style.animation = `beamMove${index + 1} ${8 + index * 2}s ease-in-out infinite`; 
            Object.keys(pos).forEach(key => { 
                if (key !== 'bg') { 
                    beam.style[key] = pos[key]; 
                } 
            }); 
            lightsContainer.appendChild(beam); 
        }); 
    } 
}

// ၆။ Container ကိုရှင်းမယ် (remove() သုံးပြီး တစ်ခါတည်းဖျက်)
function removeAll() { 
    // Main container ကိုဖျက်
    const container = document.getElementById('win-animation-container'); 
    if (container && container.parentNode) { 
        container.parentNode.removeChild(container); 
    } 
    
    // Coins တွေကိုဖျက်
    document.querySelectorAll('.coin-particle').forEach(el => { 
        if (el.parentNode) el.parentNode.removeChild(el); 
    }); 
    
    // Splash container ကိုဖျက်
    const splashContainer = document.getElementById('splash-container'); 
    if (splashContainer && splashContainer.parentNode) { 
        splashContainer.parentNode.removeChild(splashContainer); 
    } 
    
    // Lights container ကိုဖျက်
    const lightsContainer = document.getElementById('dj-lights-container'); 
    if (lightsContainer && lightsContainer.parentNode) { 
        lightsContainer.parentNode.removeChild(lightsContainer); 
    } 
    
    console.log('🧹 All animation elements removed'); 
}

// ၇။ BIG WIN ပြမယ်
function showBigWin() { 
    addWinStyles(); 
    removeAll(); // အရင်ရှိတာတွေကိုဖျက်
    const container = createContainer(); 
    const div = document.createElement('div'); 
    div.className = 'big-win-text'; 
    div.textContent = 'BIG WIN'; 
    container.appendChild(div); 
    createCoins(60); 
    createSplash(25); 
    console.log('🎰 BIG WIN animation started'); 
    
    // ၆ စက္ကန့်ကြာရင် အကုန်ဖျက်
    setTimeout(() => { 
        removeAll(); 
        console.log('🎰 BIG WIN hidden'); 
    }, 6000); 
}

// ၈။ MEGA WIN ပြမယ်
function showMegaWin() { 
    addWinStyles(); 
    removeAll(); 
    const container = createContainer(); 
    const div = document.createElement('div'); 
    div.className = 'mega-win-text'; 
    div.textContent = 'MEGA WIN'; 
    container.appendChild(div); 
    createDJLights(); 
    createCoins(80); 
    createSplash(30); 
    console.log('🎰 MEGA WIN animation started'); 
    
    setTimeout(() => { 
        removeAll(); 
        console.log('🎰 MEGA WIN hidden'); 
    }, 6000); 
}

// ၉။ SUPER WIN ပြမယ်
function showSuperWin() { 
    addWinStyles(); 
    removeAll(); 
    const container = createContainer(); 
    const div = document.createElement('div'); 
    div.className = 'super-win-text'; 
    div.textContent = 'SUPER WIN'; 
    container.appendChild(div); 
    createDJLights(); 
    createCoins(100); 
    createSplash(40); 
    console.log('🎰 SUPER WIN animation started'); 
    
    setTimeout(() => { 
        removeAll(); 
        console.log('🎰 SUPER WIN hidden'); 
    }, 6000); 
}

// Public API
return { 
    big: showBigWin, 
    mega: showMegaWin, 
    super: showSuperWin, 
    clear: removeAll 
}; 

})();

console.log('✅ WinAnimations loaded with remove() method - guaranteed to disappear after 6 seconds');
