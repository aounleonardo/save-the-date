// Phaser 3 Wedding Save The Date Game

class WeddingGame extends Phaser.Game {
    constructor() {
        const config = {
            type: Phaser.AUTO,
            parent: 'gameContainer',
            width: 800,
            height: 600,
            backgroundColor: '#87CEEB',
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
        // Create colored rectangles as sprites using graphics
        const groomGraphics = this.make.graphics();
        groomGraphics.fillStyle(0x2E86AB);
        groomGraphics.fillCircle(15, 15, 15);
        groomGraphics.generateTexture('groom', 30, 30);
        groomGraphics.destroy();
        
        const brideGraphics = this.make.graphics();
        brideGraphics.fillStyle(0xFF69B4);
        brideGraphics.fillCircle(15, 15, 15);
        brideGraphics.generateTexture('bride', 30, 30);
        brideGraphics.destroy();
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
    }

    create() {
        // Create venue areas
        this.createVenue();
        
        // Create characters
        this.createCharacters();
        
        // Setup input
        this.setupInput();
        
        // Setup UI
        this.setupUI();
        
        // Setup battle system
        this.setupBattleSystem();
    }

    createVenue() {
        const venue = GAME_CONFIG.venue;
        
        // Create venue areas as colored rectangles
        this.altar = this.add.rectangle(
            venue.altar.x + venue.altar.width/2,
            venue.altar.y + venue.altar.height/2,
            venue.altar.width,
            venue.altar.height,
            Phaser.Display.Color.ValueToColor(venue.altar.color).color
        );
        this.altar.setStrokeStyle(2, 0x000000);
        
        this.reception = this.add.rectangle(
            venue.reception.x + venue.reception.width/2,
            venue.reception.y + venue.reception.height/2,
            venue.reception.width,
            venue.reception.height,
            Phaser.Display.Color.ValueToColor(venue.reception.color).color
        );
        this.reception.setStrokeStyle(2, 0x000000);
        
        this.danceFloor = this.add.rectangle(
            venue.danceFloor.x + venue.danceFloor.width/2,
            venue.danceFloor.y + venue.danceFloor.height/2,
            venue.danceFloor.width,
            venue.danceFloor.height,
            Phaser.Display.Color.ValueToColor(venue.danceFloor.color).color
        );
        this.danceFloor.setStrokeStyle(2, 0x000000);
        
        this.entrance = this.add.rectangle(
            venue.entrance.x + venue.entrance.width/2,
            venue.entrance.y + venue.entrance.height/2,
            venue.entrance.width,
            venue.entrance.height,
            Phaser.Display.Color.ValueToColor(venue.entrance.color).color
        );
        this.entrance.setStrokeStyle(2, 0x000000);
        
        // Add labels
        this.add.text(venue.altar.x + venue.altar.width/2, venue.altar.y + venue.altar.height/2, 
            venue.altar.label, { fontSize: '12px', fill: '#000' }).setOrigin(0.5);
        this.add.text(venue.reception.x + venue.reception.width/2, venue.reception.y + venue.reception.height/2, 
            venue.reception.label, { fontSize: '12px', fill: '#000' }).setOrigin(0.5);
        this.add.text(venue.danceFloor.x + venue.danceFloor.width/2, venue.danceFloor.y + venue.danceFloor.height/2, 
            venue.danceFloor.label, { fontSize: '12px', fill: '#000' }).setOrigin(0.5);
        this.add.text(venue.entrance.x + venue.entrance.width/2, venue.entrance.y + venue.entrance.height/2, 
            venue.entrance.label, { fontSize: '12px', fill: '#000' }).setOrigin(0.5);
    }

    createCharacters() {
        const groomConfig = GAME_CONFIG.characters.groom;
        const brideConfig = GAME_CONFIG.characters.bride;
        
        // Create groom with physics
        this.groom = this.physics.add.sprite(groomConfig.startX, groomConfig.startY, 'groom');
        this.groom.setDisplaySize(groomConfig.size, groomConfig.size);
        this.groom.setCollideWorldBounds(true);
        
        // Create bride
        this.bride = this.physics.add.sprite(brideConfig.x, brideConfig.y, 'bride');
        this.bride.setDisplaySize(brideConfig.size, brideConfig.size);
        this.bride.captured = false;
        
        // Add groom details (hat and face)
        this.groomHat = this.add.rectangle(
            this.groom.x, this.groom.y - 10, 16, 8,
            Phaser.Display.Color.ValueToColor(groomConfig.hatColor).color
        );
        this.groomFace = this.add.circle(
            this.groom.x, this.groom.y - 5, 8,
            Phaser.Display.Color.ValueToColor(groomConfig.faceColor).color
        );
        
        // Add bride details (veil, face, crown)
        this.brideVeil = this.add.rectangle(
            this.bride.x, this.bride.y - 10, 30, 15,
            Phaser.Display.Color.ValueToColor(brideConfig.veilColor).color
        );
        this.brideFace = this.add.circle(
            this.bride.x, this.bride.y - 5, 8,
            Phaser.Display.Color.ValueToColor(brideConfig.faceColor).color
        );
        this.brideCrown = this.add.rectangle(
            this.bride.x, this.bride.y - 15, 20, 5,
            Phaser.Display.Color.ValueToColor(brideConfig.crownColor).color
        );
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
        
        // Battle menu event listeners
        document.getElementById('flirtBtn').addEventListener('click', () => this.useMove('flirt'));
        document.getElementById('kissBtn').addEventListener('click', () => this.useMove('kiss'));
        document.getElementById('complimentBtn').addEventListener('click', () => this.useMove('compliment'));
        document.getElementById('pokeballBtn').addEventListener('click', () => this.usePokeball());
        document.getElementById('runBtn').addEventListener('click', () => this.runFromBattle());
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
            this.updateCharacterDetails();
            this.checkProximityToBride();
        }
    }

