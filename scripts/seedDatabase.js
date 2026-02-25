// pos_backend/scripts/seedDatabase.js
require("dotenv").config(); // Loads variables from ../.env
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  console.log("🌱 Starting database seeding process...");

  // Create database connection pool using your .env credentials
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pos_db",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // 1. Insert a Main User (Owner)
    const [userResult] = await pool.execute(
      `INSERT INTO users (name, email, password, role, status, createdOn) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["Demo Owner", "owner@demo.com", hashedPassword, "owner", 1, currentDate],
    );
    const userId = userResult.insertId;
    console.log(`✅ Created User: owner@demo.com (ID: ${userId})`);

    // 2. Insert Settings for the User [cite: 15, 62]
    await pool.execute(
      `INSERT INTO settings (userId, companyName, currency, currencyPosition, taxPercent, enableTax, updatedOn) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, "DreamsPOS Demo Store", "PKR", "left", 18.0, 1, currentDate],
    );
    console.log(`✅ Created Settings for User ID: ${userId}`);

    // 3. Insert a Subscription (Linking to Basic Plan ID 1) [cite: 11, 18, 64]
    await pool.execute(
      `INSERT INTO subscriptions (userId, planId, status, startDate, endDate, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        1,
        "Active",
        currentDate,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currentDate,
      ],
    );
    console.log(`✅ Created Subscription for User ID: ${userId}`);

    // 4. Insert Categories [cite: 3, 55]
    const [catResult] = await pool.execute(
      `INSERT INTO categories (userId, name, status, createdOn) VALUES (?, ?, ?, ?)`,
      [userId, "Electronics", 1, currentDate],
    );
    console.log(`✅ Created Category: Electronics`);

    // 5. Insert Products [cite: 12, 59]
    await pool.execute(
      `INSERT INTO products (userId, name, sku, category, brand, price, unit, quantity, status, createdOn) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "Wireless Mouse",
        "SKU-ELEC-001",
        "Electronics",
        "Logitech",
        1500.0,
        "pcs",
        50,
        1,
        currentDate,
      ],
    );
    console.log(`✅ Created Product: Wireless Mouse`);

    // 6. Insert Customers [cite: 4, 56]
    await pool.execute(
      `INSERT INTO customers (userId, firstName, lastName, email, phone, status, createdOn) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "John",
        "Doe",
        "john.doe@example.com",
        "03001234567",
        1,
        currentDate,
      ],
    );
    console.log(`✅ Created Customer: John Doe`);

    // 7. Insert Suppliers [cite: 21, 65]
    await pool.execute(
      `INSERT INTO suppliers (userId, firstName, lastName, email, phone, status, createdOn) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "Acme",
        "Supplies",
        "contact@acmesupplies.com",
        "03009876543",
        1,
        currentDate,
      ],
    );
    console.log(`✅ Created Supplier: Acme Supplies`);

    console.log("\n🎉 Seeding completed successfully!");
    console.log("You can now log in using:");
    console.log("Email: owner@demo.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

seedDatabase();
