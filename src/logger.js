import 'colors';

const logger = console;

export function info(message, value) {
  const outputValue = value ? value : '';
  logger.log(message.blue, outputValue.white);
}

export function warn(message) {
  logger.log(message.yellow);
}

export function error(message) {
  logger.log(message.red);
}
