const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BC${timestamp}${random}`;
};

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public (can be guest or authenticated)
router.post('/', [
  optionalAuth,
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('paymentMethod').isIn(['credit', 'debit', 'paypal']).withMessage('Valid payment method is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item')
], (req, res) => {
  // Validate input
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

  // Calculate order totals
  let subtotal = 0;
  
  // Validate items and calculate subtotal
  const validatePromises = items.map(item => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, price FROM menu_items WHERE id = ? AND available = 1',
        [item.id],
        (err, menuItem) => {
          if (err) reject(err);
          if (!menuItem) reject(new Error(`Menu item ${item.id} not found or unavailable`));
          
          subtotal += menuItem.price * item.quantity;
          resolve({
            ...item,
            name: menuItem.name,
            price: menuItem.price
          });
        }
      );
    });
  });

  Promise.all(validatePromises)
    .then(validatedItems => {
      // Calculate fees
      const deliveryFee = subtotal >= parseFloat(process.env.FREE_DELIVERY_THRESHOLD) 
        ? 0 
        : parseFloat(process.env.DELIVERY_FEE);
      const tax = subtotal * parseFloat(process.env.TAX_RATE);
      const total = subtotal + deliveryFee + tax;

      // Check minimum order
      if (subtotal < parseFloat(process.env.MINIMUM_ORDER)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is $${process.env.MINIMUM_ORDER}`
        });
      }

      // Generate order number
      const orderNumber = generateOrderNumber();
      const userId = req.user ? req.user.userId : null;

      // Insert order
      const orderSql = `
        INSERT INTO orders (
          user_id, order_number, full_name, email, phone, 
          address, city, state, zip_code, delivery_notes,
          subtotal, delivery_fee, tax, total, payment_method, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        orderSql,
        [
          userId, orderNumber, fullName, email, phone,
          address, city, state, zipCode, deliveryNotes || null,
          subtotal.toFixed(2), deliveryFee.toFixed(2), tax.toFixed(2), total.toFixed(2),
          paymentMethod, 'confirmed'
        ],
        function(err) {
          if (err) {
            console.error('Order creation error:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Error creating order' 
            });
          }

          const orderId = this.lastID;

          // Insert order items
          const itemSql = `
            INSERT INTO order_items (order_id, menu_item_id, name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
          `;

          const itemPromises = validatedItems.map(item => {
            return new Promise((resolve, reject) => {
              db.run(
                itemSql,
                [orderId, item.id, item.name, item.price, item.quantity],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(itemPromises)
            .then(() => {
              // Clear user's cart if authenticated
              if (userId) {
                db.run('DELETE FROM carts WHERE user_id = ?', [userId]);
              }

              res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: {
                  orderId,
                  orderNumber,
                  total: parseFloat(total.toFixed(2)),
                  estimatedDelivery: '30-45 minutes'
                }
              });
            })
            .catch(err => {
              console.error('Order items error:', err);
              res.status(500).json({ 
                success: false, 
                message: 'Error creating order items' 
              });
            });
        }
      );
    })
    .catch(err => {
      console.error('Item validation error:', err);
      res.status(400).json({ 
        success: false, 
        message: err.message || 'Invalid order items' 
      });
    });
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authMiddleware, (req, res) => {
  const sql = `
    SELECT 
      o.id,
      o.order_number,
      o.full_name,
      o.email,
      o.phone,
      o.address,
      o.city,
      o.state,
      o.zip_code,
      o.delivery_notes,
      o.subtotal,
      o.delivery_fee,
      o.tax,
      o.total,
      o.payment_method,
      o.status,
      o.created_at,
      o.updated_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.all(sql, [req.user.userId], (err, orders) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  });
});

// @route   GET /api/orders/:orderNumber
// @desc    Get order details by order number
// @access  Public (with order number)
router.get('/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;

  // Get order details
  const orderSql = `
    SELECT 
      o.*
    FROM orders o
    WHERE o.order_number = ?
  `;

  db.get(orderSql, [orderNumber], (err, order) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Get order items
    const itemsSql = `
      SELECT 
        oi.menu_item_id,
        oi.name,
        oi.price,
        oi.quantity
      FROM order_items oi
      WHERE oi.order_id = ?
    `;

    db.all(itemsSql, [order.id], (err, items) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      res.json({
        success: true,
        data: {
          ...order,
          items
        }
      });
    });
  });
});

module.exports = router;