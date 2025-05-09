const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Maak uploads directory als deze nog niet bestaat
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configureer multer voor bestandsuploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Maak SQLite database verbinding
const db = new sqlite3.Database('files.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Maak de files tabel als deze nog niet bestaat
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      originalname TEXT NOT NULL,
      size INTEGER NOT NULL,
      shareId TEXT UNIQUE NOT NULL,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Endpoints
app.get('/api/files', (req, res) => {
  db.all('SELECT * FROM files ORDER BY uploadDate DESC', [], (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(files);
  });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const shareId = crypto.randomBytes(4).toString('hex');
  
  db.run(
    'INSERT INTO files (filename, originalname, size, shareId) VALUES (?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, req.file.size, shareId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        shareId: shareId,
        filename: req.file.originalname,
        size: req.file.size
      });
    }
  );
});

app.get('/api/files/:shareId', (req, res) => {
  const { shareId } = req.params;
  
  db.get('SELECT * FROM files WHERE shareId = ?', [shareId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  });
});

app.get('/api/download/:shareId', (req, res) => {
  const { shareId } = req.params;
  
  db.get('SELECT * FROM files WHERE shareId = ?', [shareId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, file.filename);
    res.download(filePath, file.originalname);
  });
});

// Start de server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 