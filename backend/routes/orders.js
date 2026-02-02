const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll, db } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

// Generate order number
const generateOrderNumber = () => {
    return 'BC-' + Math.floor(100000 + Math.random() * 900000);
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, [
    body('fullName').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('state').trim().notEmpty(),
    body('zipCode').trim().notEmpty(),
    body('paymentMethod').trim().notEmpty(),
    body('items').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const {
            fullName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            deliveryNotes,
            paymentMethod,
            items
        } = req.body;

        const userId = req.user.id;

        // Calculate totals
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const menuItem = await dbGet('SELECT * FROM menu_items WHERE id = ?', [item.menuItemId]);
            
            if (!menuItem) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Menu item ${item.menuItemId} not found` 
                });
            }

            if (!menuItem.isAvailable) {
                return res.status(400).json({ 
                    success: false, 
                    message: `${menuItem.name} is currently unavailable` 
                });
            }

            const itemSubtotal = menuItem.price * item.quantity;
            subtotal += itemSubtotal;

            validatedItems.push({
                menuItemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        const deliveryFee = subtotal >= 30 ? 0 : 5;
        const tax = subtotal * 0.0875;
        const total = subtotal + deliveryFee + tax;

        // Generate unique order number
        let orderNumber;
        let isUnique = false;
        while (!isUnique) {
            orderNumber = generateOrderNumber();
            const existing = await dbGet('SELECT id FROM orders WHERE orderNumber = ?', [orderNumber]);
            if (!existing) isUnique = true;
        }

        // Start transaction
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION', (err) => {
                    if (err) reject(err);
                });

                // Insert order
                db.run(
                    `INSERT INTO orders (
                        orderNumber, userId, fullName, email, phone, address, city, state, zipCode,
                        deliveryNotes, subtotal, deliveryFee, tax, total, paymentMethod, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderNumber, userId, fullName, email, phone, address, city, state, zipCode,
                        deliveryNotes || null, subtotal, deliveryFee, tax, total, paymentMethod, 'pending'
                    ],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const orderId = this.lastID;

                        // Insert order items
                        const insertItem = db.prepare(
                            'INSERT INTO order_items (orderId, menuItemId, name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
                        );

                        validatedItems.forEach(item => {
                            insertItem.run(
                                orderId,
                                item.menuItemId,
                                item.name,
                                item.price,
                                item.quantity,
                                item.subtotal
                            );
                        });

                        insertItem.finalize((err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            // Clear user's cart
                            db.run('DELETE FROM cart WHERE userId = ?', [userId], (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                db.run('COMMIT', (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                    } else {
                                        resolve(orderId);
                                    }
                                });
                            });
                        });
                    }
                );
            });
        }).then((orderId) => {
            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: {
                    orderId,
                    orderNumber,
                    total: parseFloat(total.toFixed(2))
                }
            });
        }).catch((error) => {
            console.error('Order creation error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error creating order' 
            });
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating order' 
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await dbAll(
            `SELECT * FROM orders 
             WHERE userId = ? 
             ORDER BY createdAt DESC`,
            [userId]
        );

        // Get items for each order
        for (let order of orders) {
            const items = await dbAll(
                'SELECT * FROM order_items WHERE orderId = ?',
                [order.id]
            );
            order.items = items;
        }

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders' 
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await dbGet(
            'SELECT * FROM orders WHERE id = ? AND userId = ?',
            [orderId, userId]
        );

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Get order items
        const items = await dbAll(
            'SELECT * FROM order_items WHERE orderId = ?',
            [orderId]
        );

        order.items = items;

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching order' 
        });
    }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;

        const order = await dbGet(
            'SELECT id, orderNumber, status, createdAt, total FROM orders WHERE orderNumber = ?',
            [orderNumber]
        );

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error tracking order' 
        });
    }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const orders = await dbAll(query, params);

        // Get items for each order
        for (let order of orders) {
            const items = await dbAll(
                'SELECT * FROM order_items WHERE orderId = ?',
                [order.id]
            );
            order.items = items;

            // Get user info
            const user = await dbGet(
                'SELECT firstName, lastName, email FROM users WHERE id = ?',
                [order.userId]
            );
            order.user = user;
        }

        // Get total count
        const countQuery = status 
            ? 'SELECT COUNT(*) as count FROM orders WHERE status = ?' 
            : 'SELECT COUNT(*) as count FROM orders';
        const countResult = await dbGet(countQuery, status ? [status] : []);

        res.json({
            success: true,
            count: orders.length,
            total: countResult.count,
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders' 
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
    body('status').isIn(['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'])
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
        const orderId = req.params.id;

        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        await dbRun(
            'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [status, orderId]
        );

        const updatedOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating order status' 
        });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await dbGet(
            'SELECT * FROM orders WHERE id = ? AND userId = ?',
            [orderId, userId]
        );

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Only allow cancellation if order is pending
        if (order.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Order cannot be cancelled at this stage' 
            });
        }

        await dbRun(
            'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            ['cancelled', orderId]
        );

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error cancelling order' 
        });
    }
});

module.exports = router;
