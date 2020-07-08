import path from "path";

import logger from "../logger";
import { Configuration } from "../configuration";

export type LoaderDefinition = {
  outputs: Array<LoaderOutputConfiguration>;
};

type LoaderOutputConfiguration = {
  patterns: Array<string>;
  outputFile: string;
};

export const generateLoaderDefinition = async (
  processDirectory: string,
  configuration: Configuration
): Promise<LoaderDefinition> => {
  logger.debug("generateLoaderDefinition", processDirectory, configuration);

  const outputFile = path.resolve(processDirectory, configuration.outputFile);

  const outputs = [
    {
      outputFile,
      patterns: configuration.searchDir.map(dir =>
        path.resolve(processDirectory, dir, configuration.pattern)
      )
    }
  ];

  const loaderDef = {
    outputs
  };

  logger.debug("generateLoaderDefinition", loaderDef);
  return loaderDef;
};
