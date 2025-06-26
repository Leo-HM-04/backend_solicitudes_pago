/**
 * Middleware para autorizar acceso basado en roles
 * @param {string|string[]} rolesPermitidos - Rol o array de roles permitidos
 * @returns {Function} Middleware function
 */
const autorizarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Usuario no autenticado",
        code: "UNAUTHORIZED" 
      });
    }

    // Convertir a array si es un string
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: "Acceso denegado. Rol no autorizado.",
        code: "FORBIDDEN",
        requiredRoles: roles,
        userRole: req.user.rol
      });
    }
    
    next();
  };
};

// Funciones de utilidad para roles comunes
const soloAdmin = () => autorizarRol("admin_general");
const soloSolicitante = () => autorizarRol("solicitante");
const soloAprobador = () => autorizarRol("aprobador");
const adminOAprobador = () => autorizarRol(["admin_general", "aprobador"]);

// Exportar la función principal como default para mantener compatibilidad
module.exports = autorizarRol;

// También exportar las funciones de utilidad
module.exports.autorizarRol = autorizarRol;
module.exports.soloAdmin = soloAdmin;
module.exports.soloSolicitante = soloSolicitante;
module.exports.soloAprobador = soloAprobador;
module.exports.adminOAprobador = adminOAprobador;
