module.exports = {
  modulePaths: ['<rootDir>/src/', '<rootDir>/frontend/'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverage: false,
  testMatch: ['**/*.spec.(ts|tsx)'],
  setupFiles: ['<rootDir>/test/setup.ts']
}
