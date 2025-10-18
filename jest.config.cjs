const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.ts',
    '\\.(svg|png|jpg|jpeg|gif|webp|avif)$': '<rootDir>/tests/__mocks__/fileMock.ts',
  },
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testMatch: ['**/?(*.)+(unit|integration|e2e).test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'cms/src/**/*.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.app.json',
      useESM: true,
      isolatedModules: true,
    },
  },
};

module.exports = config;
