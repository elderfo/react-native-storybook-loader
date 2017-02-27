import mock from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { writeFile, outputPath, templatePath } from './';
import { encoding } from '../constants';

const template = fs.readFileSync(templatePath, encoding);
const baseDir = path.resolve(__dirname, '../../');

beforeEach(() => {
  mock({
    [outputPath]: '',
    [templatePath]: template,
  });
});

afterEach(() => {
  mock.restore();
});

test('it should do what I think it should do', () => {
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
