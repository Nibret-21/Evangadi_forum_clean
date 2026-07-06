// import dotenv from 'dotenv';
// dotenv.config();
// import mysql from 'mysql2/promise';

// // Database connection pool
// export const db = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS || "",
//   database: process.env.DB_NAME || "forum",
// });

// const ensureParams = params => {
//   if (params === undefined || params === null) {
//     throw new Error('SQL parameters are required');
//   }
//   const isArray = Array.isArray(params);
//   const isObject = !isArray && typeof params === 'object';
//   if (!isArray && !isObject) {
//     throw new Error('SQL parameters must be an array or object');
//   }
// };

// export const safeExecute = async (sql, params) => {
//   if (typeof sql !== 'string' || sql.trim().length === 0) {
//     throw new Error('SQL query must be a non-empty string');
//   }
//   ensureParams(params);
//   const [result] = await db.execute(sql, params);
//   return result;
// };
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const safeExecute = async (query, params = []) => {
  try {
    const [result] = await db.query(query, params);
    return result;
  } catch (err) {
    console.error("DB ERROR:", err.message);
    throw err;
  }
};