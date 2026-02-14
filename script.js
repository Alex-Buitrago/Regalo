// ==========================================
// CONFIGURACIÓN DEL JUEGO
// ==========================================

const gameState = {
    isPlaying: false,
    score: 0,
    lives: 3,
    currentLevel: 1,
    totalLevels: 2,
    gameOver: false
};

// Mensajes entre niveles
const loveMessages = {
    1: "Mi amor, con cada paso que damos juntos, construimos nuestro camino. ¡Gracias por estar siempre a mi lado! 💕"
};

// ==========================================
// CONFIGURACIÓN DEL CANVAS
// ==========================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight - 100;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ==========================================
// JUGADOR (DogDay)
// ==========================================

const player = {
    x: 100,
    y: 0,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    speed: 6,
    jumpPower: -16,
    gravity: 0.8,
    isJumping: false
};

// ==========================================
// NIVELES - SOLO 2 NIVELES FÁCILES
// ==========================================

const levels = {
    1: {
        worldWidth: 2000,
        platforms: [
            { x: 0, y: 500, width: 800, height: 100 },
            { x: 300, y: 420, width: 200, height: 20 },
            { x: 600, y: 360, width: 200, height: 20 },
            { x: 900, y: 400, width: 200, height: 20 },
            { x: 1200, y: 440, width: 200, height: 20 },
            { x: 1500, y: 410, width: 200, height: 20 },
            { x: 1800, y: 460, width: 200, height: 20 }
        ],
        pizzas: [
            { x: 350, y: 380 },
            { x: 650, y: 320 },
            { x: 950, y: 360 },
            { x: 1250, y: 400 },
            { x: 1550, y: 370 },
            { x: 1850, y: 420 }
        ],
        enemies: [
            { platformIndex: 2, speed: 1.2 },
            { platformIndex: 4, speed: 1.2 }
        ],
        goal: { x: 1900, y: 400 }
    },
    2: {
        worldWidth: 2500,
        platforms: [
            { x: 0, y: 500, width: 600, height: 100 },
            { x: 250, y: 430, width: 180, height: 20 },
            { x: 500, y: 370, width: 180, height: 20 },
            { x: 750, y: 330, width: 200, height: 20 },
            { x: 1050, y: 390, width: 180, height: 20 },
            { x: 1300, y: 350, width: 180, height: 20 },
            { x: 1550, y: 410, width: 200, height: 20 },
            { x: 1850, y: 370, width: 180, height: 20 },
            { x: 2100, y: 430, width: 180, height: 20 },
            { x: 2350, y: 460, width: 150, height: 20 }
        ],
        pizzas: [
            { x: 300, y: 390 },
            { x: 550, y: 330 },
            { x: 800, y: 290 },
            { x: 1100, y: 350 },
            { x: 1350, y: 310 },
            { x: 1600, y: 370 },
            { x: 1900, y: 330 },
            { x: 2150, y: 390 },
            { x: 2400, y: 420 }
        ],
        enemies: [
            { platformIndex: 2, speed: 1.5 },
            { platformIndex: 4, speed: 1.5 },
            { platformIndex: 6, speed: 1.5 }
        ],
        movingPlatforms: [
            { x: 1000, y: 230, width: 120, height: 20, startX: 1000, endX: 1200, speed: 1.5 }
        ],
        goal: { x: 2400, y: 400 }
    }
};

// ==========================================
// VARIABLES DEL JUEGO
// ==========================================

let platforms = [];
let pizzas = [];
let enemies = [];
let movingPlatforms = [];
const camera = { x: 0, y: 0 };

// ==========================================
// CONTROLES
// ==========================================

const keys = {
    left: false,
    right: false,
    space: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') {
        e.preventDefault();
        keys.space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.space = false;
});

// Controles móviles
document.getElementById('left-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});
document.getElementById('left-btn').addEventListener('touchend', () => keys.left = false);
document.getElementById('left-btn').addEventListener('mousedown', () => keys.left = true);
document.getElementById('left-btn').addEventListener('mouseup', () => keys.left = false);

document.getElementById('right-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});
document.getElementById('right-btn').addEventListener('touchend', () => keys.right = false);
document.getElementById('right-btn').addEventListener('mousedown', () => keys.right = true);
document.getElementById('right-btn').addEventListener('mouseup', () => keys.right = false);

document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.space = true;
    setTimeout(() => keys.space = false, 200);
});
document.getElementById('jump-btn').addEventListener('mousedown', () => {
    keys.space = true;
    setTimeout(() => keys.space = false, 200);
});

