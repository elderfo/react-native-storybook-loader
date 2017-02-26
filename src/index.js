import glob from 'glob';

import * as logger from './logger';
import pathResolver from './pathResolver';
import fileLoader from './fileLoader';

function loadStories() {
  const paths = pathResolver.resolvePaths();

  logger.info('\nGenerating Dynamic Storybook File List\n');
  logger.info('package.json:     ', paths.packageJsonFile);
  logger.info('Base Directory:   ', paths.baseDir);
  logger.info('Search Pattern:   ', paths.pattern);

  // Get the files
  const files = glob.sync(paths.pattern);

  let loaded = 0;
  let errors = 0;

  files.forEach((file) => {
    try {
      fileLoader.loadFile(file);
      loaded += 1;
    } catch (error) {
      logger.error(`Failed to load file '${file}'`, error);
      errors += 1;
    }
  });

  if (errors && loaded === 0) {
    throw new Error('No files were loaded, see log for more information.');
  } else if (errors) {
    logger.warn(`Loaded ${loaded} of ${files.length} files with ${errors} errors. See above for errored files.`); // eslint-disable-line max-len
  } else if (loaded === 0) {
    logger.warn(`No files matched the pattern '${paths.pattern}'`);
  } else {
    logger.info(`Loaded ${loaded} of ${files.length} files`);
  }
}

export default loadStories;
