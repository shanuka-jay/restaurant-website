// Menu Controller - Handles menu items operations
const { getDb } = require("../config/db");

// GET ALL MENU ITEMS
// Returns all available menu items
const getAllItems = (req, res) => {
  try {
    const db = getDb();

    // Get all menu items where available = 1
    db.all(
      "SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name",
      [],
      (err, items) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        res.json({
          success: true,
          count: items.length,
          items: items,
        });
      },
    );
  } catch (error) {
    console.error("Get all items error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET MENU ITEM BY ID
// Returns a specific menu item
const getItemById = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    db.get("SELECT * FROM menu_items WHERE id = ?", [id], (err, item) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error",
        });
      }

      if (!item) {
        return res.status(404).json({
          success: false,
          error: "Menu item not found",
        });
      }

      res.json({
        success: true,
        item: item,
      });
    });
  } catch (error) {
    console.error("Get item by ID error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET ITEMS BY CATEGORY
// Returns menu items filtered by category
const getItemsByCategory = (req, res) => {
  try {
    const { category } = req.params;
    const db = getDb();

    db.all(
      "SELECT * FROM menu_items WHERE category = ? AND available = 1 ORDER BY name",
      [category],
      (err, items) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        res.json({
          success: true,
          category: category,
          count: items.length,
          items: items,
        });
      },
    );
  } catch (error) {
    console.error("Get items by category error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET ALL CATEGORIES
// Returns list of unique categories
const getCategories = (req, res) => {
  try {
    const db = getDb();

    db.all(
      "SELECT DISTINCT category FROM menu_items WHERE available = 1 ORDER BY category",
      [],
      (err, rows) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        const categories = rows.map((row) => row.category);

        res.json({
          success: true,
          count: categories.length,
          categories: categories,
        });
      },
    );
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemsByCategory,
  getCategories,
};
