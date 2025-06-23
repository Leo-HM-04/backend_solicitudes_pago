const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // sin contraseña
  database: process.env.DB_NAME || "plataforma_solicitudes_pago",
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión exitosa a la base de datos");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
  }
})();

module.exports = pool;
