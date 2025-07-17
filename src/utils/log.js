function format(level, msg) {
  return `aem-sdk-setup: [${level}] ${msg}`;
}

module.exports = {
  info: (msg) => format('INFO', msg),
  warn: (msg) => format('WARN', msg),
  error: (msg) => format('ERROR', msg),
};
