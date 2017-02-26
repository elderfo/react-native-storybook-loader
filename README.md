# react-native-storybook-loader
[![Build Status](https://travis-ci.org/elderfo/react-native-storybook-loader.svg?branch=master)](https://travis-ci.org/elderfo/react-native-storybook-loader)

A component for dynamically import stories into [react-native-storybook](https://github.com/storybooks/react-native-storybook).

## Installation

```bash
yarn add react-native-storybook-loader -D
```
Or
```bash
npm install react-native-storybook-loader --save-dev
```

## Quick Start

Create a React Native project using [react-native-cli](https://facebook.github.io/react-native/docs/getting-started.html#the-react-native-cli)
```bash
react-native init AwesomeProject
```

Add react-native-storybook to the project using [`getstorybook`](https://getstorybook.io/docs/react-storybook/basics/quick-start-guide)
```bash
cd AwesomeProject
getstorybook
```

Update `index.android.js` and `index.ios.js` files in the `./storybook` directory

```javascript
import { AppRegistry } from 'react-native';
import { getStorybookUI, configure } from '@kadira/react-native-storybook';
import storyLoader from 'react-native-storybook-loader';

// import stories
configure(storyLoader.loadStories, module);

const StorybookUI = getStorybookUI({port: 7007, host: 'localhost'});
AppRegistry.registerComponent('ReactNative', () => StorybookUI);
```

## Configuration
Story loading is controlled by the `react-native-storybook-loader` section of the project's `package.json`. 

### Options

| Setting | Description | Default | Notes |
|---|---|---| --- |
| **searchDir** | This is the directory, relative to the project root, to search for files in. | Project root | |
| **pattern** | This is the pattern of files to look at. It can be a specific file, or any valid glob | `./storybook/index.js` | This is the default storybook file, and chosen for this component to be able to be dropped in to a new project and work, only requiring and update to the `index.android.js` and `index.ios.js` files. |

#### Example:

```json
{
  "name": "AwesomeProject",
  ...
  "config": {
    "react-native-storybook-loader": {
      "searchDir": "./src",
      "pattern": "**/*.stories.js"
    }
  }
}
```

This configuration will search `src` recursively for files that end with `.stories.js`.

## Support
Please log issues

## Contributing
Coming Soon
