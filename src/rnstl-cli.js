#!/usr/bin/env node
import yargs from 'yargs/yargs';

import cliResolver from './paths/cliResolver';
import * as logger from './logger';
import { writeOutStoryLoader } from './storyWriterProcess';
import resolvePaths from './paths/multiResolver';

logger.setLogLevel(logger.logLevels.info);

const args = yargs()
  .usage('$0 [options]')
  .options({
    searchDir: {
      array: true,
      desc: 'The directory or directories, relative to the project root, to search for files in.',
    },
    pattern: {
      desc: 'The directory or directories, relative to the project root, to search for files in.',
      type: 'string',
    },
    outputFile: {
      desc: 'The directory or directories, relative to the project root, to search for files in.',
      type: 'string',
    },
  })
  .help()
  .argv;

logger.debug('yargs', args);

const cliConfig = cliResolver(args);
logger.debug('cliConfig', cliConfig);

const pathConfig = resolvePaths(process.cwd(), cliConfig);
logger.info('\nGenerating Dynamic Storybook File List\n');

writeOutStoryLoader(pathConfig);
