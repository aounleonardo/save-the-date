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

        // Load groom sprite sheets with cache-busting
        this.load.spritesheet('groom', 'assets/images/groom_spritesheet_down.png?v=' + Date.now(), {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load groom walking right sprite sheet
        this.load.spritesheet('groom-right', 'assets/images/groom_spritesheet_right.png?v=' + Date.now(), {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load groom walking left sprite sheet
        this.load.spritesheet('groom-left', 'assets/images/groom_spritesheet_left.png?v=' + Date.now(), {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load groom walking up sprite sheet
        this.load.spritesheet('groom-up', 'assets/images/groom_spritesheet_up.png?v=' + Date.now(), {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load bride image
        this.load.image('bride', 'assets/images/bride.png?v=' + Date.now());
        // Load battle bride image
        this.load.image('battle-bride', 'assets/images/battle_bride.png?v=' + Date.now());
        // Load battle background
        this.load.image('battle-background', 'assets/images/battle_background.jpg?v=' + Date.now());

        // Load audio files
        this.load.audio('map-music', 'assets/audios/go_solo.mp3');
        this.load.audio('battle-music', 'assets/audios/bala_wala_chi.mp3');
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
        this.battleCooldown = false;
        
        // World dimensions - much larger than the visible canvas
        this.worldWidth = 2400;  // 3x the canvas width
        this.worldHeight = 1800; // 3x the canvas height
        
        // Audio management
        this.mapMusic = null;
        this.battleMusic = null;
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
        
        // Initialize audio
        this.initializeAudio();
        
        // Start the opening sequence
        this.startOpeningSequence();
    }
    
    initializeAudio() {
        // Create audio instances
        this.mapMusic = this.sound.add('map-music', {
            loop: true,
            volume: 0.5
        });
        
        this.battleMusic = this.sound.add('battle-music', {
            loop: true,
            volume: 0.5
        });
        
        // Start map music with offset
        this.startMapMusic();
    }
    
    startMapMusic() {
        if (this.mapMusic && !this.mapMusic.isPlaying) {
            // Start at 44 seconds (0:44)
            this.mapMusic.play('', { start: 44 });
        }
    }
    
    stopMapMusic() {
        if (this.mapMusic && this.mapMusic.isPlaying) {
            this.mapMusic.stop();
        }
    }
    
    startBattleMusic() {
        if (this.battleMusic && !this.battleMusic.isPlaying) {
            // Start at 15 seconds (0:15)
            this.battleMusic.play('', { start: 15 });
        }
    }
    
    stopBattleMusic() {
        if (this.battleMusic && this.battleMusic.isPlaying) {
            this.battleMusic.stop();
        }
    }
    
    startOpeningSequence() {
        // Disable input during opening sequence
        this.input.enabled = false;
        
        // Start map music
        this.startMapMusic();
        
        // Calculate zoom level to fit entire world in canvas
        const canvasWidth = this.cameras.main.width;
        const canvasHeight = this.cameras.main.height;
        const zoomX = canvasWidth / this.worldWidth;
        const zoomY = canvasHeight / this.worldHeight;
        const fitZoom = Math.min(zoomX, zoomY); // Use the smaller zoom to ensure everything fits
        
        // First, show the entire map by setting camera to world center with calculated zoom
        this.cameras.main.setZoom(fitZoom);
        this.cameras.main.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        this.cameras.main.stopFollow(); // Stop following the groom temporarily
        
        // Wait 2 seconds to let player see the whole map
        this.time.delayedCall(2000, () => {
            // Now zoom in to the groom with a smooth transition
            this.cameras.main.pan(this.groom.x, this.groom.y, 2000, 'Power2');
            this.cameras.main.zoomTo(1.5, 2000, 'Power2');
            
            // After zoom completes, start following the groom and show message
            this.time.delayedCall(2000, () => {
                this.cameras.main.startFollow(this.groom, true, 0.1, 0.1);
                this.input.enabled = true; // Re-enable input
                
                // Show the groom's message
                this.showMessage('I need to find Ghinwa 👰🏽‍♀️...');
            });
        });
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
        this.add.rectangle(this.worldWidth / 2, 10, this.worldWidth, 20, boundaryColor, boundaryAlpha);

        // Bottom boundary
        this.add.rectangle(this.worldWidth / 2, this.worldHeight - 10, this.worldWidth, 20, boundaryColor, boundaryAlpha);

        // Left boundary
        this.add.rectangle(10, this.worldHeight / 2, 20, this.worldHeight, boundaryColor, boundaryAlpha);

        // Right boundary
        this.add.rectangle(this.worldWidth - 10, this.worldHeight / 2, 20, this.worldHeight, boundaryColor, boundaryAlpha);
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
            venue.ceremonyArea.x + venue.ceremonyArea.width / 2,
            venue.ceremonyArea.y + venue.ceremonyArea.height / 2,
            venue.ceremonyArea.width,
            venue.ceremonyArea.height,
            0x000000 // Black color
        );
        this.ceremonyArea.setAlpha(0);
        this.ceremonyArea.setDepth(1);
    }

    setupGroomAnimation() {
        // Create walking animations for different directions
        // Down walking (original spritesheet)
        this.anims.create({
            key: 'groom-walk-down',
            frames: [
                { key: 'groom', frame: 0 },
                { key: 'groom', frame: 1 },
                { key: 'groom', frame: 2 },
                { key: 'groom', frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Right walking (new spritesheet)
        this.anims.create({
            key: 'groom-walk-right',
            frames: [
                { key: 'groom-right', frame: 0 },
                { key: 'groom-right', frame: 1 },
                { key: 'groom-right', frame: 2 },
                { key: 'groom-right', frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Left walking (new spritesheet)
        this.anims.create({
            key: 'groom-walk-left',
            frames: [
                { key: 'groom-left', frame: 0 },
                { key: 'groom-left', frame: 1 },
                { key: 'groom-left', frame: 2 },
                { key: 'groom-left', frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Up walking (new spritesheet)
        this.anims.create({
            key: 'groom-walk-up',
            frames: [
                { key: 'groom-up', frame: 0 },
                { key: 'groom-up', frame: 1 },
                { key: 'groom-up', frame: 2 },
                { key: 'groom-up', frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Create idle animations for different directions
        this.anims.create({
            key: 'groom-idle-down',
            frames: [{ key: 'groom', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'groom-idle-right',
            frames: [{ key: 'groom-right', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'groom-idle-left',
            frames: [{ key: 'groom-left', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'groom-idle-up',
            frames: [{ key: 'groom-up', frame: 0 }],
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

        // Start with idle animation
        this.groom.play('groom-idle-down');

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
        document.getElementById('argumentBtn').addEventListener('click', () => this.useArgument());
        document.getElementById('pokeballBtn').addEventListener('click', () => this.usePokeball());
        
        // Setup instant tooltip for pokeball button
        const pokeballBtn = document.getElementById('pokeballBtn');
        const tooltip = document.getElementById('customTooltip');
        
        pokeballBtn.addEventListener('mouseenter', (e) => {
            if (pokeballBtn.disabled) {
                tooltip.textContent = 'You need to charm the bride first before you can throw the Pokeball!';
                tooltip.classList.remove('hidden');
                
                const rect = pokeballBtn.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = (rect.top - 10) + 'px';
            }
        });
        
        pokeballBtn.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
        document.getElementById('runBtn').addEventListener('click', () => this.runFromBattle());
    }

    createCoordinateDisplay() {
        // Set up console logging every second
        this.lastLogTime = 0;
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
            this.checkVenueAreas();
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
    }

    handleGroomAnimation() {
        const velocityX = this.groom.body.velocity.x;
        const velocityY = this.groom.body.velocity.y;
        const isMoving = velocityX !== 0 || velocityY !== 0;

        // Determine direction and appropriate animation
        let animationKey = 'groom-idle-down'; // Default idle animation

        if (isMoving) {
            // Determine which direction the groom is moving
            if (velocityX > 0) {
                // Moving right
                animationKey = 'groom-walk-right';
            } else if (velocityX < 0) {
                // Moving left
                animationKey = 'groom-walk-left';
            } else if (velocityY > 0) {
                // Moving down
                animationKey = 'groom-walk-down';
            } else if (velocityY < 0) {
                // Moving up
                animationKey = 'groom-walk-up';
            }
        } else {
            // Idle state - use last direction
            if (this.groom.lastVelocityX > 0) {
                animationKey = 'groom-idle-right';
            } else if (this.groom.lastVelocityX < 0) {
                animationKey = 'groom-idle-left';
            } else if (this.groom.lastVelocityY > 0) {
                animationKey = 'groom-idle-down';
            } else if (this.groom.lastVelocityY < 0) {
                animationKey = 'groom-idle-up';
            }
        }

        // Check if movement state changed or if we need to change animation
        if (isMoving !== this.groom.isMoving) {
            this.groom.isMoving = isMoving;
            this.groom.play(animationKey);
        } else if (isMoving && this.groom.anims.currentAnim && this.groom.anims.currentAnim.key !== animationKey) {
            // If we're moving but the animation doesn't match, change it
            this.groom.play(animationKey);
        }

        // Update last velocity for direction detection
        this.groom.lastVelocityX = velocityX;
        this.groom.lastVelocityY = velocityY;
    }



        checkProximityToBride() {
        if (this.bride.captured) return;
        
        // Don't start battle if cooldown is active
        if (this.battleCooldown) return;
        
        const distance = Phaser.Math.Distance.Between(
            this.groom.x, this.groom.y,
            this.bride.x, this.bride.y
        );
        
        if (distance < this.settings.proximityDistance) {
            this.startBattle();
        }
    }

    checkVenueAreas() {
        const venue = GAME_CONFIG.venue;
        const groomX = this.groom.x;
        const groomY = this.groom.y;

        // Check each venue area
        Object.keys(venue).forEach(areaKey => {
            const areaConfig = venue[areaKey];

            // Check if groom is inside the area bounds
            const areaLeft = areaConfig.x;
            const areaRight = areaConfig.x + areaConfig.width;
            const areaTop = areaConfig.y;
            const areaBottom = areaConfig.y + areaConfig.height;

            const isInArea = groomX >= areaLeft && groomX <= areaRight &&
                groomY >= areaTop && groomY <= areaBottom;

            // Create a unique flag name for each area
            const areaFlag = `in${areaKey.charAt(0).toUpperCase() + areaKey.slice(1)}Area`;

            // Show message only when entering the area (not continuously)
            if (isInArea && !this[areaFlag]) {
                this[areaFlag] = true;
                this.showMessage(areaConfig.message);
            } else if (!isInArea && this[areaFlag]) {
                // Reset flag when leaving the area
                this[areaFlag] = false;
            }
        });
    }

        startBattle() {
        this.gameState = 'battling';
        
        // Stop the groom's movement and animation immediately
        this.groom.setVelocity(0, 0);
        this.groom.stop();
        this.groom.setFrame(0); // Show static frame
        
        // Switch to battle music
        this.stopMapMusic();
        this.startBattleMusic();
        
        // Create battle transition overlay
        this.createBattleTransition();
    }
    
    createBattleTransition() {
        // Create a simple white flash (like original Pokémon)
        this.createBattleFlash();
        
        // Create a black overlay that covers the entire screen
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        this.battleTransition = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            screenWidth,
            screenHeight,
            0x000000
        );
        this.battleTransition.setDepth(1000);
        this.battleTransition.setAlpha(0);
        this.battleTransition.setScrollFactor(0);
        
        // Simple fade in (like original Pokémon)
        this.tweens.add({
            targets: this.battleTransition,
            alpha: 1,
            duration: 600,
            onComplete: () => {
                this.showBattleUI();
                // Simple fade out
                this.tweens.add({
                    targets: this.battleTransition,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => {
                        this.battleTransition.destroy();
                    }
                });
            }
        });
    }
    
    createBattleFlash() {
        // Create a simple white flash (like original Pokémon)
        const flash = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0xFFFFFF
        );
        flash.setDepth(999);
        flash.setScrollFactor(0);
        flash.setAlpha(0);
        
        // Simple flash in and out (like original Pokémon)
        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 100,
            onComplete: () => {
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        flash.destroy();
                    }
                });
            }
        });
    }
    
    showBattleUI() {
        // Show the battle overlay
        this.battleOverlay.classList.remove('hidden');
        
        // Reset battle stats
        this.groomHP = this.groomMaxHP;
        this.brideHP = this.brideMaxHP;
        this.argumentUsed = false; // Reset argument usage
        this.updateHealthBars();
        
        // Disable pokeball initially
        document.getElementById('pokeballBtn').disabled = true;
        
        // Reset argument button
        const argumentBtn = document.getElementById('argumentBtn');
        argumentBtn.disabled = false;
        argumentBtn.style.opacity = '1';
        
        this.updateBattleMessage('A wild Bride appeared! 💕');
    }
    
    createExitTransition(callback) {
        // Create a simple black overlay that covers the entire screen
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        this.exitTransition = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            screenWidth,
            screenHeight,
            0x000000
        );
        this.exitTransition.setDepth(1000);
        this.exitTransition.setAlpha(0);
        this.exitTransition.setScrollFactor(0);
        
        // Simple fade in (like original Pokémon)
        this.tweens.add({
            targets: this.exitTransition,
            alpha: 1,
            duration: 400,
            onComplete: () => {
                callback();
                // Simple fade out
                this.tweens.add({
                    targets: this.exitTransition,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => {
                        this.exitTransition.destroy();
                    }
                });
            }
        });
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

        const moveButtons = Object.keys(this.moves).map(move => move + 'Btn');
        moveButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
        setTimeout(() => {
            moveButtons.forEach(id => {
                const btn = document.getElementById(id);
                // Only re-enable if not permanently disabled (e.g., argumentBtn after use)
                if (btn && btn.style.opacity !== '0.5') btn.disabled = false;
            });
        }, 2000);

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
            }, 1000);
        }
    }

    usePokeball() {
        if (this.brideHP <= 0) {
            this.throwPokeball();
        } else {
            this.updateBattleMessage('💔 Ghinwa is not charmed enough yet! Try using more moves!');
        }
    }

    useArgument() {
        // Check if argument has been used before
        if (this.argumentUsed) {
            this.updateBattleMessage('🤦 Haven\'t you learned from your mistake? Maybe you\'re not ready to get married...');
            // Disable the button permanently
            const button = document.getElementById('argumentBtn');
            button.disabled = true;
            button.style.opacity = '0.5';
            return;
        }
        
        // Mark argument as used (first time)
        this.argumentUsed = true;
        
        // Argument move damages the groom instead of the bride!
        const damage = 10;
        this.groomHP = Math.max(0, this.groomHP - damage);
        this.updateHealthBars();
        this.updateBattleMessage('🧠 Leonardo started an argument! It backfired! Leonardo took ' + damage + ' damage!');
        
        // Check if groom fainted
        if (this.groomHP <= 0) {
            this.groomHP = 0;
            this.updateHealthBars();
            this.updateBattleMessage('💔 Leonardo fainted from arguing too much!');
            // Could add game over logic here if needed
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
        
        // Switch back to map music
        this.stopBattleMusic();
        this.startMapMusic();
        
        // Create exit transition
        this.createExitTransition(() => {
            // After transition, hide battle UI and show capture message
            this.battleOverlay.classList.add('hidden');
            
            // Ensure groom is stopped and reset animation state
            this.groom.setVelocity(0, 0);
            this.groom.stop();
            this.groom.setFrame(0);
            this.groom.isMoving = false;
            
            this.showMessage(this.weddingDetails.capturedMessage);
            
            this.bride.setVisible(false);
            
                    setTimeout(() => {
            this.showPermanentMessage(this.weddingDetails.title + '\n' + this.weddingDetails.message);
        }, 3000);
        });
    }

        runFromBattle() {
        this.gameState = 'exploring';
        
        // Switch back to map music
        this.stopBattleMusic();
        this.startMapMusic();
        
        // Move groom away immediately to prevent re-trigger
        const angle = Phaser.Math.Angle.Between(this.bride.x, this.bride.y, this.groom.x, this.groom.y);
        const distance = 200; // Move 200 pixels away
        this.groom.x = this.bride.x + Math.cos(angle) * distance;
        this.groom.y = this.bride.y + Math.sin(angle) * distance;
        
        // Keep groom in world bounds
        this.groom.x = Math.max(this.groom.width / 2, Math.min(this.worldWidth - this.groom.width / 2, this.groom.x));
        this.groom.y = Math.max(this.groom.height / 2, Math.min(this.worldHeight - this.groom.height / 2, this.groom.y));
        
        // Stop movement
        this.groom.setVelocity(0, 0);
        
        // Add a cooldown period to prevent immediate re-trigger
        this.battleCooldown = true;
        this.time.delayedCall(2000, () => {
            this.battleCooldown = false;
        });
        
        // Create exit transition
        this.createExitTransition(() => {
            // After transition, hide battle UI
            this.battleOverlay.classList.add('hidden');
            
            this.showMessage('🏃 You ran away from the battle...');
        });
    }

        showMessage(message) {
        const messageText = this.add.text(this.groom.x, this.groom.y - 80, message, {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        messageText.setOrigin(0.5);
        messageText.setDepth(10); // Always on top
        
        // Animate the message (fade in, stay, fade out)
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // After fade in, wait then fade out
                this.time.delayedCall(this.settings.messageDuration, () => {
                    this.tweens.add({
                        targets: messageText,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            messageText.destroy();
                        }
                    });
                });
            }
        });
    }
    
    showPermanentMessage(message) {
        const messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
            align: 'center'
        });
        messageText.setOrigin(0.5);
        messageText.setDepth(1000); // Very high depth to be on top
        messageText.setScrollFactor(0); // Stay fixed to screen
        
        // Fade in only, no fade out
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
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