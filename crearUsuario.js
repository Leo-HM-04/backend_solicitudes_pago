const bcrypt = require("bcrypt");
const pool = require("./db/connection");

const usuarios = [
  {
    nombre: "Leonardo Admin",
    email: "admin@bechapra.com",
    password: "admin123",
    rol: "admin_general",
  },
  {
    nombre: "Solicitante Uno",
    email: "solicitante2@bechapra.com",
    password: "sol123",
    rol: "solicitante",
  },
  {
    nombre: "Aprobador Uno",
    email: "aprobador@bechapra.com",
    password: "aprobar123",
    rol: "aprobador",
  },
  {
    nombre: "Pagador Uno",
    email: "pagador@bechapra.com",
    password: "pagar123",
    rol: "pagador_banca",
  },
];

async function insertarUsuarios() {
  for (const usuario of usuarios) {
    try {
      // Verificar si ya existe un usuario con ese email o, en el caso del admin, si ya existe un admin_general
      const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE email = ? OR rol = ?",
        [usuario.email, usuario.rol === "admin_general" ? "admin_general" : "no_rol"]
      );

      if (rows.length > 0) {
        console.log(`❌ Usuario con email ${usuario.email} o rol ${usuario.rol} ya existe.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES (?, ?, ?, ?)`,
        [usuario.nombre, usuario.email, hashedPassword, usuario.rol]
      );

      console.log(`✅ Usuario ${usuario.rol} creado: ${usuario.email}`);
    } catch (error) {
      console.error(`❌ Error al insertar ${usuario.email}:`, error);
    }
  }

  // Cerrar la conexión
  await pool.end();
}

insertarUsuarios();
