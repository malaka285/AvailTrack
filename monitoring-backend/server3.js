const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const ping = require('ping');
const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const EventEmitter = require('events');
const dns = require('dns');
const net = require('net');

const app = express();
let domainuser="";

// Middleware
app.use(cors());
app.use(bodyParser.json());

async function checkServerStatus(host) {
    const res = await ping.promise.probe(host);
    return {
        alive: res.alive,
        time: res.time,
    };
}

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myapp_db',
    password: 'rendi', 
    port: 5432,
});

let uptimeSeconds = 0;
let downtimeSeconds = 0;
let lastChecked = Date.now();
let isAlive = false;

const updateUptimeDowntime = (alive) => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - lastChecked) / 1000; 

    if (alive) {
        uptimeSeconds += elapsedTime;
    } else {
        downtimeSeconds += elapsedTime;
    }

    lastChecked = currentTime;
};

const calculateUptime = () => uptimeSeconds;
const calculateDowntime = () => downtimeSeconds;

console.log('DB_PASSWORD:', 'rahman24zin');

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

app.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, password, isAdmin]);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        
        if (!user || password !== user.password) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.is_admin },
            'your_jwt_secret_here',
            { expiresIn: '1h' }
        );

        await pool.query('UPDATE users SET nlogin = COALESCE(nlogin, 0) + 1, active = 1 WHERE id = $1', [user.id]);
        res.json({ token, message: 'Login successful', isAdmin: user.is_admin });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Logout route
