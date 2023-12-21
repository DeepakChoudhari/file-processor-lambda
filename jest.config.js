module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/file-processor-app/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
