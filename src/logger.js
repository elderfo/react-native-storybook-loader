require('colors');

const logger = console;

const info = (message, value) => {
  const outputValue = value || '';
  logger.log(message.blue, outputValue.white);
};

const warn = (message) => {
  logger.log(message.yellow);
};

const error = (message) => {
  logger.log(message.red);
};

module.exports = {
  info,
  error,
  warn,
};
