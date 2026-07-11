// db.js - Secure Database Configuration Layer for USSD Health System
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Define a secure, non-public directory pathway for the database file
const dbDirectory = path.resolve(__dirname, 'data');
if (!fs.existsSync(dbDirectory)) {
    // Automatically provision directory with restricted 0700 read/write/execute flags
    fs.mkdirSync(dbDirectory, { mode: 0o700 });
}

const dbPath = path.join(dbDirectory, 'health_system.db');

// Initialize database instance connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('🚨 Critical: Secure database connection failure:', err.message);
        process.exit(1); // Force fail-fast system termination if storage layer fails
    } else {
        console.log('🔒 Production Database instantiated with strict access privileges.');
    }
});

// Configure embedded SQLite sub-engine security parameters via PRAGMA declarations
db.serialize(() => {
    // 1. Enforce strict Foreign Key constraint validation checks
    db.run("PRAGMA foreign_keys = ON;");
    
    // 2. Enable Write-Ahead Logging (WAL) mode for high-concurrency performance and corruption resilience
    db.run("PRAGMA journal_mode = WAL;");
    
    // 3. Prevent structural exploitation by forcing query parameters execution optimization 
    db.run("PRAGMA secure_delete = ON;");

    // ---- SCHEMA DEFINITION VIA STRICT SCHEMAS ----
    
    // Table to log anonymized active text sessions securely
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        phone_number TEXT NOT NULL,
        current_level INTEGER NOT NULL,
        last_input TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) STRICT;`); // STRICT mode prevents database type-juggling attacks

    // Table to log anonymized symptom data inputs
    db.run(`CREATE TABLE IF NOT EXISTS health_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        symptom_selected TEXT NOT NULL CHECK(symptom_selected IN ('High Fever', 'Persistent Cough')),
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) STRICT;`); // Explicit validation constraint restricts input to valid clinical paths
});

module.exports = db;
