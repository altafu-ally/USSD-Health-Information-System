const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const crypto = require('crypto'); 
const db = require('./db'); 

const app = express();
app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, 
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        res.set('Content-Type', 'text/plain');
        res.status(429).send("END Error: System busy. Please slow down and try again.");
    }
});
app.use('/ussd', apiLimiter);

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10kb' }));

const GATEWAY_API_KEY = process.env.USSD_API_KEY || "your_super_secret_gateway_token_123";
const ADMIN_PIN_SECRET = process.env.ADMIN_PIN || "2026"; // Set a secure numerical PIN
const ALLOWED_GATEWAY_IPS = ['127.0.0.1', '::1', '196.201.214.200', '196.201.214.201'];

app.post('/ussd', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIp = clientIp ? clientIp.split(',')[0].trim() : '';
    
    if (process.env.NODE_ENV === 'production' && !ALLOWED_GATEWAY_IPS.includes(cleanIp)) {
        res.set('Content-Type', 'text/plain');
        return res.status(403).send("END Error: Network origin untrusted.");
    }

    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey || apiKey !== GATEWAY_API_KEY) {
        res.set('Content-Type', 'text/plain');
        return res.status(401).send("END Error: Unauthorized application handshake.");
    }

    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    const cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^a-zA-Z0-9+]/g, '') : '';
    const cleanText = text ? String(text).replace(/[^a-zA-Z0-9* ]/g, '') : '';
    const cleanSession = sessionId ? String(sessionId).replace(/[^a-zA-Z0-9-]/g, '') : '';

    const maskedPhone = crypto.createHmac('sha256', GATEWAY_API_KEY)
                              .update(cleanPhone)
                              .digest('hex')
                              .substring(0, 16);

    let response = '';
    const textArray = cleanText ? cleanText.split('*') : [];
    const level = textArray.length;

    if (cleanText === '') {
        response = `CON Welcome to USSD Health Info System
1. Symptom Checker
2. Find Nearest Clinic
3. Public Health Alerts
4. Admin Case Dashboard`; // Option 4 Added
    } 
    // ---- 1. SYMPTOM CHECKER BRANCH ----
    else if (textArray[0] === '1') {
        if (level === 1) {
            response = `CON Select main symptom:
1. High Fever
2. Persistent Cough`;
        } else if (level === 2 && textArray[1] === '1') {
            response = `END Medical Advice: Rest, drink fluids, and monitor temperature. If it persists beyond 3 days, visit a doctor immediately.`;
            db.run(`INSERT INTO health_logs (phone_number, symptom_selected) VALUES (?, ?)`, [maskedPhone, 'High Fever']);
        } else if (level === 2 && textArray[1] === '2') {
            response = `END Medical Advice: Isolate if possible, stay hydrated, and wear a mask. Seek testing if breathing becomes difficult.`;
            db.run(`INSERT INTO health_logs (phone_number, symptom_selected) VALUES (?, ?)`, [maskedPhone, 'Persistent Cough']);
        } else {
            response = `END Invalid selection. Please redial the code and try again.`;
        }
    }
    // ---- 2. FIND CLINIC BRANCH ----
    else if (textArray[0] === '2') {
        if (level === 1) {
            response = `CON Reply with your current Region or City Name:`;
        } else if (level === 2) {
            const location = textArray[1];
            response = `END The nearest health center in ${location} is: ${location} District General Hospital. Working hours: 24/7.`;
        }
    }
    // ---- 3. PUBLIC HEALTH ALERTS BRANCH ----
    else if (textArray[0] === '3') {
        response = `END Health Alert: Ensure routine child vaccinations are up to date. Handwashing practices remain critical for disease prevention.`;
    }
    // ---- 4. SECURE ADMIN VIEW BRANCH ----
    else if (textArray[0] === '4') {
        if (level === 1) {
            // Prompt user for the authorization PIN
            response = `CON Enter Secret Admin Access PIN:`;
        } else if (level === 2) {
            const enteredPin = textArray[1];
            
            // Check credentials safely
            if (enteredPin !== ADMIN_PIN_SECRET) {
                response = `END Error: Access Denied. Invalid Credentials.`;
                res.set('Content-Type', 'text/plain');
                return res.send(response);
            }

            // If PIN matches, query database totals dynamically
            db.get(`SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN symptom_selected = 'High Fever' THEN 1 ELSE 0 END) as feverCount,
                SUM(CASE WHEN symptom_selected = 'Persistent Cough' THEN 1 ELSE 0 END) as coughCount
                FROM health_logs`, [], (err, row) => {
                    
                    if (err || !row) {
                        response = `END Error pulling registry metrics.`;
                    } else {
                        response = `END 📊 System Health Metrics:
Total Logged Cases: ${row.total || 0}
• High Fevers: ${row.feverCount || 0}
• Severe Coughs: ${row.coughCount || 0}`;
                    }
                    res.set('Content-Type', 'text/plain');
                    res.send(response);
            });
            return; // Pause execution structure to wait for internal asynchronous database response callback
        }
    }
    else {
        response = `END Invalid menu option chosen. Please redial to start over.`;
    }

    db.run(`INSERT OR REPLACE INTO sessions (id, phone_number, current_level, last_input) VALUES (?, ?, ?, ?)`, 
        [cleanSession, maskedPhone, level, cleanText || 'INITIAL']
    );

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.use((err, req, res, next) => {
    console.error("🚨 System Failure Caught Interfacing Webhook:", err.message);
    res.set('Content-Type', 'text/plain');
    res.status(500).send("END Internal Service Error. Processing failed safely.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Enterprise Secured USSD System running on port ${PORT}`);
});
