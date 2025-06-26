const pool = require("../db/connection");

// Datos para generar solicitudes realistas
const departamentos = [
  'Recursos Humanos', 'Contabilidad', 'Sistemas', 'Ventas', 'Marketing',
  'Compras', 'Logística', 'Administración', 'Producción', 'Calidad'
];

const conceptos = [
  'Pago a proveedores',
  'Reembolso de gastos de viaje',
  'Compra de equipos de oficina',
  'Servicios de consultoría',
  'Mantenimiento de equipos',
  'Servicios públicos',
  'Capacitación del personal',
  'Software y licencias',
  'Materiales de oficina',
  'Servicios de limpieza',
  'Reparaciones menores',
  'Gastos de representación',
  'Publicidad y marketing',
  'Alquiler de equipos',
  'Servicios profesionales'
];

const estados = ['pendiente', 'autorizada', 'rechazada'];

// Función para generar monto aleatorio
const generarMonto = () => {
  const minimo = 50000;
  const maximo = 5000000;
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
};

// Función para generar fecha aleatoria en los últimos 3 meses
const generarFecha = () => {
  const ahora = new Date();
  const treseMesesAtras = new Date(ahora.getTime() - (90 * 24 * 60 * 60 * 1000));
  const fechaAleatoria = new Date(treseMesesAtras.getTime() + Math.random() * (ahora.getTime() - treseMesesAtras.getTime()));
  return fechaAleatoria.toISOString().split('T')[0];
};

// Función para generar fecha límite (entre 15 y 60 días desde creación)
const generarFechaLimite = (fechaCreacion) => {
  const fecha = new Date(fechaCreacion);
  const diasAdicionales = Math.floor(Math.random() * 45) + 15;
  fecha.setDate(fecha.getDate() + diasAdicionales);
  return fecha.toISOString().split('T')[0];
};

async function seedSolicitudes() {
  try {
    console.log('🌱 Iniciando seeding de solicitudes...');

    // Obtener usuarios solicitantes
    const [solicitantes] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE rol = 'solicitante'"
    );

    // Obtener usuarios aprobadores
    const [aprobadores] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE rol = 'aprobador'"
    );

    if (solicitantes.length === 0) {
      throw new Error('No hay usuarios solicitantes disponibles. Ejecuta primero el seeder de usuarios.');
    }

    // Limpiar tabla solicitudes (opcional)
    const clearTable = process.argv.includes('--clear');
    if (clearTable) {
      await pool.query('DELETE FROM solicitudes_pago');
      console.log('🧹 Tabla solicitudes_pago limpiada');
    }

    const solicitudes = [];

    // Generar 100 solicitudes
    for (let i = 1; i <= 100; i++) {
      const solicitante = solicitantes[Math.floor(Math.random() * solicitantes.length)];
      const departamento = departamentos[Math.floor(Math.random() * departamentos.length)];
      const concepto = conceptos[Math.floor(Math.random() * conceptos.length)];
      const monto = generarMonto();
      const fechaCreacion = generarFecha();
      const estado = estados[Math.floor(Math.random() * estados.length)];

      const solicitud = {
        id_usuario: solicitante.id_usuario,
        departamento,
        monto,
        cuenta_destino: `${Math.floor(Math.random() * 900000000) + 100000000}`, // Número de cuenta de 9 dígitos
        factura_url: `https://storage.bechapra.com/facturas/factura_${i}_${Date.now()}.pdf`,
        concepto,
        fecha_limite_pago: generarFechaLimite(fechaCreacion),
        soporte_url: Math.random() > 0.3 ? `https://storage.bechapra.com/soportes/soporte_${i}_${Date.now()}.pdf` : null,
        estado,
        fecha_creacion: fechaCreacion
      };

      // Si la solicitud está autorizada o rechazada, agregar datos del aprobador
      if (estado !== 'pendiente' && aprobadores.length > 0) {
        const aprobador = aprobadores[Math.floor(Math.random() * aprobadores.length)];
        solicitud.id_aprobador = aprobador.id_usuario;
        solicitud.comentario_aprobador = estado === 'autorizada' 
          ? 'Solicitud aprobada según procedimientos internos'
          : 'Solicitud rechazada por falta de documentación completa';
        
        // Fecha de revisión entre 1 y 5 días después de la creación
        const fechaRevision = new Date(fechaCreacion);
        fechaRevision.setDate(fechaRevision.getDate() + Math.floor(Math.random() * 5) + 1);
        solicitud.fecha_revision = fechaRevision.toISOString().split('T')[0];
      }

      solicitudes.push(solicitud);
    }

    let creadas = 0;

    for (const solicitud of solicitudes) {
      try {
        if (solicitud.estado === 'pendiente') {
          await pool.query(
            `INSERT INTO solicitudes_pago 
            (id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, 
             fecha_limite_pago, soporte_url, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              solicitud.id_usuario, solicitud.departamento, solicitud.monto,
              solicitud.cuenta_destino, solicitud.factura_url, solicitud.concepto,
              solicitud.fecha_limite_pago, solicitud.soporte_url, solicitud.estado
            ]
          );
        } else {
          await pool.query(
            `INSERT INTO solicitudes_pago 
            (id_usuario, departamento, monto, cuenta_destino, factura_url, concepto, 
             fecha_limite_pago, soporte_url, estado, id_aprobador, comentario_aprobador,
             fecha_revision)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              solicitud.id_usuario, solicitud.departamento, solicitud.monto,
              solicitud.cuenta_destino, solicitud.factura_url, solicitud.concepto,
              solicitud.fecha_limite_pago, solicitud.soporte_url, solicitud.estado,
              solicitud.id_aprobador, solicitud.comentario_aprobador,
              solicitud.fecha_revision
            ]
          );
        }

        creadas++;
        console.log(`✅ Solicitud ${creadas} creada: ${solicitud.concepto} - ${solicitud.estado}`);
      } catch (error) {
        console.error(`❌ Error al insertar solicitud ${creadas + 1}:`, error.message);
      }
    }

    // Estadísticas finales
    const [stats] = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad,
        AVG(monto) as monto_promedio,
        SUM(monto) as monto_total
      FROM solicitudes_pago 
      GROUP BY estado
    `);

    console.log(`\n📊 Resumen del seeding:`);
    console.log(`✅ Solicitudes creadas: ${creadas}`);
    console.log(`\n📈 Estadísticas por estado:`);
    stats.forEach(stat => {
      console.log(`${stat.estado}: ${stat.cantidad} solicitudes | Promedio: $${Math.round(stat.monto_promedio).toLocaleString()} | Total: $${stat.monto_total.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error en seeding de solicitudes:', error);
  } finally {
    await pool.end();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  seedSolicitudes();
}

module.exports = seedSolicitudes;
module.exports = seedSolicitudes;
