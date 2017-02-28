import moduleConfig from '../module.config.json';

var storyLoader = require(moduleConfig.outputPath); // eslint-disable-line no-var, import/no-dynamic-require

export function loadStories() {
  if (storyLoader && storyLoader.loadStories) {
    storyLoader.loadStories();
  }
}
