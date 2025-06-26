const pool = require("../db/connection");

async function clearSolicitudes() {
  try {
    console.log('🧹 Iniciando limpieza de tabla solicitudes_pago...');

    // Verificar si la tabla existe
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.DB_NAME || 'plataforma_solicitudes_pago', 'solicitudes_pago']);

    if (tables.length === 0) {
      console.log('⚠️  La tabla solicitudes_pago no existe. Creándola...');
      
      // Crear la tabla solicitudes_pago
      await pool.query(`
        CREATE TABLE solicitudes_pago (
          id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
          id_usuario INT NOT NULL,
          departamento VARCHAR(100) NOT NULL,
          monto DECIMAL(15,2) NOT NULL,
          cuenta_destino VARCHAR(50) NOT NULL,
          factura_url VARCHAR(500) NOT NULL,
          concepto TEXT NOT NULL,
          fecha_limite_pago DATE NOT NULL,
          soporte_url VARCHAR(500) NULL,
          estado ENUM('pendiente', 'autorizada', 'rechazada') DEFAULT 'pendiente',
          id_aprobador INT NULL,
          comentario_aprobador TEXT NULL,
          fecha_revision DATETIME NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
          FOREIGN KEY (id_aprobador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
        )
      `);
      
      console.log('✅ Tabla solicitudes_pago creada');
      console.log('📊 Solicitudes en la tabla: 0');
      return;
    }

    // Eliminar todas las solicitudes
    const [result] = await pool.query('DELETE FROM solicitudes_pago');
    console.log(`✅ Eliminadas ${result.affectedRows} solicitudes`);
    
    // Resetear AUTO_INCREMENT
    await pool.query('ALTER TABLE solicitudes_pago AUTO_INCREMENT = 1');
    console.log('🔄 AUTO_INCREMENT reseteado');

    // Mostrar estadísticas finales
    const [remaining] = await pool.query('SELECT COUNT(*) as count FROM solicitudes_pago');
    console.log(`📊 Solicitudes restantes en la tabla: ${remaining[0].count}`);

  } catch (error) {
    console.error('❌ Error al limpiar tabla solicitudes_pago:', error);
  } finally {
    await pool.end();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  clearSolicitudes();
}

module.exports = clearSolicitudes;
