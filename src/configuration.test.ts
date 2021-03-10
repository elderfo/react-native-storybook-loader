import * as faker from 'faker';
import {
  resolveConfiguration,
  defaultConfiguration,
  InputConfiguration,
  Configuration,
} from './configuration';

describe('resolveConfiguration', () => {
  test('should return default when invalid params are specified', () => {
    const undefinedResult = resolveConfiguration(undefined, defaultConfiguration);
    expect(undefinedResult).toEqual(defaultConfiguration);

    const emptyResult = resolveConfiguration({}, defaultConfiguration);
    expect(emptyResult).toEqual(defaultConfiguration);
  });

  test('should return searchDir when array specified', () => {
    const cliArgs: InputConfiguration = {
      searchDir: [
        faker.system.fileName(),
        faker.system.fileName(),
        faker.system.fileName(),
      ],
    };
    const expected = { ...defaultConfiguration, ...cliArgs };

    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should return searchDir when string specified', () => {
    const filename = faker.system.fileName();
    const cliArgs: InputConfiguration = {
      searchDir: filename,
    };
    const expected = { ...defaultConfiguration, searchDir: [filename] };

    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should return outputFile when specified', () => {
    const filename = faker.system.fileName();
    const cliArgs: InputConfiguration = {
      outputFile: filename,
    };

    const expected = { ...defaultConfiguration, ...cliArgs };

    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should return pattern when specified', () => {
    const filename = faker.system.fileName();
    const cliArgs: InputConfiguration = {
      pattern: filename,
    };
    const expected = { ...defaultConfiguration, pattern: [cliArgs.pattern] };
    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should return pattern, searchDir (array), and outputFile when specified', () => {
    const cliArgs: InputConfiguration = {
      pattern: faker.system.fileName(),
      searchDir: [
        faker.system.fileName(),
        faker.system.fileName(),
        faker.system.fileName(),
      ],
      outputFile: faker.system.fileName(),
    };

    const expected = { ...defaultConfiguration, ...cliArgs, pattern: [cliArgs.pattern] };

    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should pattern, outputFile and searchDir (string) when specified', () => {
    const cliArgs: InputConfiguration = {
      pattern: faker.system.fileName(),
      searchDir: faker.system.fileName(),
      outputFile: faker.system.fileName(),
    };
    const expected = {
      ...defaultConfiguration,
      ...cliArgs,
      pattern: [cliArgs.pattern],
      searchDir: [cliArgs.searchDir],
    };

    const actual = resolveConfiguration(cliArgs, defaultConfiguration);

    expect(actual).toEqual(expected);
  });

  test('should return patterns, when multiple pattern provided', () => {
    const cliArgs: InputConfiguration = {
      pattern: [faker.system.fileName(), faker.system.fileName()],
      searchDir: faker.system.fileName(),
      outputFile: faker.system.fileName()
    }
    const expected = {
      ...defaultConfiguration,
      ...cliArgs,
      searchDir: [cliArgs.searchDir]
    }

    const actual = resolveConfiguration(cliArgs, defaultConfiguration)
    expect(actual).toEqual(expected)
  })
  
  test('should return patterns, when multiple pattern and searchDir provided', () => {
    const cliArgs: InputConfiguration = {
      pattern: [faker.system.fileName(), faker.system.fileName()],
      searchDir: [faker.system.fileName(), faker.system.fileName()],
      outputFile: faker.system.fileName()
    }
    const expected = {
      ...defaultConfiguration,
      ...cliArgs,
    }

    const actual = resolveConfiguration(cliArgs, defaultConfiguration)
    expect(actual).toEqual(expected)
  })
});
