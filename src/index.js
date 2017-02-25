// import fs from 'fs';
// import glob from 'glob';
import * as logger from './logger';
import resolvePaths from './paths';

const paths = resolvePaths();

logger.info('\nGenerating Dynamic Storybook File List\n');
logger.info('package.json:     ', paths.packageJsonFile);
logger.info('Base Directory:   ', paths.baseDir);
logger.info('Search Pattern:   ', paths.pattern);
logger.info('Storybook Path:   ', paths.storybookPath);
logger.info('Output File:      ', paths.outputFile);

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
