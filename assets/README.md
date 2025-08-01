# Assets Directory

This directory contains all media files for the Wedding Save The Date game.

## Structure

```
assets/
├── images/          # All image files (backgrounds, sprites, etc.)
│   ├── .gitkeep    # Preserves directory structure in git
│   ├── background.png
│   └── old_background.jpg
└── README.md       # This file
```

## Media Files

- **background.png**: Current game background image
- **old_background.jpg**: Previous background image (kept for reference)

## Git Ignore Rules

All media files in `assets/images/` are ignored by default via `.gitignore`. This prevents large media files from being committed to the repository.

To add a new image:
1. Place it in `assets/images/`
2. Update the game code to reference the new path
3. If you want to track a specific image, you can temporarily remove it from `.gitignore` or use `git add -f assets/images/your-image.png`

## Adding New Assets

When adding new media files:
1. Place them in the appropriate subdirectory (`images/`, `audio/`, etc.)
2. Update the game code to reference the new path
3. Consider the file size and whether it should be tracked in git 