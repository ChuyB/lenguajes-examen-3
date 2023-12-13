/**  @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  transform: {
    "\\.[jt]sx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "(.+)\\.js": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest",
  testEnvironment: "node",
};
