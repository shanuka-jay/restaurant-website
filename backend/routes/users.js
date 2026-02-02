const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { role, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT id, firstName, lastName, email, phone, role, createdAt FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const users = await dbAll(query, params);

        // Get total count
        const countQuery = role 
            ? 'SELECT COUNT(*) as count FROM users WHERE role = ?' 
            : 'SELECT COUNT(*) as count FROM users';
        const countResult = await dbGet(countQuery, role ? [role] : []);

        res.json({
            success: true,
            count: users.length,
            total: countResult.count,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users' 
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin)
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await dbGet(
            'SELECT id, firstName, lastName, email, phone, role, createdAt, updatedAt FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Get user's order history
        const orders = await dbAll(
            'SELECT id, orderNumber, total, status, createdAt FROM orders WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );

        user.orders = orders;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user' 
        });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin)
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role' 
            });
        }

        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Prevent changing own role
        if (userId == req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot change your own role' 
            });
        }

        await dbRun(
            'UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [role, userId]
        );

        const updatedUser = await dbGet(
            'SELECT id, firstName, lastName, email, role FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user role' 
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Prevent deleting own account
        if (userId == req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        await dbRun('DELETE FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user' 
        });
    }
});

module.exports = router;
