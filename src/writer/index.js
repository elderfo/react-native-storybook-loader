import fs from 'fs';
import path from 'path';
import dot from 'dot';
import { encoding } from '../constants';

dot.templateSettings.strip = false;

function getRelativePaths(fromDir, files) {
  files.sort();
  return files.map((file) => {
    let relativePath = path.relative(fromDir, file);

    if (relativePath.substr(0, 2) !== '..' || relativePath.substr(0, 2) !== './') {
      relativePath = `./${relativePath}`;
    }

    return {
      relative: relativePath,
      full: file,
    };
  });
}

function ensureFileDirectoryExists(filePath) {
  const directory = path.dirname(filePath);

  const stats = fs.lstatSync(directory);

  if (!stats.isDirectory()) {
    fs.mkdirSync(directory);
  }
}

export const templateContents = `
// template for doT (https://github.com/olado/doT)

function loadStories() {
  
  {{~it.files :value:index}}require('{{=value.relative}}');
  {{~}}
}

module.exports = {
  loadStories,
};
`;

export function writeFile(files, outputPath) {
  const template = dot.template(templateContents);
  const relativePaths = getRelativePaths(path.dirname(outputPath), files);

  const output = template({ files: relativePaths });

  ensureFileDirectoryExists(outputPath);

  fs.writeFileSync(outputPath, output, { encoding });
}
