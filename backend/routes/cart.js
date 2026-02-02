const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authMiddleware, (req, res) => {
  const sql = `
    SELECT 
      c.id as cart_id,
      c.quantity,
      c.menu_item_id,
      m.name,
      m.price,
      m.image,
      m.category
    FROM carts c
    JOIN menu_items m ON c.menu_item_id = m.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;

  db.all(sql, [req.user.userId], (err, items) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= parseFloat(process.env.FREE_DELIVERY_THRESHOLD) ? 0 : parseFloat(process.env.DELIVERY_FEE);
    const tax = subtotal * parseFloat(process.env.TAX_RATE);
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          deliveryFee: parseFloat(deliveryFee.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    });
  });
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', authMiddleware, (req, res) => {
  const { menuItemId, quantity } = req.body;

  if (!menuItemId || !quantity || quantity < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Menu item ID and valid quantity are required' 
    });
  }

  // Check if menu item exists
  db.get('SELECT id FROM menu_items WHERE id = ?', [menuItemId], (err, item) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    // Check if item already in cart
    db.get(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND menu_item_id = ?',
      [req.user.userId, menuItemId],
      (err, cartItem) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (cartItem) {
          // Update existing cart item
          const newQuantity = cartItem.quantity + quantity;
          db.run(
            'UPDATE carts SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newQuantity, cartItem.id],
            (err) => {
              if (err) {
                return res.status(500).json({ 
                  success: false, 
                  message: 'Error updating cart' 
                });
              }

              res.json({
                success: true,
                message: 'Cart updated successfully'
              });
            }
          );
        } else {
          // Add new cart item
          db.run(
            'INSERT INTO carts (user_id, menu_item_id, quantity) VALUES (?, ?, ?)',
            [req.user.userId, menuItemId, quantity],
            (err) => {
              if (err) {
                return res.status(500).json({ 
                  success: false, 
                  message: 'Error adding to cart' 
                });
              }

              res.status(201).json({
                success: true,
                message: 'Item added to cart successfully'
              });
            }
          );
        }
      }
    );
  });
});

// @route   PUT /api/cart/:cartId
// @desc    Update cart item quantity
// @access  Private
router.put('/:cartId', authMiddleware, (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid quantity is required' 
    });
  }

  db.run(
    'UPDATE carts SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [quantity, cartId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart item not found' 
        });
      }

      res.json({
        success: true,
        message: 'Cart item updated successfully'
      });
    }
  );
});

// @route   DELETE /api/cart/:cartId
// @desc    Remove item from cart
// @access  Private
router.delete('/:cartId', authMiddleware, (req, res) => {
  const { cartId } = req.params;

  db.run(
    'DELETE FROM carts WHERE id = ? AND user_id = ?',
    [cartId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart item not found' 
        });
      }

      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    }
  );
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', authMiddleware, (req, res) => {
  db.run(
    'DELETE FROM carts WHERE user_id = ?',
    [req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    }
  );
});

module.exports = router;