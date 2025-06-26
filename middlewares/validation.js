const Joi = require('joi');

// Esquemas de validación
const schemas = {
  createUser: Joi.object({
    nombre: Joi.string().min(2).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    rol: Joi.string().valid('admin_general', 'solicitante', 'aprobador', 'pagador_banca').required().messages({
      'any.only': 'El rol debe ser uno de: admin_general, solicitante, aprobador, pagador_banca',
      'any.required': 'El rol es requerido'
    })
  }),

  createSolicitud: Joi.object({
    departamento: Joi.string().min(2).max(100).required(),
    monto: Joi.number().positive().required(),
    cuenta_destino: Joi.string().required(),
    factura_url: Joi.string().uri().required(),
    concepto: Joi.string().min(5).max(500).required(),
    fecha_limite_pago: Joi.date().iso().min('now').required(),
    soporte_url: Joi.string().uri().optional().allow(null, '')
  }),

  updateEstado: Joi.object({
    estado: Joi.string().valid('autorizada', 'rechazada').required(),
    comentario_aprobador: Joi.string().max(1000).optional().allow('')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Middleware de validación
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Errores de validación',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  schemas
};
