const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/authMiddleware");
const autorizarRol = require("../middlewares/autorizarRol");
const controller = require("../controllers/recurrente.controller");

// Crear plantilla (solo solicitantes)
router.post("/", verificarToken, autorizarRol("solicitante"), controller.crearRecurrente);

// Obtener plantillas del usuario
router.get("/", verificarToken, controller.obtenerRecurrentes);


module.exports = router;
