const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const verificarToken = require("../middlewares/authMiddleware");
const autorizarRol = require("../middlewares/autorizarRol");

// Solo usuarios autenticados Y con rol admin_general podrán acceder
router.get("/", verificarToken, autorizarRol("admin_general"), usuarioController.getUsuarios);
router.get("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.getUsuario);
router.post("/", verificarToken, autorizarRol("admin_general"), usuarioController.createUsuario);
router.put("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.updateUsuario);
router.delete("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.deleteUsuario);

module.exports = router;
