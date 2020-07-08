import mockfs from "mock-fs";
import path from "path";
import faker from "faker";
import fs from "fs";

import {
  getRelativePath,
  formatPath} from "./paths";

afterEach(() => mockfs.restore());

describe("getRelativePath()", () => {
  describe("prefixes", () => {
    it("should resolve windows paths with right seps", () => {
      const file = "c:\\users\\george\\dev\\app\\src\\stuff.js";
      const fromDir = "c:\\users\\george\\dev\\app\\stories\\";

      const actual = getRelativePath(file, fromDir);

      expect(actual).toEqual("../src/stuff.js");
    });

    it("should resolve windows paths with wrong seps", () => {
      const file = "c:/users/george/dev/app/src/stuff.js";
      const fromDir = "c:/users/george/dev/app/stories/";

      const actual = getRelativePath(file, fromDir);

      expect(actual).toEqual("../src/stuff.js");
    });

    it("should resolve unix paths with right seps", () => {
      const file = "/users/george/dev/app/src/stuff.js";
      const fromDir = "/users/george/dev/app/stories/";

      const actual = getRelativePath(file, fromDir);

      expect(actual).toEqual("../src/stuff.js");
    });

    it("should resolve unix paths with wrong seps", () => {
      const file = "\\users\\george\\dev\\app\\src\\stuff.js";
      const fromDir = "\\users\\george\\dev\\app\\stories\\";

      const actual = getRelativePath(file, fromDir);

      expect(actual).toEqual("../src/stuff.js");
    });

    it("should be added when file is in the same folder", () => {
      const relativePath = "abc123";
      const spy = jest.spyOn(path, "relative");

      spy.mockImplementation(() => relativePath);

      const actual = getRelativePath(
        faker.system.fileName(),
        faker.system.fileName()
      );

      expect(actual).toEqual(`./${relativePath}`);

      spy.mockReset();
      spy.mockRestore();
    });

    it('should not change a path prefixed with "./"', () => {
      const relativePath = "./abc123";
      const spy = jest.spyOn(path, "relative");

      spy.mockImplementation(() => relativePath);

      const actual = getRelativePath(
        faker.system.fileName(),
        faker.system.fileName()
      );

      expect(actual).toEqual(relativePath);

      spy.mockReset();
      spy.mockRestore();
    });

    it('should not change a path prefixed with ".."', () => {
      const relativePath = "../abc123";
      const spy = jest.spyOn(path, "relative");

      spy.mockImplementation(() => relativePath);

      const actual = getRelativePath(
        faker.system.fileName(),
        faker.system.fileName()
      );

      expect(actual).toEqual(relativePath);

      spy.mockReset();
      spy.mockRestore();
    });

    it('should not change a path prefixed with ".\\"', () => {
      const relativePath = "./abc123";
      const spy = jest.spyOn(path, "relative");

      spy.mockImplementation(() => relativePath);

      const actual = getRelativePath(
        faker.system.fileName(),
        faker.system.fileName()
      );

      expect(actual).toEqual(relativePath);

      spy.mockReset();
      spy.mockRestore();
    });
  });
});

describe("formatPath()", () => {
  it("should convert unix style paths to windows style", () => {
    const pathSegments = Array(10).map(_ => faker.system.fileName());
    const sourceDir = pathSegments.join("/");
    const expected = pathSegments.join("\\");

    const actual = formatPath(sourceDir, "\\");

    expect(actual).toEqual(expected);
  });

  it("should convert windows style paths to unix style", () => {
    const pathSegments = Array(10).map(_ => faker.system.fileName());
    const sourceDir = pathSegments.join("\\");
    const expected = pathSegments.join("/");

    const actual = formatPath(sourceDir, "/");

    expect(actual).toEqual(expected);
  });

  it("should preserve windows style paths", () => {
    const pathSegments = Array(10).map(_ => faker.system.fileName());
    const expected = pathSegments.join("\\");

    const actual = formatPath(expected, "\\");

    expect(actual).toEqual(expected);
  });

  it("should preservce unix style paths", () => {
    const pathSegments = Array(10).map(_ => faker.system.fileName());
    const expected = pathSegments.join("/");

    const actual = formatPath(expected, "/");

    expect(actual).toEqual(expected);
  });
});
