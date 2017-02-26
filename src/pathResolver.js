import fs from 'fs';
import path from 'path';
import findup from 'findup';
import { appName } from './constants';

const settings = [
  'storybookPath',
  'pattern',
  'outputFile',
];

function getDefaultValue(baseDir, setting) {
  const storybookPath = path.resolve(baseDir, './storybook');

  switch (setting) {
    case 'storybookPath':
      return storybookPath;
    case 'pattern':
      return path.resolve(storybookPath, 'index.js');
    case 'outputFile':
      return path.resolve(storybookPath, './config/index.js');
    default:
      return '';
  }
}

export function resolvePaths(nodeModulesPath) {
  const packageJsonFile = path.resolve(findup.sync(nodeModulesPath, 'package.json'), 'package.json');
  const baseDir = path.dirname(packageJsonFile);

  const pkg = JSON.parse(fs.readFileSync(packageJsonFile));

  const paths = {
    packageJsonFile,
    baseDir,
  };

  settings.forEach((setting) => {
    paths[setting] = getDefaultValue(baseDir, setting);

    if (pkg.config && pkg.config[appName] && pkg.config[appName][setting]) {
      paths[setting] = path.resolve(baseDir, pkg.config[appName][setting]);
    }
  });

  return paths;
}
