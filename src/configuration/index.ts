import logger from "../logger";

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
  silent: boolean;
};

export type RnstlPackageJsonSupportedOptions =
  | "searchDir"
  | "outputFile"
  | "pattern";

export const defaultConfiguration: Configuration = {
  pattern: "./storybook/stories/index.js",
  outputFile: "./storybook/storyLoader.js",
  searchDir: ["./"],
  silent: false
};

export const resolveCliArguments = (
  args: InputConfiguration | undefined
): Configuration | undefined => {
  logger.debug("cliResolver", args);
  if (!args || typeof args !== "object") {
    return defaultConfiguration;
  }

  const {
    searchDir,
    outputFile,
    pattern,
    silent = defaultConfiguration.silent
  } = args;

  let config: Configuration = Object.assign({}, defaultConfiguration);

  if (searchDir) {
    config = Array.isArray(searchDir)
      ? Object.assign({}, config, { searchDir })
      : Object.assign({}, config, { searchDir: [searchDir] });
  }

  if (outputFile) {
    config = Object.assign({}, config, { outputFile });
  }

  if (pattern) {
    config = Object.assign({}, config, { pattern });
  }

  config = Object.assign({}, config, { silent });

  logger.debug("cliResolver:return", config);
  return config;
};
