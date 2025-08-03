// Phaser 3 Wedding Save The Date Game

class WeddingGame extends Phaser.Game {
    constructor() {
        const config = {
            type: Phaser.AUTO,
            parent: 'gameContainer',
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [BootScene, GameScene, BattleScene]
        };
        super(config);
    }
}

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load background image
        this.load.image('background', 'assets/images/background.png');
        
        // Load groom sprite sheet with cache-busting
        this.load.spritesheet('groom', 'assets/images/groom_sprite_sheet.png?v=' + Date.now(), { 
            frameWidth: 64, 
            frameHeight: 64 
        });
        
        // Load bride image
        this.load.image('bride', 'assets/images/bride.png?v=' + Date.now());
    }

    create() {
        this.scene.start('GameScene');
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameState = 'exploring';
        this.battleProgress = 0;
        
        // World dimensions - much larger than the visible canvas
        this.worldWidth = 2400;  // 3x the canvas width
        this.worldHeight = 1800; // 3x the canvas height
    }

    create() {
        // Set world bounds for the larger world
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        
        // Create a larger background by tiling or scaling
        this.createWorldBackground();
        
        // Create venue areas
        this.createVenue();
        
        // Create characters
        this.createCharacters();
        
        // Setup groom animation
        this.setupGroomAnimation();
        
        // Setup input
        this.setupInput();
        
        // Setup UI
        this.setupUI();
        
        // Setup battle system
        this.setupBattleSystem();
        
        // Setup camera to follow the player
        this.setupCamera();
    }

    createWorldBackground() {
        // Create a single large background that covers the entire world
        const background = this.add.image(this.worldWidth / 2, this.worldHeight / 2, 'background');
        background.setDisplaySize(this.worldWidth, this.worldHeight);
        background.setDepth(0);
        
        // Add some decorative elements to make the world feel more alive
        this.addDecorativeElements();
    }
    
    addDecorativeElements() {
        // Add some decorative elements scattered around the world
        const numDecorations = 20;
        
        for (let i = 0; i < numDecorations; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            // Create a simple decorative circle
            const decoration = this.add.circle(x, y, Math.random() * 10 + 5, 0xFFFFFF, 0.1);
            decoration.setDepth(1);
        }
        
        // Add world boundary indicators
        this.addWorldBoundaries();
    }
    
    addWorldBoundaries() {
        // Add subtle boundary indicators at the edges of the world
        const boundaryColor = 0x444444;
        const boundaryAlpha = 0.3;
        
        // Top boundary
        this.add.rectangle(this.worldWidth/2, 10, this.worldWidth, 20, boundaryColor, boundaryAlpha);
        
        // Bottom boundary
        this.add.rectangle(this.worldWidth/2, this.worldHeight - 10, this.worldWidth, 20, boundaryColor, boundaryAlpha);
        
        // Left boundary
        this.add.rectangle(10, this.worldHeight/2, 20, this.worldHeight, boundaryColor, boundaryAlpha);
        
        // Right boundary
        this.add.rectangle(this.worldWidth - 10, this.worldHeight/2, 20, this.worldHeight, boundaryColor, boundaryAlpha);
    }
    
    setupCamera() {
        // Set up the camera to follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.groom, true, 0.1, 0.1);
        
        // Set the camera to a fixed zoom level
        this.cameras.main.setZoom(1.5); // Adjust this value to experiment with different zoom levels
        
        // Optional: Add some camera shake or effects later
    }

    createVenue() {
        const venue = GAME_CONFIG.venue;
        
        // Create invisible ceremony area for interaction
        // Note: These coordinates are now in world space, not screen space
        this.ceremonyArea = this.add.rectangle(
            venue.ceremonyArea.x + venue.ceremonyArea.width/2,
            venue.ceremonyArea.y + venue.ceremonyArea.height/2,
            venue.ceremonyArea.width,
            venue.ceremonyArea.height,
            0x000000 // Black color
        );
        this.ceremonyArea.setAlpha(0);
        this.ceremonyArea.setDepth(1);
        
        // No label needed since it's invisible
    }
    
    setupGroomAnimation() {
        // Create walking animation from sprite sheet - use 4 frames (1x4 layout)
        this.anims.create({
            key: 'groom-walk',
            frames: [
                { key: 'groom', frame: 0 },
                { key: 'groom', frame: 1 },
                { key: 'groom', frame: 2 },
                { key: 'groom', frame: 3 }
            ],
            frameRate: 8, // Normal speed for 4 frames
            repeat: -1 // Loop infinitely
        });
        
        // Create idle animation (first frame)
        this.anims.create({
            key: 'groom-idle',
            frames: [{ key: 'groom', frame: 0 }], // Just the first frame
            frameRate: 1,
            repeat: 0
        });
    }

    createCharacters() {
        const groomConfig = GAME_CONFIG.characters.groom;
        const brideConfig = GAME_CONFIG.characters.bride;
        
        // Create groom with physics using sprite sheet
        this.groom = this.physics.add.sprite(groomConfig.startX, groomConfig.startY, 'groom');
        this.groom.setDisplaySize(groomConfig.size, groomConfig.size);
        this.groom.setCollideWorldBounds(true);
        this.groom.setDepth(3);
        
        // Initialize groom animation state
        this.groom.isMoving = false;
        this.groom.lastVelocityX = 0;
        this.groom.lastVelocityY = 0;
        
        // Create bride at the configured position in world space
        this.bride = this.physics.add.sprite(brideConfig.x, brideConfig.y, 'bride');
        this.bride.setDisplaySize(brideConfig.size, brideConfig.size);
        this.bride.captured = false;
        this.bride.setDepth(3);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    setupUI() {
        this.battleOverlay = document.getElementById('battleOverlay');
        this.battleMessage = document.getElementById('battleMessage');
        this.messageBox = document.getElementById('messageBox');
        
        // Create coordinate display
        this.createCoordinateDisplay();
        
        // Battle menu event listeners
        document.getElementById('flirtBtn').addEventListener('click', () => this.useMove('flirt'));
        document.getElementById('kissBtn').addEventListener('click', () => this.useMove('kiss'));
        document.getElementById('complimentBtn').addEventListener('click', () => this.useMove('compliment'));
        document.getElementById('pokeballBtn').addEventListener('click', () => this.usePokeball());
        document.getElementById('runBtn').addEventListener('click', () => this.runFromBattle());
    }
    
    createCoordinateDisplay() {
        // Create a text object to display player coordinates
        this.coordinateText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coordinateText.setDepth(10); // Always on top
        this.coordinateText.setScrollFactor(0); // Don't move with camera
        
        // Create area indicator
        this.areaIndicator = this.add.text(10, 40, '', {
            fontSize: '14px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.areaIndicator.setDepth(10);
        this.areaIndicator.setScrollFactor(0);
    }

    setupBattleSystem() {
        this.moves = GAME_CONFIG.moves;
        this.settings = GAME_CONFIG.settings;
        this.weddingDetails = GAME_CONFIG.weddingDetails;
        
        // Initialize battle stats
        this.groomHP = 83;
        this.groomMaxHP = 83;
        this.brideHP = 65;
        this.brideMaxHP = 65;
        
        // Disable pokeball initially
        document.getElementById('pokeballBtn').disabled = true;
    }

    update() {
        if (this.gameState === 'exploring') {
            this.handleMovement();
            this.checkProximityToBride();
            this.updateCoordinateDisplay();
        }
    }
    
    updateCoordinateDisplay() {
        // Update coordinate display with player position
        const x = Math.round(this.groom.x);
        const y = Math.round(this.groom.y);
        this.coordinateText.setText(`Position: (${x}, ${y})`);
        
        // Update area indicator
        this.updateAreaIndicator(x, y);
    }
    
    updateAreaIndicator(x, y) {
        const ceremonyConfig = GAME_CONFIG.venue.ceremonyArea;
        const areaLeft = ceremonyConfig.x;
        const areaRight = ceremonyConfig.x + ceremonyConfig.width;
        const areaTop = ceremonyConfig.y;
        const areaBottom = ceremonyConfig.y + ceremonyConfig.height;
        
        if (x >= areaLeft && x <= areaRight && y >= areaTop && y <= areaBottom) {
            this.areaIndicator.setText('📍 In Ceremony Area');
            this.areaIndicator.setFill('#00ff00');
        } else {
            // Calculate distance to ceremony area
            const centerX = (areaLeft + areaRight) / 2;
            const centerY = (areaTop + areaBottom) / 2;
            const distance = Math.round(Phaser.Math.Distance.Between(x, y, centerX, centerY));
            this.areaIndicator.setText(`🎯 Ceremony Area: ${distance}px away`);
            this.areaIndicator.setFill('#ffff00');
        }
    }

    handleMovement() {
        const speed = GAME_CONFIG.characters.groom.speed;
        this.groom.setVelocity(0);
        
        // Get input states
        const leftPressed = this.cursors.left.isDown || this.wasd.A.isDown;
        const rightPressed = this.cursors.right.isDown || this.wasd.D.isDown;
        const upPressed = this.cursors.up.isDown || this.wasd.W.isDown;
        const downPressed = this.cursors.down.isDown || this.wasd.S.isDown;
        
        // Prioritize one direction at a time (like Pokémon)
        // Priority: Up > Down > Left > Right
        if (upPressed) {
            this.groom.setVelocityY(-speed);
        } else if (downPressed) {
            this.groom.setVelocityY(speed);
        } else if (leftPressed) {
            this.groom.setVelocityX(-speed);
        } else if (rightPressed) {
            this.groom.setVelocityX(speed);
        }
        
        // Handle groom animation based on movement
        this.handleGroomAnimation();
        
        // Check for interaction
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.checkInteraction();
        }
    }
    
    handleGroomAnimation() {
        const velocityX = this.groom.body.velocity.x;
        const velocityY = this.groom.body.velocity.y;
        const isMoving = velocityX !== 0 || velocityY !== 0;
        
        // Check if movement state changed
        if (isMoving !== this.groom.isMoving) {
            this.groom.isMoving = isMoving;
            
            if (isMoving) {
                // Start walking animation when moving
                this.groom.play('groom-walk');
            } else {
                // Play idle animation when stopped
                this.groom.play('groom-idle');
            }
        }
        
        // Update last velocity for direction detection
        this.groom.lastVelocityX = velocityX;
        this.groom.lastVelocityY = velocityY;
    }

    checkProximityToBride() {
        if (this.bride.captured) return;
        
        const distance = Phaser.Math.Distance.Between(
            this.groom.x, this.groom.y,
            this.bride.x, this.bride.y
        );
        
        if (distance < this.settings.proximityDistance) {
            this.startBattle();
        }
    }

    checkInteraction() {
        const ceremonyConfig = GAME_CONFIG.venue.ceremonyArea;
        
        // Check if groom is inside the ceremony area bounds
        // These coordinates are now in world space
        const groomX = this.groom.x;
        const groomY = this.groom.y;
        const areaLeft = ceremonyConfig.x;
        const areaRight = ceremonyConfig.x + ceremonyConfig.width;
        const areaTop = ceremonyConfig.y;
        const areaBottom = ceremonyConfig.y + ceremonyConfig.height;
        
        if (groomX >= areaLeft && groomX <= areaRight && 
            groomY >= areaTop && groomY <= areaBottom) {
            this.showMessage('💒 You approach the altar... the perfect place for your special moment!');
        }
    }

    startBattle() {
        this.gameState = 'battling';
        this.battleOverlay.classList.remove('hidden');
        
        // Stop the groom's movement and animation
        this.groom.setVelocity(0, 0);
        this.groom.stop();
        this.groom.setFrame(0); // Show static frame
        
        // Reset battle stats
        this.groomHP = this.groomMaxHP;
        this.brideHP = this.brideMaxHP;
        this.updateHealthBars();
        
        // Disable pokeball initially
        document.getElementById('pokeballBtn').disabled = true;
        
        this.updateBattleMessage('A wild Bride appeared! 💕');
    }

    updateHealthBars() {
        const groomHealthBar = document.querySelector('.groom-health .health-bar-fill');
        const brideHealthBar = document.querySelector('.bride-health .health-bar-fill');
        const groomHealthText = document.querySelector('.groom-health .health-text');
        const brideHealthText = document.querySelector('.bride-health .health-text');
        
        const groomHealthPercent = (this.groomHP / this.groomMaxHP) * 100;
        const brideHealthPercent = (this.brideHP / this.brideMaxHP) * 100;
        
        groomHealthBar.style.width = `${groomHealthPercent}%`;
        brideHealthBar.style.width = `${brideHealthPercent}%`;
        
        groomHealthText.textContent = `Leonardo Lv.42 HP ${this.groomHP}/${this.groomMaxHP}`;
        brideHealthText.textContent = `Ghinwa Lv.17 HP ${this.brideHP}/${this.brideMaxHP}`;
        
        // Change color based on health
        if (groomHealthPercent <= 25) {
            groomHealthBar.style.background = 'linear-gradient(to right, #FF0000, #FF4444)';
        } else if (groomHealthPercent <= 50) {
            groomHealthBar.style.background = 'linear-gradient(to right, #FFAA00, #FFCC44)';
        }
        
        if (brideHealthPercent <= 25) {
            brideHealthBar.style.background = 'linear-gradient(to right, #FF0000, #FF4444)';
        } else if (brideHealthPercent <= 50) {
            brideHealthBar.style.background = 'linear-gradient(to right, #FFAA00, #FFCC44)';
        }
    }

    updateBattleMessage(message) {
        this.battleMessage.textContent = message;
    }

    useMove(moveType) {
        const move = this.moves[moveType];
        
        const damage = move.power;
        this.brideHP = Math.max(0, this.brideHP - damage);
        
        this.updateHealthBars();
        this.updateBattleMessage(move.message);
        
        const button = document.getElementById(moveType + 'Btn');
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
        }, 1000);
        
        // Check if bride is defeated
        if (this.brideHP <= 0) {
            this.brideHP = 0;
            this.updateHealthBars();
            this.updateBattleMessage('💕 Ghinwa is charmed! Now is your chance to use the Pokeball!');
            document.getElementById('pokeballBtn').disabled = false;
        } else {
            // Bride counter-attack
            setTimeout(() => {
                const counterDamage = Math.floor(Math.random() * 10) + 3;
                this.groomHP = Math.max(0, this.groomHP - counterDamage);
                this.updateHealthBars();
                this.updateBattleMessage(`Ghinwa blushes! Leonardo took ${counterDamage} damage! 💕`);
            }, 500);
        }
    }

    usePokeball() {
        if (this.brideHP <= 0) {
            this.throwPokeball();
        } else {
            this.updateBattleMessage('💔 Ghinwa is not charmed enough yet! Try using more moves!');
        }
    }

    throwPokeball() {
        const pokeball = document.getElementById('pokeball');
        const brideSprite = document.querySelector('.bride-sprite');
        
        // Position pokeball near the groom (Leonardo)
        pokeball.style.left = '140px';
        pokeball.style.bottom = '140px';
        pokeball.style.display = 'block';
        
        // Start the throwing animation
        setTimeout(() => {
            pokeball.classList.add('pokeball-throw');
            this.updateBattleMessage('Leonardo threw a Pokéball!');
        }, 100);
        
        // After pokeball reaches the bride, start wiggling
        setTimeout(() => {
            pokeball.classList.remove('pokeball-throw');
            pokeball.classList.add('pokeball-wiggle');
            this.updateBattleMessage('The Pokéball is wiggling...');
        }, 1500);
        
        // After wiggling, show capture sequence
        setTimeout(() => {
            pokeball.style.display = 'none';
            pokeball.classList.remove('pokeball-wiggle');
            
            // Add capture success animation to bride sprite
            brideSprite.classList.add('capture-success');
            this.updateBattleMessage('🎉 Gotcha! Ghinwa was caught! 💕');
            
            // Complete the capture after animation
            setTimeout(() => {
                this.captureBride();
            }, 2000);
            
        }, 3500);
    }

    captureBride() {
        this.bride.captured = true;
        this.gameState = 'captured';
        this.battleOverlay.classList.add('hidden');
        
        // Ensure groom is stopped and reset animation state
        this.groom.setVelocity(0, 0);
        this.groom.stop();
        this.groom.setFrame(0);
        this.groom.isMoving = false;
        
        this.showMessage(this.weddingDetails.capturedMessage);
        
        this.bride.setVisible(false);
        
        setTimeout(() => {
            this.showMessage(this.weddingDetails.title + '\n' + this.weddingDetails.message);
        }, 3000);
    }

    runFromBattle() {
        this.gameState = 'exploring';
        this.battleOverlay.classList.add('hidden');
        
        // Move groom away from bride to prevent immediate re-trigger
        const angle = Phaser.Math.Angle.Between(this.bride.x, this.bride.y, this.groom.x, this.groom.y);
        const distance = 100; // Move 100 pixels away
        this.groom.x = this.bride.x + Math.cos(angle) * distance;
        this.groom.y = this.bride.y + Math.sin(angle) * distance;
        
        // Keep groom in world bounds
        this.groom.x = Math.max(this.groom.width/2, Math.min(this.worldWidth - this.groom.width/2, this.groom.x));
        this.groom.y = Math.max(this.groom.height/2, Math.min(this.worldHeight - this.groom.height/2, this.groom.y));
        
        // Stop movement
        this.groom.setVelocity(0, 0);
        
        this.showMessage('🏃 You ran away from the battle...');
    }

    showMessage(message) {
        this.messageBox.textContent = message;
        this.messageBox.classList.remove('hidden');
        setTimeout(() => {
            this.messageBox.classList.add('hidden');
        }, this.settings.messageDuration);
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }
}

// Initialize the game
window.addEventListener('load', () => {
    new WeddingGame();
}); 