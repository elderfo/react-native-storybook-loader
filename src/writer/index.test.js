import mock from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { writeFile } from './';
import { encoding } from '../constants';

const baseDir = path.resolve(__dirname, '../../');
const outputPath = path.resolve(baseDir, 'output.js');
const moduleDir = path.resolve(baseDir);
const configFile = path.resolve(moduleDir, './module.config.json');

beforeEach(() => {
  mock({
    [outputPath]: '',
    [configFile]: '',
  });
});

afterEach(() => {
  mock.restore();
});

test('writeFile should perform expected work', () => {
  const files = [
    path.resolve(__dirname, '../file1.js'),
    path.resolve(__dirname, '../sub/file2.js'),
    path.resolve(__dirname, '../../parent/file3.js'),
    path.resolve(__dirname, './sub/file4.js'),
    path.resolve(__dirname, './sub/sub/file5.js'),
  ];
  writeFile(files, outputPath, moduleDir);

  const contents = fs.readFileSync(outputPath, encoding);

  expect(contents).toMatchSnapshot();

  const configContents = fs.readFileSync(configFile, encoding);
  expect(configContents).toMatchSnapshot();
});
