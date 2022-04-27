import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

connection.connect(function (err) {
  if (err) {
    throw err;
  } else {
    connection.query('CREATE DATABASE chat', function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log("Database 'chat' created.");
      }
    });
  }
});
