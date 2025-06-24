const pool = require("../db/connection");

// Obtener todas las solicitudes (para admins/aprobadores)
exports.getTodas = async () => {
  const [rows] = await pool.query("SELECT * FROM solicitudes_pago");
  return rows;
};

// Obtener solicitudes de un usuario específico (rol solicitante)
exports.getPorUsuario = async (id_usuario) => {
  const [rows] = await pool.query("SELECT * FROM solicitudes_pago WHERE id_usuario = ?", [id_usuario]);
  return rows;
};

// Obtener una sola solicitud por ID
exports.getPorId = async (id_solicitud) => {
  const [rows] = await pool.query("SELECT * FROM solicitudes_pago WHERE id_solicitud = ?", [id_solicitud]);
  return rows[0];
};

// Crear una nueva solicitud
exports.crear = async (datos) => {
  const {
    id_usuario,
    departamento,
    monto,
    cuenta_destino,
    factura_url,
    concepto,
    fecha_limite_pago,
    soporte_url,
  } = datos;

  await pool.query(
    `INSERT INTO solicitudes_pago 
    (id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, fecha_limite_pago, soporte_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, fecha_limite_pago, soporte_url || null]
  );
};

// Aprobar o rechazar solicitud (solo por rol aprobador)
exports.actualizarEstado = async (id_solicitud, estado, comentario_aprobador, id_aprobador) => {
  const [result] = await pool.query(
    `UPDATE solicitudes_pago 
     SET estado = ?, comentario_aprobador = ?, id_aprobador = ?, fecha_revision = NOW() 
     WHERE id_solicitud = ?`,
    [estado, comentario_aprobador, id_aprobador, id_solicitud]
  );

  return result.affectedRows; // 👈 Devuelve el número de filas afectadas
};


// Eliminar una solicitud (solo admin_general)
exports.eliminar = async (id_solicitud) => {
  await pool.query("DELETE FROM solicitudes_pago WHERE id_solicitud = ?", [id_solicitud]);
};
