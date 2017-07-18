const fs = require('fs');
const path = require('path');
const dot = require('dot');

const { getRelativePath, ensureFileDirectoryExists } = require('../utils/pathHelper');
const { encoding } = require('../constants');

dot.templateSettings.strip = false;

function getRelativePaths(fromDir, files) {
  return files
    .map(file => getRelativePath(file, fromDir))
    .concat()
    .sort();
}

const templateContents = `
// template for doT (https://github.com/olado/doT)

function loadStories() {
  
  {{~it.files :value:index}}require('{{=value}}');
  {{~}}
}

module.exports = {
  loadStories,
};
`;

const writeFile = (files, outputFile) => {
  const template = dot.template(templateContents);
  const relativePaths = getRelativePaths(path.dirname(outputFile), files);

  const output = template({ files: relativePaths });

  ensureFileDirectoryExists(outputFile);

  fs.writeFileSync(outputFile, output, { encoding });
};

module.exports = {
  templateContents,
  writeFile,
};
