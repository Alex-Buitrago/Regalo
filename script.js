// Game state
const gameState = {
    isPlaying: false,
    score: 0,
    lives: 3,
    currentLevel: 1,
    totalLevels: 5,
    gameOver: false,
    won: false
};

// Love messages for each level
const loveMessages = {
    1: "Mi amor, con cada paso que damos juntos, construimos nuestro camino. ¡Gracias por estar siempre a mi lado! 💕",
    2: "Eres la razón por la que cada día tiene sentido. Tu sonrisa ilumina mi mundo. ¡Sigamos adelante juntos! ❤️",
    3: "No importa cuántos obstáculos encontremos, contigo todo es posible. Eres mi fuerza y mi inspiración. 💖",
    4: "Cada momento a tu lado es un tesoro. Gracias por ser mi compañero de aventuras en esta vida. ¡Ya casi llegamos! 🌟",
    5: "Final - ¡Has llegado al final del viaje!"
};

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Resize canvas
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight - 100;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Player (DogDay)
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
    isJumping: false,
    facingRight: true
};

// Game elements
let platforms = [];
let pizzas = [];
let enemies = [];
let movingPlatforms = [];

// Camera
const camera = {
    x: 0,
    y: 0
};

// Levels configuration
const levels = {
    1: {
        worldWidth: 3000,
        platforms: [
            { x: 0, y: 500, width: 800, height: 100 },
            { x: 300, y: 400, width: 150, height: 20 },
            { x: 550, y: 320, width: 150, height: 20 },
            { x: 800, y: 280, width: 200, height: 20 },
            { x: 1100, y: 360, width: 150, height: 20 },
            { x: 1350, y: 440, width: 150, height: 20 },
            { x: 1600, y: 360, width: 200, height: 20 },
            { x: 1900, y: 280, width: 150, height: 20 },
            { x: 2150, y: 380, width: 150, height: 20 },
            { x: 2400, y: 320, width: 150, height: 20 },
            { x: 2650, y: 400, width: 350, height: 20 }
        ],
        pizzas: [
            { x: 350, y: 360 }, { x: 600, y: 280 }, { x: 850, y: 240 },
            { x: 1150, y: 320 }, { x: 1400, y: 400 }, { x: 1650, y: 320 },
            { x: 1950, y: 240 }, { x: 2200, y: 340 }, { x: 2450, y: 280 },
            { x: 2700, y: 360 }
        ],
        enemies: [
            { platformIndex: 3, speed: 1.5 },
            { platformIndex: 4, speed: 2 },
            { platformIndex: 6, speed: 1.8 },
            { platformIndex: 8, speed: 2 }
        ],
        goal: { x: 2800, y: 340 }
    },
    2: {
        worldWidth: 3500,
        platforms: [
            { x: 0, y: 500, width: 600, height: 100 },
            { x: 250, y: 420, width: 120, height: 20 },
            { x: 450, y: 350, width: 120, height: 20 },
            { x: 650, y: 280, width: 200, height: 20 },
            { x: 950, y: 380, width: 150, height: 20 },
            { x: 1200, y: 320, width: 150, height: 20 },
            { x: 1450, y: 420, width: 150, height: 20 },
            { x: 1700, y: 340, width: 200, height: 20 },
            { x: 2000, y: 260, width: 150, height: 20 },
            { x: 2250, y: 360, width: 150, height: 20 },
            { x: 2500, y: 280, width: 200, height: 20 },
            { x: 2800, y: 380, width: 150, height: 20 },
            { x: 3050, y: 320, width: 150, height: 20 },
            { x: 3300, y: 420, width: 200, height: 20 }
        ],
        pizzas: [
            { x: 300, y: 380 }, { x: 500, y: 310 }, { x: 700, y: 240 },
            { x: 1000, y: 340 }, { x: 1250, y: 280 }, { x: 1500, y: 380 },
            { x: 1750, y: 300 }, { x: 2050, y: 220 }, { x: 2300, y: 320 },
            { x: 2550, y: 240 }, { x: 2850, y: 340 }, { x: 3100, y: 280 }
        ],
        enemies: [
            { platformIndex: 2, speed: 2 },
            { platformIndex: 4, speed: 1.8 },
            { platformIndex: 6, speed: 2 },
            { platformIndex: 8, speed: 2.2 },
            { platformIndex: 10, speed: 2 },
            { platformIndex: 12, speed: 2.2 }
        ],
        movingPlatforms: [
            { x: 1000, y: 200, width: 120, height: 20, startX: 1000, endX: 1300, speed: 2 }
        ],
        goal: { x: 3400, y: 360 }
    },
    3: {
        worldWidth: 4000,
        platforms: [
            { x: 0, y: 500, width: 500, height: 100 },
            { x: 200, y: 430, width: 100, height: 20 },
            { x: 380, y: 360, width: 100, height: 20 },
            { x: 560, y: 290, width: 150, height: 20 },
            { x: 800, y: 360, width: 120, height: 20 },
            { x: 1000, y: 280, width: 120, height: 20 },
            { x: 1200, y: 380, width: 150, height: 20 },
            { x: 1450, y: 300, width: 150, height: 20 },
            { x: 1700, y: 400, width: 120, height: 20 },
            { x: 1920, y: 320, width: 150, height: 20 },
            { x: 2170, y: 240, width: 150, height: 20 },
            { x: 2420, y: 340, width: 150, height: 20 },
            { x: 2670, y: 260, width: 150, height: 20 },
            { x: 2920, y: 360, width: 150, height: 20 },
            { x: 3170, y: 280, width: 200, height: 20 },
            { x: 3470, y: 380, width: 150, height: 20 },
            { x: 3720, y: 420, width: 280, height: 20 }
        ],
        pizzas: [
            { x: 250, y: 390 }, { x: 430, y: 320 }, { x: 610, y: 250 },
            { x: 850, y: 320 }, { x: 1050, y: 240 }, { x: 1250, y: 340 },
            { x: 1500, y: 260 }, { x: 1750, y: 360 }, { x: 1970, y: 280 },
            { x: 2220, y: 200 }, { x: 2470, y: 300 }, { x: 2720, y: 220 },
            { x: 2970, y: 320 }, { x: 3220, y: 240 }, { x: 3800, y: 380 }
        ],
        enemies: [
            { platformIndex: 3, speed: 2 },
            { platformIndex: 4, speed: 2.2 },
            { platformIndex: 6, speed: 2 },
            { platformIndex: 8, speed: 2.2 },
            { platformIndex: 10, speed: 2.4 },
            { platformIndex: 12, speed: 2.2 },
            { platformIndex: 14, speed: 2.4 }
        ],
        movingPlatforms: [
            { x: 1100, y: 180, width: 100, height: 20, startX: 1100, endX: 1350, speed: 2 },
            { x: 2500, y: 160, width: 100, height: 20, startX: 2500, endX: 2700, speed: 2.5 }
        ],
        goal: { x: 3850, y: 360 }
    },
    4: {
        worldWidth: 4500,
        platforms: [
            { x: 0, y: 500, width: 400, height: 100 },
            { x: 150, y: 440, width: 100, height: 20 },
            { x: 300, y: 380, width: 100, height: 20 },
            { x: 480, y: 310, width: 120, height: 20 },
            { x: 680, y: 380, width: 120, height: 20 },
            { x: 880, y: 300, width: 150, height: 20 },
            { x: 1130, y: 380, width: 120, height: 20 },
            { x: 1330, y: 280, width: 150, height: 20 },
            { x: 1580, y: 360, width: 120, height: 20 },
            { x: 1800, y: 260, width: 150, height: 20 },
            { x: 2050, y: 350, width: 150, height: 20 },
            { x: 2300, y: 270, width: 150, height: 20 },
            { x: 2550, y: 360, width: 150, height: 20 },
            { x: 2800, y: 280, width: 150, height: 20 },
            { x: 3050, y: 370, width: 150, height: 20 },
            { x: 3300, y: 290, width: 150, height: 20 },
            { x: 3550, y: 380, width: 150, height: 20 },
            { x: 3800, y: 300, width: 150, height: 20 },
            { x: 4050, y: 390, width: 200, height: 20 },
            { x: 4300, y: 430, width: 200, height: 20 }
        ],
        pizzas: [
            { x: 200, y: 400 }, { x: 350, y: 340 }, { x: 530, y: 270 },
            { x: 730, y: 340 }, { x: 930, y: 260 }, { x: 1180, y: 340 },
            { x: 1380, y: 240 }, { x: 1630, y: 320 }, { x: 1850, y: 220 },
            { x: 2100, y: 310 }, { x: 2350, y: 230 }, { x: 2600, y: 320 },
            { x: 2850, y: 240 }, { x: 3100, y: 330 }, { x: 3350, y: 250 },
            { x: 3600, y: 340 }, { x: 3850, y: 260 }, { x: 4100, y: 350 }
        ],
        enemies: [
            { platformIndex: 2, speed: 2 },
            { platformIndex: 4, speed: 2.2 },
            { platformIndex: 6, speed: 2.4 },
            { platformIndex: 8, speed: 2.2 },
            { platformIndex: 10, speed: 2.4 },
            { platformIndex: 12, speed: 2.2 },
            { platformIndex: 14, speed: 2.4 },
            { platformIndex: 16, speed: 2.6 },
            { platformIndex: 18, speed: 2.2 }
        ],
        movingPlatforms: [
            { x: 1000, y: 200, width: 100, height: 20, startX: 1000, endX: 1250, speed: 2 },
            { x: 1900, y: 160, width: 100, height: 20, startX: 1900, endX: 2150, speed: 2.5 },
            { x: 3200, y: 190, width: 100, height: 20, startX: 3200, endX: 3450, speed: 2 }
        ],
        goal: { x: 4350, y: 370 }
    },
    5: {
        worldWidth: 5000,
        platforms: [
            { x: 0, y: 500, width: 350, height: 100 },
            { x: 100, y: 450, width: 80, height: 20 },
            { x: 240, y: 400, width: 80, height: 20 },
            { x: 380, y: 340, width: 100, height: 20 },
            { x: 550, y: 280, width: 100, height: 20 },
            { x: 720, y: 350, width: 120, height: 20 },
            { x: 910, y: 270, width: 120, height: 20 },
            { x: 1100, y: 360, width: 120, height: 20 },
            { x: 1290, y: 280, width: 140, height: 20 },
            { x: 1500, y: 370, width: 120, height: 20 },
            { x: 1690, y: 290, width: 120, height: 20 },
            { x: 1880, y: 380, width: 120, height: 20 },
            { x: 2070, y: 300, width: 140, height: 20 },
            { x: 2280, y: 390, width: 120, height: 20 },
            { x: 2470, y: 310, width: 120, height: 20 },
            { x: 2660, y: 240, width: 140, height: 20 },
            { x: 2870, y: 330, width: 120, height: 20 },
            { x: 3060, y: 260, width: 120, height: 20 },
            { x: 3250, y: 350, width: 140, height: 20 },
            { x: 3460, y: 270, width: 120, height: 20 },
            { x: 3650, y: 360, width: 120, height: 20 },
            { x: 3840, y: 280, width: 140, height: 20 },
            { x: 4050, y: 370, width: 120, height: 20 },
            { x: 4240, y: 300, width: 120, height: 20 },
            { x: 4430, y: 390, width: 140, height: 20 },
            { x: 4640, y: 430, width: 360, height: 20 }
        ],
        pizzas: [
            { x: 150, y: 410 }, { x: 290, y: 360 }, { x: 430, y: 300 },
            { x: 600, y: 240 }, { x: 770, y: 310 }, { x: 960, y: 230 },
            { x: 1150, y: 320 }, { x: 1340, y: 240 }, { x: 1550, y: 330 },
            { x: 1740, y: 250 }, { x: 1930, y: 340 }, { x: 2120, y: 260 },
            { x: 2330, y: 350 }, { x: 2520, y: 270 }, { x: 2710, y: 200 },
            { x: 2920, y: 290 }, { x: 3110, y: 220 }, { x: 3300, y: 310 },
            { x: 3510, y: 230 }, { x: 3700, y: 320 }, { x: 3890, y: 240 },
            { x: 4100, y: 330 }, { x: 4290, y: 260 }, { x: 4480, y: 350 },
            { x: 4800, y: 390 }
        ],
        enemies: [
            { platformIndex: 3, speed: 2.2 },
            { platformIndex: 4, speed: 2.4 },
            { platformIndex: 6, speed: 2.6 },
            { platformIndex: 8, speed: 2.4 },
            { platformIndex: 10, speed: 2.6 },
            { platformIndex: 12, speed: 2.4 },
            { platformIndex: 14, speed: 2.6 },
            { platformIndex: 16, speed: 2.8 },
            { platformIndex: 18, speed: 2.6 },
            { platformIndex: 20, speed: 2.8 },
            { platformIndex: 22, speed: 2.6 }
        ],
        movingPlatforms: [
            { x: 800, y: 180, width: 100, height: 20, startX: 800, endX: 1050, speed: 2 },
            { x: 1400, y: 160, width: 100, height: 20, startX: 1400, endX: 1650, speed: 2.5 },
            { x: 2100, y: 190, width: 100, height: 20, startX: 2100, endX: 2350, speed: 2 },
            { x: 3500, y: 170, width: 100, height: 20, startX: 3500, endX: 3750, speed: 2.5 }
        ],
        goal: { x: 4850, y: 370 }
    }
};

