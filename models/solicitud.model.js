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

// Obtener solo solicitudes autorizadas (para pagador_banca)
exports.getAutorizadas = async () => {
  const [rows] = await pool.query("SELECT * FROM solicitudes_pago WHERE estado = 'autorizada'");
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
    tipo_pago,
    fecha_limite_pago,
    soporte_url,
  } = datos;

  await pool.query(
    `INSERT INTO solicitudes_pago 
    (id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, tipo_pago, fecha_limite_pago, soporte_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, tipo_pago, fecha_limite_pago, soporte_url || null]
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

  return result.affectedRows;
};

// Marcar una solicitud como pagada (solo por rol pagador_banca)
exports.marcarComoPagada = async (id_solicitud, id_pagador) => {
  const [result] = await pool.query(
    `UPDATE solicitudes_pago 
     SET estado = 'pagada', id_pagador = ?, fecha_pago = NOW()
     WHERE id_solicitud = ? AND estado = 'autorizada'`,
    [id_pagador, id_solicitud]
  );

  return result.affectedRows;
};

// Eliminar una solicitud (solo admin_general)
exports.eliminar = async (id_solicitud) => {
  await pool.query("DELETE FROM solicitudes_pago WHERE id_solicitud = ?", [id_solicitud]);
};
