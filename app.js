const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // Protects HTTP headers
const db = require('./db'); 

const app = express();

// 1. Use Helmet to secure HTTP headers against common web vulnerabilities
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 2. Define a secret API Key that your USSD gateway must provide
// In production, save this safely in your environment variables (process.env.USSD_API_KEY)
const GATEWAY_API_KEY = process.env.USSD_API_KEY || "your_super_secret_gateway_token_123";

app.post('/ussd', (req, res) => {
    // 3. Security Check: Authenticate that the request is coming from your trusted provider
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey !== GATEWAY_API_KEY) {
        res.set('Content-Type', 'text/plain');
        return res.status(401).send("END Error: Unauthorized access attempt.");
    }

    // Read variables sent from the telecom/USSD gateway
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // 4. Input Sanitization: Strict regex validation to block malicious SQL payloads
    const cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^a-zA-Z0-9+]/g, '') : '';
    const cleanText = text ? String(text).replace(/[^a-zA-Z0-9* ]/g, '') : '';
    const cleanSession = sessionId ? String(sessionId).replace(/[^a-zA-Z0-9-]/g, '') : '';

    let response = '';

    // Split user inputs by asterisk (*) to track navigation history
    const textArray = cleanText ? cleanText.split('*') : [];
    const level = textArray.length;

    if (cleanText === '') {
        // Main Menu (Initial Dial)
        response = `CON Welcome to USSD Health Info System
1. Symptom Checker
2. Find Nearest Clinic
3. Public Health Alerts`;
    } 
    // ---- 1. SYMPTOM CHECKER BRANCH ----
    else if (textArray[0] === '1') {
        if (level === 1) {
            response = `CON Select main symptom:
1. High Fever
2. Persistent Cough`;
        } else if (level === 2 && textArray[1] === '1') {
            response = `END Medical Advice: Rest, drink fluids, and monitor temperature. If it persists beyond 3 days, visit a doctor immediately.`;
            
            // Secure database write using parameterized arrays to prevent SQL Injection
            db.run(`INSERT INTO health_logs (phone_number, symptom_selected) VALUES (?, ?)`, [cleanPhone, 'High Fever']);
        } else if (level === 2 && textArray[1] === '2') {
            response = `END Medical Advice: Isolate if possible, stay hydrated, and wear a mask. Seek testing if breathing becomes difficult.`;
            
            db.run(`INSERT INTO health_logs (phone_number, symptom_selected) VALUES (?, ?)`, [cleanPhone, 'Persistent Cough']);
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
    // ---- FALLBACK FOR WRONG INPUTS ----
    else {
        response = `END Invalid menu option chosen. Please redial to start over.`;
    }

    // Secure database log using parameterized safe input structures
    db.run(`INSERT OR REPLACE INTO sessions (id, phone_number, current_level, last_input) VALUES (?, ?, ?, ?)`, 
        [cleanSession, cleanPhone, level, cleanText || 'INITIAL']
    );

    // Set plain text header required by telecom networks
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// Centralized error-handling middleware to avoid crashing the server and exposing stack traces
app.use((err, req, res, next) => {
    console.error("🚨 System Error Exception Caught:", err.message);
    res.set('Content-Type', 'text/plain');
    res.status(500).send("END System Error. Please try again later.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Secured Health USSD Server running on port ${PORT}`);
});
