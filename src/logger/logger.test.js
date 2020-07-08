global.console = {
  warn: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

const faker = require('faker');

// Have to require for the mocking of console to work
const {
  debug,
  setLogLevel,
  logLevels,
  error,
  info,
  warn,
  resolveLogLevel,
} = require('.'); // eslint-disable-line import/first

beforeEach(() => jest.resetAllMocks());

const assertTrue = fn => {
  expect(fn).toHaveBeenCalled();
};

const assertFalse = fn => {
  expect(fn).not.toHaveBeenCalled();
};

describe('logger.resolveLogLevel', () => {
  it('should resolve info when invalid level specified', () => {
    const level = faker.random.word();
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels.info);
  });

  it('should resolve silent', () => {
    const level = 'silent';
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels[level]);
  });

  it('should resolve error', () => {
    const level = 'error';
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels[level]);
  });

  it('should resolve warn', () => {
    const level = 'warn';
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels[level]);
  });

  it('should resolve info', () => {
    const level = 'info';
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels[level]);
  });

  it('should resolve debug', () => {
    const level = 'debug';
    const actual = resolveLogLevel(level);

    expect(actual).toEqual(logLevels[level]);
  });
});

describe('logger.debug', () => {
  const fn = global.console.log;
  it('should log when level is set to debug', () => {
    setLogLevel(logLevels.debug);
    debug(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to info', () => {
    setLogLevel(logLevels.info);
    debug(faker.random.words());
    assertFalse(fn);
  });

  it('should not log when level is set to warn', () => {
    setLogLevel(logLevels.warn);
    debug(faker.random.words());
    assertFalse(fn);
  });
  it('should not log when level is set to error', () => {
    setLogLevel(logLevels.error);
    debug(faker.random.words());
    assertFalse(fn);
  });

  it('should not log when level is set to silent', () => {
    setLogLevel(logLevels.silent);
    debug(faker.random.words());
    assertFalse(fn);
  });
});

describe('logger.info', () => {
  const fn = global.console.log;

  it('should log when level is set to info', () => {
    setLogLevel(logLevels.info);
    info(faker.random.words());
    assertTrue(fn);
  });

  it('should log when level is set to debug', () => {
    setLogLevel(logLevels.debug);
    info(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to warn', () => {
    setLogLevel(logLevels.warn);
    info(faker.random.words());
    assertFalse(fn);
  });

  it('should not log when level is set to error', () => {
    setLogLevel(logLevels.error);
    info(faker.random.words());
    assertFalse(fn);
  });

  it('should not log when level is set to silent', () => {
    setLogLevel(logLevels.silent);
    info(faker.random.words());
    assertFalse(fn);
  });
});

describe('logger.warn', () => {
  const fn = global.console.warn;

  it('should not log when level is set to info', () => {
    setLogLevel(logLevels.info);
    warn(faker.random.words());
    assertTrue(fn);
  });

  it('should log when level is set to debug', () => {
    setLogLevel(logLevels.debug);
    warn(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to warn', () => {
    setLogLevel(logLevels.warn);
    warn(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to error', () => {
    setLogLevel(logLevels.error);
    warn(faker.random.words());
    assertFalse(fn);
  });

  it('should not log when level is set to silent', () => {
    setLogLevel(logLevels.silent);
    warn(faker.random.words());
    assertFalse(fn);
  });
});

describe('logger.error', () => {
  const fn = global.console.error;

  it('should not log when level is set to info', () => {
    setLogLevel(logLevels.info);
    error(faker.random.words());
    assertTrue(fn);
  });

  it('should log when level is set to debug', () => {
    setLogLevel(logLevels.debug);
    error(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to warn', () => {
    setLogLevel(logLevels.warn);
    error(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to error', () => {
    setLogLevel(logLevels.error);
    error(faker.random.words());
    assertTrue(fn);
  });

  it('should not log when level is set to silent', () => {
    setLogLevel(logLevels.silent);
    error(faker.random.words());
    assertFalse(fn);
  });
});
