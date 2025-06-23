const pool = require("./db/connection");

async function probarConexion() {
  try {
    const [rows] = await pool.query("SELECT 1 + 3 AS resultado");
    console.log("Conexión exitosa ✅ Resultado:", rows[0].resultado);
  } catch (error) {
    console.error("Error en la conexión ❌:", error);
  }
}

probarConexion();
