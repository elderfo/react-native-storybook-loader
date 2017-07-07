import fs from 'fs';
import path from 'path';

import dot from 'dot';
import { encoding } from '../constants';

dot.templateSettings.strip = false;

/**
 * Determines if the path is prefixed or not
 *
 * @param {String} relativePath - Relative path to check for directory prefixes
 * @returns True if path prefix exists, otherwise false
 */
function hasPathPrefix(relativePath) {
  return relativePath.substr(0, 2) === '..'
    || relativePath.substr(0, 2) === './'
    || relativePath.substr(0, 2) === '.\\';
}

/**
 * Correctly formats path separators
 *
 * @param {String} path - Path to format
 * @returns Path with the correct separators
 */
function formatPath(dir) {
  const oppositeSep = path.sep === '/' ? '\\' : '/';
  return dir.replace(new RegExp(`\\${oppositeSep}`, 'g'), path.sep);
}

function getRelativePaths(fromDir, files) {
  const workingFiles = files
    .map(file => formatPath(file))
    .map(file => path.resolve(file));

  workingFiles.sort();

  return workingFiles.map((file) => {
    let relativePath = path.relative(fromDir, file);

    if (!hasPathPrefix(relativePath)) {
      relativePath = `.${path.sep}${relativePath}`;
    }

    return {
      relative: relativePath,
      full: file,
    };
  });
}

function ensureFileDirectoryExists(filePath) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
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
