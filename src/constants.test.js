const { appName } = require('./constants');

test('appName should equal expected value', () => {
  expect(appName).toBe('react-native-storybook-loader');
});
