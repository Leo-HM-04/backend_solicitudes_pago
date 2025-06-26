const pool = require("../db/connection");

async function clearUsuarios() {
  try {
    console.log('🧹 Iniciando limpieza de tabla usuarios...');

    // Opción para mantener solo el admin principal
    const keepAdmin = process.argv.includes('--keep-admin');

    if (keepAdmin) {
      // Eliminar todos excepto el admin principal
      const [result] = await pool.query(
        'DELETE FROM usuarios WHERE email != ?',
        ['admin@bechapra.com']
      );
      console.log(`✅ Eliminados ${result.affectedRows} usuarios (manteniendo admin principal)`);
    } else {
      // Eliminar todos los usuarios
      const [result] = await pool.query('DELETE FROM usuarios');
      console.log(`✅ Eliminados ${result.affectedRows} usuarios`);
      
      // Resetear AUTO_INCREMENT
      await pool.query('ALTER TABLE usuarios AUTO_INCREMENT = 1');
      console.log('🔄 AUTO_INCREMENT reseteado');
    }

    // Mostrar usuarios restantes
    const [remaining] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`📊 Usuarios restantes en la tabla: ${remaining[0].count}`);

  } catch (error) {
    console.error('❌ Error al limpiar tabla usuarios:', error);
  } finally {
    await pool.end();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  clearUsuarios();
}

module.exports = clearUsuarios;
