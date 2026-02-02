const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath =
    process.env.DB_PATH || path.join(__dirname, '../database/restaurant.db');

// Create database connection
const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('❌ Error connecting to database:', err.message);
        } else {
            console.log('✅ Connected to SQLite database');
        }
    }
);

db.serialize(() => {
    db.run('PRAGMA journal_mode = WAL;');     // prevents SQLITE_BUSY
    db.run('PRAGMA busy_timeout = 5000;');    // wait instead of fail
    db.run('PRAGMA foreign_keys = ON;');
});

// Promisified helpers (SERIALIZED writes)
const dbRun = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    });

const dbGet = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

const dbAll = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll
};
