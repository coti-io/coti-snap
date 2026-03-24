module.exports = {
  preset: '@metamask/snaps-jest',
  coverageProvider: 'v8',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
    '^.+\\.svg$': 'jest-transform-stub',
  },
};
