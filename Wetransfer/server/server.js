const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Database setup
const db = new sqlite3.Database('wetransfer.db', (err) => {
  if (err) {
    console.error('Database verbindingsfout:', err.message);
    process.exit(1); // Stop de server als we geen database verbinding kunnen maken
  }
  console.log('Verbonden met de SQLite database');
});

// Verwijder bestaande tabellen en maak ze opnieuw aan
db.serialize(() => {
  // Verwijder bestaande tabellen
  db.run('DROP TABLE IF EXISTS files');
  db.run('DROP TABLE IF EXISTS users');

  // Users tabel
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_pro BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Fout bij aanmaken users tabel:', err.message);
    } else {
      console.log('Users tabel aangemaakt');
    }
  });

  // Files tabel
  db.run(`CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    originalname TEXT NOT NULL,
    size INTEGER NOT NULL,
    shareId TEXT UNIQUE NOT NULL,
    userId INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Fout bij aanmaken files tabel:', err.message);
    } else {
      console.log('Files tabel aangemaakt');
    }
  });
});

// Middleware voor authenticatie
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geen token gevonden' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Ongeldige token' });
  }
};

// Auth endpoints
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord zijn verplicht' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Gebruikersnaam bestaat al' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, process.env.JWT_SECRET || 'your-secret-key');
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Er is een fout opgetreden bij het registreren' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord zijn verplicht' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key');
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Er is een fout opgetreden bij het inloggen' });
    }
  });
});

// File endpoints
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  console.log('Upload request ontvangen:', {
    file: req.file,
    user: req.user
  });

  if (!req.file) {
    console.error('Geen bestand ontvangen in de request');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!req.user || !req.user.id) {
    console.error('Geen geldige gebruiker in de request');
    return res.status(401).json({ error: 'Unauthorized - geen geldige gebruiker' });
  }

  // Controleer bestandsgrootte limiet
  const MAX_SIZE_FREE = 500 * 1024 * 1024; // 500MB
  const MAX_SIZE_PRO = 5 * 1024 * 1024 * 1024; // 5GB

  // Haal gebruiker op om pro status te controleren
  db.get('SELECT is_pro FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error bij ophalen gebruiker:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      console.error('Gebruiker niet gevonden voor ID:', req.user.id);
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    const maxSize = user.is_pro ? MAX_SIZE_PRO : MAX_SIZE_FREE;
    
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: `Bestand is te groot. Maximum grootte is ${user.is_pro ? '5GB' : '500MB'}.`,
        isPro: user.is_pro
      });
    }

    const shareId = crypto.randomBytes(4).toString('hex');
    
    // Begin een transactie
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Fout bij starten transactie:', err);
          return res.status(500).json({ error: 'Database transactie fout' });
        }

        const query = 'INSERT INTO files (filename, originalname, size, shareId, userId) VALUES (?, ?, ?, ?, ?)';
        const params = [req.file.filename, req.file.originalname, req.file.size, shareId, req.user.id];
        
        console.log('Database query:', { query, params });

        db.run(query, params, function(err) {
          if (err) {
            console.error('Database error bij insert:', err);
            db.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.error('Fout bij rollback:', rollbackErr);
              }
              return res.status(500).json({ 
                error: 'Er is een fout opgetreden bij het opslaan van het bestand',
                details: err.message 
              });
            });
            return;
          }

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('Fout bij commit:', commitErr);
              return res.status(500).json({ error: 'Fout bij afronden transactie' });
            }

            console.log('Bestand succesvol opgeslagen:', {
              id: this.lastID,
              shareId,
              filename: req.file.originalname
            });

            res.json({
              id: this.lastID,
              shareId: shareId,
              filename: req.file.originalname,
              size: req.file.size
            });
          });
        });
      });
    });
  });
});

app.get('/api/files', authenticateToken, (req, res) => {
  db.all('SELECT * FROM files WHERE userId = ? ORDER BY created_at DESC', [req.user.id], (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(files);
  });
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

// User endpoints
app.get('/api/user/status', authenticateToken, (req, res) => {
  db.get('SELECT is_pro FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }
    res.json({ isPro: user.is_pro });
  });
});

// Upgrade naar Pro endpoint
app.post('/api/user/upgrade', authenticateToken, (req, res) => {
  db.run('UPDATE users SET is_pro = 1 WHERE id = ?', [req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Succesvol geüpgraded naar Pro!' });
  });
});

// Start de server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 