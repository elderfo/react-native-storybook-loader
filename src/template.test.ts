import * as faker from 'faker';

import { generateTemplate } from './template';
import { LoaderDefinition } from './locator';

describe('generateTemplate', () => {
  test('generate story loader', async () => {
    const def: LoaderDefinition = {
      outputFile: faker.system.fileName(),
      storyFiles: [
        '../file1.tsx',
        '../sub/file2.tsx',
        '../../parent/file3.tsx',
        './sub/file4.tsx',
        './sub/sub/file5.tsx',
      ],
    };

    const contents = await generateTemplate(def);
    expect(contents).toMatchSnapshot();
  });
});
