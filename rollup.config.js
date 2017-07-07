// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

export default {
  banner: '#!/usr/bin/env node',
  entry: 'src/rnstl-cli.js',
  format: 'cjs',
  external: ['fs', 'path', 'os', 'util', 'yargs', 'glob', 'dot', 'findup', 'colors'],
  sourceMap: true,
  plugins: [
    replace({
      '#!/usr/bin/env node': '',
    }),
    resolve(),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: [
        'node_modules/yargs/**',
        'node_modules/glob/**',
        'node_modules/dot/**',
        'node_modules/findup/**',
        'node_modules/colors/**',
      ],

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: true,  // Default: true
    }),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
  dest: 'dist/rnstl-cli.js',
};
