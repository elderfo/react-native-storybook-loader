import faker from 'faker';
import cliResolver from './cliResolver';

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

test('cliResolver should searchDir when array specified', () => {
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

test('cliResolver should searchDir when string specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    searchDir: filename,
  };
  const expected = Object.assign({}, yargv, { searchDir: [filename] });

  const actual = cliResolver(yargv);

  expect(actual).toEqual(expected);
});

test('cliResolver should outputFile when specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    outputFile: filename,
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});

test('cliResolver should pattern when specified', () => {
  const filename = faker.system.fileName();
  const yargv = {
    pattern: filename,
  };

  const actual = cliResolver(yargv);

  expect(actual).toEqual(yargv);
});
