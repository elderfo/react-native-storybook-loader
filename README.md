# react-native-storybook-loader
[![Build Status](https://travis-ci.org/elderfo/react-native-storybook-loader.svg?branch=master)](https://travis-ci.org/elderfo/react-native-storybook-loader) [![Known Vulnerabilities](https://snyk.io/test/github/elderfo/react-native-storybook-loader/badge.svg)](https://snyk.io/test/github/elderfo/react-native-storybook-loader)


A CLI for dynamically import stories into [react-native-storybook](https://github.com/storybooks/react-native-storybook).

## Purpose

While using storybook for React Native, I repeatedly found myself manually creating a file with imports for all my stories. So I built an automated way to do it. `react-native-storybook-loader` can be run using configuration in your `package.json` or via the CLI interface.

## Installation

```bash
yarn add react-native-storybook-loader -D
```
Or
```bash
npm install react-native-storybook-loader --save-dev
```

## Quick Start

Create a React Native project using [create-react-native-app](https://facebook.github.io/react-native/blog/2017/03/13/introducing-create-react-native-app.html)
```bash
create-react-native-app AwesomeProject
```

Add react-native-storybook to the project using [`getstorybook`](https://getstorybook.io/docs/react-storybook/basics/quick-start-guide)
```bash
cd AwesomeProject
getstorybook
```

Install react-native-storybook-loader

```bash
yarn install react-native-storybook-loader -D
```

Update `index.js` file in the `./storybook` directory to point to the generated `storyLoader.js`

```javascript
import { getStorybookUI, configure } from '@storybook/react-native';
import { loadStories } from './storyLoader';

configure(() => {
  loadStories()
}, module);

const StorybookUI = getStorybookUI({ port: 7007, host: 'localhost' });
export default StorybookUI;
```

Add the `rnstl` cli to the scripts tag of the `package.json`

```json
{
  "scripts": {
    "prestorybook": "rnstl"
  }
}
```

## Configuration
Story loading is controlled by the `react-native-storybook-loader` section of the project's `package.json`. 

### Options

| Setting | CLI Option | Type | Description | Default | 
|---|---|---|---|---|
| **searchDir** | `--searchDir` | `string` or `string[]` | The directory or directories, relative to the project root, to search for files in. | Project root |
| **outputFile** | `--outputFile` | `string` | The output file that will be written. It is relative to the project directory. | `./storybook/storyLoader.js` | 
| **pattern** | `--pattern` | `string` | The pattern of files to look at. It can be a specific file, or any valid glob. Note: if using the CLI, globs with `**/*...` must be escaped with quotes | `./storybook/stories/index.js` (The default React Native storybook file) | 

> Note: When using the CLI, any of option passed will override the values in the `package.json`

### Examples:

Both examples below will search `src` and `packages` directories recursively for files that end with `.stories.js` and write the output to `./storybook/storyLoader.js`

#### `package.json`

```json
{
  "name": "AwesomeProject",
  ...
  "scripts": {
    ...
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

#### CLI

**Breaking Change**

CLI can now be accessed from a terminal 
```bash
./node_modules/.bin/rnstl <options>
```
or in package.json 
```json
{
  "scripts": {
    "prestorybook": "rnstl <options>"
  }
}
```

_Note:_ When using a glob with `**/*` it is required to be wrapped in quotes

There is no longer a need to use `node ./node_modules/.bin/rnstl
<options>`.

```bash
$ ./node_modules/.bin/rnstl --searchDir ./src ./packages --pattern "**/*.stories.js" --outputFile ./storybook/storyLoader.js
```

## Support
Please log issues

## Contributing
Coming Soon
