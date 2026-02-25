const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const pool = require("./models/db");

// ================= ROUTE IMPORTS =================
const authRoutes = require("./routes/auth");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const orderRoutes = require("./routes/orderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const barcodeRoutes = require("./routes/barcodeRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const syncRoutes = require("./routes/syncRoutes");

const app = express();

// ================= GLOBAL MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= API VERSIONING =================
const API_PREFIX = "/api/v1";

// ================= ROUTES =================
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);
app.use(`${API_PREFIX}/shifts`, shiftRoutes);
app.use(`${API_PREFIX}/barcodes`, barcodeRoutes);
app.use(`${API_PREFIX}/permissions`, permissionRoutes);
app.use(`${API_PREFIX}/sync`, syncRoutes);

// ================= HEALTH CHECK =================
app.get(`${API_PREFIX}/health`, async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "OK",
      database: "Connected",
      timezone: "Asia/Karachi",
      timestamp: new Date(),
      version: "1.2.0",
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 DreamsPOS SaaS Backend Running",
    version: "1.2.0",
    apiBase: API_PREFIX,
    endpoints: {
      health: `${API_PREFIX}/health`,
      auth: `${API_PREFIX}/auth`,
      products: `${API_PREFIX}/products`,
      sync: `${API_PREFIX}/sync/full`,
      barcodes: `${API_PREFIX}/barcodes`,
      permissions: `${API_PREFIX}/permissions`,
    },
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Global error:", err);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}${API_PREFIX}`);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});