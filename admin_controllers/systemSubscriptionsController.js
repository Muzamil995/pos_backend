const pool = require("../models/db");

// ================= GET ALL SUBSCRIPTIONS =================
exports.getAllSubscriptions = async (req, res) => {
  try {
    // Removed s.paymentStatus from the query
    const [rows] = await pool.query(
      `SELECT 
         s.id, 
         u.name AS userName, 
         p.name AS planName, 
         s.status, 
         s.startDate, 
         s.endDate, 
         p.price,
         s.paymentProof
       FROM subscriptions s
       LEFT JOIN users u ON s.userId = u.id
       LEFT JOIN plans p ON s.planId = p.id
       ORDER BY s.id DESC`,
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Get system subscriptions error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch system subscriptions" });
  }
};

// ================= TOGGLE SUBSCRIPTION STATUS =================
exports.toggleSubscriptionStatus = async (req, res) => {
  const { id, status } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE subscriptions SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    return res.json({ success: true, message: "Subscription status updated" });
  } catch (err) {
    console.error("Toggle subscription error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Database update failed" });
  }
};

// ================= APPROVE PAYMENT =================
exports.approvePayment = async (req, res) => {
  const { id } = req.body;

  try {
    await pool.query(
      "UPDATE subscriptions SET status = 'Active' WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Payment approved and subscription activated.",
    });
  } catch (err) {
    console.error("Approve payment error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to approve payment" });
  }
};

// ================= REJECT PAYMENT =================
exports.rejectPayment = async (req, res) => {
  const { id } = req.body;

  try {
    await pool.query(
      "UPDATE subscriptions SET status = 'Rejected' WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Payment rejected. Status set to rejected.",
    });
  } catch (err) {
    console.error("Reject payment error:", err);
    res.status(500).json({ success: false, error: "Failed to reject payment" });
  }
};
