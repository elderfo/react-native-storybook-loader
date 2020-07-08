import glob from 'glob';
import path from 'path';

import { formatPath, getRelativePath, stripExtension } from './paths';
import { Configuration } from './configuration';

export type LoaderDefinition = {
  outputFile: string;
  storyFiles: string[];
};

export const generateLoaderDefinition = async ({
  rootDirectory,
  outputFile,
  searchDir,
  pattern,
}: Configuration): Promise<LoaderDefinition> => {
  const fullOutputFile = path.resolve(rootDirectory, outputFile);

  const lookupPatterns = searchDir.map(dir =>
    path.resolve(rootDirectory, dir, pattern)
  );

  const lookupFiles = lookupPatterns
    .map(f => formatPath(f))
    .flatMap(p => glob.sync(p))
    // Applying a format again to ensure paths are using '/'
    .map(file => formatPath(file));

  return {
    outputFile: fullOutputFile,
    storyFiles: lookupFiles
      .map(f => getRelativePath(f, rootDirectory))
      .map(f => stripExtension(f))
      .map(f => formatPath(f)),
  };
};
