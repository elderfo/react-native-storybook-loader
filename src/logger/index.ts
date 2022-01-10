import { Logger, BitBucketLogger, ConsoleLogger } from './logger';

export enum LogLevels {
  silent = 0,
  error = 1,
  warn = 2,
  info = 3,
  debug = 4,
  trace = 5,
}

let logLevel = LogLevels.info;

export const setLogLevel = (level: LogLevels) => {
  logLevel = level;
};

let logger: Logger = new BitBucketLogger();

export const useLogger = (newLogger: Logger) => {
  logger = newLogger;
};

export const useConsoleLogger = () => {
  logger = new ConsoleLogger();
};

const debug = (...message: any[]) => {
  if (logLevel < LogLevels.debug) {
    return;
  }
  logger.debug(...message);
};

const info = (...message: any[]) => {
  if (logLevel < LogLevels.info) {
    return;
  }
  logger.info(...message);
};

const infoNameValue = (message: string, value: string) => {
  if (logLevel < LogLevels.info) {
    return;
  }
  const outputValue = value || '';
  logger.log('\x1b[34m%s\x1b[0m', message, outputValue);
};

const warn = (...message: any[]) => {
  if (logLevel < LogLevels.warn) {
    return;
  }
  logger.warn(...message);
};

const error = (...message: any[]) => {
  if (logLevel < LogLevels.error) {
    return;
  }
  logger.error(...message);
};

const trace = (...message: any[]) => {
  if (logLevel < LogLevels.trace) {
    return;
  }
  logger.trace(...message);
};

export default {
  error,
  warn,
  info,
  infoNameValue,
  setLogLevel,
  debug,
  useConsoleLogger,
  trace,
  useLogger,
};
