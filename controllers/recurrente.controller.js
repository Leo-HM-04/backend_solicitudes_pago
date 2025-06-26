// controllers/recurrente.controller.js
const RecurrenteModel = require("../models/recurrente.model");

// Crear una nueva plantilla de pago recurrente
exports.crearRecurrente = async (req, res) => {
  try {
    const { id_usuario } = req.user;  // viene del token
    const {
      departamento,
      monto,
      cuenta_destino,
      concepto,
      tipo_pago,
      frecuencia,
      siguiente_fecha,
    } = req.body;

    // Validaciones básicas (opcional, puedes mejorar)
    if (!departamento || !monto || !cuenta_destino || !concepto || !tipo_pago || !frecuencia || !siguiente_fecha) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await RecurrenteModel.crearRecurrente({
      id_usuario,
      departamento,
      monto,
      cuenta_destino,
      concepto,
      tipo_pago,
      frecuencia,
      siguiente_fecha,
    });

    res.status(201).json({ message: "Plantilla de pago recurrente creada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la plantilla recurrente" });
  }
};

// (Opcional) Obtener plantillas recurrentes del usuario autenticado
exports.obtenerRecurrentes = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const recurrentes = await RecurrenteModel.obtenerRecurrentesPorUsuario(id_usuario);
    res.json(recurrentes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las plantillas recurrentes" });
  }
};
