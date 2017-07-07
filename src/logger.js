import 'colors';

export const logLevels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

let logLevel = logLevels.info;

export const setLogLevel = (level) => {
  logLevel = level;
};

const logger = console;

export const debug = (message) => {
  if (logLevel < logLevels.debug) {
    return;
  }
  logger.log(message.white);
};

export function info(message, value) {
  if (logLevel < logLevels.info) {
    return;
  }
  const outputValue = value || '';
  logger.log(message.blue, outputValue.white);
}

export function warn(message) {
  if (logLevel < logLevels.warn) {
    return;
  }
  logger.warn(message);
}

export function error(message) {
  if (logLevel < logLevels.error) {
    return;
  }
  logger.error(message);
}
