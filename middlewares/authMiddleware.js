const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🛡️ Authorization Header:", authHeader);

  if (!authHeader) {
    console.log("❌ No se proporcionó token");
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔐 Token extraído:", token);

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el entorno");
    return res.status(500).json({ message: "Error interno de autenticación" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decodificado:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verificarToken;
  