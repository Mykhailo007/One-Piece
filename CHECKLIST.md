# Pre-Launch Checklist for Expo Go

## ✅ Required Before First Run

### Backend Setup

- [ ] Navigate to `backend` folder
- [ ] Run `npm install`
- [ ] Server starts successfully with `npm run dev`
- [ ] Can access `http://localhost:3000/health` in browser
- [ ] Get your PC's IP address with `ipconfig`

### Mobile Setup

- [ ] Navigate to `mobile` folder
- [ ] Run `npm install`
- [ ] Start Expo with `npm start`
- [ ] QR code appears in terminal
- [ ] Metro bundler shows "Ready"

### iPhone Setup

- [ ] Expo Go app installed from App Store
- [ ] iPhone connected to same WiFi as PC
- [ ] Opened Expo Go app
- [ ] Scanned QR code from terminal
- [ ] App loads successfully on device

### First Time Configuration

- [ ] App opens without crashing
- [ ] Navigate to Settings screen
- [ ] Enter server URL: `http://YOUR_PC_IP:3000`
- [ ] Connection test passes
- [ ] Return to home screen
- [ ] Episode list loads (even if empty)

---

## 📝 Optional but Recommended

### Assets (For Professional Look)

- [ ] Replace `mobile/assets/icon.png` with real 1024x1024 icon
- [ ] Replace `mobile/assets/splash.png` with real splash screen
- [ ] Replace `mobile/assets/adaptive-icon.png` for Android
- [ ] Replace `mobile/assets/favicon.png` for web

### Media Content (For Testing)

- [ ] Add at least one .mp4 video to `backend/media/`
- [ ] Add corresponding thumbnail to `backend/images/`
- [ ] Update `backend/catalog/catalog.json` with episode info
- [ ] Restart backend server

### Testing Features

- [ ] Stream a video from server
- [ ] Download a video to device
- [ ] Play downloaded video offline
- [ ] Delete downloaded video
- [ ] Change server URL in settings
- [ ] Pull to refresh episode list

---

## 🚨 Common Issues

| Problem            | Check This                                        |
| ------------------ | ------------------------------------------------- |
| Can't scan QR code | Metro bundler still running? Try LAN option       |
| App won't load     | Both devices on same WiFi? Not guest network?     |
| Connection failed  | Firewall blocking port 3000?                      |
| No episodes shown  | Catalog.json has data? Server running?            |
| Video won't play   | File exists? Correct path in catalog? MP4 format? |
| TypeScript errors  | node_modules installed? Try clearing cache        |

---

## 🎯 Success Criteria

Your MVP is ready when:

1. ✅ App loads on iPhone via Expo Go
2. ✅ Can configure and save server URL
3. ✅ Episodes list displays (with at least test data)
4. ✅ Can tap an episode to open player
5. ✅ Video streams and plays smoothly
6. ✅ Can download an episode successfully
7. ✅ Downloaded episode plays offline
8. ✅ Can navigate between all screens
9. ✅ No crashes during normal usage
10. ✅ You're happy with the basic functionality!

---

## 💡 Quick Start Command

**Windows (Automatic):**

```bash
start.bat
```

**Manual:**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Mobile
cd mobile
npm install
npm start
```

Then scan QR code with Expo Go!

---

## 📖 Full Documentation

- **SETUP.md** - Complete setup guide with troubleshooting
- **CHANGES.md** - Detailed list of all changes made
- **README.md** - Project overview

---

**Remember:** The placeholder assets will make the app look unprofessional, but functionality will work perfectly. Replace them when you're ready to polish your MVP!

Good luck! 🏴‍☠️
