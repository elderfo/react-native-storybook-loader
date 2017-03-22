
// template for doT (https://github.com/olado/doT)

function loadStories() {
  
  require('./../src/paths/index.js');
  require('./../src/paths/index.test.js');
  require('./../src/paths/multiResolver.js');
  require('./../src/paths/multiResolver.test.js');
  require('./../src/writer/index.js');
  require('./../src/writer/index.test.js');
  
}

module.exports = {
  loadStories,
};