// ==========================================
// CARGAR NIVEL
// ==========================================

function loadLevel(levelNum) {
    const level = levels[levelNum];
    
    platforms = level.platforms.map(p => ({...p}));
    pizzas = level.pizzas.map(p => ({...p, size: 25, collected: false}));
    
    enemies = level.enemies.map(e => {
        const platform = platforms[e.platformIndex];
        return {
            platformIndex: e.platformIndex,
            platform: platform,
            x: platform.x + 20,
            y: platform.y - 35,
            width: 35,
            height: 35,
            speed: e.speed,
            direction: 1,
            minX: platform.x + 10,
            maxX: platform.x + platform.width - 45
        };
    });
    
    movingPlatforms = (level.movingPlatforms || []).map(mp => ({
        ...mp,
        direction: 1,
        currentX: mp.x
    }));
    
    player.x = 100;
    player.y = 400;
    player.velocityY = 0;
    player.velocityX = 0;
    player.isJumping = false;
    
    camera.x = 0;
    
    gameState.currentLevel = levelNum;
    document.getElementById('current-level').textContent = levelNum;
}

// ==========================================
// ACTUALIZAR JUGADOR
// ==========================================

function updatePlayer() {
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }

    player.x += player.velocityX;

    if (keys.space && !player.isJumping) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
    }

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    for (let platform of [...platforms, ...movingPlatforms]) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 20 &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            
            if (platform.velocityX) {
                player.x += platform.velocityX;
            }
            break;
        }
    }

    if (player.y + player.height > canvas.height) {
        loseLife();
    }

    const worldWidth = levels[gameState.currentLevel].worldWidth;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;

    camera.x = player.x - canvas.width / 3;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > worldWidth - canvas.width) camera.x = worldWidth - canvas.width;
}

// ==========================================
// ACTUALIZAR ENEMIGOS
// ==========================================

function updateEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.speed * enemy.direction;
        
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.direction *= -1;
        }
        
        enemy.y = enemy.platform.y - enemy.height;

        if (
            player.x + player.width - 8 > enemy.x &&
            player.x + 8 < enemy.x + enemy.width &&
            player.y + player.height - 8 > enemy.y &&
            player.y + 8 < enemy.y + enemy.height
        ) {
            loseLife();
        }
    }
}

// ==========================================
// ACTUALIZAR PLATAFORMAS MÓVILES
// ==========================================

function updateMovingPlatforms() {
    for (let platform of movingPlatforms) {
        platform.currentX += platform.speed * platform.direction;
        
        if (platform.currentX <= platform.startX || platform.currentX >= platform.endX) {
            platform.direction *= -1;
        }
        
        platform.x = platform.currentX;
        platform.velocityX = platform.speed * platform.direction;
    }
}

// ==========================================
// COLECTAR PIZZAS
// ==========================================

function checkPizzaCollection() {
    for (let pizza of pizzas) {
        if (!pizza.collected) {
            const distance = Math.hypot(
                (player.x + player.width / 2) - pizza.x,
                (player.y + player.height / 2) - pizza.y
            );
            if (distance < pizza.size + player.width / 2) {
                pizza.collected = true;
                gameState.score++;
                updateScore();
            }
        }
    }
}

// ==========================================
// VERIFICAR META
// ==========================================

function checkGoal() {
    const goal = levels[gameState.currentLevel].goal;
    const goalWidth = 40;
    const goalHeight = 40;
    
    if (
        player.x + player.width > goal.x &&
        player.x < goal.x + goalWidth &&
        player.y + player.height > goal.y &&
        player.y < goal.y + goalHeight
    ) {
        if (gameState.currentLevel >= gameState.totalLevels) {
            // Nivel 2 completado - Mostrar propuesta
            showProposalScene();
        } else {
            // Nivel 1 completado - Mostrar modal
            showLevelCompleteModal();
        }
    }
}

// ==========================================
// SISTEMA DE VIDAS
// ==========================================

