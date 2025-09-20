import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { jsWithTsESM: defaults } = require('ts-jest/presets');

/** @type {import('jest').Config} */
const config = {
  ...defaults,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@monynha/ui$': '<rootDir>/packages/ui/src/index.ts',
    '^@monynha/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.app.json',
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
