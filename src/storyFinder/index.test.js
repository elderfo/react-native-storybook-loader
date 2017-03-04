// required imports
import faker from 'faker';

// mocked imports
import glob from 'glob';

// test file import
import { loadStories } from './';

jest.mock('glob');

beforeEach(() => {
  jest.clearAllMocks();
});

const files = [faker.system.fileName(), faker.system.fileName()];

function setupMocks() {
  glob.sync = jest.fn(() => files);
}

test('loadStories should locate stories', () => {
  setupMocks();
  const actual = loadStories();
  expect(actual).toBe(files);
});

test('loadStories should perform expected work', () => {
  setupMocks();
  const pattern = faker.system.fileName();

  loadStories(pattern);

  expect(glob.sync).toHaveBeenCalledWith(pattern);
});
