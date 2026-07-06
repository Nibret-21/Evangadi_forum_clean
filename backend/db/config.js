import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

// Debug logs (you can remove later)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ THIS WAS MISSING (causing your crash)
export const safeExecute = async (sql, params) => {
  if (typeof sql !== "string" || sql.trim() === "") {
    throw new Error("SQL query must be a non-empty string");
  }

  if (params === undefined || params === null) {
    throw new Error("SQL parameters are required");
  }

  const [result] = await db.execute(sql, params);
  return result;
};

























































































































// // import dotenv from 'dotenv';            //  dotenv is a package that reads the .env file.
// // dotenv.config();
// // import mysql from 'mysql2/promise';

// // // Database connection pool
// // export const db = mysql.createPool({
// //   host: process.env.DB_HOST || 'localhost',
// //   user: process.env.DB_USER || 'root',
// //   password: process.env.DB_PASS || '',
// //   database: process.env.DB_NAME || 'evangadi_forum',
// // });

// // const ensureParams = params => {
// //   if (params === undefined || params === null) {
// //     throw new Error('SQL parameters are required');
// //   }
// //   const isArray = Array.isArray(params);
// //   const isObject = !isArray && typeof params === 'object';
// //   if (!isArray && !isObject) {
// //     throw new Error('SQL parameters must be an array or object');
// //   }
// // };

// // export const safeExecute = async (sql, params) => {
// //   if (typeof sql !== 'string' || sql.trim().length === 0) {
// //     throw new Error('SQL query must be a non-empty string');
// //   }
// //   ensureParams(params);
// //   const [result] = await db.execute(sql, params);
// //   return result;
// // };

// import dotenv from 'dotenv';
// dotenv.config();
// import mysql from 'mysql2/promise';

// Database connection pool
// export const db = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE || "evangadi_forum_db",
//   port: process.env.DB_PORT || 4000,
//   ssl: {
//     rejectUnauthorized: false,
//   },
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
