/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/"],
  roots: ["<rootDir>/01-concurrent-fibonacci"],
};
