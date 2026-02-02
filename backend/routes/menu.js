const express = require('express');
const router = express.Router();
const db = require('../config/database');

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', (req, res) => {
  const { category, available } = req.query;
  
  let sql = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];

  // Filter by category
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  // Filter by availability
  if (available !== undefined) {
    sql += ' AND available = ?';
    params.push(available === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY category, name';

  db.all(sql, params, (err, items) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    // Parse ingredients JSON string
    const menuItems = items.map(item => ({
      ...item,
      ingredients: JSON.parse(item.ingredients),
      available: item.available === 1
    }));

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  });
});

// @route   GET /api/menu/:id
// @desc    Get single menu item by ID
// @access  Public
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
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

    // Parse ingredients JSON string
    item.ingredients = JSON.parse(item.ingredients);
    item.available = item.available === 1;

    res.json({
      success: true,
      data: item
    });
  });
});

// @route   GET /api/menu/categories
// @desc    Get all unique categories
// @access  Public
router.get('/meta/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM menu_items ORDER BY category', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    const categories = rows.map(row => row.category);

    res.json({
      success: true,
      data: categories
    });
  });
});

module.exports = router;
