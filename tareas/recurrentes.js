// tareas/recurrentes.js
const cron = require("node-cron");
const pool = require("../db/connection");
const dayjs = require("dayjs");

const ejecutarRecurrentes = async () => {
  const hoy = dayjs().format("YYYY-MM-DD");

  try {
    const [plantillas] = await pool.query(
      "SELECT * FROM pagos_recurrentes WHERE siguiente_fecha = ?",
      [hoy]
    );

    for (const plantilla of plantillas) {
      // Crear solicitud
      await pool.query(
        `INSERT INTO solicitudes_pago (
          id_usuario, departamento, monto, cuenta_destino, factura_url,
          concepto, tipo_pago, fecha_limite_pago, soporte_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plantilla.id_usuario,
          plantilla.departamento,
          plantilla.monto,
          plantilla.cuenta_destino,
          null, // factura_url
          plantilla.concepto,
          plantilla.tipo_pago,
          hoy,
          null,
        ]
      );

      // Calcular siguiente fecha según frecuencia
      let siguiente = dayjs(plantilla.siguiente_fecha);
      switch (plantilla.frecuencia) {
        case "diaria":
          siguiente = siguiente.add(1, "day");
          break;
        case "semanal":
          siguiente = siguiente.add(1, "week");
          break;
        case "mensual":
          siguiente = siguiente.add(1, "month");
          break;
        default:
          console.warn("Frecuencia desconocida:", plantilla.frecuencia);
          continue;
      }

      // Actualizar siguiente_fecha
      await pool.query(
  `UPDATE pagos_recurrentes SET siguiente_fecha = ? WHERE id_recurrente = ?`,
  [siguiente.format("YYYY-MM-DD"), plantilla.id_recurrente]
);
      console.log(`✅ Generada solicitud para plantilla ${plantilla.id_plantilla}`);
    }

    console.log("✔️  Ejecución de tareas recurrentes completada.");
  } catch (err) {
    console.error("❌ Error al ejecutar tareas recurrentes:", err);
  }
};

module.exports = { ejecutarRecurrentes };

// Ejecutar la tarea automáticamente cada día a las 00:05
cron.schedule("* * * * *", ejecutarRecurrentes);
