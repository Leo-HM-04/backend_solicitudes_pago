const bcrypt = require("bcrypt");
const Usuario = require("../models/usuario.model");

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Obtiene la lista completa de usuarios del sistema. Solo disponible para admin_general.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error del servidor
 */

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAllUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error("Error en getUsuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Obtiene la información de un usuario específico por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */

// Obtener un usuario por ID
const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.getUsuarioById(req.params.id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    console.error("Error en getUsuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en el sistema. Valida que el email sea único y que solo exista un admin_general.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuario'
 *           example:
 *             nombre: "Juan Pérez"
 *             email: "juan.perez@bechapra.com"
 *             password: "password123"
 *             rol: "solicitante"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 email:
 *                   type: string
 *                 rol:
 *                   type: string
 *       400:
 *         description: Campos requeridos faltantes
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       409:
 *         description: Email ya existe o ya hay un admin_general
 *       500:
 *         description: Error del servidor
 */

// Crear un nuevo usuario (con validación de duplicado y de admin único)
const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Validar si el correo ya existe
    const usuarioExistente = await Usuario.getUsuarioByEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email" });
    }
    
    // Validar si ya existe un admin_general (solo puede haber uno)
    if (rol === "admin_general") {
      const adminYaExiste = await Usuario.getUsuarioByRol("admin_general");
      if (adminYaExiste) {
        return res.status(409).json({ message: "Ya existe un usuario con rol admin_general; solo puede haber un administador" });
      }
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const id = await Usuario.createUsuario(nombre, email, hashedPassword, rol);

    res.status(201).json({ id, nombre, email, rol });
  } catch (error) {
    console.error("Error en createUsuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente. Permite cambiar contraseña opcionalmente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez Actualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez.nuevo@bechapra.com"
 *               rol:
 *                 type: string
 *                 enum: [admin_general, solicitante, aprobador, pagador_banca]
 *                 example: "aprobador"
 *               password:
 *                 type: string
 *                 description: Nueva contraseña (opcional)
 *                 example: "nuevaPassword123"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado correctamente"
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Ya existe un admin_general
 *       500:
 *         description: Error del servidor
 */

// Actualizar un usuario (con console.log para depuración)
const updateUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, email, rol, password } = req.body;

    console.log("Intentando actualizar usuario con ID:", id);
    console.log("Datos recibidos:", { nombre, email, rol });

    // Validar que no haya más de un admin_general
    if (rol === "admin_general") {
      const adminExistente = await Usuario.getUsuarioByRol("admin_general");

      if (adminExistente && adminExistente.id_usuario !== parseInt(id)) {
        return res.status(409).json({
          message: "Ya existe un usuario con rol admin_general; solo puede haber un administrador.",
        });
      }
    }

    // Si se proporciona una nueva contraseña, encriptarla y actualizarla
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Usuario.updateUsuarioConPassword(id, nombre, email, rol, hashedPassword);
    } else {
      await Usuario.updateUsuario(id, nombre, email, rol);
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error en updateUsuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema de forma permanente. Solo disponible para admin_general.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *         example: 5
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado"
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 *     x-codeSamples:
 *       - lang: 'cURL'
 *         source: |
 *           curl -X DELETE \
 *             http://localhost:3000/api/usuarios/5 \
 *             -H 'Authorization: Bearer your-jwt-token'
 */

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
  try {
    const deleted = await Usuario.deleteUsuario(req.params.id);
    if (deleted === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error en deleteUsuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// Exportar funciones
module.exports = {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
