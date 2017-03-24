#!/usr/bin/env node
import yargs from 'yargs';

import cliResolver from './paths/cliResolver';
import { info } from './logger';
import { writeOutStoryLoader } from './storyWriterProcess';
import resolvePaths from './paths/multiResolver';

const args = yargs
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

const cliConfig = cliResolver(args);

const pathConfig = resolvePaths(process.cwd());
info('\nGenerating Dynamic Storybook File List\n');

writeOutStoryLoader(pathConfig, cliConfig);
