#!/usr/bin/env node
import yargs from 'yargs';
import { promises as fs } from 'fs';
import path from 'path';

import logger, { useConsoleLogger } from './logger';
import { InputConfiguration, generateConfiguration } from './configuration';

import { LogLevels } from './logger';
import { generateTemplate } from './template';
import { generateLoaderDefinition } from './locator';
import { encoding } from './constants';

const args: InputConfiguration = yargs
  .usage('$0 [options]')
  .options({
    searchDir: {
      type: 'string',
      array: true,
      desc:
        'The directory or directories, relative to the project root, to search for files in.',
    },
    pattern: {
      desc:
        "Pattern to search the search directories with. Note: if pattern contains '**/*' it must be escaped with quotes",
      type: 'string',
    },
    outputFile: {
      desc: 'Path to the output file.',
      type: 'string',
    },
    silent: {
      desc: 'Silences all logging',
      type: 'boolean',
    },
  })
  .help().argv;

useConsoleLogger();

if (args.silent) {
  logger.setLogLevel(LogLevels.silent);
} else {
  logger.setLogLevel(LogLevels.info);
}

logger.debug('yargs', args);

(async () => {
  try {
    const cwd = process.cwd();

    const configuration = await generateConfiguration(args, cwd);
    const loaderDefinition = await generateLoaderDefinition(configuration);
    const template = await generateTemplate(loaderDefinition);

    await fs.mkdir(path.dirname(loaderDefinition.outputFile), {
      recursive: true,
    });

    logger.info("Writing to " + loaderDefinition.outputFile)

    await fs.writeFile(loaderDefinition.outputFile, template, { encoding });
  } catch (err) {
    logger.error('Failed to execute: ' + err);
  }
})().catch(e => logger.error(e));
