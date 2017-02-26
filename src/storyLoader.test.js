// required imports
import faker from 'faker';

// mocked imports
import glob from 'glob';
import * as pathResolver from './pathResolver';
import * as fileLoader from './fileLoader';
import * as logger from './logger';

// test file import
import { loadStories } from './storyLoader';

jest.mock('glob');
jest.mock('./pathResolver.js');
jest.mock('./fileLoader.js');
jest.mock('./logger.js');

beforeEach(() => {
  jest.resetAllMocks();
});

const config = {
  storybookPath: faker.system.fileName(),
  pattern: faker.system.fileName(),
  outputFile: faker.system.fileName(),
};
const files = [faker.system.fileName(), faker.system.fileName()];

function setupMocks(sync, loadFile) {
  pathResolver.resolvePaths = jest.fn(() => config);
  glob.sync = jest.fn(sync || (() => files));
  fileLoader.loadFile = jest.fn(loadFile || (() => { }));
}

test('loadStories should load located stories', () => {
  setupMocks();

  loadStories();

  expect(glob.sync).toHaveBeenCalledWith(config.pattern);
  expect(fileLoader.loadFile).toHaveBeenCalledWith(files[0]);
  expect(fileLoader.loadFile).toHaveBeenCalledWith(files[1]);
});

test('loadStories should error when all files fail', () => {
  setupMocks(null, () => {
    throw new Error('failed to load file');
  });

  expect(loadStories).toThrowErrorMatchingSnapshot();
});

test('loadStories should log errors when exception occurs loading file', () => {
  setupMocks(null, (f) => {
    if (f === files[0]) {
      throw new Error('failed to load file');
    }
  });
  logger.error = jest.fn();

  loadStories();

  expect(logger.error).toHaveBeenCalledTimes(1);
});

test('loadStories should log warning when errors and loads happen', () => {
  setupMocks(null, (f) => {
    if (f === files[0]) {
      throw new Error('failed to load file');
    }
  });
  logger.warn = jest.fn();

  loadStories();

  expect(logger.warn).toHaveBeenCalledTimes(1);
  expect(logger.warn.mock.calls).toMatchSnapshot();
});

test('loadStories should log warning no files were found', () => {
  setupMocks(() => []);
  logger.warn = jest.fn();

  loadStories();

  expect(logger.warn).toHaveBeenCalledTimes(1);
});
