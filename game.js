class WeddingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.battleMenu = document.getElementById('battleMenu');
        this.messageBox = document.getElementById('messageBox');
        
        this.gameState = 'exploring';
        this.inBattle = false;
        this.battleProgress = 0;
        
        this.player = {
            x: GAME_CONFIG.characters.groom.startX,
            y: GAME_CONFIG.characters.groom.startY,
            size: GAME_CONFIG.characters.groom.size,
            speed: GAME_CONFIG.characters.groom.speed,
            color: GAME_CONFIG.characters.groom.color,
            vx: 0, // velocity x
            vy: 0, // velocity y
            maxSpeed: GAME_CONFIG.characters.groom.speed,
            acceleration: GAME_CONFIG.characters.groom.acceleration,
            friction: GAME_CONFIG.characters.groom.friction
        };
        
        this.bride = {
            x: GAME_CONFIG.characters.bride.x,
            y: GAME_CONFIG.characters.bride.y,
            size: GAME_CONFIG.characters.bride.size,
            color: GAME_CONFIG.characters.bride.color,
            captured: false
        };
        
        this.venue = GAME_CONFIG.venue;
        this.moves = GAME_CONFIG.moves;
        this.settings = GAME_CONFIG.settings;
        this.weddingDetails = GAME_CONFIG.weddingDetails;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'exploring') {
                this.handleMovement(e);
            }
        });
        
        document.getElementById('flirtBtn').addEventListener('click', () => this.useMove('flirt'));
        document.getElementById('kissBtn').addEventListener('click', () => this.useMove('kiss'));
        document.getElementById('complimentBtn').addEventListener('click', () => this.useMove('compliment'));
        document.getElementById('pokeballBtn').addEventListener('click', () => this.usePokeball());
        document.getElementById('runBtn').addEventListener('click', () => this.runFromBattle());
    }
    
    handleMovement(e) {
        const key = e.key.toLowerCase();
        
        switch(key) {
            case 'w':
            case 'arrowup':
                this.player.vy -= this.player.acceleration;
                break;
            case 's':
            case 'arrowdown':
                this.player.vy += this.player.acceleration;
                break;
            case 'a':
            case 'arrowleft':
                this.player.vx -= this.player.acceleration;
                break;
            case 'd':
            case 'arrowright':
                this.player.vx += this.player.acceleration;
                break;
            case ' ':
                this.checkInteraction();
                break;
        }
        
        // Limit maximum speed
        this.player.vx = Math.max(-this.player.maxSpeed, Math.min(this.player.maxSpeed, this.player.vx));
        this.player.vy = Math.max(-this.player.maxSpeed, Math.min(this.player.maxSpeed, this.player.vy));
    }
    
    updatePlayerMovement() {
        // Apply friction
        this.player.vx *= this.player.friction;
        this.player.vy *= this.player.friction;
        
        // Update position
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Keep player in bounds
        this.player.x = Math.max(this.player.size/2, Math.min(this.canvas.width - this.player.size/2, this.player.x));
        this.player.y = Math.max(this.player.size/2, Math.min(this.canvas.height - this.player.size/2, this.player.y));
        
        // Stop movement if very small (prevent jitter)
        if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
        if (Math.abs(this.player.vy) < 0.1) this.player.vy = 0;
        
        // Check proximity to bride if moving
        if (Math.abs(this.player.vx) > 0.1 || Math.abs(this.player.vy) > 0.1) {
            this.checkProximityToBride();
        }
    }
    
    checkProximityToBride() {
        const distance = Math.sqrt(
            Math.pow(this.player.x - this.bride.x, 2) + 
            Math.pow(this.player.y - this.bride.y, 2)
        );
        
        if (distance < this.settings.proximityDistance && !this.bride.captured && this.gameState === 'exploring') {
            this.startBattle();
        }
    }
    
    checkInteraction() {
        const altarDistance = Math.sqrt(
            Math.pow(this.player.x - (this.venue.altar.x + this.venue.altar.width/2), 2) + 
            Math.pow(this.player.y - (this.venue.altar.y + this.venue.altar.height/2), 2)
        );
        
        if (altarDistance < this.settings.interactionDistance) {
            this.showMessage('💒 You approach the altar... the perfect place for your special moment!');
        }
    }
    
    startBattle() {
        this.gameState = 'battling';
        this.inBattle = true;
        this.battleProgress = 0;
        this.battleMenu.classList.remove('hidden');
        this.showMessage('💕 A wild Bride appeared! 💕');
    }
    
    useMove(moveType) {
        const move = this.moves[moveType];
        this.battleProgress += move.power;
        this.showMessage(move.message);
        
        document.getElementById(moveType + 'Btn').disabled = true;
        setTimeout(() => {
            document.getElementById(moveType + 'Btn').disabled = false;
        }, 1000);
        
        if (this.battleProgress >= this.settings.battleThreshold) {
            this.showMessage('💕 The Bride is charmed! Now is your chance to use the Pokeball!');
            document.getElementById('pokeballBtn').disabled = false;
        }
    }
    
    usePokeball() {
        if (this.battleProgress >= this.settings.battleThreshold) {
            this.captureBride();
        } else {
            this.showMessage('💔 The Bride is not charmed enough yet! Try using more moves!');
        }
    }
    
    captureBride() {
        this.bride.captured = true;
        this.gameState = 'captured';
        this.battleMenu.classList.add('hidden');
        this.showMessage(this.weddingDetails.capturedMessage);
        
        setTimeout(() => {
            this.showMessage(this.weddingDetails.title + '\n' + this.weddingDetails.message);
        }, 3000);
    }
    
    runFromBattle() {
        this.gameState = 'exploring';
        this.inBattle = false;
        this.battleProgress = 0;
        this.battleMenu.classList.add('hidden');
        this.showMessage('🏃 You ran away from the battle...');
    }
    
    showMessage(message) {
        this.messageBox.textContent = message;
        this.messageBox.classList.remove('hidden');
        setTimeout(() => {
            this.messageBox.classList.add('hidden');
        }, this.settings.messageDuration);
    }
    
    drawVenue() {
        this.ctx.fillStyle = this.venue.altar.color;
        this.ctx.fillRect(this.venue.altar.x, this.venue.altar.y, this.venue.altar.width, this.venue.altar.height);
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(this.venue.altar.label, this.venue.altar.x + 35, this.venue.altar.y + 45);
        
        this.ctx.fillStyle = this.venue.reception.color;
        this.ctx.fillRect(this.venue.reception.x, this.venue.reception.y, this.venue.reception.width, this.venue.reception.height);
        this.ctx.fillText(this.venue.reception.label, this.venue.reception.x + 45, this.venue.reception.y + 55);
        
        this.ctx.fillStyle = this.venue.danceFloor.color;
        this.ctx.fillRect(this.venue.danceFloor.x, this.venue.danceFloor.y, this.venue.danceFloor.width, this.venue.danceFloor.height);
        this.ctx.fillText(this.venue.danceFloor.label, this.venue.danceFloor.x + 35, this.venue.danceFloor.y + 45);
        
        this.ctx.fillStyle = this.venue.entrance.color;
        this.ctx.fillRect(this.venue.entrance.x, this.venue.entrance.y, this.venue.entrance.width, this.venue.entrance.height);
        this.ctx.fillText(this.venue.entrance.label, this.venue.entrance.x + 20, this.venue.entrance.y + 35);
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size/2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = GAME_CONFIG.characters.groom.hatColor;
        this.ctx.fillRect(this.player.x - 8, this.player.y - 20, 16, 8);
        
        this.ctx.fillStyle = GAME_CONFIG.characters.groom.faceColor;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y - 5, 8, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawBride() {
        if (!this.bride.captured) {
            this.ctx.fillStyle = this.bride.color;
            this.ctx.beginPath();
            this.ctx.arc(this.bride.x, this.bride.y, this.bride.size/2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.fillStyle = GAME_CONFIG.characters.bride.veilColor;
            this.ctx.fillRect(this.bride.x - 15, this.bride.y - 25, 30, 15);
            
            this.ctx.fillStyle = GAME_CONFIG.characters.bride.faceColor;
            this.ctx.beginPath();
            this.ctx.arc(this.bride.x, this.bride.y - 5, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.fillStyle = GAME_CONFIG.characters.bride.crownColor;
            this.ctx.fillRect(this.bride.x - 10, this.bride.y - 30, 20, 5);
        }
    }
    
    drawBattleUI() {
        if (this.inBattle) {
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(50, 50, 200, 20);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(50, 50, (this.battleProgress / 100) * 200, 20);
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Charm Progress: ${this.battleProgress}%`, 50, 40);
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updatePlayerMovement();
        this.drawVenue();
        this.drawBride();
        this.drawPlayer();
        this.drawBattleUI();
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new WeddingGame();
}); 