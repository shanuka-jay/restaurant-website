const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, (req, res) => {
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authMiddleware,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { firstName, lastName, phone } = req.body;
  const updates = [];
  const values = [];

  if (firstName !== undefined) {
    updates.push('first_name = ?');
    values.push(firstName);
  }
  if (lastName !== undefined) {
    updates.push('last_name = ?');
    values.push(lastName);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.user.userId);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating profile' 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  });
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get current password hash
  db.get(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.userId],
    async (err, user) => {
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

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, req.user.userId],
        (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Error updating password' 
            });
          }

          res.json({
            success: true,
            message: 'Password updated successfully'
          });
        }
      );
    }
  );
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authMiddleware, (req, res) => {
  db.run(
    'DELETE FROM users WHERE id = ?',
    [req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error deleting account' 
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    }
  );
});

module.exports = router;