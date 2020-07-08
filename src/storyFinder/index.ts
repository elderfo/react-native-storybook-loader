import glob from "glob";

import { formatPath } from "../utils/pathHelper";

/**
 * Locates files matching the specified pattern
 *
 * @param {String} pattern - Pattern to use to locate files
 * @returns {Array<String>} - Array of located files
 */
export const loadStories = (pattern: string) =>
  glob.sync(pattern).map(file => formatPath(file));
