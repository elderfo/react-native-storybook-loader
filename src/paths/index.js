import fs from 'fs';
import path from 'path';
import findup from 'findup';
import { appName } from '../constants';

const settings = [
  'pattern',
];

function getDefaultValue(baseDir, setting) {
  switch (setting) {
    case 'pattern':
      return path.resolve(baseDir, './storybook/stories/index.js');
    default:
      return baseDir;
  }
}

function hasConfigSetting(pkg, setting) {
  return pkg.config && pkg.config[appName] && pkg.config[appName][setting];
}

function getConfigSetting(pkg, setting) {
  if (hasConfigSetting(pkg, setting)) {
    return pkg.config[appName][setting];
  }
  return null;
}

export function resolvePaths(nodeModulesPath) {
  const packageJsonFile = path.resolve(findup.sync(nodeModulesPath, 'package.json'), 'package.json');
  const baseDir = path.dirname(packageJsonFile);
  let searchDir = path.resolve(baseDir);

  const pkg = JSON.parse(fs.readFileSync(packageJsonFile));

  if (hasConfigSetting(pkg, 'searchDir')) {
    searchDir = path.resolve(baseDir, getConfigSetting(pkg, 'searchDir'));
  }

  const paths = {
    packageJsonFile,
    baseDir,
    searchDir,
  };

  settings.forEach((setting) => {
    paths[setting] = getDefaultValue(searchDir, setting);

    if (hasConfigSetting(pkg, setting)) {
      paths[setting] = path.resolve(searchDir, getConfigSetting(pkg, setting));
    }
  });

  return paths;
}
