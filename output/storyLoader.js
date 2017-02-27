
// template for doT (https://github.com/olado/doT)

function loadStories() {
  
  require('../src/constants.test.js'); // /Users/Freddy/Developer/react-native-storybook-loader/src/constants.test.js
  require('../src/paths/index.test.js'); // /Users/Freddy/Developer/react-native-storybook-loader/src/paths/index.test.js
  require('../src/storyFinder/index.test.js'); // /Users/Freddy/Developer/react-native-storybook-loader/src/storyFinder/index.test.js
  require('../src/storyWriterProcess.test.js'); // /Users/Freddy/Developer/react-native-storybook-loader/src/storyWriterProcess.test.js
  require('../src/writer/index.test.js'); // /Users/Freddy/Developer/react-native-storybook-loader/src/writer/index.test.js
  
}

module.exports = {
  loadStories,
};
