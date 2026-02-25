const pool = require("../models/db");

// ================= GET CURRENT SUBSCRIPTION =================
exports.getMySubscription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.*,
          p.name AS planName,
          p.price,
          p.durationDays,
          p.maxProducts,
          p.maxCategories,
          p.maxCustomers,
          p.maxEmployees,
          p.maxSuppliers,
          p.maxUsers,
          p.hasOnlineBackup,
          p.hasFullBackupWithImages
       FROM subscriptions s
       JOIN plans p ON s.planId = p.id
       WHERE s.userId = ?
       ORDER BY s.id DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.json({ subscription: null });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get subscription error:", err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};


// ================= REQUEST PLAN CHANGE =================
exports.requestPlanUpgrade = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID required" });
    }

    // 🔥 Check Plan Exists
    const [planRows] = await pool.query(
      "SELECT durationDays FROM plans WHERE id = ? AND status = 1",
      [planId],
    );

    if (planRows.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const duration = planRows[0].durationDays;

    // ===============================
    // 🔴 STEP 1: Expire Old Subscriptions
    // ===============================

    await pool.query(
      `UPDATE subscriptions 
       SET status = 'Expired'
       WHERE userId = ?
       AND status IN ('Active', 'Grace', 'Pending')`,
      [req.user.userId],
    );

    // ===============================
    // 📂 STEP 2: Payment Proof Path
    // ===============================

    const paymentProofPath = req.file
      ? `/uploads/${req.user.userId}/subscription/${req.file.filename}`
      : null;

    // ===============================
    // 🟡 STEP 3: Insert New Pending
    // ===============================

    await pool.query(
      `INSERT INTO subscriptions
       (userId, planId, status, startDate, endDate, createdAt, paymentProof)
       VALUES (?, ?, 'Pending', CURDATE(),
               DATE_ADD(CURDATE(), INTERVAL ? DAY),
               NOW(), ?)`,
      [req.user.userId, planId, duration, paymentProofPath],
    );

    res.json({
      success: true,
      message: "Plan upgrade request submitted successfully",
    });
  } catch (err) {
    console.error("Upgrade request error:", err);
    res.status(500).json({ error: "Failed to request upgrade" });
  }
};

// ================= RENEW SUBSCRIPTION =================
exports.renewSubscription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM subscriptions
       WHERE userId = ?
       ORDER BY id DESC
       LIMIT 1`,
      [req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No subscription found" });
    }

    const currentSub = rows[0];

    const [planRows] = await pool.query(
      "SELECT durationDays FROM plans WHERE id = ?",
      [currentSub.planId],
    );

    const duration = planRows[0].durationDays;

    // 🔥 FILE PATH
    const paymentProofPath = req.file
      ? `/uploads/${req.user.userId}/subscription/${req.file.filename}`
      : null;

    await pool.query(
      `INSERT INTO subscriptions
       (userId, planId, status, startDate, endDate, createdAt, paymentProof)
       VALUES (?, ?, 'Pending', CURDATE(),
               DATE_ADD(CURDATE(), INTERVAL ? DAY),
               NOW(), ?)`,
      [req.user.userId, currentSub.planId, duration, paymentProofPath],
    );

    res.json({
      success: true,
      message: "Renewal request submitted",
    });
  } catch (err) {
    console.error("Renew error:", err);
    res.status(500).json({ error: "Failed to renew subscription" });
  }
};

// ================= CHECK SUBSCRIPTION STATUS =================
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.*,
          p.name AS planName,
          p.price,
          p.durationDays,
          p.maxProducts,
          p.maxCategories,
          p.maxCustomers,
          p.maxEmployees,
          p.maxSuppliers,
          p.maxUsers,
          p.hasOnlineBackup,
          p.hasFullBackupWithImages
       FROM subscriptions s
       JOIN plans p ON s.planId = p.id
       WHERE s.userId = ?
       ORDER BY s.endDate DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.json({
        state: "Locked",
        message: "No subscription found",
      });
    }

    const sub = rows[0];

    if (sub.status === "Pending") {
      return res.json({
        state: "Locked",
        message: "Subscription pending approval",
      });
    }

    const today = new Date();
    const endDate = new Date(sub.endDate);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));

    if (today <= endDate) {
      return res.json({
        state: "Active",
        subscription: sub,
      });
    }

    const GRACE_DAYS = 5;

    if (diffDays > 0 && diffDays <= GRACE_DAYS) {
      return res.json({
        state: "Grace",
        remainingDays: GRACE_DAYS - diffDays,
        subscription: sub,
      });
    }

    return res.json({
      state: "Locked",
      message: "Subscription expired",
    });

  } catch (err) {
    console.error("Subscription status error:", err);
    res.status(500).json({
      error: "Failed to check subscription",
    });
  }
};

// ================= GET ALL ACTIVE PLANS =================
exports.getAllPlans = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          id,
          name,
          price,
          durationDays,
          maxProducts,
          maxCategories,
          maxCustomers,
          maxEmployees,
          maxSuppliers,
          maxUsers,
          hasOnlineBackup,
          hasFullBackupWithImages
       FROM plans
       WHERE status = 1
       ORDER BY price ASC`
    );

    res.json({
      success: true,
      plans: rows,
    });

  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({
      error: "Failed to fetch plans",
    });
  }
};
// ================= GET SUBSCRIPTION HISTORY =================
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.*,
          p.name AS planName,
          p.price,
          p.maxProducts,
          p.maxCategories,
          p.maxCustomers,
          p.maxEmployees,
          p.maxSuppliers,
          p.maxUsers,
          p.hasOnlineBackup,
          p.hasFullBackupWithImages
       FROM subscriptions s
       JOIN plans p ON s.planId = p.id
       WHERE s.userId = ?
       ORDER BY s.id DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      history: rows,
    });

  } catch (err) {
    console.error("Subscription history error:", err);
    res.status(500).json({
      error: "Failed to fetch subscription history",
    });
  }
};