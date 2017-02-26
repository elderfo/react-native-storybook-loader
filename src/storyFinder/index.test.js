// required imports
import faker from 'faker';

// mocked imports
import glob from 'glob';

// test file import
import { loadStories } from './';

jest.mock('glob');

beforeEach(() => {
  jest.resetAllMocks();
});

const files = [faker.system.fileName(), faker.system.fileName()];

function setupMocks(sync) {
  glob.sync = jest.fn(sync || (() => files));
}

test('loadStories should locate stories', () => {
  setupMocks();
  const actual = loadStories();
  expect(actual).toBe(files);
});
