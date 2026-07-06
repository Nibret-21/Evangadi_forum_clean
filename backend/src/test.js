import pool from "../db/config.js";

const test = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    console.log("✅ SUCCESS:", rows);
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  } finally {
    process.exit();
  }
};

test();
