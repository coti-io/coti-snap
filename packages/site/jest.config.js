module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-fixed-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!(wagmi)|@wagmi)/",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testMatch: ['<rootDir>/src/test/**/*.(spec|test).(ts|tsx|js|jsx)'],
};
