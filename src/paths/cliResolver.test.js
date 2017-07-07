const faker = require('faker');
const cliResolver = require('./cliResolver');

test('cliResolver should return an empty object when invalid params are specified', () => {
  const nullResult = cliResolver(null);
  expect(nullResult).toEqual({});

  const stringResult = cliResolver('string');
  expect(stringResult).toEqual({});

  const numberResult = cliResolver(1);
  expect(numberResult).toEqual({});

  const booleanResult = cliResolver(false);
  expect(booleanResult).toEqual({});

  const undefinedResult = cliResolver(undefined);
  expect(undefinedResult).toEqual({});

  const emptyResult = cliResolver({});
  expect(emptyResult).toEqual({});
});

test('cliResolver should return searchDir when array specified', () => {
  const yargv = {
    searchDir: [
      faker.system.fileName(),
      faker.system.fileName(),
      faker.system.fileName(),
    ],
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});

test('cliResolver should return searchDir when string specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    searchDir: filename,
  };
  const expected = Object.assign({}, yargv, { searchDir: [filename] });

  const actual = cliResolver(yargv);

  expect(actual).toEqual(expected);
});

test('cliResolver should return outputFile when specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    outputFile: filename,
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});

test('cliResolver should return pattern when specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    pattern: filename,
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});

test('cliResolver should return pattern, searchDir (array), and outputFile when specified', () => {
  const yargv = {
    pattern: faker.system.fileName(),
    searchDir: [
      faker.system.fileName(),
      faker.system.fileName(),
      faker.system.fileName(),
    ],
    outputFile: faker.system.fileName(),
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});

test('cliResolver should pattern, outputFile and searchDir (string) when specified', () => {
  const yargv = {
    pattern: faker.system.fileName(),
    searchDir: faker.system.fileName(),
    outputFile: faker.system.fileName(),
  };
  const expected = Object.assign({}, yargv, { searchDir: [yargv.searchDir] });

  const actual = cliResolver(yargv);

  expect(actual).toEqual(expected);
});
