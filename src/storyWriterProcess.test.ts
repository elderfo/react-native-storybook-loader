import faker from "faker";
import * as writer from "./writer";
import * as storyFinder from "./locator";
import { writeOutStoryLoader } from "./storyWriterProcess";

jest.mock("./writer");
jest.mock("./locator");
jest.mock("./logger");

test("writeOutStoryLoader should perform expected work", () => {
  const config = {
    outputs: [
      {
        outputFile: faker.system.fileName(),
        patterns: [faker.system.fileName(), faker.system.fileName()]
      },
      {
        outputFile: faker.system.fileName(),
        patterns: [faker.system.fileName()]
      }
    ]
  };
  const firstFiles = Array(10).map(_ => faker.system.fileName());
  const secondFiles = Array(10).map(_ => faker.system.fileName());
  const noFiles: string[] = [];

  const loadStoriesMock = storyFinder.loadStories as jest.Mock;
  loadStoriesMock
    .mockImplementationOnce(() => firstFiles)
    .mockImplementationOnce(() => secondFiles)
    .mockImplementationOnce(() => noFiles);

  writeOutStoryLoader(config);

  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputs[0].patterns[0]
  );
  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputs[0].patterns[1]
  );
  expect(storyFinder.loadStories).toHaveBeenCalledWith(
    config.outputs[1].patterns[0]
  );

  expect(writer.writeFile).toHaveBeenCalledWith(
    firstFiles.concat(secondFiles).sort(),
    config.outputs[0].outputFile
  );
  expect(writer.writeFile).toHaveBeenCalledWith(
    noFiles.concat().sort(),
    config.outputs[1].outputFile
  );
});
