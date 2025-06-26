const express = require("express");
const router = express.Router();

const { ejecutarRecurrentes } = require("../tareas/recurrentes");

// Endpoint para disparar la tarea manualmente
router.post("/recurrentes/ejecutar", async (req, res) => {
  try {
    await ejecutarRecurrentes();
    res.json({ message: "Tarea recurrente ejecutada manualmente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al ejecutar la tarea recurrente" });
  }
});

module.exports = router;
