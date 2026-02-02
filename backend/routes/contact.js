const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../config/database");

// @route   POST /api/contact
// @desc    Submit a contact form message
// @access  Public
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 10 })
      .withMessage("Message must be at least 10 characters"),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, subject, message, phone } = req.body;

      // Insert contact message
      const sql = `
      INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `;

      db.run(
        sql,
        [name, email, phone || null, subject, message],
        function (err) {
          if (err) {
            console.error("Error saving contact message:", err);
            return res.status(500).json({
              success: false,
              message: "Error submitting your message. Please try again.",
            });
          }

          res.status(201).json({
            success: true,
            message:
              "Thank you for contacting us! We will get back to you soon.",
            data: {
              messageId: this.lastID,
            },
          });
        },
      );
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// @route   GET /api/contact/messages
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get("/messages", async (req, res) => {
  try {
    const sql = `
      SELECT id, name, email, phone, subject, message, status, created_at, updated_at
      FROM contact_messages
      ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, messages) => {
      if (err) {
        console.error("Error fetching contact messages:", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving messages",
        });
      }

      res.json({
        success: true,
        data: messages,
      });
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PATCH /api/contact/messages/:id/status
// @desc    Update contact message status (admin only)
// @access  Private/Admin
router.patch(
  "/messages/:id/status",
  [
    body("status")
      .isIn(["pending", "reviewed", "responded"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const sql = `
      UPDATE contact_messages 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `;

      db.run(sql, [status, id], function (err) {
        if (err) {
          console.error("Error updating message status:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating message status",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Message not found",
          });
        }

        res.json({
          success: true,
          message: "Message status updated successfully",
        });
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

module.exports = router;
