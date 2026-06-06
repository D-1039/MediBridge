module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/docs/**"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
};
