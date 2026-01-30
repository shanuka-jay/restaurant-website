// Database configuration and initialization
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file path
const dbPath = path.join(__dirname, "../database/restaurant.db");

// Database connection
let db;

// Initialize database
const init = () => {
  return new Promise((resolve, reject) => {
    // Connect to database (creates file if doesn't exist)
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Error connecting to database:", err.message);
        reject(err);
      } else {
        console.log("✅ Connected to SQLite database");
        // Create tables after connection
        createTables()
          .then(() => resolve())
          .catch((err) => reject(err));
      }
    });
  });
};

// Create all tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. USERS TABLE
      db.run(
        `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
        (err) => {
          if (err) console.error("Error creating users table:", err);
          else console.log("✅ Users table ready");
        },
      );

      // 2. MENU_ITEMS TABLE
      db.run(
        `
                CREATE TABLE IF NOT EXISTS menu_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    description TEXT,
                    image_url TEXT,
                    ingredients TEXT,
                    available BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
        (err) => {
          if (err) console.error("Error creating menu_items table:", err);
          else console.log("✅ Menu items table ready");
        },
      );

      // 3. ORDERS TABLE
      db.run(
        `
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    total_amount REAL NOT NULL,
                    status TEXT DEFAULT 'pending',
                    delivery_address TEXT,
                    delivery_name TEXT,
                    delivery_phone TEXT,
                    delivery_email TEXT,
                    payment_method TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `,
        (err) => {
          if (err) console.error("Error creating orders table:", err);
          else console.log("✅ Orders table ready");
        },
      );

      // 4. ORDER_ITEMS TABLE
      db.run(
        `
                CREATE TABLE IF NOT EXISTS order_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER NOT NULL,
                    menu_item_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(id),
                    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
                )
            `,
        (err) => {
          if (err) console.error("Error creating order_items table:", err);
          else console.log("✅ Order items table ready");
        },
      );

      // 5. PAYMENTS TABLE (NEW!)
      db.run(
        `
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT NOT NULL,
                    payment_status TEXT DEFAULT 'pending',
                    transaction_id TEXT,
                    card_last4 TEXT,
                    payment_date DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(id)
                )
            `,
        (err) => {
          if (err) {
            console.error("Error creating payments table:", err);
            reject(err);
          } else {
            console.log("✅ Payments table ready");
            console.log("🎉 All database tables created successfully!");
            resolve();
          }
        },
      );
    });
  });
};

// Get database connection
const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call init() first.");
  }
  return db;
};

// Close database connection
const close = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else {
          console.log("Database connection closed");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  init,
  getDb,
  close,
};
