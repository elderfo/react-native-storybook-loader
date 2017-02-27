import mock from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { writeFile, outputPath } from './';
import { encoding } from '../constants';

const baseDir = path.resolve(__dirname, '../../');

beforeEach(() => {
  mock({
    [outputPath]: '',
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
  writeFile(baseDir, files);

  const contents = fs.readFileSync(outputPath, encoding);

  expect(contents).toMatchSnapshot();
});
