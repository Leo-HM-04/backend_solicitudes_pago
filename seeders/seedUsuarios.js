const bcrypt = require("bcrypt");
const pool = require("../db/connection");

// Función para generar datos aleatorios
const generateRandomUser = (index, rol) => {
  const nombres = [
    'Ana', 'Carlos', 'María', 'José', 'Laura', 'Pedro', 'Carmen', 'Luis', 'Elena', 'Miguel',
    'Isabel', 'Antonio', 'Rosa', 'Francisco', 'Pilar', 'Manuel', 'Teresa', 'Jesús', 'Mercedes', 'Ángel',
    'Dolores', 'Rafael', 'Antonia', 'David', 'Josefa', 'Juan', 'Francisca', 'Daniel', 'Cristina', 'Javier'
  ];
  
  const apellidos = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
    'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'
  ];

  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${index}@bechapra.com`;

  return {
    nombre: `${nombre} ${apellido}`,
    email,
    password: `${rol}123`,
    rol
  };
};

const usuariosBase = [
  {
    nombre: "Leonardo Admin",
    email: "admin@bechapra.com",
    password: "admin123",
    rol: "admin_general",
  }
];

async function seedUsuarios() {
  try {
    console.log('🌱 Iniciando seeding de usuarios...');

    // Limpiar tabla usuarios (opcional)
    const clearTable = process.argv.includes('--clear');
    if (clearTable) {
      await pool.query('DELETE FROM usuarios WHERE email != "admin@bechapra.com"');
      console.log('🧹 Tabla usuarios limpiada (excepto admin principal)');
    }

    const usuarios = [...usuariosBase];

    // Generar 30 solicitantes
    for (let i = 1; i <= 300; i++) {
      usuarios.push(generateRandomUser(i, 'solicitante'));
    }

    // Generar 20 aprobadores
    for (let i = 1; i <= 200; i++) {
      usuarios.push(generateRandomUser(i, 'aprobador'));
    }

    // Generar 15 pagadores
    for (let i = 1; i <= 150; i++) {
      usuarios.push(generateRandomUser(i, 'pagador_banca'));
    }

    let creados = 0;
    let existentes = 0;

    for (const usuario of usuarios) {
      try {
        // Verificar si ya existe
        const [existing] = await pool.query(
          "SELECT id_usuario FROM usuarios WHERE email = ?",
          [usuario.email]
        );

        if (existing.length > 0) {
          existentes++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(usuario.password, 10);

        await pool.query(
          `INSERT INTO usuarios (nombre, email, password, rol)
           VALUES (?, ?, ?, ?)`,
          [usuario.nombre, usuario.email, hashedPassword, usuario.rol]
        );

        creados++;
        console.log(`✅ Usuario ${usuario.rol} creado: ${usuario.email}`);
      } catch (error) {
        console.error(`❌ Error al insertar ${usuario.email}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen del seeding:`);
    console.log(`✅ Usuarios creados: ${creados}`);
    console.log(`⚠️  Usuarios ya existentes: ${existentes}`);
    console.log(`📝 Total procesados: ${usuarios.length}`);

  } catch (error) {
    console.error('❌ Error en seeding de usuarios:', error);
  } finally {
    await pool.end();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  seedUsuarios();
}

module.exports = seedUsuarios;
