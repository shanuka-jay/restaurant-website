// Menu Routes - Define menu API endpoints
const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");

// GET /api/menu - Get all menu items
// Example: GET http://localhost:3000/api/menu
router.get("/", menuController.getAllItems);

// GET /api/menu/categories - Get all categories
// Example: GET http://localhost:3000/api/menu/categories
router.get("/categories", menuController.getCategories);

// GET /api/menu/category/:category - Get items by category
// Example: GET http://localhost:3000/api/menu/category/pasta
router.get("/category/:category", menuController.getItemsByCategory);

// GET /api/menu/:id - Get specific menu item
// Example: GET http://localhost:3000/api/menu/1
router.get("/:id", menuController.getItemById);

module.exports = router;
