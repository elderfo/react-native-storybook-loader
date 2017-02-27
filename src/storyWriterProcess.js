import * as logger from './logger';
import { resolvePaths } from './paths';
import { loadStories } from './storyFinder';
import { writeFile } from './writer';

export function writeOutStoryLoader() {
  const paths = resolvePaths(process.cwd());

  logger.info('\nGenerating Dynamic Storybook File List\n');
  logger.info('package.json:     ', paths.packageJsonFile);
  logger.info('Base directory:   ', paths.baseDir);
  logger.info('Output file:      ', paths.outputFile);
  logger.info('Pattern:          ', paths.pattern);

  const storyFiles = loadStories(paths.pattern);

  logger.info(`Located ${storyFiles.length} files matching pattern '${paths.pattern}'`);

  if (storyFiles.length > 0) {
    writeFile(paths.baseDir, storyFiles, paths.outputFile);
    logger.info(`Compiled story loader for ${storyFiles.length} files:\n`, ` ${storyFiles.join('\n  ')}`);
  } else {
    logger.warn('No files were found matching the specified pattern. Story loader was not written.');
  }
}
