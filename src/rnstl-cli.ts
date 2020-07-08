#!/usr/bin/env node
import yargs from "yargs";

import logger from "./logger";
import { resolveCliArguments, InputConfiguration } from "./configuration";
import { writeOutStoryLoader } from "./storyWriterProcess";
import { resolvePaths } from "./paths/multiResolver";
import { LogLevels } from "./logger";

const args: InputConfiguration = yargs
  .usage("$0 [options]")
  .options({
    searchDir: {
      type: "string",
      array: true,
      desc:
        "The directory or directories, relative to the project root, to search for files in."
    },
    pattern: {
      desc:
        "Pattern to search the search directories with. Note: if pattern contains '**/*' it must be escaped with quotes",
      type: "string"
    },
    outputFile: {
      desc: "Path to the output file.",
      type: "string"
    },
    silent: {
      desc: "Silences all logging",
      type: "boolean"
    }
  })
  .help().argv;

if (args.silent) {
  logger.setLogLevel(LogLevels.silent);
} else {
  logger.setLogLevel(LogLevels.info);
}

logger.debug("yargs", args);

(async () => {
  const cliConfig = resolveCliArguments(args);
  
  const pathConfig = await resolvePaths(process.cwd(), cliConfig);
  logger.info("\nGenerating Dynamic Storybook File List\n");
  
  writeOutStoryLoader(pathConfig);
})();
