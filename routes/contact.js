const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('inquiryType').trim().notEmpty(),
    body('message').trim().notEmpty().isLength({ min: 10 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { firstName, lastName, email, phone, inquiryType, message } = req.body;

        const result = await dbRun(
            `INSERT INTO contact_messages (firstName, lastName, email, phone, inquiryType, message, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone || null, inquiryType, message, 'new']
        );

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: result.lastID
            }
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting contact form' 
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const messages = await dbAll(query, params);

        // Get total count
        const countQuery = status 
            ? 'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?' 
            : 'SELECT COUNT(*) as count FROM contact_messages';
        const countResult = await dbGet(countQuery, status ? [status] : []);

        res.json({
            success: true,
            count: messages.length,
            total: countResult.count,
            data: messages
        });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching contact messages' 
        });
    }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message (admin)
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const messageId = req.params.id;

        const message = await dbGet(
            'SELECT * FROM contact_messages WHERE id = ?',
            [messageId]
        );

        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact message not found' 
            });
        }

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Get contact message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching contact message' 
        });
    }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact message status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
    body('status').isIn(['new', 'read', 'replied', 'archived'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { status } = req.body;
        const messageId = req.params.id;

        const message = await dbGet('SELECT * FROM contact_messages WHERE id = ?', [messageId]);

        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact message not found' 
            });
        }

        await dbRun(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, messageId]
        );

        const updatedMessage = await dbGet('SELECT * FROM contact_messages WHERE id = ?', [messageId]);

        res.json({
            success: true,
            message: 'Message status updated successfully',
            data: updatedMessage
        });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating message status' 
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message (admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const messageId = req.params.id;

        const message = await dbGet('SELECT * FROM contact_messages WHERE id = ?', [messageId]);

        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact message not found' 
            });
        }

        await dbRun('DELETE FROM contact_messages WHERE id = ?', [messageId]);

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting contact message' 
        });
    }
});

module.exports = router;
