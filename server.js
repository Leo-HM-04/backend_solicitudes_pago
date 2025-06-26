const app = require("./app");
require("dotenv").config();

// 🔔 Importar la tarea programada
require("./tareas/recurrentes");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
