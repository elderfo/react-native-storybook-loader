#!/usr/bin/env node
import { info } from './logger';
import { writeOutStoryLoader } from './storyWriterProcess';
import resolvePaths from './paths/multiResolver';

const pathConfig = resolvePaths(process.cwd());
info('\nGenerating Dynamic Storybook File List\n');
info('package.json:     ', pathConfig.packageJsonFile);
info('Base directory:   ', pathConfig.baseDir);

writeOutStoryLoader(pathConfig);
