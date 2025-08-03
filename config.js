// Wedding Save The Date Game Configuration
// Edit these values to customize your game!

const GAME_CONFIG = {
    // Venue Layout - Easy to edit!
    // Coordinates are now in world space (2400x1800 world)
    venue: {
        ceremonyArea: { 
            x: 750, y: 360, width: 540, height: 960, 
            color: '#8B4513', 
            label: 'Ceremony Area' 
        }
    },
    
    // Character positions and colors
    // Coordinates are now in world space (2400x1800 world)
    characters: {
        groom: {
            startX: 65 * 3,
            startY: 400 * 3,
            size: 48,
            speed: 160
        },
        bride: {
            x: 1026, // Scaled from original 342
            y: 540,  // Scaled from original 180
            size: 36
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