const express = require('express');
const ping = require('ping');
const https = require('https');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const EventEmitter = require('events');

const app = express();
const port = 4000;

app.use(cors());

const execPromise = util.promisify(exec);

EventEmitter.defaultMaxListeners = 20;

// Variabel untuk menyimpan uptime dan downtime
let totalDowntime = 0;
let lastDownTime = null; // Waktu terakhir server down
let isNetworkDown = false; // Status network
const serverStartTime = new Date();

// Fungsi untuk menghitung uptime dan downtime
const calculateUptimeDowntime = (pingResult) => {
    const currentTime = new Date();

    // Jika ping gagal, tandai sebagai downtime
    if (!pingResult.alive) {
        if (!isNetworkDown) {
            lastDownTime = currentTime; // Set waktu mulai downtime
            isNetworkDown = true;
        }
    } else {
        if (isNetworkDown && lastDownTime) {
            // Hitung durasi downtime
            totalDowntime += (currentTime - lastDownTime) / 1000; // dalam detik
            lastDownTime = null;
        }
        isNetworkDown = false;
    }

    // Hitung uptime sejak server mulai dijalankan
    const uptimeMilliseconds = currentTime - serverStartTime;
    const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);

    // Kembalikan data uptime dan downtime
    return {
        uptimeSeconds,
        downtimeSeconds: totalDowntime
    };
};

app.get('/network-status', async (req, res) => {
    try {
        const result = await ping.promise.probe('www.github.com');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Network check failed' });
    }
});

app.get('/ssl-cert', (req, res) => {
    const host = 'www.github.com';
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

const services = ['MySQL80'];

app.get('/service-status', (req, res) => {
    exec('sc query "MySQL80"', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error checking status for MySQL: ${error.message}`);
            return res.status(500).json({ service: 'MySQL', status: 'Error', details: 'Service not found' });
        }

        if (stderr) {
            console.error(`Standard error: ${stderr}`);
            return res.status(500).json({ service: 'MySQL', status: 'Error', details: 'Service not found' });
        }

        const isRunning = stdout.includes('RUNNING');
        res.json({ service: 'MySQL', status: isRunning ? 'active' : 'inactive' });
    });
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

app.get('/network-access', async (req, res) => {
    try {
        const { stdout } = await execPromise('netstat -an');
        res.json({ networkAccess: stdout.trim() });
    } catch (error) {
        res.status(500).json({ error: 'Error checking network access' });
    }
});

app.get('/vulnerability-scan', async (req, res) => {
    try {
        const { stdout, stderr } = await execPromise('nmap 20.205.243.166');

        // Check for errors in stderr
        if (stderr) {
            console.error(`Nmap error: ${stderr}`);
            return res.status(500).json({ error: 'An error occurred during the vulnerability scan. Please try again later.' });
        }

        // Return the scan results
        res.json({ scanResults: stdout.trim() });
    } catch (error) {
        console.error(`Error performing vulnerability scan: ${error.message}`);
        res.status(500).json({ error: 'An unexpected error occurred while performing the vulnerability scan.' });
    }
});

app.get('/uptime-downtime', async (req, res) => {
    try {
        // Calculate uptime
        const currentTime = new Date();
        const uptimeMilliseconds = currentTime - serverStartTime;
        
        // Calculate uptime in seconds, minutes, hours, and days
        const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
        const uptimeMinutes = Math.floor(uptimeSeconds / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptimeDays = Math.floor(uptimeHours / 24);

        // Format the uptime data for easy readability
        const uptime = {
            days: uptimeDays,
            hours: uptimeHours % 24,
            minutes: uptimeMinutes % 60,
            seconds: uptimeSeconds % 60
        };

        // Perform a ping to check network status
        const pingResult = await ping.promise.probe('www.github.com');

        // Determine downtime (in this example, it's static; replace with real tracking if needed)
        const downtime = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        res.json({
            uptime,
            downtime,
            networkStatus: {
                isAlive: pingResult.alive,
                time: pingResult.time,
                host: pingResult.host
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error calculating uptime or network status' });
    }
});
// Starting the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});



