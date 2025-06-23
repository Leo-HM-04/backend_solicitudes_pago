const pool = require("../db/connection");

// Obtener todos los usuarios
const getAllUsuarios = async () => {
  const [rows] = await pool.query("SELECT id_usuario, nombre, email, rol FROM usuarios");
  return rows;
};

// Obtener un usuario por Rol
const getUsuarioByRol = async (rol) => {
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE rol = ?", [rol]);
  return rows.length > 0 ? rows[0] : null;
};

// Obtener un usuario por ID
const getUsuarioById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = ?",
    [id]
  );
  return rows[0];
};

// Obtener un usuario por email (para validar duplicados)
const getUsuarioByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
  return rows[0];
};

// Crear un nuevo usuario
const createUsuario = async (nombre, email, password, rol) => {
  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
    [nombre, email, password, rol]
  );
  return result.insertId;
};

// Actualizar un usuario
const updateUsuario = async (id, nombre, email, rol) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?",
    [nombre, email, rol, id]
  );
  return result.affectedRows;
};


// Actualizar con nueva contraseña
async function updateUsuarioConPassword(id, nombre, email, rol, password) {
  const [result] = await pool.query(
    "UPDATE usuarios SET nombre = ?, email = ?, rol = ?, password = ? WHERE id_usuario = ?",
    [nombre, email, rol, password, id]
  );
  return result.affectedRows;
}


// Eliminar un usuario
const deleteUsuario = async (id) => {
  const [result] = await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
  return result.affectedRows;
};

// Exportar funciones
module.exports = {
  getAllUsuarios,
  getUsuarioById,
  getUsuarioByEmail, // 👈 importante para validación en create
  getUsuarioByRol,
  createUsuario,
  updateUsuarioConPassword,
  updateUsuario,
  deleteUsuario,
};
