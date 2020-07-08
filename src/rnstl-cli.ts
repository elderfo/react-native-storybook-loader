#!/usr/bin/env node
import yargs from "yargs";

import logger, { useConsoleLogger } from "./logger";
import {
  resolveConfiguration,
  resolvePackageJsonConfiguration,
  InputConfiguration,
  getPackageJsonPath,
  defaultConfiguration
} from "./configuration";
import { writeOutStoryLoader } from "./storyWriterProcess";
import { generateLoaderDefinition } from "./outputs";
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

useConsoleLogger();

if (args.silent) {
  logger.setLogLevel(LogLevels.silent);
} else {
  logger.setLogLevel(LogLevels.info);
}

logger.debug("yargs", args);

(async () => {
  try {
    const cwd = process.cwd();

    const cliConfig = resolveConfiguration(args);
    const packageConfig = resolvePackageJsonConfiguration(cwd);

    const resolvedConfig = {
      ...defaultConfiguration,
      ...packageConfig,
      ...cliConfig
    };

    const pathConfig = await generateLoaderDefinition(cwd, resolvedConfig);

    logger.info("\nGenerating Dynamic Storybook File List\n");

    await writeOutStoryLoader(pathConfig);
  } catch (err) {
    logger.error("Failed to execute: " + err);
  }
})().catch(e => logger.error(e));
