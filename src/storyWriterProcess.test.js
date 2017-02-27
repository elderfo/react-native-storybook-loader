import faker from 'faker';
import * as writer from './writer';
import * as storyFinder from './storyFinder';
import * as paths from './paths';
import * as logger from './logger'; // eslint-disable-line no-unused-vars
import { generateArray } from './utils/testUtils';
import { writeOutStoryLoader } from './storyWriterProcess';

jest.mock('./writer/index.js');
jest.mock('./storyFinder/index.js');
jest.mock('./paths/index.js');
jest.mock('./logger');

function setupMocks(pathConfig, files) {
  paths.resolvePaths.mockImplementation(() => pathConfig);
  storyFinder.loadStories.mockImplementation(() => files);
  writer.writeFile.mockImplementation(() => { });
}

test('writeOutStoryLoader should perform expected work', () => {
  const config = {
    baseDir: faker.system.fileName(),
    packageJsonFile: faker.system.fileName(),
    searchDir: faker.system.fileName(),
    pattern: faker.system.fileName(),
    outputFile: faker.system.fileName(),
  };
  const files = generateArray(faker.system.fileName);

  setupMocks(config, files);

  writeOutStoryLoader();

  expect(paths.resolvePaths).toHaveBeenCalled();
  expect(storyFinder.loadStories).toHaveBeenCalledWith(config.pattern);
  expect(writer.writeFile).toHaveBeenCalledWith(config.baseDir, files, config.outputFile);
});
