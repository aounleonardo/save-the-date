// Wedding Save The Date Game Configuration
// Edit these values to customize your game!

const GAME_CONFIG = {
    // Venue Layout - Easy to edit!
    // Coordinates are now in world space (2400x1800 world)
    venue: {
        houseArea: {
            message: 'I\'m not chickening out,\nI\'m going to get married!',
            x: 52 * 1.56,
            y: 522 * 1.76,
            width: (302 - 52) * 1.56,
            height: (640 - 522) * 1.76
        },
        rightPathArea: {
            message: 'I don\'t think she went that way...',
            x: 296 * 1.56,
            y: 646 * 1.76,
            width: (455 - 296) * 1.56,
            height: (802 - 646) * 1.76
        },
        downArea: {
            message: 'Yes I think she went this way.',
            x: 106 * 1.56,
            y: 826 * 1.76,
            width: (194 - 106) * 1.56,
            height: (966 - 826) * 1.76
        },
        perfumeArea: {
            message: 'I can smell her perfume',
            x: 546 * 1.56,
            y: 851 * 1.76,
            width: (736 - 546) * 1.56,
            height: (1015 - 851) * 1.76
        },
        ceremonyArea: { 
            x: 780, y: 360, width: 510, height: 860, 
            message: 'Oh my god, I\'m gonna cry...\nShe\'s gorgeous',
            color: '#8B4513', 
            label: 'Ceremony Area' 
        },
        duckArea: {
            message: 'What a cool duck!',
            x: 950 * 1.56,
            y: 796 * 1.76,
            width: (1254 - 950) * 1.56,
            height: (1002 - 796) * 1.76
        },
        receptionArea: {
            message: 'I hope everyone will dance their ass off',
            x: 970 * 1.56,
            y: 504 * 1.76,
            width: (1376 - 970) * 1.56,
            height: (686 - 504) * 1.76
        }
    },
    
    // Character positions and colors
    // Coordinates are now in world space (2400x1800 world)
    characters: {
        groom: {
            startX: 195,
            startY: 1200,
            size: 48,
            speed: 160
        },
        bride: {
            x: 1026,
            y: 540,
            size: 44
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
            message: '💝 Groom used Compliment! It seems to be working!',
            emoji: '💝'
        },
        argument: { 
            name: 'Start an argument',
            power: 0, 
            message: '🧠 Groom used Start an argument! It\'s not effective at all...',
            emoji: '🧠'
        }
    },
    
    // Game settings
    settings: {
        proximityDistance: 60, // How close to start battle
        messageDuration: 3000   // How long messages show (ms)
    },
    
    // Wedding details - customize this for your save the date!
    weddingDetails: {
        title: '💍 Save The Date! 🤸🏽‍♀️🍃',
        message: [
            "We’re getting married",
            "on July 18, 2026",
            "in our beautiful Lebanon!",
            "",
            "We hope you will include us",
            "in your summer travel plans."
        ].join('\n'),
        capturedMessage: '🎉 Congratulations! You captured the Bride! 💒💕'
    }
};

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
} 