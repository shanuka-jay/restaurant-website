// Order Routes
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Create new order
router.post("/", orderController.createOrder);

// Get all orders (admin)
router.get("/", orderController.getAllOrders);

// Get specific order by ID
router.get("/:id", orderController.getOrderById);

// Get orders by user ID
router.get("/user/:userId", orderController.getUserOrders);

// Update order status
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;