    handleMovement() {
        const speed = GAME_CONFIG.characters.groom.speed;
        this.groom.setVelocity(0);
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.groom.setVelocityX(-speed);
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.groom.setVelocityX(speed);
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.groom.setVelocityY(-speed);
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.groom.setVelocityY(speed);
        }
        
        // Check for interaction
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.checkInteraction();
        }
    }

    updateCharacterDetails() {
        // Update groom details position
        this.groomHat.setPosition(this.groom.x, this.groom.y - 10);
        this.groomFace.setPosition(this.groom.x, this.groom.y - 5);
        
        // Update bride details position
        if (!this.bride.captured) {
            this.brideVeil.setPosition(this.bride.x, this.bride.y - 10);
            this.brideFace.setPosition(this.bride.x, this.bride.y - 5);
            this.brideCrown.setPosition(this.bride.x, this.bride.y - 15);
        }
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
        const altarConfig = GAME_CONFIG.venue.altar;
        const distance = Phaser.Math.Distance.Between(
            this.groom.x, this.groom.y,
            altarConfig.x + altarConfig.width/2,
            altarConfig.y + altarConfig.height/2
        );
        
        if (distance < this.settings.interactionDistance) {
            this.showMessage('💒 You approach the altar... the perfect place for your special moment!');
        }
    }

    startBattle() {
        this.gameState = 'battling';
        this.battleOverlay.classList.remove('hidden');
        
        // Stop the groom's movement
        this.groom.setVelocity(0, 0);
        
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
        
        // After pokeball animation, show capture sequence
        setTimeout(() => {
            pokeball.style.display = 'none';
            pokeball.classList.remove('pokeball-throw');
            
            // Add capture success animation to bride sprite
            brideSprite.classList.add('capture-success');
            this.updateBattleMessage('🎉 Gotcha! Ghinwa was caught! 💕');
            
            // Complete the capture after animation
            setTimeout(() => {
                this.captureBride();
            }, 2000);
            
        }, 1500);
    }

    captureBride() {
        this.bride.captured = true;
        this.gameState = 'captured';
        this.battleOverlay.classList.add('hidden');
        
        this.showMessage(this.weddingDetails.capturedMessage);
        
        // Hide bride details
        this.brideVeil.setVisible(false);
        this.brideFace.setVisible(false);
        this.brideCrown.setVisible(false);
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
        
        // Keep groom in bounds
        this.groom.x = Math.max(this.groom.width/2, Math.min(this.game.config.width - this.groom.width/2, this.groom.x));
        this.groom.y = Math.max(this.groom.height/2, Math.min(this.game.config.height - this.groom.height/2, this.groom.y));
        
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