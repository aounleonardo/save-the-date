// Wedding Save The Date Game Configuration
// Edit these values to customize your game!

const GAME_CONFIG = {
    // Venue Layout - Easy to edit!
    venue: {
        ceremonyArea: { 
            x: 250, y: 120, width: 180, height: 320, 
            color: '#8B4513', 
            label: 'Ceremony Area' 
        }
    },
    
    // Character positions and colors
    characters: {
        groom: {
            startX: 72,
            startY: 450,
            size: 30,
            speed: 100,
            color: '#2E86AB',
            hatColor: '#000',
            faceColor: '#FFE4C4'
        },
        bride: {
            x: 342,
            y: 180,
            size: 30,
            color: '#FF69B4',
            veilColor: '#FFF',
            faceColor: '#FFE4C4',
            crownColor: '#FFD700'
        }
    },
    
    // Battle moves - customize the romantic moves!
    moves: {
        flirt: { 
            name: 'Flirt', 
            power: 15, 
            message: '💋 Groom used Flirt! It\'s super effective!',
            emoji: '💋'
        },
        kiss: { 
            name: 'Kiss', 
            power: 20, 
            message: '😘 Groom used Kiss! Critical hit!',
            emoji: '😘'
        },
        compliment: { 
            name: 'Compliment', 
            power: 10, 
            message: '💝 Groom used Compliment! Bride is charmed!',
            emoji: '💝'
        }
    },
    
    // Game settings
    settings: {
        proximityDistance: 60, // How close to start battle
        interactionDistance: 80, // How close to interact with altar
        messageDuration: 3000   // How long messages show (ms)
    },
    
    // Wedding details - customize this for your save the date!
    weddingDetails: {
        title: '💒 Save The Date! 💒',
        message: 'We\'re getting married!\n\n[Your wedding details here]\n\nDate: [Your Date]\nVenue: [Your Venue]\nTime: [Your Time]',
        capturedMessage: '🎉 Congratulations! You captured the Bride! 💒💕'
    }
};

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
} 