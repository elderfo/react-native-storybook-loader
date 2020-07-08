import mock from "mock-fs";
import path from "path";

import { appName } from "../constants";
import { resolvePaths } from "./multiResolver";
import { InputConfiguration, Configuration } from "../configuration";

const generatePackageJson = ({
  searchDir,
  pattern,
  outputFile,
  silent
}: InputConfiguration) => {
  return {
    config: {
      [appName]: {
        searchDir,
        pattern,
        outputFile,
        silent
      }
    }
  };
};

const baseDir = path.resolve(process.cwd());
const packageJsonFilePath = path.resolve(baseDir, "package.json");


describe("resolvePaths", () => {
  afterEach(() => {
    mock.restore();
  });
  test("should resolve expected defaults", async () => {
    const packageJsonContents = {};
    mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
    const expected = {
      outputFiles: [
        {
          patterns: [path.resolve(baseDir, "./storybook/stories/index.js")],
          outputFile: path.resolve(baseDir, "./storybook/storyLoader.js")
        }
      ]
    };

    const actual = await resolvePaths(baseDir);

    expect(actual).toEqual(expected);
  });

  test("should resolve expected paths with single search dir", async () => {
    const packageJsonContents = generatePackageJson({
      searchDir: "./src/storybook",
      pattern: "**/*.stories.js",
      outputFile: "./storybook/config.js"
    });

    
    mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
    const expected = {
      outputFiles: [
        {
          patterns: [path.resolve(baseDir, "./src/storybook/**/*.stories.js")],
          outputFile: path.resolve(baseDir, "./storybook/config.js")
        }
      ]
    };
    
    const actual = await resolvePaths(baseDir);
    
    expect(actual).toEqual(expected);
  });
  
  test("should resolve expected paths with multiple search dirs", async () => {
    const packageJsonContents = generatePackageJson({
      searchDir: ["./src/storybook", "./packages"],
      pattern: "**/*.stories.js",
      outputFile: "./storybook/config.js"
    });

    mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });

    const expected = {
      outputFiles: [
        {
          patterns: [
            path.resolve(baseDir, "./src/storybook/**/*.stories.js"),
            path.resolve(baseDir, "./packages/**/*.stories.js")
          ],
          outputFile: path.resolve(baseDir, "./storybook/config.js")
        }
      ]
    };

    const actual = await resolvePaths(baseDir);

    expect(actual).toEqual(expected);
  });

  test("should resolve expected paths with cli configs", async () => {
    const packageJsonContents = generatePackageJson({
      searchDir: ["./src/storybook", "./packages"],
      pattern: "**/*.stories.js",
      outputFile: "./storybook/config.js"
    });

    const cliConfig: Configuration = {
      searchDir: ["./src", "./package/pkg1"],
      pattern: "*.js",
      outputFile: "./storyLoader.js",
      silent: false
    };

    mock({ [packageJsonFilePath]: JSON.stringify(packageJsonContents) });
    const expected = {
      outputFiles: [
        {
          patterns: [
            path.resolve(baseDir, "./src/*.js"),
            path.resolve(baseDir, "./package/pkg1/*.js")
          ],
          outputFile: path.resolve(baseDir, "./storyLoader.js")
        }
      ]
    };

    const actual = await resolvePaths(baseDir, cliConfig);

    expect(actual).toEqual(expected);
  });
});
