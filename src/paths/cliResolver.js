export default function cliResolver(yargv) {
  if (!yargv || typeof yargv !== 'object') {
    return {};
  }

  const config = {};

  if (yargv.searchDir && Array.isArray(yargv.searchDir)) {
    config.searchDir = yargv.searchDir;
  } else if (yargv.searchDir) {
    config.searchDir = [yargv.searchDir];
  }

  if (yargv.outputFile) {
    config.outputFile = yargv.outputFile;
  }

  if (yargv.pattern) {
    config.pattern = yargv.pattern;
  }

  return config;
}
