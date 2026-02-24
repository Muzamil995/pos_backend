const pool = require("../models/db");

async function ensureSettingsRow(userId) {
  const [existing] = await pool.query(
    "SELECT id FROM settings WHERE userId = ?",
    [userId],
  );

  if (existing.length === 0) {
    await pool.query(
      "INSERT INTO settings (userId, updatedOn) VALUES (?, NOW())",
      [userId],
    );
  }
}

// ================= GET SETTINGS =================
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM settings WHERE userId = ?", [
      req.user.userId,
    ]);

    if (rows.length === 0) {
      return res.json(null); // return null instead of 404
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};
exports.saveBusiness = async (req, res) => {
  try {
    const userId = req.user.userId;

    await ensureSettingsRow(userId);

    const {
      companyName,
      tagline,
      phone,
      whatsapp,
      email,
      website,
      address,
      ntn,
    } = req.body;

    const logoPath = req.file
      ? `/uploads/${userId}/settings/${req.file.filename}`
      : null;

    await pool.query(
      `UPDATE settings SET
        companyName = ?,
        logoPath = COALESCE(?, logoPath),
        tagline = ?,
        phone = ?,
        whatsapp = ?,
        email = ?,
        website = ?,
        address = ?,
        ntn = ?,
        updatedOn = NOW()
       WHERE userId = ?`,
      [
        companyName || null,
        logoPath,
        tagline || null,
        phone || null,
        whatsapp || null,
        email || null,
        website || null,
        address || null,
        ntn || null,
        userId,
      ],
    );

    res.json({ success: true, message: "Business updated" });
  } catch (err) {
    console.error("Business save error:", err);
    res.status(500).json({ error: "Failed to save business settings" });
  }
};
exports.saveReceipt = async (req, res) => {
  try {
    const userId = req.user.userId;

    await ensureSettingsRow(userId);

    const {
      printerType,
      showLogo,
      showAddress,
      showPhone,
      showTaxBreakdown,
      footerMessage,
    } = req.body;

    await pool.query(
      `UPDATE settings SET
        printerType = ?,
        showLogo = ?,
        showAddress = ?,
        showPhone = ?,
        showTaxBreakdown = ?,
        footerMessage = ?,
        updatedOn = NOW()
       WHERE userId = ?`,
      [
        printerType || null,
        showLogo ?? null,
        showAddress ?? null,
        showPhone ?? null,
        showTaxBreakdown ?? null,
        footerMessage || null,
        userId,
      ],
    );

    res.json({ success: true, message: "Receipt updated" });
  } catch (err) {
    console.error("Receipt save error:", err);
    res.status(500).json({ error: "Failed to save receipt settings" });
  }
};
exports.saveTax = async (req, res) => {
  try {
    const userId = req.user.userId;

    await ensureSettingsRow(userId);

    const { currency, currencyPosition, taxPercent, enableTax, rounding } =
      req.body;

    await pool.query(
      `UPDATE settings SET
        currency = ?,
        currencyPosition = ?,
        taxPercent = ?,
        enableTax = ?,
        rounding = ?,
        updatedOn = NOW()
       WHERE userId = ?`,
      [
        currency || null,
        currencyPosition || null,
        taxPercent ?? null,
        enableTax ?? null,
        rounding || null,
        userId,
      ],
    );

    res.json({ success: true, message: "Tax updated" });
  } catch (err) {
    console.error("Tax save error:", err);
    res.status(500).json({ error: "Failed to save tax settings" });
  }
};
exports.saveSecurity = async (req, res) => {
  try {
    const userId = req.user.userId;

    await ensureSettingsRow(userId);

    const { posPin } = req.body;

    await pool.query(
      `UPDATE settings SET
        posPin = ?,
        updatedOn = NOW()
       WHERE userId = ?`,
      [posPin || null, userId],
    );

    res.json({ success: true, message: "Security updated" });
  } catch (err) {
    console.error("Security save error:", err);
    res.status(500).json({ error: "Failed to save security settings" });
  }
};
