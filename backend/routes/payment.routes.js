// Payment Routes
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Process payment
router.post("/", paymentController.processPayment);

// Get payment by order ID
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// Verify payment by transaction ID
router.get("/verify/:transaction_id", paymentController.verifyPayment);

// Update payment status
router.put("/:id/status", paymentController.updatePaymentStatus);

module.exports = router;
