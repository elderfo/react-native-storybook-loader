#!/usr/bin/env node
const yargs = require('yargs/yargs');

const cliResolver = require('./paths/cliResolver');
const { info } = require('./logger');
const { writeOutStoryLoader } = require('./storyWriterProcess');
const resolvePaths = require('./paths/multiResolver');

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

const cliConfig = cliResolver(args);
const pathConfig = resolvePaths(process.cwd(), cliConfig);
info('\nGenerating Dynamic Storybook File List\n');

writeOutStoryLoader(pathConfig);
