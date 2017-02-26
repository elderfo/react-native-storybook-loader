export default class FileLoader {
  static loadFile(filepath) {
    require(filepath); // eslint-disable-line global-require, import/no-dynamic-require
  }
}
