import path from "path";

import { generateLoaderDefinition } from ".";
import {
  InputConfiguration,
  Configuration,
  resolveConfiguration,
  defaultConfiguration
} from "../configuration";

const generatePackageJson = (input: InputConfiguration) => {
  return resolveConfiguration(input) as Configuration;
};

const baseDir = path.resolve(process.cwd());
const packageJsonFilePath = path.resolve(baseDir, "package.json");

describe("resolvePaths", () => {
  test("should resolve expected defaults", async () => {
    const expected = {
      outputs: [
        {
          patterns: [path.resolve(baseDir, "./storybook/stories/index.js")],
          outputFile: path.resolve(baseDir, "./storybook/storyLoader.js")
        }
      ]
    };

    await expect(generateLoaderDefinition(baseDir, defaultConfiguration)).resolves.toEqual(
      expected
    );
  });

  test("should resolve expected paths with single search dir", async () => {
    const configuration = generatePackageJson({
      searchDir: "./src/storybook",
      pattern: "**/*.stories.js",
      outputFile: "./storybook/config.js"
    });

    const expected = {
      outputs: [
        {
          patterns: [path.resolve(baseDir, "./src/storybook/**/*.stories.js")],
          outputFile: path.resolve(baseDir, "./storybook/config.js")
        }
      ]
    };

    await expect(generateLoaderDefinition(baseDir, configuration)).resolves.toEqual(
      expected
    );
  });

  test("should resolve expected paths with multiple search dirs", async () => {
    const configuration = generatePackageJson({
      searchDir: ["./src/storybook", "./packages"],
      pattern: "**/*.stories.js",
      outputFile: "./storybook/config.js"
    });

    const expected = {
      outputs: [
        {
          patterns: [
            path.resolve(baseDir, "./src/storybook/**/*.stories.js"),
            path.resolve(baseDir, "./packages/**/*.stories.js")
          ],
          outputFile: path.resolve(baseDir, "./storybook/config.js")
        }
      ]
    };

    await expect(generateLoaderDefinition(baseDir, configuration)).resolves.toEqual(
      expected
    );
  });

  test("should resolve expected paths with cli configs", async () => {
    const cliConfig: Configuration = {
      searchDir: ["./src", "./package/pkg1"],
      pattern: "*.js",
      outputFile: "./storyLoader.js",
      silent: false
    };

    const expected = {
      outputs: [
        {
          patterns: [
            path.resolve(baseDir, "./src/*.js"),
            path.resolve(baseDir, "./package/pkg1/*.js")
          ],
          outputFile: path.resolve(baseDir, "./storyLoader.js")
        }
      ]
    };

    await expect(generateLoaderDefinition(baseDir, cliConfig)).resolves.toEqual(expected);
  });
});
