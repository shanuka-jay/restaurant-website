const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (user) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert new user
      const sql = `
        INSERT INTO users (first_name, last_name, email, phone, password_hash)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(sql, [firstName, lastName, email, phone || null, passwordHash], function(err) {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error creating user' 
          });
        }

        // Generate token
        const token = generateToken(this.lastID, email);

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            token,
            user: {
              id: this.lastID,
              firstName,
              lastName,
              email,
              phone
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    db.get(
      'SELECT * FROM users WHERE email = ?', 
      [email], 
      async (err, user) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        // Generate token
        const token = generateToken(user.id, user.email);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              phone: user.phone
            }
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
  db.get(
    'SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          createdAt: user.created_at
        }
      });
    }
  );
});

module.exports = router;
