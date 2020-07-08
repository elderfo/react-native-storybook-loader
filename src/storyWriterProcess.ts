import path from "path";
import fs from "fs";

import logger from "./logger";
import { loadStories } from "./locator";
import { writeFile } from "./writer";
import { LoaderDefinition } from "./outputs";
import { ensureFileDirectoryExists } from "./paths";

const sortFiles = (files: Array<string>) => files.concat().sort();


export const writeOutStoryLoader = async (loader: LoaderDefinition) => {
  logger.debug("writeOutStoryLoader", loader);
  const outputProcessess = loader.outputs.map(async outputFileConfig => {
    logger.info("Output file:      ", outputFileConfig.outputFile);
    logger.info(
      "Patterns:         ",
      JSON.stringify(outputFileConfig.patterns)
    );

    await ensureFileDirectoryExists(outputFileConfig.outputFile);

    const storyFiles: string[] = [];

    outputFileConfig.patterns.forEach(pattern => {
      const patternStories = loadStories(pattern);
      Array.prototype.push.apply(storyFiles, patternStories);
      logger.info(
        `Located ${patternStories.length} files matching pattern '${pattern}'`
      );
    });

    const sortedFiles = sortFiles(storyFiles);
    writeFile(sortedFiles, outputFileConfig.outputFile);
    logger.info(
      `Compiled story loader for ${storyFiles.length} files:\n`,
      ` ${storyFiles.join("\n  ")}`
    );
  });

  await Promise.all(outputProcessess);
};
