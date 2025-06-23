const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuario.routes'); // <-- Importamos rutas de usuarios

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes); // <-- Agregamos la ruta base del CRUD de usuarios

module.exports = app;
