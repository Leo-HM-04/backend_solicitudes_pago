const pool = require("../db/connection");

// Crear una nueva plantilla de pago recurrente
exports.crearRecurrente = async (datos) => {
  const {
    id_usuario,
    departamento,
    monto,
    cuenta_destino,
    concepto,
    tipo_pago,
    frecuencia,
    siguiente_fecha
  } = datos;

  await pool.query(`
    INSERT INTO pagos_recurrentes 
    (id_usuario, departamento, monto, cuenta_destino, concepto, tipo_pago, frecuencia, siguiente_fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, departamento, monto, cuenta_destino, concepto, tipo_pago, frecuencia, siguiente_fecha]
  );
};

// (Opcional) Obtener todas las plantillas activas del usuario
exports.obtenerRecurrentesPorUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT * FROM pagos_recurrentes WHERE id_usuario = ? AND activo = 1`,
    [id_usuario]
  );
  return rows;
};
