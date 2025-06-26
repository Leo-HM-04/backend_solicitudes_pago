const SolicitudModel = require("../models/solicitud.model");

/**
 * @swagger
 * components:
 *   schemas:
 *     Solicitud:
 *       type: object
 *       properties:
 *         id_solicitud:
 *           type: integer
 *           description: ID único de la solicitud
 *         id_usuario:
 *           type: integer
 *           description: ID del usuario solicitante
 *         departamento:
 *           type: string
 *           description: Departamento que realiza la solicitud
 *         monto:
 *           type: number
 *           format: decimal
 *           description: Monto de la solicitud
 *         cuenta_destino:
 *           type: string
 *           description: Cuenta bancaria de destino
 *         factura_url:
 *           type: string
 *           format: uri
 *           description: URL de la factura
 *         concepto:
 *           type: string
 *           description: Concepto o descripción del pago
 *         fecha_limite_pago:
 *           type: string
 *           format: date
 *           description: Fecha límite para el pago
 *         soporte_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL del documento de soporte (opcional)
 *         estado:
 *           type: string
 *           enum: [pendiente, autorizada, rechazada]
 *           description: Estado actual de la solicitud
 *         id_aprobador:
 *           type: integer
 *           nullable: true
 *           description: ID del usuario que aprobó/rechazó
 *         comentario_aprobador:
 *           type: string
 *           nullable: true
 *           description: Comentario del aprobador
 *         fecha_revision:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha de revisión
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *     CreateSolicitud:
 *       type: object
 *       required:
 *         - departamento
 *         - monto
 *         - cuenta_destino
 *         - factura_url
 *         - concepto
 *         - fecha_limite_pago
 *       properties:
 *         departamento:
 *           type: string
 *           example: "Recursos Humanos"
 *         monto:
 *           type: number
 *           format: decimal
 *           example: 150000.50
 *         cuenta_destino:
 *           type: string
 *           example: "123456789"
 *         factura_url:
 *           type: string
 *           format: uri
 *           example: "https://storage.bechapra.com/facturas/factura123.pdf"
 *         concepto:
 *           type: string
 *           example: "Pago a proveedores por servicios de consultoría"
 *         fecha_limite_pago:
 *           type: string
 *           format: date
 *           example: "2024-02-15"
 *         soporte_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://storage.bechapra.com/soportes/soporte123.pdf"
 *     UpdateEstado:
 *       type: object
 *       required:
 *         - estado
 *       properties:
 *         estado:
 *           type: string
 *           enum: [autorizada, rechazada]
 *           example: "autorizada"
 *         comentario_aprobador:
 *           type: string
 *           example: "Solicitud aprobada según procedimientos internos"
 */

/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     summary: Obtener solicitudes
 *     description: |
 *       Obtiene solicitudes según el rol del usuario:
 *       - Solicitantes: Solo sus propias solicitudes
 *       - Aprobadores/Admin: Todas las solicitudes
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Solicitud'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     description: Obtiene una solicitud específica. Los solicitantes solo pueden ver sus propias solicitudes.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Solicitud'
 *       403:
 *         description: Sin permisos para ver esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     summary: Crear nueva solicitud
 *     description: Crea una nueva solicitud de pago. Solo disponible para usuarios con rol 'solicitante'.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSolicitud'
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud creada exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * /api/solicitudes/{id}/estado:
 *   put:
 *     summary: Actualizar estado de solicitud
 *     description: Aprueba o rechaza una solicitud. Solo disponible para usuarios con rol 'aprobador'.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEstado'
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado actualizado correctamente"
 *       400:
 *         description: Estado no válido
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */
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

<<<<<<< HEAD
/**
 * @swagger
 * /api/solicitudes/{id}:
 *   delete:
 *     summary: Eliminar solicitud
 *     description: Elimina una solicitud de pago. Solo disponible para usuarios con rol 'admin_general'.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud eliminada correctamente"
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */
=======
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
>>>>>>> eac983571927045bae869201bdef093c8f57e201
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
