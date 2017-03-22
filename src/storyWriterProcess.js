import * as logger from './logger';
import { loadStories } from './storyFinder';
import { writeFile } from './writer';

export function writeOutStoryLoader(pathConfig) {
  pathConfig.outputFiles.forEach((outputFileConfig) => {
    logger.info('Output file:      ', outputFileConfig.outputFile);
    logger.info('Patterns:         ', JSON.stringify(outputFileConfig.patterns));

    const storyFiles = [];

    outputFileConfig.patterns.forEach((pattern) => {
      const patternStories = loadStories(pattern);
      Array.prototype.push.apply(storyFiles, patternStories);
      logger.info(`Located ${patternStories.length} files matching pattern '${pattern}'`);
    });

    if (storyFiles.length > 0) {
      writeFile(storyFiles, outputFileConfig.outputFile);
      logger.info(`Compiled story loader for ${storyFiles.length} files:\n`, ` ${storyFiles.join('\n  ')}`);
    } else {
      logger.warn('No files were found matching the specified pattern. Story loader was not written.');
    }
  });
}
