const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  writeToFile(formattedMessage) {
    try {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(`${colors.green}ℹ️  ${formatted}${colors.reset}`);
    this.writeToFile(formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error(`${colors.red}❌ ${formatted}${colors.reset}`);
    this.writeToFile(formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(`${colors.yellow}⚠️  ${formatted}${colors.reset}`);
    this.writeToFile(formatted);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.log(`${colors.cyan}🐛 ${formatted}${colors.reset}`);
      this.writeToFile(formatted);
    }
  }

  auth(message, meta = {}) {
    const formatted = this.formatMessage('auth', message, meta);
    console.log(`${colors.magenta}🔐 ${formatted}${colors.reset}`);
    this.writeToFile(formatted);
  }
}

module.exports = new Logger();
