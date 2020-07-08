import faker  from 'faker';
import * as writer  from './writer';
import * as storyFinder  from './storyFinder';
import { generateArray }  from './utils/testUtils';
import { writeOutStoryLoader }  from './storyWriterProcess';

jest.mock('./writer/index.ts');
jest.mock('./storyFinder/index.ts');
jest.mock('./paths/multiResolver.ts');
jest.mock('./logger');

test('writeOutStoryLoader should perform expected work', () => {
  const config = {
    outputFiles: [
      {
        outputFile: faker.system.fileName(),
        patterns: [faker.system.fileName(), faker.system.fileName()],
      },
      {
        outputFile: faker.system.fileName(),
        patterns: [faker.system.fileName()],
      },
    ],
  };
  const firstFiles = generateArray(faker.system.fileName);
  const secondFiles = generateArray(faker.system.fileName);
  const noFiles :string[] = [];

  const loadStoriesMock = storyFinder.loadStories as jest.Mock;
  loadStoriesMock
    .mockImplementationOnce(() => firstFiles)
    .mockImplementationOnce(() => secondFiles)
    .mockImplementationOnce(() => noFiles);

  writeOutStoryLoader(config);

  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputFiles[0].patterns[0]
  );
  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputFiles[0].patterns[1]
  );
  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputFiles[1].patterns[0]
  );

  expect(writer.writeFile).toHaveBeenCalledWith(
    firstFiles.concat(secondFiles).sort(),
    config.outputFiles[0].outputFile
  );
  expect(writer.writeFile).toHaveBeenCalledWith(
    noFiles.concat().sort(),
    config.outputFiles[1].outputFile
  );
});
