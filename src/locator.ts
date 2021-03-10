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
  const outputFileDir = path.dirname(fullOutputFile);

  const lookupPatterns: string[] = []
  searchDir.forEach(dir =>
    pattern.forEach(p =>
      lookupPatterns.push(path.resolve(rootDirectory, dir, p))
    )
  )
  
  const lookupFiles = lookupPatterns
    .map(f => formatPath(f))
    .reduce((acc: string[], p: string) => [...acc, ...glob.sync(p)], [])
    // Applying a format again to ensure paths are using '/'
    .map(file => formatPath(file));

  const uniqueFiles = Array.from(new Set(lookupFiles));

  return {
    outputFile: fullOutputFile,
    storyFiles: uniqueFiles
      .map(f => getRelativePath(f, outputFileDir))
      .map(f => stripExtension(f))
      .map(f => formatPath(f)),
  };
};
