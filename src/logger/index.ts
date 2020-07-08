import "colors";
import { Logger, BitBucketLogger, ConsoleLogger } from "./logger";

export enum LogLevels {
  silent = 0,
  error = 1,
  warn = 2,
  info = 3,
  debug = 4,
  trace = 5
}

let logLevel = LogLevels.info;
const setLogLevel = (level: LogLevels) => {
  logLevel = level;
};

let logger: Logger = new BitBucketLogger();

const useConsoleLogger = () => {
  logger = new ConsoleLogger();
};

const debug = (...message: any[]) => {
  if (logLevel < LogLevels.debug) {
    return;
  }
  logger.log(message);
};

const info = (...message: any[]) => {
  if (logLevel < LogLevels.info) {
    return;
  }
  logger.log(message);
};

const infoNameValue = (message: string, value: string) => {
  if (logLevel < LogLevels.info) {
    return;
  }
  const outputValue = value || "";
  logger.log(message.blue, outputValue.white);
};

const warn = (...message: any[]) => {
  if (logLevel < LogLevels.warn) {
    return;
  }
  logger.warn(message);
};

const error = (...message: any[]) => {
  if (logLevel < LogLevels.error) {
    return;
  }
  logger.error(message);
};

const trace = (...message: any[]) => {
  if (logLevel < LogLevels.trace) {
    return;
  }
  logger.trace(message);
};

export default {
  error,
  warn,
  info,
  infoNameValue,
  setLogLevel,
  debug,
  useConsoleLogger,
  trace
};
