import path from 'path';
import mock from 'mock-fs';

import { resolvePaths } from './pathResolver';
import { appName } from './constants';

const packageJsonFilePath = path.resolve(process.cwd(), 'package.json');
const packageJsonContents = {
  config: {
    [appName]: { // match name of the project
      searchDir: './src/storybook',
      pattern: '**/*.stories.js',
    },
  },
};

afterEach(() => {
  mock.restore();
});

function mockResolveAndValidate(setting, expected) {
  mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
  const defaultPath = path.resolve(process.cwd(), packageJsonContents.config[appName][setting]);
  const expectedValue = expected || defaultPath;

  const actual = resolvePaths(process.cwd());

  expect(actual[setting]).toBe(expectedValue);
}

function mockNoSettingsResolveAndValidate(setting, expected) {
  mock({
    [packageJsonFilePath]: JSON.stringify({
      config: {},
    }),
  });

  const actual = resolvePaths(process.cwd());
  expect(actual[setting]).toBe(expected);
}

test('resolvePaths should resolve "searchDir" to the expected fully qualified path when specified in the package.json', () => {
  mockResolveAndValidate('searchDir');
});

test('resolvePaths should resolve "pattern" to the expected fully qualified path when specified in the package.json', () => {
  mockResolveAndValidate('pattern', path.resolve(process.cwd(), packageJsonContents.config[appName].searchDir, packageJsonContents.config[appName].pattern));
});

test('resolvePaths should resolve "searchDir" to the default fully qualified path when not specified in the package.json', () => {
  mockNoSettingsResolveAndValidate('searchDir', path.resolve(process.cwd()));
});

test('resolvePaths should resolve "pattern" to the default fully qualified path when not specified in the package.json', () => {
  mockNoSettingsResolveAndValidate('pattern', path.resolve(process.cwd(), './storybook/index.js'));
});

test('resolvePaths should resolve expected "baseDir"', () => {
  const expected = path.dirname(packageJsonFilePath);
  const actual = resolvePaths(process.cwd());

  expect(actual.baseDir).toBe(expected);
});

test('resolvePaths should find the package.json', () => {
  const expected = packageJsonFilePath;
  const actual = resolvePaths(process.cwd());

  expect(actual.packageJsonFile).toBe(expected);
});
