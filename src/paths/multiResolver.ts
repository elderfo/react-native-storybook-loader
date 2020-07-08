import { promises as fs } from "fs";
import path from "path";
import findup from "find-up";

import { appName, encoding } from "../constants";
import logger from "../logger";
import {
  Configuration,
  InputConfiguration,
  defaultConfiguration
} from "../configuration";

type PackageJsonFile = {
  config?: {
    [appName]?: InputConfiguration;
  };
};

/**
 * Parses the package.json file and returns a config object
 * @param {string} packageJsonFile Path to the package.json file
 */
const getConfigSettings = async (
  packageJsonFile: string
): Promise<Configuration> => {
  const packageJsonContents = await fs.readFile(packageJsonFile, {
    encoding: encoding
  });

  const pkg = JSON.parse(packageJsonContents) as PackageJsonFile;

  if (pkg.config === undefined || pkg.config[appName] === undefined) {
    return defaultConfiguration;
  }

  let workingConfig = { ...defaultConfiguration };

  const {
    searchDir,
    pattern,
    silent,
    outputFile
  } = pkg.config[appName] as InputConfiguration;


  if (searchDir !== undefined) {
    workingConfig = {
      ...workingConfig,
      searchDir: Array.isArray(searchDir) ? searchDir : [searchDir]
    };
  }

  if (pattern !== undefined) {
    workingConfig = { ...workingConfig, pattern };
  }
  
  if (outputFile !== undefined) {
    workingConfig = { ...workingConfig, outputFile };
  }
  
  if (silent !== undefined) {
    workingConfig = { ...workingConfig, silent };
  }


  return workingConfig;
};

export type ProcessDefinitions = {
  outputFiles: Array<ProcessDefinition>;
};

type ProcessDefinition = {
  patterns: Array<string>;
  outputFile: string;
};

/**
 * Resolves paths and returns the following schema:
 * {
 *    "outputFiles": [{
 *      "patterns":[],
 *      "outputFile": ""
 *    }, {...}]
 * }
 * @param {string} processDirectory directory of the currently running process
 */
export const resolvePaths = async (
  processDirectory: string,
  overrideConfiguration: Configuration | undefined = undefined
): Promise<ProcessDefinitions> => {
  logger.debug("resolvePaths", processDirectory, overrideConfiguration);

  const overrides = overrideConfiguration || {};
  const packageJsonFile = await findup("package.json", {
    cwd: processDirectory
  });

  if (packageJsonFile === undefined) {
    throw new Error(
      `Unable to locate package.json starting iterating up from ${processDirectory}`
    );
  }

  const baseDir = path.dirname(packageJsonFile);

  const config: Configuration = {
    ...defaultConfiguration,
    ...(await getConfigSettings(packageJsonFile)),
    ...overrides
  };
  const outputFile = path.resolve(baseDir, config.outputFile);

  const outputFiles = [
    {
      outputFile,
      patterns: config.searchDir.map(dir =>
        path.resolve(baseDir, dir, config.pattern)
      )
    }
  ];

  const returnValue = {
    outputFiles
  };

  logger.debug("resolvePaths", returnValue);
  return returnValue;
};
