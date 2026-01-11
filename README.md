# One Piece - Personal Media Library

A personal offline-capable media library application for streaming and downloading episodes over your home LAN.

## Architecture

This is a monorepo containing:
- **backend/** - Node.js + Express server for serving media files and catalog
- **mobile/** - Expo (React Native) iOS app for browsing, streaming, and downloading episodes

## Prerequisites

- **Windows PC** (for backend server)
  - Node.js 18+ and npm
- **iPhone** (for mobile app)
  - Expo Go app installed from App Store

## Setup Instructions

### 1. Backend Setup (Windows)

#### Install Dependencies
```bash
cd backend
npm install
```

#### Add Your Media Files
1. Place your MP4 episode files in `backend/media/` with naming pattern `s01e01.mp4`, `s01e02.mp4`, etc.
2. (Optional) Add episode thumbnail images to `backend/images/` named `s01e01.jpg`, etc.

#### Update Catalog
Edit `backend/catalog/catalog.json` to match your episode files.

#### Start the Server
```bash
npm run dev
```

The server will start on `http://0.0.0.0:3000`

#### Find Your PC's IP Address
In Windows Command Prompt or PowerShell:
```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

#### Configure Windows Firewall
You need to allow incoming connections on port 3000:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. TCP, Specific local ports: `3000` → Next
6. Allow the connection → Next
7. Check all profiles → Next
8. Name: "One Piece Media Server" → Finish

#### Test from iPhone
Open Safari on your iPhone and navigate to:
```
http://YOUR_PC_IP:3000/health
```

You should see: `{"ok":true}`

### 2. Mobile App Setup (Windows)

#### Install Dependencies
```bash
cd mobile
npm install
```

#### Start Expo Development Server
```bash
npx expo start
```

A QR code will appear in the terminal.

#### Connect with Expo Go
1. Open Expo Go app on your iPhone
2. Scan the QR code
3. The app will load on your device

#### Configure Server URL
1. In the app, navigate to Settings
2. Enter your server URL: `http://YOUR_PC_IP:3000`
3. Save

The app will now fetch the catalog and you can:
- Browse episodes
- Stream episodes when connected to your LAN
- Download episodes for offline viewing
- Manage downloaded episodes in the Downloads screen

## Project Structure

```
One-Piece/
├── backend/
│   ├── catalog/
│   │   └── catalog.json          # Episode metadata
│   ├── media/                     # Your MP4 files (gitignored)
│   ├── images/                    # Episode thumbnails (gitignored)
│   ├── package.json
│   └── server.js                  # Express server
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx           # Navigation setup
│   │   ├── index.tsx             # Home/Catalog screen
│   │   ├── settings.tsx          # Server configuration
│   │   ├── player.tsx            # Video player
│   │   └── downloads.tsx         # Download management
│   ├── src/
│   │   ├── types.ts              # TypeScript definitions
│   │   ├── api.ts                # API client functions
│   │   └── storage.ts            # Local storage helpers
│   ├── app.json                  # Expo configuration
│   └── package.json
├── .gitignore
└── README.md
```

## Usage

### Backend
- Health check: `GET /health`
- Episode catalog: `GET /catalog.json`
- Media files: `GET /media/s01e01.mp4`
- Images: `GET /images/s01e01.jpg`

### Mobile App
- **Home**: Browse and stream episodes, initiate downloads
- **Settings**: Configure server URL
- **Player**: Watch episodes (streams or plays downloaded file)
- **Downloads**: View, play, and delete downloaded episodes

## Notes

- Media files are **not** committed to git - you must supply your own MP4 files
- The server only serves files over your local network
- Ensure both your PC and iPhone are on the same Wi-Fi network
- This is for personal use with your own legally obtained media files

## License

Personal use only.
