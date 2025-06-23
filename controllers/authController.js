const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_INTENTOS_TEMPORAL = 3; // Intentos para el primer bloqueo temporal
const MAX_INTENTOS_PERMANENTE = 1; // Un intento después del bloqueo temporal para el permanente
const TIEMPO_BLOQUEO_MS = 15 * 1000; // 15 segundos

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Si el email no existe, no contamos como intento fallido en una cuenta específica.
      // Puedes ajustar esto si quieres mitigar enumeración de usuarios.
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // 1. Verificar bloqueo permanente
    if (user.bloqueado) {
      return res.status(403).json({ message: 'Cuenta bloqueada permanentemente. Contacta al administrador.' });
    }

    // 2. Verificar si hay un bloqueo temporal activo
    if (user.bloqueo_temporal_fin) {
      const ahora = new Date();
      const finBloqueo = new Date(user.bloqueo_temporal_fin);

      if (finBloqueo > ahora) {
        // Todavía está dentro del período de bloqueo temporal
        const segRestantes = Math.ceil((finBloqueo - ahora) / 1000);
        return res.status(403).json({ message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${segRestantes} segundos.` });
      } else {
        // El tiempo de bloqueo temporal ha expirado
        // Reseteamos el bloqueo_temporal_fin, pero mantenemos intentos_fallidos
        // y bloqueo_temporal_activado para la siguiente lógica.
        await pool.query(`
          UPDATE usuarios
          SET bloqueo_temporal_fin = NULL
          WHERE id_usuario = ?
        `, [user.id_usuario]);
        user.bloqueo_temporal_fin = null; // Actualizar el objeto user en memoria
        // El `intentos_fallidos` NO se resetea aquí. Es crucial para el siguiente paso.
      }
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Contraseña incorrecta
      let intentos = user.intentos_fallidos || 0;
      intentos++;

      if (user.bloqueo_temporal_activado) {
        // Si ya fue bloqueado temporalmente antes y falla de nuevo (es su "último intento")
        if (intentos > MAX_INTENTOS_PERMANENTE) { // Si falla una vez más después de bloqueo temporal
          // -> Bloqueo Permanente
          await pool.query(`
            UPDATE usuarios
            SET bloqueado = TRUE, intentos_fallidos = 0, bloqueo_temporal_fin = NULL, bloqueo_temporal_activado = FALSE
            WHERE id_usuario = ?
          `, [user.id_usuario]);
          return res.status(403).json({ message: 'Cuenta bloqueada permanentemente por múltiples intentos fallidos. Contacta al administrador.' });
        } else {
          // Es su "último intento" después del bloqueo temporal
          await pool.query(`
            UPDATE usuarios
            SET intentos_fallidos = ?
            WHERE id_usuario = ?
          `, [intentos, user.id_usuario]);
          // Este mensaje es crucial para el frontend
          return res.status(401).json({ message: `Credenciales inválidas. Último intento antes del bloqueo permanente.` });
        }
      } else {
        // No ha sido bloqueado temporalmente todavía
        if (intentos >= MAX_INTENTOS_TEMPORAL) {
          // Ha llegado a 3 intentos fallidos -> Primer bloqueo temporal
          const bloqueoFin = new Date(Date.now() + TIEMPO_BLOQUEO_MS);
          await pool.query(`
            UPDATE usuarios
            SET bloqueo_temporal_fin = ?, intentos_fallidos = ?, bloqueo_temporal_activado = TRUE
            WHERE id_usuario = ?
          `, [bloqueoFin, intentos, user.id_usuario]);

          return res.status(403).json({ message: `Cuenta bloqueada temporalmente por ${TIEMPO_BLOQUEO_MS / 1000} segundos.` });
        } else {
          // Incrementar el contador de intentos fallidos antes del bloqueo temporal
          await pool.query(`
            UPDATE usuarios
            SET intentos_fallidos = ?
            WHERE id_usuario = ?
          `, [intentos, user.id_usuario]);

          return res.status(401).json({ message: `Credenciales inválidas. Intento ${intentos} de ${MAX_INTENTOS_TEMPORAL}.` });
        }
      }
    }

    // Contraseña correcta -> limpiar todo y permitir acceso
    await pool.query(`
      UPDATE usuarios
      SET intentos_fallidos = 0, bloqueo_temporal_fin = NULL, bloqueo_temporal_activado = FALSE
      WHERE id_usuario = ?
    `, [user.id_usuario]);

    const token = jwt.sign({
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol,
    }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};