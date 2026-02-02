// Order Controller - Handles order operations
const { getDb } = require("../config/db");

// CREATE NEW ORDER
// Creates a new order with order items
const createOrder = (req, res) => {
  try {
    const {
      user_id,
      items, // Array of {menu_item_id, quantity, price}
      total_amount,
      delivery_address,
      delivery_name,
      delivery_phone,
      delivery_email,
      payment_method,
    } = req.body;

    // Validate required fields
    if (
      !user_id ||
      !items ||
      items.length === 0 ||
      !total_amount ||
      !delivery_address ||
      !delivery_name ||
      !delivery_phone
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const db = getDb();

    // Insert order
    db.run(
      `INSERT INTO orders (user_id, total_amount, status, delivery_address, delivery_name, delivery_phone, delivery_email, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        total_amount,
        "pending", // Default status
        delivery_address,
        delivery_name,
        delivery_phone,
        delivery_email || null,
        payment_method || "cash",
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Failed to create order",
          });
        }

        const orderId = this.lastID;

        // Insert order items
        const stmt = db.prepare(
          "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
        );

        let itemsInserted = 0;
        items.forEach((item) => {
          stmt.run(
            [orderId, item.menu_item_id, item.quantity, item.price],
            (err) => {
              if (err) {
                console.error("Error inserting order item:", err);
              }
              itemsInserted++;

              // When all items are inserted, return response
              if (itemsInserted === items.length) {
                stmt.finalize();

                res.status(201).json({
                  success: true,
                  message: "Order created successfully",
                  order: {
                    id: orderId,
                    user_id,
                    total_amount,
                    status: "pending",
                    delivery_name,
                    delivery_phone,
                    items_count: items.length,
                  },
                });
              }
            },
          );
        });
      },
    );
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET ORDER BY ID
// Returns a specific order with its items
const getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    // Get order details
    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, order) => {
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

      // Get order items with menu item details
      db.all(
        `SELECT oi.*, mi.name, mi.image_url, mi.category 
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = ?`,
        [id],
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
            order: {
              ...order,
              items: items,
            },
          });
        },
      );
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET USER ORDERS
// Returns all orders for a specific user
const getUserOrders = (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();

    db.all(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
      (err, orders) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        res.json({
          success: true,
          count: orders.length,
          orders: orders,
        });
      },
    );
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS
// Updates the status of an order
const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Valid statuses: pending, confirmed, preparing, out_for_delivery, delivered, cancelled
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const db = getDb();

    db.run(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id],
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
            error: "Order not found",
          });
        }

        res.json({
          success: true,
          message: "Order status updated successfully",
          order_id: id,
          new_status: status,
        });
      },
    );
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET ALL ORDERS (Admin function)
// Returns all orders in the system
const getAllOrders = (req, res) => {
  try {
    const db = getDb();

    db.all(
      "SELECT * FROM orders ORDER BY created_at DESC",
      [],
      (err, orders) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        res.json({
          success: true,
          count: orders.length,
          orders: orders,
        });
      },
    );
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
};
