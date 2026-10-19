import { faker } from '@faker-js/faker';

// Have to require for the mocking of console to work
import logger, { useLogger, LogLevels } from '.';
import { Logger } from './logger';

beforeEach(() => jest.resetAllMocks());

const assertTrue = (fn: any) => {
  expect(fn).toHaveBeenCalled();
};

const assertFalse = (fn: any) => {
  expect(fn).not.toHaveBeenCalled();
};

const jestLogger: Logger = {
  debug: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
  log: jest.fn(),
};

useLogger(jestLogger);

describe('logger.debug', () => {
  it('should log when level is set to debug', () => {
    logger.setLogLevel(LogLevels.debug);
    logger.debug(faker.lorem.words());
    assertTrue(jestLogger.debug);
  });

  it('should not log when level is set to info', () => {
    logger.setLogLevel(LogLevels.info);
    logger.debug(faker.lorem.words());
    assertFalse(jestLogger.debug);
  });

  it('should not log when level is set to warn', () => {
    logger.setLogLevel(LogLevels.warn);
    logger.debug(faker.lorem.words());
    assertFalse(jestLogger.debug);
  });
  it('should not log when level is set to error', () => {
    logger.setLogLevel(LogLevels.error);
    logger.debug(faker.lorem.words());
    assertFalse(jestLogger.debug);
  });

  it('should not log when level is set to silent', () => {
    logger.setLogLevel(LogLevels.silent);
    logger.debug(faker.lorem.words());
    assertFalse(jestLogger.debug);
  });
});

describe('logger.info', () => {
  it('should log when level is set to info', () => {
    logger.setLogLevel(LogLevels.info);
    logger.info(faker.lorem.words());
    assertTrue(jestLogger.info);
  });

  it('should log when level is set to debug', () => {
    logger.setLogLevel(LogLevels.debug);
    logger.info(faker.lorem.words());
    assertTrue(jestLogger.info);
  });

  it('should not log when level is set to warn', () => {
    logger.setLogLevel(LogLevels.warn);
    logger.info(faker.lorem.words());
    assertFalse(jestLogger.info);
  });

  it('should not log when level is set to error', () => {
    logger.setLogLevel(LogLevels.error);
    logger.info(faker.lorem.words());
    assertFalse(jestLogger.info);
  });

  it('should not log when level is set to silent', () => {
    logger.setLogLevel(LogLevels.silent);
    logger.info(faker.lorem.words());
    assertFalse(jestLogger.info);
  });
});

describe('logger.warn', () => {
  it('should not log when level is set to info', () => {
    logger.setLogLevel(LogLevels.info);
    logger.warn(faker.lorem.words());
    assertTrue(jestLogger.warn);
  });

  it('should log when level is set to debug', () => {
    logger.setLogLevel(LogLevels.debug);
    logger.warn(faker.lorem.words());
    assertTrue(jestLogger.warn);
  });

  it('should not log when level is set to warn', () => {
    logger.setLogLevel(LogLevels.warn);
    logger.warn(faker.lorem.words());
    assertTrue(jestLogger.warn);
  });

  it('should not log when level is set to error', () => {
    logger.setLogLevel(LogLevels.error);
    logger.warn(faker.lorem.words());
    assertFalse(jestLogger.warn);
  });

  it('should not log when level is set to silent', () => {
    logger.setLogLevel(LogLevels.silent);
    logger.warn(faker.lorem.words());
    assertFalse(jestLogger.warn);
  });
});

describe('logger.error', () => {
  it('should not log when level is set to info', () => {
    logger.setLogLevel(LogLevels.info);
    logger.error(faker.lorem.words());
    assertTrue(jestLogger.error);
  });

  it('should log when level is set to debug', () => {
    logger.setLogLevel(LogLevels.debug);
    logger.error(faker.lorem.words());
    assertTrue(jestLogger.error);
  });

  it('should not log when level is set to warn', () => {
    logger.setLogLevel(LogLevels.warn);
    logger.error(faker.lorem.words());
    assertTrue(jestLogger.error);
  });

  it('should not log when level is set to error', () => {
    logger.setLogLevel(LogLevels.error);
    logger.error(faker.lorem.words());
    assertTrue(jestLogger.error);
  });

  it('should not log when level is set to silent', () => {
    logger.setLogLevel(LogLevels.silent);
    logger.error(faker.lorem.words());
    assertFalse(jestLogger.error);
  });
});
