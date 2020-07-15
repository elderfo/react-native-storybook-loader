# React Native Storybook Loader

A CLI for dynamically importing stories into [Storybook for React Native](https://storybook.js.org/docs/guides/guide-react-native/).

[![Build Status](https://travis-ci.org/elderfo/react-native-storybook-loader.svg?branch=master)](https://travis-ci.org/elderfo/react-native-storybook-loader) [![Known Vulnerabilities](https://snyk.io/test/github/elderfo/react-native-storybook-loader/badge.svg)](https://snyk.io/test/github/elderfo/react-native-storybook-loader)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/github/elderfo/react-native-storybook-loader?svg=true)](https://ci.appveyor.com/project/elderfo/react-native-storybook-loader)
[![codecov](https://codecov.io/gh/elderfo/react-native-storybook-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/elderfo/react-native-storybook-loader)
## Purpose

While using storybook for React Native, I repeatedly found myself manually creating a file with imports for all my stories.

`react native storybook-loader` solves this by searching directories, matching files to patterns and generating a story loader that Storybook can use to load all of your stories.

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Configuration](#configuration)
* [Story Loader API](#story-loader-api)
* [Story Loader Formatting](#story-loader-formatting) (Prettier support)
* [Support](https://github.com/elderfo/react-native-storybook-loader/issues)


## Installation

```bash
yarn add react-native-storybook-loader -D
```

## Quick Start

1. Create a React Native project using [create-react-native-app](https://github.com/expo/create-react-native-app)

    ```bash
    yarn create react-native-app
    ```

2. Add [Storybook for React Native](https://storybook.js.org/docs/guides/guide-react-native/) to the project and follow instructions to finalize setup.

    ```bash
    cd <project name>
    npx -p @storybook/cli sb init --type react_native
    ```

3. Install react-native-storybook-loader

    ```bash
    yarn add react-native-storybook-loader -D
    ```

4. Add the `rnstl` cli to the scripts tag of the `package.json`

    ```json
    {
      "scripts": {
        "prestorybook": "rnstl"
      }
    }
    ```

5. Update `index.js` file in the `./storybook` directory to point to `storyLoader.js`

    ```javascript
    import { AppRegistry } from 'react-native';
    import { getStorybookUI, configure } from '@storybook/react-native';

    import { loadStories } from './storyLoader';

    import './rn-addons';

    // import stories
    configure(() => {
      loadStories();
    }, module);

    // Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
    // To find allowed options for getStorybookUI
    const StorybookUIRoot = getStorybookUI({});

    // If you are using React Native vanilla and after installation you don't see your app name here, write it manually.
    // If you use Expo you can safely remove this line.
    AppRegistry.registerComponent('%APP_NAME%', () => StorybookUIRoot);

    export default StorybookUIRoot;
    ```
    _Note:_ Step 4 ensures `storyLoader.js` will be created
6. Start Storybook

    ```bash
    yarn storybook
    ```

7. Run react native app in targeted platform

    ```bash
    yarn android
    ```

    Or

    ```bash
    yarn ios
    ```
    _Note: If you have problems connecting from your device to Storybook using Android issue the following command: `adb reverse tcp:7007 tcp:7007`._


## Configuration

Story loading is controlled by the `react-native-storybook-loader` section of the project's `package.json`. 

### Options

| Setting | CLI Option | Type | Description | Default | 
|---|---|---|---|---|
| **searchDir** | `--searchDir` | `string` or `string[]` | The directory or directories, relative to the project root, to search for files in. | Project root |
| **outputFile** | `--outputFile` | `string` | The output file that will be written. It is relative to the project directory. | `./storybook/storyLoader.js` | 
| **pattern** | `--pattern` | `string` | The pattern of files to look at. It can be a specific file, or any valid glob. Note: if using the CLI, globs with `**/*...` must be escaped with quotes | `./storybook/stories/index.js` (The default React Native storybook file) | 
|  | `--silent` | | Silences output. This option is not supported in the `package.json` file. | 

> Note: When using the CLI, any of option passed will override the values in the `package.json`

### Examples:

Both examples below will search `src` and `packages` directories recursively for files that end with `.stories.js` and write the output to `./storybook/storyLoader.js`

#### `package.json`

```json
{
  "name": "awesome-project",
  "scripts": {
    "prestorybook": "rnstl"
  },
  "config": {
    "react-native-storybook-loader": {
      "searchDir": ["./src", "./packages"],
      "pattern": "**/*.stories.js",
      "outputFile": "./storybook/storyLoader.js"
    }
  }
}
```

## Story Loader API

A story loader is the file generated by `rnstl` used to load story files from your project in to Storybook. 

### storyLoader.loadStores()

Loads the located stories

Returns: `void`

### storyLoader.stories

An array of the stories that are loaded.

Returns: `string[]`

## Story Loader Formatting

To ensure the formatting of your story loader is on par with the rest of your code base, `rnstl` uses [Prettier](https://prettier.io/) to format the generated story loaders. It will travese up the tree looking for a [Prettier configuration file](https://prettier.io/docs/en/configuration.html). If none is found, the defaul Prettier settings will be used.
