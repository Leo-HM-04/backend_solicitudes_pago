const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const verificarToken = require("../middlewares/authMiddleware");
const autorizarRol = require("../middlewares/autorizarRol");

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id_usuario:
 *           type: integer
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         rol:
 *           type: string
 *           enum: [admin_general, solicitante, aprobador, pagador_banca]
 *     CreateUsuario:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *         - rol
 *       properties:
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         rol:
 *           type: string
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get("/", verificarToken, autorizarRol("admin_general"), usuarioController.getUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.getUsuario);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: Email ya existe o ya hay un admin_general
 */
router.post("/", verificarToken, autorizarRol("admin_general"), usuarioController.createUsuario);

router.put("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.updateUsuario);
router.delete("/:id", verificarToken, autorizarRol("admin_general"), usuarioController.deleteUsuario);

module.exports = router;
