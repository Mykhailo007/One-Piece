# Finding Intro End Times

The player now supports episode-specific intro end times. Here's how to add them:

## Method 1: Manual (Quick)

1. Play an episode and note when the title card appears
2. Add `introEnd` field to that episode in `catalog.json`:

```json
{
  "id": "s01e0919",
  "title": "Episode 919",
  "season": 1,
  "episode": 919,
  "description": "One Piece Episode 919",
  "mediaUrl": "/media/s01e0919.mp4",
  "subsUrl": "",
  "imageUrl": "/images/s01e0919.jpg",
  "duration": 1440,
  "introEnd": 245
}
```

## Method 2: Automated (Using ffmpeg)

You can use ffmpeg to detect scene changes and find the title card:

```bash
# Find all scene changes in a video
ffmpeg -i media/s01e0919.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep showinfo

# This will output timestamps of major scene changes
# Look for the one around 3-5 minutes in
```

## Method 3: Batch Processing

Create a Node.js script to process multiple episodes:

```javascript
const fs = require("fs");
const { execSync } = require("child_process");

// Read catalog
const catalog = JSON.parse(fs.readFileSync("./catalog/catalog.json"));

// Process each episode (this is manual but structured)
const introTimes = {
  s01e0915: 190,
  s01e0916: 205,
  s01e0917: 198,
  s01e0918: 215,
  s01e0919: 245,
  // Add more as you find them
};

// Update catalog
catalog.episodes = catalog.episodes.map((ep) => {
  if (introTimes[ep.id]) {
    return { ...ep, introEnd: introTimes[ep.id] };
  }
  return ep;
});

// Save updated catalog
fs.writeFileSync("./catalog/catalog.json", JSON.stringify(catalog, null, 2));
```

## Quick Reference

- Typical intro: 90-120 seconds
- Recap varies: 30-90 seconds
- Total range: 190-300 seconds
- Look for the episode title card appearance

## Current Behavior

- If `introEnd` is set: button shows until that time, skips to that time
- If not set: uses default (225 seconds show, 225 seconds skip)
