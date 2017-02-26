import path from 'path';
import mock from 'mock-fs';

import { resolvePaths } from './pathResolver';
import { appName } from './constants';

const packageJsonFilePath = path.resolve(process.cwd(), 'package.json');
const packageJsonContents = {
  config: {
    [appName]: { // match name of the project
      storybookPath: './src/storybook',
      pattern: '**/*.stories.js',
      outputFile: 'storieslist.js',
    },
  },
};

afterEach(() => {
  mock.restore();
});

function mockResolveAndValidate(setting) {
  mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });

  const expected = path.resolve(process.cwd(), packageJsonContents.config[appName][setting]);
  const actual = resolvePaths(process.cwd());

  expect(actual[setting]).toBe(expected);
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

test('resolvePaths should resolve "outputFile" to the expected fully qualified path when specified in the package.json', () => {
  mockResolveAndValidate('outputFile');
});

test('resolvePaths should resolve "storybookPath" to the expected fully qualified path when specified in the package.json', () => {
  mockResolveAndValidate('storybookPath');
});

test('resolvePaths should resolve "pattern" to the expected fully qualified path when specified in the package.json', () => {
  mockResolveAndValidate('pattern');
});

test('resolvePaths should resolve "outputFile" to the default fully qualified path when not specified in the package.json', () => {
  mockNoSettingsResolveAndValidate('outputFile', path.resolve(process.cwd(), './storybook/config/index.js'));
});

test('resolvePaths should resolve "storybookPath" to the default fully qualified path when not specified in the package.json', () => {
  mockNoSettingsResolveAndValidate('storybookPath', path.resolve(process.cwd(), './storybook'));
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
