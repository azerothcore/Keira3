import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/vitest.config.ts', '**/src/environments/*'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['src/tsconfig.*?.json'],
      },
    },
  },
];
