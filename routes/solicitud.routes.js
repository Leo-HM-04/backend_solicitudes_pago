const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/authMiddleware");
const autorizarRol = require("../middlewares/autorizarRol");
const controller = require("../controllers/solicitud.controller");

// Crear solicitud (solo solicitantes)
router.post("/", verificarToken, autorizarRol("solicitante"), controller.createSolicitud);

// Obtener todas o propias según el rol
router.get("/", verificarToken, controller.getSolicitudes);

// Obtener una solicitud por ID
router.get("/:id", verificarToken, controller.getSolicitud);

// Aprobar o rechazar solicitud (solo aprobadores)
router.put("/:id/estado", verificarToken, autorizarRol("aprobador"), controller.actualizarEstado);

// Marcar como pagada (solo pagador_banca)
router.put("/:id/pagar", verificarToken, controller.marcarComoPagada);

// Eliminar solicitud (solo admin_general)
router.delete("/:id", verificarToken, autorizarRol("admin_general"), controller.deleteSolicitud);

module.exports = router;