function loseLife() {
    if (gameState.lives > 0) {
        gameState.lives--;
        updateLives();
        
        player.x = 100;
        player.y = 400;
        player.velocityY = 0;
        player.velocityX = 0;
        camera.x = 0;

        if (gameState.lives === 0) {
            gameOver();
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-life';
        heart.textContent = '💜';
        livesContainer.appendChild(heart);
    }
}

// ==========================================
// MODALES Y PANTALLAS
// ==========================================

function showLevelCompleteModal() {
    gameState.isPlaying = false;
    const message = loveMessages[gameState.currentLevel];
    document.getElementById('level-message').textContent = message;
    document.getElementById('level-complete-modal').classList.add('active');
}

function hideLevelCompleteModal() {
    document.getElementById('level-complete-modal').classList.remove('active');
}

function nextLevel() {
    hideLevelCompleteModal();
    setTimeout(() => {
        loadLevel(gameState.currentLevel + 1);
        gameState.isPlaying = true;
        gameLoop();
    }, 300);
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.gameOver = true;
    showScreen('gameover-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ==========================================
// ESCENA DE PROPUESTA (NIVEL 2 COMPLETADO)
// ==========================================

function showProposalScene() {
    gameState.isPlaying = false;
    showScreen('proposal-screen');
    startProposalAnimation();
}

function startProposalAnimation() {
    const canvas = document.getElementById('proposal-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    let animationStep = 0;
    let ringVisible = false;
    
    function animateProposal() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Cielo nocturno
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#0a0a1a');
        skyGradient.addColorStop(0.5, '#1a1a3a');
        skyGradient.addColorStop(1, '#2a2a4a');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Estrellas
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 53) % (canvas.height * 0.6);
            const size = ((i * 7) % 3) + 1;
            const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
            ctx.globalAlpha = twinkle;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
        
        // Luna
        ctx.fillStyle = '#f0e68c';
        ctx.beginPath();
        ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Océano
        const oceanGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        oceanGradient.addColorStop(0, '#1a3a5a');
        oceanGradient.addColorStop(1, '#0a1a2a');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
        
        // Olas
        ctx.strokeStyle = '#2a4a6a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const offset = (Date.now() * 0.0005 + i) * 50;
            for (let x = 0; x < canvas.width; x += 20) {
                const y = canvas.height * 0.6 + 20 * i + Math.sin((x + offset) * 0.02) * 5;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Arena
        ctx.fillStyle = '#d4b896';
        ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
        
        // Personajes sentados
        const centerX = canvas.width / 2;
        const beachY = canvas.height * 0.75;
        
        drawBeachCharacter(ctx, centerX - 80, beachY, 'dogday');
        drawBeachCharacter(ctx, centerX + 40, beachY, 'catnap');
        
        // Animación del anillo
        animationStep++;
        if (animationStep > 60 && !ringVisible) {
            ringVisible = true;
        }
        
        if (ringVisible && animationStep < 180) {
            const ringX = centerX - 40;
            const ringY = beachY - 20 + Math.sin(animationStep * 0.1) * 5;
            
            // Brillo del anillo
            const ringGradient = ctx.createRadialGradient(ringX, ringY, 0, ringX, ringY, 20);
            ringGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            ringGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = ringGradient;
            ctx.fillRect(ringX - 20, ringY - 20, 40, 40);
            
            // Anillo
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ringX, ringY, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Diamante
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(ringX, ringY - 12);
            ctx.lineTo(ringX - 4, ringY - 8);
            ctx.lineTo(ringX, ringY);
            ctx.lineTo(ringX + 4, ringY - 8);
            ctx.closePath();
            ctx.fill();
            
            // Destellos
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + animationStep * 0.1;
                const dist = 15 + Math.sin(animationStep * 0.05) * 3;
                const sx = ringX + Math.cos(angle) * dist;
                const sy = ringY + Math.sin(angle) * dist;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
        
        if (animationStep === 180) {
            document.getElementById('proposal-message').classList.add('show');
        } else if (animationStep < 180) {
            requestAnimationFrame(animateProposal);
        }
    }
    
    animateProposal();
}

function drawBeachCharacter(ctx, x, y, type) {
    const size = 6;
    
    if (type === 'dogday') {
        const orange = '#FF8C00';
        const black = '#000000';
        const white = '#FFFFFF';
        
        // Cuerpo
        ctx.fillStyle = orange;
        ctx.fillRect(x, y, size * 6, size * 4);
        
        // Cabeza
        ctx.fillRect(x + size, y - size * 5, size * 4, size * 4);
        
        // Orejas
        ctx.fillRect(x, y - size * 5, size, size * 2);
        ctx.fillRect(x + size * 5, y - size * 5, size, size * 2);
        
        // Ojos
        ctx.fillStyle = black;
        ctx.fillRect(x + size * 1.5, y - size * 3.5, size, size);
        ctx.fillRect(x + size * 3.5, y - size * 3.5, size, size);
        
        // Brillo
        ctx.fillStyle = white;
        ctx.fillRect(x + size * 1.5, y - size * 3.5, size * 0.4, size * 0.4);
        ctx.fillRect(x + size * 3.5, y - size * 3.5, size * 0.4, size * 0.4);
        
        // Sonrisa
        ctx.fillStyle = black;
        ctx.fillRect(x + size * 2, y - size * 2, size * 2, size * 0.5);
        
    } else if (type === 'catnap') {
        const purple = '#9370DB';
        const black = '#000000';
        const white = '#FFFFFF';
        
        // Cuerpo
        ctx.fillStyle = purple;
        ctx.fillRect(x, y, size * 6, size * 4);
        
        // Cabeza
        ctx.fillRect(x + size, y - size * 5, size * 4, size * 4);
        
        // Orejas puntiagudas
        ctx.fillRect(x + size, y - size * 6, size, size);
        ctx.fillRect(x + size * 4, y - size * 6, size, size);
        
        // Ojos cerrados
        ctx.fillStyle = black;
        ctx.fillRect(x + size * 1.5, y - size * 3.5, size * 1.5, size * 0.4);
        ctx.fillRect(x + size * 3, y - size * 3.5, size * 1.5, size * 0.4);
        
        // Sonrisa
        ctx.fillRect(x + size * 2, y - size * 2, size * 2, size * 0.5);
    }
}

// ==========================================
// FUNCIONES DE DIBUJO
// ==========================================

function drawPixelRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nubes pixel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const cloudPixels = [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 0]
    ];
    
    const pixelSize = 8;
    drawPixelCloud(100 - camera.x * 0.5, 80, cloudPixels, pixelSize);
    drawPixelCloud(400 - camera.x * 0.5, 120, cloudPixels, pixelSize);
    drawPixelCloud(700 - camera.x * 0.3, 90, cloudPixels, pixelSize);
}

function drawPixelCloud(startX, startY, pattern, size) {
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
                ctx.fillRect(
                    Math.floor(startX + col * size),
                    Math.floor(startY + row * size),
                    size,
                    size
                );
            }
        }
    }
}

