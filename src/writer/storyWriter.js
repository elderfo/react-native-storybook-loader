import fs from 'fs';
import path from 'path';
import dot from 'dot';

const encoding = 'utf-8';

dot.templateSettings.strip = false;

function getRelativePaths(fromDir, files) {
  return files.map(file => ({
    relative: path.relative(fromDir, file),
    full: file,
  }));
}

function ensureFileDirectoryExists(filePath) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}

function ensureCanWriteFile(outputPath) {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
}

export const outputPath = path.resolve(__dirname, '../../output/storyLoader.js');
export const templatePath = path.resolve(__dirname, './template.tmp');

export function writeFile(baseDir, files) {
  const templateContents = fs.readFileSync(templatePath, encoding);
  const template = dot.template(templateContents);
  const relativePaths = getRelativePaths(path.dirname(outputPath), files);

  const output = template({ files: relativePaths });

  ensureFileDirectoryExists(outputPath);
  ensureCanWriteFile(outputPath);

  fs.writeFileSync(outputPath, output, { encoding });
}
