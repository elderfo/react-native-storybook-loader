import fs from 'fs';
import path from 'path';
import encoding from '../constants';

function postbuild() {
  const template = path.resolve(__dirname, '../writer/template.tmp');
  const contents = fs.readFileSync(template, encoding);
  const output = path.resolve(__dirname, '../../dist/template.tmp');

  fs.writeFileSync(output, contents, { encoding });
}

postbuild();