function drawPlatforms() {
    for (let platform of [...platforms, ...movingPlatforms]) {
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        drawPixelRect(
            platform.x - camera.x + 3,
            platform.y + 3,
            platform.width,
            platform.height
        );

        // Plataforma
        const gradient = ctx.createLinearGradient(
            platform.x - camera.x,
            platform.y,
            platform.x - camera.x,
            platform.y + platform.height
        );
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        drawPixelRect(
            platform.x - camera.x,
            platform.y,
            platform.width,
            platform.height
        );

        // Textura
        ctx.fillStyle = '#a0522d';
        for (let i = 0; i < platform.width; i += 16) {
            drawPixelRect(
                platform.x - camera.x + i,
                platform.y + 2,
                8,
                3
            );
        }
    }
}

// DogDay Chibi
function drawPlayer() {
    const x = Math.floor(player.x - camera.x);
    const y = Math.floor(player.y);
    const size = 5;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 8, y + player.height + 2, player.width - 16, 6);

    const orange = '#FF8C00';
    const yellow = '#FFD700';
    const black = '#000000';
    const white = '#FFFFFF';
    
    // Cabeza
    ctx.fillStyle = orange;
    const head = [
        [0,1,1,1,1,0],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [0,1,1,1,1,0]
    ];
    
    for (let row = 0; row < head.length; row++) {
        for (let col = 0; col < head[row].length; col++) {
            if (head[row][col] === 1) {
                drawPixelRect(x + col * size, y + row * size, size, size);
            }
        }
    }
    
    // Orejas
    ctx.fillStyle = orange;
    drawPixelRect(x, y + size, size, size * 2);
    drawPixelRect(x + 6 * size, y + size, size, size * 2);
    
    ctx.fillStyle = yellow;
    drawPixelRect(x + size/2, y + size * 1.5, size/2, size/2);
    drawPixelRect(x + 6 * size + size/2, y + size * 1.5, size/2, size/2);
    
    // Ojos
    ctx.fillStyle = black;
    drawPixelRect(x + 1.5 * size, y + 2 * size, size, size);
    drawPixelRect(x + 4.5 * size, y + 2 * size, size, size);
    
    ctx.fillStyle = white;
    drawPixelRect(x + 1.5 * size, y + 2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 4.5 * size, y + 2 * size, size * 0.4, size * 0.4);
    
    // Nariz
    ctx.fillStyle = black;
    drawPixelRect(x + 3 * size, y + 3.5 * size, size * 0.6, size * 0.6);
    
    // Sonrisa
    ctx.fillStyle = black;
    drawPixelRect(x + 1.5 * size, y + 4 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 2 * size, y + 4.3 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 2.5 * size, y + 4.5 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 3.5 * size, y + 4.5 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 4 * size, y + 4.3 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 4.5 * size, y + 4 * size, size * 0.5, size * 0.5);
    
    // Medallón
    ctx.fillStyle = yellow;
    drawPixelRect(x + 2.5 * size, y + 6.5 * size, size, size);
}

