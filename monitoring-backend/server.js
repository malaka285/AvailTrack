const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const ping = require('ping');
const https = require('https');
const { exec } = require('child_process');
const util = require('util');

// Initialize the Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myapp_db',
    password: 'rendi', // Replace with your actual password
    port: 5432,
});

// Log the password for debugging (remove in production)
console.log('DB_PASSWORD:', 'Password');

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database', err.stack);
    } else {
        console.log('Connected to the database successfully');
    }
    release();
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, 'your_jwt_secret_here', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


// User registration route
app.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, password, isAdmin]);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    console.log("masuk ke login");
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        
        if (!user || password !== user.password) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.is_admin },
            'your_jwt_secret_here', // Ganti dengan kunci rahasia JWT Anda
            { expiresIn: '1h' }
        );

        // Perbarui nlogin dan set active ke 1 (aktif)
        await pool.query(
            'UPDATE users SET nlogin = COALESCE(nlogin, 0) + 1, active = 1 WHERE id = $1',
            [user.id]
        );

        console.log("berhasil login");

        res.json({ token, message: 'Login successful', isAdmin: user.is_admin });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.post('/logout', async (req, res) => {
    if (!req.session.userId) {
        return res.status(400).json({ message: 'User belum login' });
    }

    try {
        // Set active menjadi 0 (tidak aktif)
        await pool.query(
            'UPDATE users SET active = 0 WHERE id = $1',
            [req.session.userId]
        );

        // Hapus session
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Error saat logout' });
            }
            return res.json({ message: 'Logout berhasil' });
        });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});


app.post('/admin-add-user', authenticateToken, async (req, res) => {
    console.log("berhasil menambahkan");
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { username, password, is_admin, host, domain } = req.body; // Include host and domain
    try {
        await pool.query(
            'INSERT INTO users (username, password, is_admin, host, domains) VALUES ($1, $2, $3, $4, $5)', 
            [username, password, is_admin, host, domain]
        );
        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.get('/users', authenticateToken, async (req, res) => {
    console.log("masuk ke users");
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    try {
        const result = await pool.query('SELECT * FROM users');
        console.log('Users fetched:', result.rows); // Log users fetched
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error); // Log the error
        res.status(500).json({ error: 'Error fetching users' });
    }
});


// Profile route
app.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving profile' });
    }
});

// Update profile route
app.post('/update-profile', authenticateToken, async (req, res) => {
    const { username, password, profile_picture } = req.body;
    const userId = req.user.id;
    try {
        await pool.query('UPDATE users SET username = $1, password = $2, profile_picture = $3 WHERE id = $4', [username, password, profile_picture, userId]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Add domain (admin only)
app.post('/add-domain', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { domain_name } = req.body;
    try {
        await pool.query('INSERT INTO domains (domain_name) VALUES ($1)', [domain_name]);
        res.json({ message: 'Domain added' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding domain' });
    }
});

// Delete domain (admin only)
app.post('/delete-domain', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { domain_id } = req.body;
    try {
        await pool.query('DELETE FROM domains WHERE id = $1', [domain_id]);
        res.json({ message: 'Domain deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting domain' });
    }
});

// Add user (admin only)
app.post('/add-user', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { username, password, is_admin } = req.body;
    try {
        await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, password, is_admin]);
        res.json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Delete user (admin only)
app.post('/delete-user', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { user_id } = req.body;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [user_id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Database test route
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connection is working', time: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database connection error', details: error.message });
    }
});

app.get('/user-info', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT username, domains FROM users WHERE id = $1', [userId]
        );
        const user = result.rows[0];
        console.log('User info fetched:', user); // Add this line to debug
        res.json({ username: user.username, domains: user.domains });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving user info' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
