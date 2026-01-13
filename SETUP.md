# One Piece Mobile App - Setup Guide

## 🚀 Quick Start for Expo Go

### Prerequisites

- Node.js installed on your PC
- Expo Go app installed on your iPhone (from App Store)
- Both your PC and iPhone connected to the **same WiFi network**

---

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Start the Expo Development Server

```bash
npm start
```

This will:

- Start Metro bundler
- Display a QR code in terminal
- Open Expo Dev Tools in your browser

### 3. Connect via Expo Go

- Open **Expo Go** app on your iPhone
- Tap **"Scan QR code"**
- Scan the QR code from your terminal
- App will load on your device

---

## 🖥️ Backend Server Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Add Your Media Files

- Place video files (.mp4) in `backend/media/` folder
- Place thumbnail images (.jpg) in `backend/images/` folder
- Update `backend/catalog/catalog.json` with your episode details

### 3. Start the Server

```bash
npm run dev
```

Server will run on `http://0.0.0.0:3000`

### 4. Find Your PC's IP Address

**On Windows:**

```bash
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**On Mac/Linux:**

```bash
ifconfig
```

Look for `inet` address (e.g., `192.168.1.100`)

---

## 📲 Configure the Mobile App

1. Once the app loads on your iPhone, tap **"Go to Settings"**
2. Enter your server URL: `http://YOUR_PC_IP:3000`
   - Example: `http://192.168.1.100:3000`
3. Tap **"Save"** - it will test the connection
4. If successful, go back to view episodes!

---

## 🎨 Customize App Assets (Optional but Recommended)

Replace these placeholder files with your actual images:

- `mobile/assets/icon.png` - 1024x1024 PNG (app icon)
- `mobile/assets/splash.png` - 1284x2778 PNG (splash screen)
- `mobile/assets/adaptive-icon.png` - 1024x1024 PNG (Android adaptive icon)
- `mobile/assets/favicon.png` - 48x48 PNG (web favicon)

You can use tools like:

- [Canva](https://www.canva.com/) - Free design tool
- [App Icon Generator](https://www.appicon.co/) - Generate all sizes
- Any image editor (Photoshop, GIMP, etc.)

---

## 🔍 Troubleshooting

### App won't load on Expo Go

- ✅ Make sure both devices are on the same WiFi network
- ✅ Check if `npm start` is still running
- ✅ Try closing and reopening Expo Go
- ✅ Restart Metro bundler: press `r` in terminal

### Can't connect to backend server

- ✅ Verify backend server is running (`npm run dev`)
- ✅ Check your PC's firewall allows port 3000
- ✅ Confirm IP address is correct (use `ipconfig`/`ifconfig`)
- ✅ Try accessing `http://YOUR_IP:3000/health` in iPhone Safari
- ✅ Make sure both devices are on same WiFi (not guest network)

### Videos won't play

- ✅ Ensure videos are in `backend/media/` folder
- ✅ Check `catalog.json` has correct file paths
- ✅ Verify video format is .mp4 (H.264 codec recommended)
- ✅ Test video files play on your PC first

### App crashes or white screen

- ✅ Check terminal for error messages
- ✅ Shake iPhone and tap "Reload"
- ✅ Clear Metro cache: `npm start -- --clear`
- ✅ Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📁 Project Structure

```
One-Piece/
├── mobile/                 # React Native app
│   ├── app/               # Expo Router screens
│   │   ├── index.tsx     # Home/Episodes list
│   │   ├── player.tsx    # Video player
│   │   ├── downloads.tsx # Downloaded episodes
│   │   ├── settings.tsx  # Server configuration
│   │   └── _layout.tsx   # Navigation layout
│   ├── src/
│   │   ├── api.ts        # API functions
│   │   ├── storage.ts    # AsyncStorage helpers
│   │   └── types.ts      # TypeScript types
│   ├── assets/           # App icons and images
│   ├── app.json          # Expo configuration
│   ├── package.json
│   └── tsconfig.json
│
└── backend/               # Express server
    ├── catalog/
    │   └── catalog.json  # Episode metadata
    ├── media/            # Video files (.mp4)
    ├── images/           # Thumbnail images
    ├── server.js         # Express server
    └── package.json
```

---

## 🎯 Features

✨ **Browse Episodes** - View all available One Piece episodes
📥 **Download for Offline** - Download episodes to watch without internet
▶️ **Video Player** - Stream or play downloaded episodes
⚙️ **Server Configuration** - Easy setup with connection testing
🔄 **Pull to Refresh** - Update episode list anytime

---

## 🛠️ Development Commands

### Mobile

```bash
npm start          # Start Expo development server
npm run android    # Open on Android emulator
npm run ios        # Open on iOS simulator (Mac only)
npm run web        # Open in web browser
```

### Backend

```bash
npm run dev        # Start Express server
```

---

## 📝 Next Steps for Your MVP

1. **Add Real Assets** - Replace placeholder images with actual app icons
2. **Populate Media** - Add your One Piece video files to `backend/media/`
3. **Update Catalog** - Edit `catalog.json` with real episode information
4. **Test Everything** - Try downloading and playing videos
5. **Refine UI** - Adjust colors, fonts, and styling to your preference
6. **Add Features** - Consider adding search, favorites, or watch progress

---

## 💡 Tips

- **Testing on device is crucial** - Always test video playback on actual iPhone
- **Network matters** - 5GHz WiFi is faster for streaming large videos
- **Keep server running** - Backend must be running to stream/download
- **Catalog format** - Each episode needs unique `id`, correct `mediaUrl`, and `imageUrl`

---

## 🆘 Need Help?

1. Check terminal output for error messages
2. Look at Metro bundler logs
3. Use React Native Debugger (shake device → "Debug")
4. Check [Expo documentation](https://docs.expo.dev/)

---

**Happy coding! 🏴‍☠️⚓**