function drawPizzas() {
    for (let pizza of pizzas) {
        if (!pizza.collected) {
            const x = Math.floor(pizza.x - camera.x);
            const y = Math.floor(pizza.y);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, pizza.size);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - pizza.size, y - pizza.size, pizza.size * 2, pizza.size * 2);

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FF6347';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const px = x + Math.cos(angle) * 6;
                const py = y + Math.sin(angle) * 6;
                ctx.fillRect(Math.floor(px) - 2, Math.floor(py) - 2, 4, 4);
            }
        }
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        const x = Math.floor(enemy.x - camera.x);
        const y = Math.floor(enemy.y);
        const size = 5;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 5, y + enemy.height + 2, enemy.width - 10, 6);

        const dark = '#1a1a1a';
        ctx.fillStyle = dark;
        
        const blobShape = [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ];
        
        for (let row = 0; row < blobShape.length; row++) {
            for (let col = 0; col < blobShape[row].length; col++) {
                if (blobShape[row][col] === 1) {
                    drawPixelRect(x + col * size, y + row * size, size, size);
                }
            }
        }

        ctx.fillStyle = '#ff0000';
        drawPixelRect(x + 2 * size, y + 2 * size, size, size);
        drawPixelRect(x + 5 * size, y + 2 * size, size, size);
    }
}

function drawGoal() {
    const goal = levels[gameState.currentLevel].goal;
    const x = Math.floor(goal.x - camera.x);
    const y = Math.floor(goal.y);
    const size = 5;
    
    const gradient = ctx.createRadialGradient(x + 15, y + 15, 0, x + 15, y + 15, 40);
    gradient.addColorStop(0, 'rgba(147, 112, 219, 0.7)');
    gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 15, y - 15, 80, 80);

    const purple = '#9370DB';
    const darkPurple = '#8B008B';
    const white = '#FFFFFF';
    const black = '#000000';
    
    // Cabeza CatNap
    ctx.fillStyle = purple;
    const head = [
        [0,1,1,1,1,0],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [0,1,1,1,1,0]
    ];
    
    for (let row = 0; row < head.length; row++) {
        for (let col = 0; col < head[row].length; col++) {
            if (head[row][col] === 1) {
                drawPixelRect(x + col * size, y + row * size, size, size);
            }
        }
    }
    
    // Orejas puntiagudas
    ctx.fillStyle = purple;
    drawPixelRect(x + size, y - size/2, size, size);
    drawPixelRect(x + 5 * size, y - size/2, size, size);
    
    // Ojos cerrados
    ctx.fillStyle = black;
    drawPixelRect(x + 1.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 2 * size, y + 1.8 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 2.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    
    drawPixelRect(x + 3.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 4 * size, y + 1.8 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 4.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    
    // Nariz
    ctx.fillStyle = darkPurple;
    drawPixelRect(x + 3 * size, y + 3.5 * size, size * 0.5, size * 0.5);
    
    // Sonrisa
    drawPixelRect(x + 2 * size, y + 4 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 2.5 * size, y + 4.2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 3 * size, y + 4.3 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 3.5 * size, y + 4.2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 4 * size, y + 4 * size, size * 0.4, size * 0.4);
    
    // Corazón flotante
    const heartY = y - 20 + Math.sin(Date.now() * 0.005) * 8;
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    const time = Math.floor(Date.now() / 800);
    ctx.fillText((time % 2 === 0) ? '❤️' : '💜', x + 15, heartY);
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
    if (!gameState.isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlatforms();
    drawPizzas();
    drawEnemies();
    drawGoal();
    drawPlayer();

    updatePlayer();
    updateEnemies();
    updateMovingPlatforms();
    checkPizzaCollection();
    checkGoal();

    requestAnimationFrame(gameLoop);
}

// ==========================================
// INICIAR JUEGO
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;

    loadLevel(1);
    updateScore();
    updateLives();
    showScreen('game-screen');
    gameLoop();
}

// ==========================================
// BOTONES
// ==========================================

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('retry-button').addEventListener('click', startGame);
document.getElementById('next-level-btn').addEventListener('click', nextLevel);
document.getElementById('restart-from-proposal').addEventListener('click', startGame);

showScreen('start-screen');
