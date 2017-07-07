// required imports
const faker = require('faker');

// mocked imports
const glob = require('glob');

// test file import
const { loadStories } = require('./');

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
