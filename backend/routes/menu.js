const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

// ==================== GET ALL MENU ITEMS ====================
router.get('/', async (req, res) => {
    try {
        const { category, available } = req.query;
        let query = 'SELECT * FROM menu_items WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (available !== undefined) {
            query += ' AND isAvailable = ?';
            params.push(available === 'true' ? 1 : 0);
        }

        query += ' ORDER BY createdAt DESC';

        const items = await dbAll(query, params);

        const parsedItems = items.map(item => {
            let ingredients = [];
            try {
                ingredients = item.ingredients ? JSON.parse(item.ingredients) : [];
            } catch (err) {
                console.warn(`Failed to parse ingredients for item ${item.id}:`, err.message);
            }
            return {
                ...item,
                ingredients,
                isAvailable: item.isAvailable === 1
            };
        });

        res.json({ success: true, count: parsedItems.length, data: parsedItems });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({ success: false, message: 'Error fetching menu items' });
    }
});

// ==================== GET ALL CATEGORIES ====================
router.get('/categories', async (req, res) => {
    try {
        const categories = await dbAll('SELECT * FROM categories ORDER BY displayOrder');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

// ==================== GET SINGLE MENU ITEM ====================
router.get('/:id', async (req, res) => {
    try {
        const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        let ingredients = [];
        try {
            ingredients = item.ingredients ? JSON.parse(item.ingredients) : [];
        } catch (err) {
            console.warn(`Failed to parse ingredients for item ${item.id}:`, err.message);
        }

        res.json({ success: true, data: { ...item, ingredients, isAvailable: item.isAvailable === 1 } });
    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({ success: false, message: 'Error fetching menu item' });
    }
});

// ==================== CREATE MENU ITEM ====================
router.post(
    '/',
    protect,
    admin,
    [
        body('id').trim().notEmpty(),
        body('name').trim().notEmpty(),
        body('category').trim().notEmpty(),
        body('price').isFloat({ min: 0 }),
        body('description').trim().notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

            const { id, name, category, price, description, image, ingredients, isAvailable } = req.body;

            // Check if ID exists
            const existing = await dbGet('SELECT id FROM menu_items WHERE id = ?', [id]);
            if (existing) return res.status(400).json({ success: false, message: 'Menu item with this ID already exists' });

            // Check category
            const categoryExists = await dbGet('SELECT name FROM categories WHERE name = ?', [category]);
            if (!categoryExists) return res.status(400).json({ success: false, message: 'Invalid category' });

            await dbRun(
                `INSERT INTO menu_items (id, name, category, price, description, image, ingredients, isAvailable) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    name,
                    category,
                    price,
                    description,
                    image || null,
                    ingredients ? JSON.stringify(ingredients) : null,
                    isAvailable !== undefined ? (isAvailable ? 1 : 0) : 1
                ]
            );

            const newItem = await dbGet('SELECT * FROM menu_items WHERE id = ?', [id]);
            let parsedIngredients = [];
            try {
                parsedIngredients = newItem.ingredients ? JSON.parse(newItem.ingredients) : [];
            } catch (err) {}

            res.status(201).json({ success: true, message: 'Menu item created successfully', data: { ...newItem, ingredients: parsedIngredients, isAvailable: newItem.isAvailable === 1 } });
        } catch (error) {
            console.error('Create menu item error:', error);
            res.status(500).json({ success: false, message: 'Error creating menu item' });
        }
    }
);

// ==================== UPDATE MENU ITEM ====================
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, category, price, description, image, ingredients, isAvailable } = req.body;
        const itemId = req.params.id;

        const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

        // Validate category if provided
        if (category) {
            const categoryExists = await dbGet('SELECT name FROM categories WHERE name = ?', [category]);
            if (!categoryExists) return res.status(400).json({ success: false, message: 'Invalid category' });
        }

        await dbRun(
            `UPDATE menu_items 
             SET name = ?, category = ?, price = ?, description = ?, image = ?, 
                 ingredients = ?, isAvailable = ?, updatedAt = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [
                name || item.name,
                category || item.category,
                price !== undefined ? price : item.price,
                description || item.description,
                image !== undefined ? image : item.image,
                ingredients ? JSON.stringify(ingredients) : item.ingredients,
                isAvailable !== undefined ? (isAvailable ? 1 : 0) : item.isAvailable,
                itemId
            ]
        );

        const updatedItem = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
        let parsedIngredients = [];
        try {
            parsedIngredients = updatedItem.ingredients ? JSON.parse(updatedItem.ingredients) : [];
        } catch (err) {}

        res.json({ success: true, message: 'Menu item updated successfully', data: { ...updatedItem, ingredients: parsedIngredients, isAvailable: updatedItem.isAvailable === 1 } });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ success: false, message: 'Error updating menu item' });
    }
});

// ==================== DELETE MENU ITEM ====================
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

        await dbRun('DELETE FROM menu_items WHERE id = ?', [itemId]);
        res.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ success: false, message: 'Error deleting menu item' });
    }
});

// ==================== CREATE CATEGORY ====================
router.post(
    '/categories',
    protect,
    admin,
    [body('name').trim().notEmpty()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

            const { name, description, displayOrder } = req.body;
            const existing = await dbGet('SELECT name FROM categories WHERE name = ?', [name]);
            if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

            await dbRun('INSERT INTO categories (name, description, displayOrder) VALUES (?, ?, ?)', [
                name,
                description || null,
                displayOrder || 0
            ]);

            const newCategory = await dbGet('SELECT * FROM categories WHERE name = ?', [name]);
            res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ success: false, message: 'Error creating category' });
        }
    }
);

module.exports = router;
