import mysql from "mysql2";
import migration from "mysql-migrations";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "chat",
});

migration.init(connection, __dirname + "/migrations");
