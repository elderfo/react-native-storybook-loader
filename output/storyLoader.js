
// template for doT (https://github.com/olado/doT)

function loadStories() {
  
  require('./../src/paths/cliResolver.js');
  require('./../src/paths/cliResolver.test.js');
  require('./../src/paths/multiResolver.js');
  require('./../src/paths/multiResolver.test.js');
  require('./../src/writer/index.js');
  require('./../src/writer/index.test.js');
  
}

module.exports = {
  loadStories,
};
