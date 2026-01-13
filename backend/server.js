const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Allow serving media/subs from outside the repo (e.g., exFAT external drive)
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(__dirname, 'media');
const SUBS_DIR = process.env.SUBS_DIR || path.join(__dirname, 'subs');

app.use(cors());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get("/catalog.json", (req, res) => {
  res.sendFile(path.join(__dirname, "catalog", "catalog.json"));
});

// Serve media files (MP4)
app.use("/media", express.static(MEDIA_DIR));

// Serve subtitle files (VTT)
app.use("/subs", express.static(SUBS_DIR));

// Serve images (optional)
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`One Piece Media Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Catalog: http://0.0.0.0:${PORT}/catalog.json`);
  console.log(`Media dir: ${MEDIA_DIR}`);
  console.log(`Subs dir: ${SUBS_DIR}`);
});