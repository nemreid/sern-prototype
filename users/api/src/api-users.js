const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const saltRounds = 10;

// Create a new SQLite database
const db = new sqlite3.Database(':memory:');

// Create the users table
db.run(`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);

const validateNotEmpty = (value, label) => { if (!value) throw new Error(`${label} cannot be empty!`); };

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

app.get('/', (req, res) => {
  return res.send('Hello RealGear!');
});

// Register a new user
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  try {
    validateNotEmpty(email, 'Email');
    validateNotEmpty(password, 'Password');
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Insert the new user into the database
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, bcrypt.hashSync(password, saltRounds)], (err) => {
    if (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    return res.json({ message: 'User registered successfully' });
  });
});

// Authenticate a user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user in the database
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password is correct
    if (! (bcrypt.compareSync(password, user.password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, 'secret');

    return res.json({ token });
  });
});

// Protected route
app.get('/protected', (req, res) => {
  let token;
  try {
    token = req.headers.authorization.split(' ')[1];
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify the JWT token
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ message: 'Protected route accessed successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
