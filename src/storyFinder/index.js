import glob from 'glob';

export function loadStories(pattern) {
  // Get the files
  return glob.sync(pattern);
}
