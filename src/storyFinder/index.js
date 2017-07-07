const glob = require('glob');

const loadStories = pattern => glob.sync(pattern);

module.exports = { loadStories };
