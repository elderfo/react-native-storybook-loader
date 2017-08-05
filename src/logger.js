require('colors');

const logLevels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

let logLevel = logLevels.info;

const resolveLogLevel = level => {
  if (Object.prototype.hasOwnProperty.call(logLevels, level)) {
    return logLevels[level];
  }
  return logLevels.info;
};

const setLogLevel = level => {
  logLevel = level;
};

const logger = console;

const debug = (...message) => {
  if (logLevel < logLevels.debug) {
    return;
  }
  logger.log.apply(null, message);
};

const info = (message, value) => {
  if (logLevel < logLevels.info) {
    return;
  }
  const outputValue = value || '';
  logger.log(message.blue, outputValue.white);
};

const warn = (...message) => {
  if (logLevel < logLevels.warn) {
    return;
  }
  logger.warn.apply(null, message);
};

const error = (...message) => {
  if (logLevel < logLevels.error) {
    return;
  }
  logger.error.apply(null, message);
};

module.exports = {
  info,
  error,
  warn,
  debug,
  setLogLevel,
  logLevels,
  resolveLogLevel,
};
