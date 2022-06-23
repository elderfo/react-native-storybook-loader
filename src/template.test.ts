import * as faker from 'faker';

import { generateTemplate } from './template';
import { LoaderDefinition } from './locator';

describe('generateTemplate', () => {
  test('generate story loader', async () => {
    const def: LoaderDefinition = {
      outputFile: faker.system.fileName(),
      storyFiles: [
        '../file1',
        '../sub/file2',
        '../../parent/file3',
        './sub/file4',
        './sub/sub/file5',
      ],
    };

    const contents = await generateTemplate(def);
    expect(contents).toMatchSnapshot();
  });
});
