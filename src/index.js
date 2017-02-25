// import fs from 'fs';
// import glob from 'glob';
import path from 'path';
import * as logger from './logger';

const storybookPath = path.resolve(__dirname, '../');
const baseDir = path.resolve(__dirname, '../../src');
const pattern = path.join(baseDir, '**/*.stories.js');
const outputFile = path.resolve(__dirname, '../loadStories.js');

logger.info('\nGenerating Dynamic Storybook File List\n');
logger.info('Base Directory:   ', baseDir);
logger.info('Search Pattern:   ', pattern);
logger.info('Storybook Path:   ', storybookPath);
logger.info('Output File:      ', outputFile);

// Get the files
// let files = glob.sync(pattern);

// Map files relative to storybookPath
logger.info('\nWriting Configuration:\n');

// if (fs.existsSync(outputFile)) {
//   fs.unlinkSync(outputFile);
// }

// fs.appendFileSync(outputFile, 'export function loadStories() {\n');
// files.map(f=> {
//   const relative = path.relative(storybookPath, f);
//   info('  ', `${f}->${relative}`);
//   fs.appendFileSync(outputFile, `  require('${relative}');\n`);
// });
// fs.appendFileSync(outputFile, '}');

logger.info('\nFile list successfully written!\n');
