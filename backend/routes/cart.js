const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { protect } = require('../middleware/auth');

// Get cart
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await dbAll(
            `SELECT c.id, c.quantity, c.createdAt, c.updatedAt,
                    m.id as menuItemId, m.name, m.price, m.image, m.category
             FROM cart c
             INNER JOIN menu_items m ON c.menuItemId = m.id
             WHERE c.userId = ?
             ORDER BY c.createdAt DESC`,
            [userId]
        );

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal >= 30 ? 0 : 5;
        const tax = subtotal * 0.0875;
        const total = subtotal + deliveryFee + tax;

        res.json({
            success: true,
            data: {
                items: cartItems,
                summary: {
                    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
                    tax: parseFloat(tax.toFixed(2)),
                    total: parseFloat(total.toFixed(2))
                }
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart' });
    }
});

// Add item to cart (safe for SQLite)
router.post('/', protect, [
    body('menuItemId').trim().notEmpty(),
    body('quantity').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { menuItemId, quantity } = req.body;
        const userId = req.user.id;

        const menuItem = await dbGet('SELECT * FROM menu_items WHERE id = ?', [menuItemId]);
        if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found' });
        if (!menuItem.isAvailable) return res.status(400).json({ success: false, message: 'Item unavailable' });

        // Insert or update quantity safely
        await dbRun(
            `INSERT INTO cart (userId, menuItemId, quantity)
             VALUES (?, ?, ?)
             ON CONFLICT(userId, menuItemId) DO UPDATE SET quantity = quantity + excluded.quantity, updatedAt = CURRENT_TIMESTAMP`,
            [userId, menuItemId, quantity]
        );

        const cartItems = await dbAll(
            `SELECT c.id, c.quantity, c.createdAt,
                    m.id as menuItemId, m.name, m.price, m.image
             FROM cart c
             INNER JOIN menu_items m ON c.menuItemId = m.id
             WHERE c.userId = ?`,
            [userId]
        );

        res.status(201).json({ success: true, message: 'Item added to cart', data: cartItems });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Error adding item to cart' });
    }
});

// Update cart item quantity
router.put('/:id', protect, async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const { quantity } = req.body;
        const userId = req.user.id;

        if (quantity < 1) {
            // If quantity < 1, delete the item
            await dbRun('DELETE FROM cart WHERE id = ? AND userId = ?', [cartItemId, userId]);
        } else {
            const result = await dbRun(
                'UPDATE cart SET quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?',
                [quantity, cartItemId, userId]
            );

            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Cart item not found' });
            }
        }

        const cartItems = await dbAll(
            `SELECT c.id, c.quantity, c.createdAt,
                    m.id as menuItemId, m.name, m.price, m.image
             FROM cart c
             INNER JOIN menu_items m ON c.menuItemId = m.id
             WHERE c.userId = ?`,
            [userId]
        );

        res.json({ success: true, message: 'Cart updated', data: cartItems });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: 'Error updating cart' });
    }
});

// Remove item from cart
router.delete('/:id', protect, async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const userId = req.user.id;

        const result = await dbRun(
            'DELETE FROM cart WHERE id = ? AND userId = ?',
            [cartItemId, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        const cartItems = await dbAll(
            `SELECT c.id, c.quantity, c.createdAt,
                    m.id as menuItemId, m.name, m.price, m.image
             FROM cart c
             INNER JOIN menu_items m ON c.menuItemId = m.id
             WHERE c.userId = ?`,
            [userId]
        );

        res.json({ success: true, message: 'Item removed from cart', data: cartItems });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Error removing item from cart' });
    }
});

module.exports = router;