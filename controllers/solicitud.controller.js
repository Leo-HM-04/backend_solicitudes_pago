const SolicitudModel = require("../models/solicitud.model");

// Obtener todas las solicitudes o solo las del usuario (según su rol)
exports.getSolicitudes = async (req, res) => {
  try {
    const { rol, id_usuario } = req.user;

    let solicitudes = [];
    if (rol === "solicitante") {
      solicitudes = await SolicitudModel.getPorUsuario(id_usuario);
    } else if (rol === "pagador_banca") {
      solicitudes = await SolicitudModel.getAutorizadas();
    } else {
      solicitudes = await SolicitudModel.getTodas();
    }

    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

// Obtener una solicitud por su ID
exports.getSolicitud = async (req, res) => {
  try {
    const { rol, id_usuario } = req.user;
    const { id } = req.params;

    const solicitud = await SolicitudModel.getPorId(id);

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    if (rol === "solicitante" && solicitud.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permiso para ver esta solicitud" });
    }

    res.json(solicitud);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la solicitud" });
  }
};

// Crear una nueva solicitud de pago
exports.createSolicitud = async (req, res) => {
  try {
    const {
      departamento,
      monto,
      cuenta_destino,
      factura_url,
      concepto,
      tipo_pago,
      fecha_limite_pago,
      soporte_url,
    } = req.body;

    const { id_usuario } = req.user;

    await SolicitudModel.crear({
      id_usuario,
      departamento,
      monto,
      cuenta_destino,
      factura_url,
      concepto,
      tipo_pago,
      fecha_limite_pago,
      soporte_url,
    });

    res.status(201).json({ message: "Solicitud creada exitosamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
};

// Aprobar o rechazar una solicitud (solo aprobadores)
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario_aprobador } = req.body;
    const { id_usuario: id_aprobador } = req.user;

    if (!["autorizada", "rechazada"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido. Debe ser 'autorizada' o 'rechazada'" });
    }

    const filasActualizadas = await SolicitudModel.actualizarEstado(
      id,
      estado,
      comentario_aprobador,
      id_aprobador
    );

    if (filasActualizadas === 0) {
      return res.status(404).json({
        error: "No se encontró la solicitud o ya tiene ese estado",
      });
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el estado de la solicitud" });
  }
};

// Marcar una solicitud como pagada (solo pagador_banca)
exports.marcarComoPagada = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id_usuario: id_pagador } = req.user;

    if (rol !== "pagador_banca") {
      return res.status(403).json({ error: "No tienes permisos para marcar la solicitud como pagada" });
    }

    const filasActualizadas = await SolicitudModel.marcarComoPagada(id, id_pagador);

    if (filasActualizadas === 0) {
      return res.status(404).json({
        error: "No se pudo marcar como pagada. Verifica que esté autorizada o que exista.",
      });
    }

    res.json({ message: "Solicitud marcada como pagada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al marcar la solicitud como pagada" });
  }
};

// Eliminar una solicitud (solo admin_general)
exports.deleteSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitudModel.eliminar(id);
    res.json({ message: "Solicitud eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la solicitud" });
  }
};
