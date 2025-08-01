# 💒 Wedding Save The Date Game 💒

A fun Pokemon-style game built with Phaser 3 where you, the groom, walk around your wedding venue to capture the bride with romantic moves!

## 🎮 How to Play

1. **Move around**: Use WASD or Arrow Keys to move your character (the groom)
2. **Explore the venue**: Walk around the different areas (altar, reception, dance floor, entrance)
3. **Find the bride**: Get close to the bride sprite to start a battle
4. **Charm the bride**: Use romantic moves like Flirt, Kiss, and Compliment
5. **Capture with Pokeball**: Once the charm meter is full, use the Pokeball to capture the bride
6. **Save the Date**: After capturing, your wedding details will be displayed!

## 🎯 Game Features

- **Built with Phaser 3**: Professional game engine with physics, sprites, and scene management
- **Smooth Character Movement**: Physics-based movement with proper collision detection
- **Venue Exploration**: Multiple areas to explore (altar, reception, dance floor, entrance)
- **Battle System**: Pokemon-style battle with romantic moves instead of fighting
- **Charm Meter**: Build up charm to capture the bride
- **Customizable**: Easy to edit venue layout, colors, and wedding details

## 🛠️ Customization

### Easy Venue Layout Editing

Open `config.js` to customize:

```javascript
venue: {
    altar: { 
        x: 400, y: 200, width: 100, height: 80, 
        color: '#8B4513', 
        label: 'Altar' 
    },
    // Add more areas or modify existing ones
}
```

### Wedding Details

Edit the wedding details in `config.js`:

```javascript
weddingDetails: {
    title: '💒 Save The Date! 💒',
    message: 'We\'re getting married!\n\nDate: [Your Date]\nVenue: [Your Venue]\nTime: [Your Time]',
    capturedMessage: '🎉 Congratulations! You captured the Bride! 💒💕'
}
```

### Character Customization

Modify character positions and colors:

```javascript
characters: {
    groom: {
        startX: 100,
        startY: 300,
        color: '#2E86AB',
        // ... more options
    },
    bride: {
        x: 600,
        y: 250,
        color: '#FF69B4',
        // ... more options
    }
}
```

### Battle Moves

Customize the romantic moves:

```javascript
moves: {
    flirt: { 
        name: 'Flirt', 
        power: 20, 
        message: '💋 You give her a charming smile!',
        emoji: '💋'
    },
    // Add more moves or modify existing ones
}
```

## 🚀 How to Run

1. Simply open `index.html` in a web browser
2. No server required - it's a pure HTML5/JavaScript game using Phaser 3
3. Works on desktop and mobile browsers
4. Phaser 3 is loaded from CDN, so internet connection is required

## 🎨 Adding Custom Assets

To add custom images or sprites:

1. Create an `assets/` folder
2. Add your image files
3. Modify the drawing functions in `game.js` to use your images instead of shapes

## 📱 Mobile Support

The game works on mobile devices! Touch controls can be added by modifying the event listeners in `game.js`.

## 💝 Perfect for Save The Dates

This game is perfect for:
- Wedding save the dates
- Engagement announcements
- Wedding website entertainment
- Pre-wedding events

Just customize the wedding details and venue layout to match your special day!

---

**Made with 💕 for your special day!** 