const faker = require('faker');
const writer = require('./writer');
const storyFinder = require('./storyFinder');
const { generateArray } = require('./utils/testUtils');
const { writeOutStoryLoader } = require('./storyWriterProcess');

jest.mock('./writer/index.js');
jest.mock('./storyFinder/index.js');
jest.mock('./paths/multiResolver.js');
jest.mock('./logger');

test('writeOutStoryLoader should perform expected work', () => {
  const config = {
    outputFiles: [{
      outputFile: faker.system.fileName(),
      patterns: [faker.system.fileName(), faker.system.fileName()],
    },
    {
      outputFile: faker.system.fileName(),
      patterns: [faker.system.fileName()],
    }],
  };
  const firstFiles = generateArray(faker.system.fileName);
  const secondFiles = generateArray(faker.system.fileName);
  const thirdFiles = generateArray(faker.system.fileName);

  storyFinder.loadStories.mockImplementationOnce(() => firstFiles)
    .mockImplementationOnce(() => secondFiles)
    .mockImplementationOnce(() => thirdFiles);

  writeOutStoryLoader(config);

  expect(storyFinder.loadStories)
    .toHaveBeenCalledWith(config.outputFiles[0].patterns[0]);
  expect(storyFinder.loadStories)
    .toHaveBeenCalledWith(config.outputFiles[0].patterns[1]);
  expect(storyFinder.loadStories)
    .toHaveBeenCalledWith(config.outputFiles[1].patterns[0]);

  expect(writer.writeFile)
    .toHaveBeenCalledWith(firstFiles.concat(secondFiles), config.outputFiles[0].outputFile);
  expect(writer.writeFile)
    .toHaveBeenCalledWith(thirdFiles, config.outputFiles[1].outputFile);
});
