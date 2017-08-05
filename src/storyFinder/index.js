const glob = require('glob');

const { formatPath } = require('../utils/pathHelper');

/**
 * Locates files matching the specified pattern
 *
 * @param {String} pattern - Pattern to use to locate files
 * @returns {Array<String>} - Array of located files
 */
const loadStories = pattern => glob.sync(pattern).map(file => formatPath(file));

module.exports = { loadStories };
