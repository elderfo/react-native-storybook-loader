jest.mock('glob');

// required imports
import * as faker from 'faker';

// mocked imports
import glob from 'glob';
import path from 'path';

// test file import
import { generateLoaderDefinition } from './locator';
import { Configuration } from './configuration';

beforeEach(() => {
  jest.clearAllMocks();
});

const windowsGlob = [
  'c:\\look-at-me-im-on-windows\\src\\index.ts',
  'c:\\look-at-me-im-on-windows\\src\\source.ts',
];
const linuxGlob = [
  '/home/user/nix-rules/src/index.ts',
  '/home/user/nix-rules/src/source.ts',
];

function setupMocks() {}

describe('generateLoaderDefinition', () => {
  test('should locate and format stories on windows', async () => {
    glob.sync = jest.fn().mockReturnValueOnce(windowsGlob);

    const config: Configuration = {
      rootDirectory: 'c:\\look-at-me-im-on-windows\\',
      outputFile: faker.system.fileName(),
      pattern: '**/*.ts',
      searchDir: ['.'],
    };

    const actual = await generateLoaderDefinition(config);

    expect(actual.outputFile).toEqual(
      path.resolve(config.rootDirectory, config.outputFile)
    );

    expect(actual.storyFiles).toHaveLength(2);

    expect(actual.storyFiles).toContain('./src/index');
    expect(actual.storyFiles).toContain('./src/source');
  });

  test('should locate and format stories on linux/macOS', async () => {
    glob.sync = jest.fn().mockReturnValueOnce(linuxGlob);

    const config: Configuration = {
      rootDirectory: '/home/user/nix-rules',
      outputFile: faker.system.fileName(),
      pattern: '**/*.ts',
      searchDir: ['.'],
    };

    const actual = await generateLoaderDefinition(config);

    expect(actual.outputFile).toEqual(
      path.resolve(config.rootDirectory, config.outputFile)
    );

    expect(actual.storyFiles).toHaveLength(2);

    expect(actual.storyFiles).toContain('./src/index');
    expect(actual.storyFiles).toContain('./src/source');
  });
});
