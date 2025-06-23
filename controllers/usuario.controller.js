const bcrypt = require("bcrypt");
const Usuario = require("../models/usuario.model");

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
