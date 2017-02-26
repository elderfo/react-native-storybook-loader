#! /usr/bin/env node
import * as logger from './logger';
import { resolvePaths } from './paths';
import { loadStories } from './storyFinder';
import { writeFile } from './writer';

export function writeOutStoryLoader() {
  const paths = resolvePaths();

  logger.info('\nGenerating Dynamic Storybook File List\n');
  logger.info('package.json:     ', paths.packageJsonFile);
  logger.info('Base Directory:   ', paths.baseDir);
  logger.info('Pattern:          ', paths.pattern);

  const storyFiles = loadStories(paths.baseDir, paths.pattern);

  logger.info(`Located ${storyFiles.length} files matching pattern '${paths.pattern}'`);

  if (storyFiles.length > 0) {
    writeFile(paths.baseDir, storyFiles);
    logger.info(`Compiled story loader for ${storyFiles.length} files: \n\n ${storyFiles}`);
  }

  logger.warn('No files were found matching the specified pattern. Story loader was not written.');
}
