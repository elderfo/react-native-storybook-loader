jest.mock('./paths');
jest.mock('glob');

// required imports
import * as faker from 'faker';

// mocked imports
import  glob from 'glob';

// test file import
import { formatPath } from './paths';
import { loadStories } from './locator';

const formatPathMock = formatPath as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

const files = [faker.system.fileName(), faker.system.fileName()];

function setupMocks() {
  glob.sync = jest.fn(() => files);
  formatPathMock.mockImplementation((dir: string) => dir);
}

test('loadStories should locate stories', () => {
  setupMocks();
  const actual = loadStories("");
  expect(actual).toEqual(files);
  expect(formatPath).toHaveBeenCalledWith(files[0]);
  expect(formatPath).toHaveBeenCalledWith(files[1]);
});

test('loadStories should perform expected work', () => {
  setupMocks();
  const pattern = faker.system.fileName();

  loadStories(pattern);

  expect(glob.sync).toHaveBeenCalledWith(pattern);
});
