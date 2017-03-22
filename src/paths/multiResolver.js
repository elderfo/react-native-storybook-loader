import fs from 'fs';
import path from 'path';
import findup from 'findup';
import { appName } from '../constants';

function getDefaultValue(baseDir, setting) {
  switch (setting) {
    case 'pattern':
      return path.resolve(baseDir, './storybook/stories/index.js');
    case 'outputFile':
      return path.resolve(baseDir, './storybook/storyLoader.js');
    default:
      return baseDir;
  }
}

/**
 * Verifies if the specified setting exists. Returns true if the setting exists, otherwise false.
 * @param {object} pkg the contents of the package.json in object form.
 * @param {string} setting Name of the setting to look for
 */
function hasConfigSetting(pkg, setting) {
  return pkg.config && pkg.config[appName] && pkg.config[appName][setting];
}

/**
 * Gets the value for the specified setting if the setting exists, otherwise null
 * @param {object} pkg pkg the contents of the package.json in object form.
 * @param {*} setting setting Name of the setting to look for
 */
function getConfigSetting(pkg, setting) {
  if (hasConfigSetting(pkg, setting)) {
    return pkg.config[appName][setting];
  }
  return null;
}

function getResolvedSetting(pkg, rootDir, setting) {
  const value = getConfigSetting(pkg, setting) || getDefaultValue(rootDir, setting);
  return path.resolve(rootDir, value);
}

function getPatterns(pkg, baseDir) {
  let searchDirs = getConfigSetting(pkg, 'searchDir') || getDefaultValue(baseDir, 'searchDir');
  const pattern = getConfigSetting(pkg, 'pattern') || getDefaultValue(baseDir, 'pattern');

  if (!Array.isArray(searchDirs)) {
    searchDirs = [searchDirs];
  }

  return searchDirs.map(dir => path.resolve(baseDir, dir, pattern));
}

/**
 * Resolves paths and returns the following schema:
 * {
 *    "packageJsonFile": "",
 *    "baseDir": "",
 *    "outputFiles": [{
 *      "patterns":[],
 *      "outputFile": ""
 *    }, {...}]
 * }
 * @param {string} processDirectory directory of the currently running process
 */
export default function resolvePaths(processDirectory) {
  // Locate and read package.json
  const packageJsonFile = path.resolve(findup.sync(processDirectory, 'package.json'), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonFile));

  // initialize single entry paths
  const baseDir = path.dirname(packageJsonFile);
  const outputFile = getResolvedSetting(pkg, baseDir, 'outputFile');

  const outputFiles = [{
    outputFile,
    patterns: getPatterns(pkg, baseDir),
  }];

  return {
    packageJsonFile,
    baseDir,
    outputFiles,
  };
}
