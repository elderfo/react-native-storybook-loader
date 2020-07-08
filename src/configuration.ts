import { promises as fs } from "fs";
import findup from "find-up";

import logger from "./logger";
import { encoding, appName } from "./constants";

export type InputConfiguration = {
  searchDir?: Array<string> | string;
  outputFile?: string;
  pattern?: string;
  silent?: boolean;
};

export type Configuration = {
  searchDir: Array<string>;
  outputFile: string;
  pattern: string;
  rootDirectory: string;
};

type PackageJsonFile = {
  config?: {
    [appName]?: InputConfiguration;
  };
};

export const defaultConfiguration: Configuration = {
  pattern: "./storybook/stories/index.js",
  outputFile: "./storybook/storyLoader.js",
  searchDir: ["./"],
  rootDirectory: process.cwd(),
};

export const resolveConfiguration = (
  input: InputConfiguration | undefined
): Configuration | undefined => {
  logger.debug("resolveConfiguration", input);
  if (!input || typeof input !== "object") {
    return defaultConfiguration;
  }

  const {
    searchDir,
    outputFile,
    pattern,
  } = input;

  let config: Configuration = Object.assign({}, defaultConfiguration);

  if (searchDir !== undefined) {
    config = {
      ...config,
      searchDir: Array.isArray(searchDir) ? searchDir : [searchDir]
    };
  }

  if (outputFile !== undefined) {
    config = { ...config, outputFile };
  }

  if (pattern) {
    config = { ...config, pattern };
  }

  logger.debug("resolveConfiguration:return", config);
  return config;
};

const resolvePackageJsonConfiguration = async (
  processDirectory: string
): Promise<Configuration | undefined> => {
  const packageJsonFile = await getPackageJsonPath(processDirectory);

  if (packageJsonFile === undefined) {
    return undefined;
  }

  const packageJsonContents = await fs.readFile(packageJsonFile, {
    encoding
  });

  const pkg = JSON.parse(packageJsonContents) as PackageJsonFile;

  if (pkg.config === undefined || pkg.config[appName] === undefined) {
    return undefined;
  }

  return resolveConfiguration(pkg.config[appName]);
};

const getPackageJsonPath = async (processDirectory: string) => {
  const packageJsonFile = await findup("package.json", {
    cwd: processDirectory
  });

  return packageJsonFile;
};

export const generateConfiguration = async (
  cliArgs: InputConfiguration,
  processDirectory: string
): Promise<Configuration> => {
  const cliConfig = resolveConfiguration(cliArgs);
  const packageConfig = await resolvePackageJsonConfiguration(processDirectory);

  return {
    ...defaultConfiguration,
    ...packageConfig,
    ...cliConfig,
    rootDirectory: processDirectory
  };
};