// Input handling
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

// Mobile controls
document.getElementById('left-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});
document.getElementById('left-btn').addEventListener('touchend', () => keys.left = false);

document.getElementById('right-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});
document.getElementById('right-btn').addEventListener('touchend', () => keys.right = false);

document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.space = true;
    setTimeout(() => keys.space = false, 200);
});

document.getElementById('left-btn').addEventListener('mousedown', () => keys.left = true);
document.getElementById('left-btn').addEventListener('mouseup', () => keys.left = false);
document.getElementById('left-btn').addEventListener('mouseleave', () => keys.left = false);

document.getElementById('right-btn').addEventListener('mousedown', () => keys.right = true);
document.getElementById('right-btn').addEventListener('mouseup', () => keys.right = false);
document.getElementById('right-btn').addEventListener('mouseleave', () => keys.right = false);

document.getElementById('jump-btn').addEventListener('mousedown', () => {
    keys.space = true;
    setTimeout(() => keys.space = false, 200);
});

// Load level
function loadLevel(levelNum) {
    const level = levels[levelNum];
    
    platforms = level.platforms.map(p => ({...p}));
    pizzas = level.pizzas.map(p => ({...p, size: 25, collected: false}));
    
    // Initialize enemies on their platforms with AI
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

// Update functions
function updatePlayer() {
    if (keys.left) {
        player.velocityX = -player.speed;
        player.facingRight = false;
    } else if (keys.right) {
        player.velocityX = player.speed;
        player.facingRight = true;
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

    // Platform collision
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
            
            if (platform.direction !== undefined) {
                player.x += platform.velocityX || 0;
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

// Improved enemy AI - they patrol their platform
function updateEnemies() {
    for (let enemy of enemies) {
        // Move horizontally
        enemy.x += enemy.speed * enemy.direction;
        
        // Change direction at platform edges
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.direction *= -1;
        }
        
        // Keep enemy on platform
        enemy.y = enemy.platform.y - enemy.height;

        // Collision with player
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
        if (gameState.currentLevel < gameState.totalLevels) {
            showLevelCompleteModal();
        } else {
            winGame();
        }
    }
}

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
    if (gameState.currentLevel < gameState.totalLevels) {
        hideLevelCompleteModal();
        setTimeout(() => {
            loadLevel(gameState.currentLevel + 1);
            gameState.isPlaying = true;
            gameLoop();
        }, 300);
    }
}

// Next level button
document.getElementById('next-level-btn').addEventListener('click', nextLevel);

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

// Drawing functions - Pixel Art Style
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

    // Pixel clouds
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
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        drawPixelRect(
            platform.x - camera.x + 3,
            platform.y + 3,
            platform.width,
            platform.height
        );

        // Platform base
        ctx.fillStyle = '#8B4513';
        drawPixelRect(
            platform.x - camera.x,
            platform.y,
            platform.width,
            platform.height
        );

        // Pixel pattern
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

// DogDay CHIBI - Adorable and simple!
function drawPlayer() {
    const x = Math.floor(player.x - camera.x);
    const y = Math.floor(player.y);
    const size = 5; // Bigger pixels for chibi style
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 8, y + player.height + 2, player.width - 16, 6);

    // Colors for chibi DogDay
    const orange = '#FF8C00';
    const lightOrange = '#FFB347';
    const yellow = '#FFD700';
    const black = '#000000';
    const white = '#FFFFFF';
    
    // CHIBI HEAD - Big and round!
    ctx.fillStyle = orange;
    
    // Round head (6x6 grid for simplicity)
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
    
    // Cute floppy ears
    ctx.fillStyle = orange;
    drawPixelRect(x, y + size, size, size * 2);
    drawPixelRect(x + 6 * size, y + size, size, size * 2);
    
    // Ear inner (yellow)
    ctx.fillStyle = yellow;
    drawPixelRect(x + size/2, y + size * 1.5, size/2, size/2);
    drawPixelRect(x + 6 * size + size/2, y + size * 1.5, size/2, size/2);
    
    // HUGE CUTE EYES (chibi style - very simple circles)
    ctx.fillStyle = black;
    // Left eye
    drawPixelRect(x + 1.5 * size, y + 2 * size, size, size);
    // Right eye
    drawPixelRect(x + 4.5 * size, y + 2 * size, size, size);
    
    // Big white sparkles (SUPER IMPORTANT for cute chibi!)
    ctx.fillStyle = white;
    drawPixelRect(x + 1.5 * size, y + 2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 4.5 * size, y + 2 * size, size * 0.4, size * 0.4);
    
    // Simple cute nose
    ctx.fillStyle = black;
    drawPixelRect(x + 3 * size, y + 3.5 * size, size * 0.6, size * 0.6);
    
    // BIG HAPPY SMILE (wide W shape - very chibi!)
    ctx.fillStyle = black;
    drawPixelRect(x + 1.5 * size, y + 4 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 2 * size, y + 4.3 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 2.5 * size, y + 4.5 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 3.5 * size, y + 4.5 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 4 * size, y + 4.3 * size, size * 0.5, size * 0.5);
    drawPixelRect(x + 4.5 * size, y + 4 * size, size * 0.5, size * 0.5);
    
    // Cute sun pendant (simple)
    ctx.fillStyle = yellow;
    drawPixelRect(x + 2.5 * size, y + 6.5 * size, size, size);
    
    // Small sun rays
    ctx.fillStyle = yellow;
    drawPixelRect(x + 2 * size, y + 6.5 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 3.6 * size, y + 6.5 * size, size * 0.4, size * 0.4);
    
    // Cute sparkle effect
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    drawPixelRect(x - size, y + size, size * 0.6, size * 0.6);
    drawPixelRect(x + 7 * size, y + 2 * size, size * 0.6, size * 0.6);
}

function drawPizzas() {
    for (let pizza of pizzas) {
        if (!pizza.collected) {
            const x = Math.floor(pizza.x - camera.x);
            const y = Math.floor(pizza.y);
            
            // Glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, pizza.size);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - pizza.size, y - pizza.size, pizza.size * 2, pizza.size * 2);

            // Pizza pixel art
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
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 5, y + enemy.height + 2, enemy.width - 10, 6);

        // Dark shadow blob pixel art
        const dark = '#1a1a1a';
        const darker = '#0a0a0a';
        
        ctx.fillStyle = dark;
        // Create amorphous blob shape
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

        // Red glowing eyes
        ctx.fillStyle = '#ff0000';
        drawPixelRect(x + 2 * size, y + 2 * size, size, size);
        drawPixelRect(x + 5 * size, y + 2 * size, size, size);
        
        // Eye glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        drawPixelRect(x + size, y + size, size, size);
        drawPixelRect(x + 3 * size, y + size, size, size);
        drawPixelRect(x + 4 * size, y + size, size, size);
        drawPixelRect(x + 6 * size, y + size, size, size);
    }
}

function drawGoal() {
    const goal = levels[gameState.currentLevel].goal;
    const x = Math.floor(goal.x - camera.x);
    const y = Math.floor(goal.y);
    const size = 5; // Matching DogDay size for consistency
    
    // Purple magical glow
    const gradient = ctx.createRadialGradient(x + 15, y + 15, 0, x + 15, y + 15, 40);
    gradient.addColorStop(0, 'rgba(147, 112, 219, 0.7)');
    gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 15, y - 15, 80, 80);

    // Colors for chibi CatNap
    const purple = '#9370DB';
    const darkPurple = '#8B008B';
    const white = '#FFFFFF';
    const black = '#000000';
    const moon = '#F0E68C';
    
    // CHIBI HEAD - Big and round!
    ctx.fillStyle = purple;
    
    // Round head (6x6 grid - same as DogDay for consistency)
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
    
    // Cute pointy cat ears (simple triangles)
    ctx.fillStyle = purple;
    drawPixelRect(x + size, y - size/2, size, size);
    drawPixelRect(x + 5 * size, y - size/2, size, size);
    drawPixelRect(x + size/2, y, size, size);
    drawPixelRect(x + 5.5 * size, y, size, size);
    
    // Ear inner (darker)
    ctx.fillStyle = darkPurple;
    drawPixelRect(x + size, y, size * 0.5, size * 0.5);
    drawPixelRect(x + 5 * size, y, size * 0.5, size * 0.5);
    
    // CUTE SLEEPY EYES (simple happy curves ^^)
    ctx.fillStyle = black;
    // Left eye (simple curve)
    drawPixelRect(x + 1.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 2 * size, y + 1.8 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 2.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    
    // Right eye (simple curve)
    drawPixelRect(x + 3.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 4 * size, y + 1.8 * size, size * 0.5, size * 0.4);
    drawPixelRect(x + 4.5 * size, y + 2 * size, size * 0.5, size * 0.4);
    
    // Tiny sparkles (still dreaming)
    ctx.fillStyle = white;
    drawPixelRect(x + 2 * size, y + 2 * size, size * 0.2, size * 0.2);
    drawPixelRect(x + 4 * size, y + 2 * size, size * 0.2, size * 0.2);
    
    // Simple cute nose
    ctx.fillStyle = darkPurple;
    drawPixelRect(x + 3 * size, y + 3.5 * size, size * 0.5, size * 0.5);
    
    // Gentle sleepy smile (soft W shape)
    ctx.fillStyle = darkPurple;
    drawPixelRect(x + 2 * size, y + 4 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 2.5 * size, y + 4.2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 3 * size, y + 4.3 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 3.5 * size, y + 4.2 * size, size * 0.4, size * 0.4);
    drawPixelRect(x + 4 * size, y + 4 * size, size * 0.4, size * 0.4);
    
    // Cute "Z" for sleeping
    ctx.fillStyle = darkPurple;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('z', x - size, y + size);
    
    // Moon pendant (simple crescent)
    ctx.fillStyle = moon;
    drawPixelRect(x + 2.5 * size, y + 6.5 * size, size, size);
    drawPixelRect(x + 3 * size, y + 6.3 * size, size * 0.4, size * 0.4);
    
    // Sparkle on moon
    ctx.fillStyle = white;
    drawPixelRect(x + 3.2 * size, y + 6.4 * size, size * 0.3, size * 0.3);
    
    // Purple sparkles around
    ctx.fillStyle = 'rgba(147, 112, 219, 0.5)';
    drawPixelRect(x - size, y + 2 * size, size * 0.6, size * 0.6);
    drawPixelRect(x + 7 * size, y + 3 * size, size * 0.6, size * 0.6);
    
    // Floating hearts (alternating red and purple)
    const heartY = y - 20 + Math.sin(Date.now() * 0.005) * 8;
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    const time = Math.floor(Date.now() / 800);
    ctx.fillText((time % 2 === 0) ? '❤️' : '💜', x + 15, heartY);
}

// Game loop
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

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    gameState.won = false;

    loadLevel(1);
    updateScore();
    updateLives();
    showScreen('game-screen');
    gameLoop();
}

function winGame() {
    gameState.isPlaying = false;
    gameState.won = true;
    showScreen('win-screen');
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

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', startGame);
document.getElementById('retry-button').addEventListener('click', startGame);

showScreen('start-screen');