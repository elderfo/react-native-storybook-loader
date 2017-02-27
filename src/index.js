var storyLoader = require('../output/storyLoader'); // eslint-disable-line no-var

function loadStories() {
  if (storyLoader && storyLoader.loadStories) {
    storyLoader.loadStories();
  }
}

module.exports = loadStories;
