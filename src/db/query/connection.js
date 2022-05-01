import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// const connection = mysql.createConnection({
//   connectionLimit: 10,
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: "chat",
// });

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'chat',
});

const poolPromise = pool.promise();

export { poolPromise };
