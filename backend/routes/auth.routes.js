// Authentication Routes - Define API endpoints
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST /api/auth/register - Register new user
// Example: POST http://localhost:3000/api/auth/register
// Body: { "email": "user@example.com", "password": "123456", "full_name": "John Doe" }
router.post("/register", authController.register);

// POST /api/auth/login - User login
// Example: POST http://localhost:3000/api/auth/login
// Body: { "email": "user@example.com", "password": "123456" }
router.post("/login", authController.login);

// GET /api/auth/profile - Get user profile
// Example: GET http://localhost:3000/api/auth/profile?userId=1
router.get("/profile", authController.getProfile);
router.get("/profile/:userId", authController.getProfile);

module.exports = router;
