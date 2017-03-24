import path from 'path';
import mock from 'mock-fs';

import { appName } from '../constants';
import resolvePaths from './multiResolver';

function generatePackageJson(searchDir, pattern, outputFile) {
  return {
    config: {
      [appName]: { // match name of the project
        searchDir,
        pattern,
        outputFile,
      },
    },
  };
}

const baseDir = path.resolve(process.cwd());
const packageJsonFilePath = path.resolve(baseDir, 'package.json');

afterEach(() => {
  mock.restore();
});

test('should resolve expected defaults', () => {
  const packageJsonContents = {};
  mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
  const expected = {
    outputFiles: [{
      patterns: [path.resolve(baseDir, './storybook/stories/index.js')],
      outputFile: path.resolve(baseDir, './storybook/storyLoader.js'),
    }],
  };

  const actual = resolvePaths(baseDir);

  expect(actual).toEqual(expected);
});

test('should resolve expected paths with single search dir', () => {
  const packageJsonContents = generatePackageJson('./src/storybook', '**/*.stories.js', './storybook/config.js');
  mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
  const expected = {
    outputFiles: [{
      patterns: [path.resolve(baseDir, './src/storybook/**/*.stories.js')],
      outputFile: path.resolve(baseDir, './storybook/config.js'),
    }],
  };

  const actual = resolvePaths(baseDir);

  expect(actual).toEqual(expected);
});

test('should resolve expected paths with multiple search dirs', () => {
  const packageJsonContents = generatePackageJson(
    ['./src/storybook', './packages'],
    '**/*.stories.js',
    './storybook/config.js',
  );

  mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
  const expected = {
    outputFiles: [{
      patterns: [
        path.resolve(baseDir, './src/storybook/**/*.stories.js'),
        path.resolve(baseDir, './packages/**/*.stories.js'),
      ],
      outputFile: path.resolve(baseDir, './storybook/config.js'),
    }],
  };

  const actual = resolvePaths(baseDir);

  expect(actual).toEqual(expected);
});
