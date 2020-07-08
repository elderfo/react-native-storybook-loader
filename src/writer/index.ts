import { promises as fs } from "fs";
import path from "path";

import {
  getRelativePath,
  ensureFileDirectoryExists
} from "../utils/pathHelper";
import { encoding } from "../constants";

const getRelativePaths = (fromDir: string, files: string[]) => {
  return files
    .map(file => getRelativePath(file, fromDir))
    .concat()
    .sort();
};

const formatter = (
  files: string[],
  frms: (file: string) => string,
  separator: string
) => {
  const formatted = files.map(f => frms(f));
  return formatted.join(separator);
};

const template = (files: string[]) =>
  `// Auto-generated file created by react-native-storybook-loader
// Do not edit.
//
// https://github.com/elderfo/react-native-storybook-loader.git

function loadStories() {
${formatter(files, file => `\trequire('${file}');`, "\n")}
}

const stories = [
${formatter(files, file => `\t'${file}'`, ",\n")}
];

module.exports = {
  loadStories,
  stories,
};
`;

export const writeFile = async (files: string[], outputFile: string) => {
  const relativePaths = getRelativePaths(path.dirname(outputFile), files).map(
    file => file.substring(0, file.lastIndexOf("."))
  ); // strip file extensions

  const output = template(relativePaths);

  await ensureFileDirectoryExists(outputFile);

  await fs.writeFile(outputFile, output, { encoding });
};
