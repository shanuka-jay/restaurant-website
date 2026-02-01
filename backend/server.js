// Import required packages
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth.routes");
const menuRoutes = require("./routes/menu.routes");

// Create Express app
const app = express();
const PORT = 3000;

// Middleware - These help process requests
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON data
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);

// Test route - Simple API endpoint to check if server works
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection
app.get("/api/db-test", (req, res) => {
  const database = db.getDb();

  // Count tables
  database.all(
    `
        SELECT name FROM sqlite_master 
        WHERE type='table'
    `,
    [],
    (err, tables) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Database is connected!",
        tables: tables.map((t) => t.name),
        tableCount: tables.length,
      });
    },
  );
});

// Initialize database and start server
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log("\n🚀 ========================================");
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📁 Frontend: http://localhost:${PORT}/home/index.html`);
      console.log(`🔌 API Test: http://localhost:${PORT}/api/test`);
      console.log("🚀 ========================================\n");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });

module.exports = app;