app.post('/logout', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE users SET active = 0 WHERE id = $1', [req.user.id]);
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes
app.post('/admin-add-user', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    const { username, password, is_admin, host, domain } = req.body;
    try {
        await pool.query('INSERT INTO users (username, password, is_admin, host, domains) VALUES ($1, $2, $3, $4, $5)', 
            [username, password, is_admin, "", domain]);
        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Fetch users route
app.get('/users', authenticateToken, async (req, res) => {
    console.log('Fetching users for:', req.user); // Log user
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
    try {
        const result = await pool.query('SELECT * FROM users');
        console.log('Users fetched:', result.rows); // Log hasil
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});
// Delete user route
app.delete('/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});


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

app.post('/update-profile', authenticateToken, async (req, res) => {
    const { username, password, profile_picture } = req.body;
    const userId = req.user.id;
    try {
        await pool.query('UPDATE users SET username = $1, password = $2, profile_picture = $3 WHERE id = $4', 
            [username, password, profile_picture, userId]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Network and system status routes
const execPromise = util.promisify(exec);
let totalDowntime = 0;
let lastDownTime = null; 
let isNetworkDown = false; 
const serverStartTime = new Date();

app.get('/network-status', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const userResult = await pool.query('SELECT domains FROM users WHERE id = $1', [userId]);
        const domainId = userResult.rows[0]?.domains?.trim(); 

        if (!domainId) {
            return res.status(404).json({ error: 'Domain not found for the user' });
        }

        const domainResult = await pool.query('SELECT domain_name FROM domains WHERE id = $1', [domainId]);
        let domain = domainResult.rows[0]?.domain_name;
        domainuser = domain;

        if (!domain) {
            return res.status(404).json({ error: 'Domain name not found' });
        }

        const result = await ping.promise.probe(domain);
        res.json(result);
    } catch (error) {
        console.error('Error checking network status:', error);
        res.status(500).json({ error: 'Network check failed' });
    }
});



app.get('/ssl-cert',  authenticateToken, async(req, res) => {
    const userId = req.user.id;
    const userResult = await pool.query('SELECT domains FROM users WHERE id = $1', [userId]);
    const domainId = userResult.rows[0]?.domains?.trim();
    if (!domainId) {
        return res.status(404).json({ error: 'Domain not found for the user' });
    }
    const domainResult = await pool.query('SELECT domain_name FROM domains WHERE id = $1', [domainId]);
    let domain = domainResult.rows[0]?.domain_name;
    const host = domain;
    const options = {
        hostname: host,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false
    };

    const request = https.request(options, (response) => {
        const cert = response.connection.getPeerCertificate();
        if (cert && cert.valid_to) {
            res.json({ certExpiryDate: cert.valid_to });
        } else {
            res.json({ certExpiryDate: 'N/A' });
        }
    });

    request.on('error', (error) => {
        res.status(500).json({ error: 'SSL check failed' });
    });

    request.end();
});

const axios = require('axios');

app.get('/service-status',authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userResult = await pool.query('SELECT domains FROM users WHERE id = $1', [userId]);
    const domainId = userResult.rows[0]?.domains?.trim(); 
    if (!domainId) {
        return res.status(404).json({ error: 'Domain not found for the user' });
    }
    const domainResult = await pool.query('SELECT domain_name FROM domains WHERE id = $1', [domainId]);
    let domain = domainResult.rows[0]?.domain_name;


    try {
        const response = await axios.get(`https://${domain}`);
        res.json({ service: '', status: 'active', httpStatus: response.status });
    } catch (error) {
        console.error(`Error checking status for : ${error.message}`);
        res.status(500).json({ service: '', status: 'inactive', details: 'Service not reachable' });
    }
});


app.get('/system-updates', async (req, res) => {
    try {
        const { stdout } = await execPromise('wmic qfe list brief /format:table');
        const updates = stdout.trim().split('\n').slice(1);
        res.json({ lastUpdate: updates[0] || 'No updates available' });
    } catch (error) {
        res.status(500).json({ error: 'Error checking system updates' });
    }
});

app.get('/network-access',authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userResult = await pool.query('SELECT domains FROM users WHERE id = $1', [userId]);
    const domainId = userResult.rows[0]?.domains?.trim(); // Trim untuk menghapus spasi
    if (!domainId) {
        return res.status(404).json({ error: 'Domain not found for the user' });
    }
    const domainResult = await pool.query('SELECT domain_name FROM domains WHERE id = $1', [domainId]);
    let domain = domainResult.rows[0]?.domain_name;

    try {
        const { stdout } = await execPromise(`tracert ${domain}`);
        res.json({ networkAccess: stdout.trim() });
    } catch (error) {
        res.status(500).json({ error: 'Error checking traceroute' });
    }
});


app.get('/vulnerability-scan', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userResult = await pool.query('SELECT domains FROM users WHERE id = $1', [userId]);
    const domainId = userResult.rows[0]?.domains?.trim(); 
    if (!domainId) {
        return res.status(404).json({ error: 'Domain not found for the user' });
    }
    const domainResult = await pool.query('SELECT domain_name FROM domains WHERE id = $1', [domainId]);
    let domain = domainResult.rows[0]?.domain_name;

    try {
        const { stdout, stderr } = await execPromise(`nmap ${domain}`);
        if (stderr) {
            console.error(`Nmap error: ${stderr}`);
            return res.status(500).json({ error: 'An error occurred during the vulnerability scan. Please try again later.' });
        }
        res.json({ scanResults: stdout.trim() });
    } catch (error) {
        console.error(`Error performing vulnerability scan: ${error.message}`);
        res.status(500).json({ error: 'An unexpected error occurred while performing the vulnerability scan.' });
    }
});

app.get('/uptime-downtime', async (req, res) => {
    try {
        const status = await checkServerStatus('tniad.mil.id');
        updateUptimeDowntime(status.alive);
        
        return res.json({
            uptime: calculateUptime(),
            downtime: calculateDowntime(),
        });
    } catch (error) {
        console.error('Error calculating uptime or network status', error);
        return res.status(500).json({ error: 'Error calculating uptime or network status' });
    }
});


function parsePingOutput(output) {
    const lines = output.split('\n');
    let packetsReceived = 0;
    let totalTime = 0;
    let alive = false;

    for (const line of lines) {
        if (line.includes('Reply from')) {
            packetsReceived++;
            const timeMatch = line.match(/time=(\d+\.?\d*)ms/);
            if (timeMatch) {
                totalTime += parseFloat(timeMatch[1]);
            }
        }
    }

    if (packetsReceived > 0) {
        alive = true;
        const avgTime = (totalTime / packetsReceived).toFixed(2);
        return { alive, avgTime, host: 'tniad.mil.id' };
    } else {
        return { alive: false, avgTime: 0, host: 'tniad.mil.id' };
    }
}


app.get('/user-info', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const userResult = await pool.query(
            'SELECT username, domains FROM users WHERE id = $1', [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const domainResult = await pool.query(
            'SELECT domain_name FROM domains WHERE id = $1', [user.domains]
        );
        const domain = domainResult.rows[0];

        res.json({
            username: user.username,
            domains: domain ? domain.domain_name : 'No domain found'
        });
    } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Error retrieving user info' });
    }
});

app.get('/domains', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM domains');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching domains:', error);
        res.status(500).json({ error: 'Error fetching domains' });
    }
});

app.get('/email-service/:domain', authenticateToken, async (req, res) => {
    const domain = req.params.domain;

    dns.resolveMx(domain, (err, addresses) => {
        if (err) {
            console.error(`Error resolving MX for domain ${domain}:`, err);
            return res.status(500).json({ error: 'Error resolving MX records' });
        }

        if (addresses && addresses.length > 0) {
            res.json({
                domain,
                status: 'active',
                mxRecords: addresses,
            });
        } else {
            res.json({
                domain,
                status: 'inactive',
                message: 'No MX records found, email service may be unavailable.',
            });
        }
    });
});

// Cek layanan SMTP
async function checkSmtp(domain) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(25, domain, () => {
            client.write('EHLO example.com\r\n');
        });

        client.on('data', (data) => {
            client.end();
            const response = data.toString();
            if (response.includes('250')) {
                resolve({ status: 'active', message: 'SMTP service is active' });
            } else {
                resolve({ status: 'inactive', message: 'SMTP service is not responsive' });
            }
        });

        client.on('error', (err) => {
            resolve({ status: 'inactive', message: `Error: ${err.message}` });
        });

        client.on('end', () => {
            console.log('Disconnected from server');
        });
    });
}

app.get('/check-smtp/:domain', authenticateToken, async (req, res) => {
    const domain = req.params.domain;

    try {
        const result = await checkSmtp(domain);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error checking SMTP service' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

EventEmitter.defaultMaxListeners = 20;

       
