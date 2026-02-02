// Payment Controller - Handles payment operations
const { getDb } = require("../config/db");

// PROCESS PAYMENT
// Creates a payment record for an order
const processPayment = (req, res) => {
  try {
    const {
      order_id,
      amount,
      payment_method, // card, cash, online
      card_last4, // Optional: last 4 digits of card
    } = req.body;

    // Validate required fields
    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const db = getDb();

    // Check if order exists
    db.get("SELECT * FROM orders WHERE id = ?", [order_id], (err, order) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error",
        });
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      // Generate a transaction ID (in real app, this would come from payment gateway)
      const transaction_id = `TXN${Date.now()}${Math.floor(
        Math.random() * 1000,
      )}`;

      // In a real application, here you would:
      // 1. Call payment gateway API (Stripe, PayPal, etc.)
      // 2. Validate payment
      // 3. Handle payment response

      // For now, we'll simulate a successful payment
      const payment_status = payment_method === "cash" ? "pending" : "success";

      // Insert payment record
      db.run(
        `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, card_last4) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          amount,
          payment_method,
          payment_status,
          transaction_id,
          card_last4 || null,
        ],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Failed to process payment",
            });
          }

          const paymentId = this.lastID;

          // Update order status if payment is successful
          if (payment_status === "success") {
            db.run(
              "UPDATE orders SET status = ? WHERE id = ?",
              ["confirmed", order_id],
              (err) => {
                if (err) {
                  console.error("Error updating order status:", err);
                }
              },
            );
          }

          res.status(201).json({
            success: true,
            message: "Payment processed successfully",
            payment: {
              id: paymentId,
              order_id,
              amount,
              payment_method,
              payment_status,
              transaction_id,
            },
          });
        },
      );
    });
  } catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET PAYMENT BY ORDER ID
// Returns payment details for a specific order
const getPaymentByOrderId = (req, res) => {
  try {
    const { orderId } = req.params;
    const db = getDb();

    db.get(
      "SELECT * FROM payments WHERE order_id = ?",
      [orderId],
      (err, payment) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        if (!payment) {
          return res.status(404).json({
            success: false,
            error: "Payment not found",
          });
        }

        res.json({
          success: true,
          payment: payment,
        });
      },
    );
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE PAYMENT STATUS
// Updates the status of a payment (for admin or webhook handlers)
const updatePaymentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    // Valid statuses: pending, success, failed, refunded
    const validStatuses = ["pending", "success", "failed", "refunded"];

    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment status",
      });
    }

    const db = getDb();

    db.run(
      "UPDATE payments SET payment_status = ? WHERE id = ?",
      [payment_status, id],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            error: "Payment not found",
          });
        }

        res.json({
          success: true,
          message: "Payment status updated successfully",
          payment_id: id,
          new_status: payment_status,
        });
      },
    );
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// VERIFY PAYMENT
// Verifies a payment transaction (simulated for now)
const verifyPayment = (req, res) => {
  try {
    const { transaction_id } = req.params;
    const db = getDb();

    db.get(
      "SELECT * FROM payments WHERE transaction_id = ?",
      [transaction_id],
      (err, payment) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        if (!payment) {
          return res.status(404).json({
            success: false,
            error: "Payment not found",
          });
        }

        // In real app, you would verify with payment gateway here
        res.json({
          success: true,
          verified: payment.payment_status === "success",
          payment: {
            transaction_id: payment.transaction_id,
            amount: payment.amount,
            status: payment.payment_status,
            payment_method: payment.payment_method,
            payment_date: payment.payment_date,
          },
        });
      },
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  processPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  verifyPayment,
};
