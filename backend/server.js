const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for mobile app
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Serve catalog
app.get('/catalog.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'catalog', 'catalog.json'));
});

// Serve media files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Serve images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`One Piece Media Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Catalog: http://0.0.0.0:${PORT}/catalog.json`);
});
