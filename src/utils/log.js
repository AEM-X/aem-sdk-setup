/**
 * Utility to prefix log messages for consistent CLI output.
 * @module utils/log
 */

/**
 * Prefix log messages for consistent CLI output.
 *
 * @param {string} level log level label
 * @param {string} msg message to display
 * @returns {string} formatted log message
 */
const chalk = require('chalk');

function format(level, msg) {
  const colors = {
    INFO: chalk.cyan,
    WARN: chalk.yellow,
    ERROR: chalk.red,
  };
  const color = colors[level] || ((t) => t);
  return `aem-sdk-setup: ${color(`[${level}]`)} ${msg}`;
}

/** Logging helpers used by commands. */
module.exports = {
  info: (msg) => format('INFO', msg),
  warn: (msg) => format('WARN', msg),
  error: (msg) => format('ERROR', msg),
};
