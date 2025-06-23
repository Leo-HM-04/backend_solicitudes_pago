const autorizarRol = (rolPermitido) => {
  return (req, res, next) => {
    if (!req.user || req.user.rol !== rolPermitido) {
      return res.status(403).json({ message: "Acceso denegado. Rol no autorizado." });
    }
    next();
  };
};

module.exports = autorizarRol;
