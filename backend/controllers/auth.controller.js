// Authentication Controller - Handles user registration and login
const bcrypt = require("bcrypt");
const { getDb } = require("../config/db");

// REGISTER NEW USER
// This function creates a new user account
const register = async (req, res) => {
  try {
    // Get data from request body
    const { email, password, full_name } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: "All fields are required (email, password, full_name)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const db = getDb();

    // Check if user already exists
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        if (user) {
          return res.status(409).json({
            success: false,
            error: "Email already registered",
          });
        }

        // Hash password for security (never store plain passwords!)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        db.run(
          "INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)",
          [email, hashedPassword, full_name],
          function (err) {
            if (err) {
              console.error("Error creating user:", err);
              return res.status(500).json({
                success: false,
                error: "Failed to create user",
              });
            }

            // Success! Return user data (without password)
            res.status(201).json({
              success: true,
              message: "User registered successfully",
              user: {
                id: this.lastID,
                email: email,
                full_name: full_name,
              },
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// LOGIN USER
// This function validates user credentials and logs them in
const login = async (req, res) => {
  try {
    // Get credentials from request body
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const db = getDb();

    // Find user by email
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        // Check if user exists
        if (!user) {
          return res.status(401).json({
            success: false,
            error: "Invalid email or password",
          });
        }

        // Compare password with hashed password in database
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            error: "Invalid email or password",
          });
        }

        // Success! Return user data (without password)
        res.json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
        });
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET USER PROFILE
// This function gets user information by ID
const getProfile = (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const db = getDb();

    // Get user by ID (excluding password)
    db.get(
      "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
      [userId],
      (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        res.json({
          success: true,
          user: user,
        });
      },
    );
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
