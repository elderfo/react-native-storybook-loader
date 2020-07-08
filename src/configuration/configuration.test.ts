import * as faker from "faker";
import {
  resolveCliArguments,
  defaultConfiguration,
  CliConfig} from ".";

describe("resolveCliArguments", () => {
  test("should return default when invalid params are specified", () => {
    const undefinedResult = resolveCliArguments(undefined);
    expect(undefinedResult).toEqual(defaultConfiguration);

    const emptyResult = resolveCliArguments({});
    expect(emptyResult).toEqual(defaultConfiguration);
  });

  test("should return searchDir when array specified", () => {
    const cliArgs: CliConfig = {
      searchDir: [
        faker.system.fileName(),
        faker.system.fileName(),
        faker.system.fileName()
      ]
    };
    const expected = { ...defaultConfiguration, ...cliArgs};

    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });

  test("should return searchDir when string specified", () => {
    const filename = faker.system.fileName();
    const cliArgs: CliConfig = {
      searchDir: filename
    };
    const expected = {...defaultConfiguration, searchDir: [filename]    };

    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });

  test("should return outputFile when specified", () => {
    const filename = faker.system.fileName();
    const cliArgs: CliConfig = {
      outputFile: filename
    };

    const expected =  {...defaultConfiguration, ...cliArgs};

    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });

  test("should return pattern when specified", () => {
    const filename = faker.system.fileName();
    const cliArgs: CliConfig = {
      pattern: filename
    };
    const expected = {...defaultConfiguration, ...cliArgs};
    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });

  test("should return pattern, searchDir (array), and outputFile when specified", () => {
    const cliArgs: CliConfig = {
      pattern: faker.system.fileName(),
      searchDir: [
        faker.system.fileName(),
        faker.system.fileName(),
        faker.system.fileName()
      ],
      outputFile: faker.system.fileName()
    };

    const expected = {...defaultConfiguration, ...cliArgs}

    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });

  test("should pattern, outputFile and searchDir (string) when specified", () => {
    const cliArgs: CliConfig = {
      pattern: faker.system.fileName(),
      searchDir: faker.system.fileName(),
      outputFile: faker.system.fileName(),
      silent: false
    };
    const expected = Object.assign({}, cliArgs, {
      searchDir: [cliArgs.searchDir]
    });

    const actual = resolveCliArguments(cliArgs);

    expect(actual).toEqual(expected);
  });
});
