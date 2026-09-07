import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import nx from '@nx/eslint-plugin';
import typescript from '@typescript-eslint/eslint-plugin';

// project configs extend this one. Nx passes them via --config from the workspace root,
// so their `ignores` patterns need a **/ prefix to match files inside the project
export default [
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:app-keira',
              onlyDependOnLibsWithTags: ['scope:main-window', 'scope:features', 'scope:shared'],
            },
            {
              sourceTag: 'scope:main-window',
              onlyDependOnLibsWithTags: ['scope:features', 'scope:shared'],
            },
            {
              sourceTag: 'scope:features',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  ...typescript.configs['flat/recommended'].map((config) => ({ files: ['**/*.ts'], ...config })),
  {
    files: ['**/*.ts'],
    plugins: { '@angular-eslint': angular },
    processor: angularTemplate.processors['extract-inline-html'],
    rules: {
      ...angular.configs.recommended.rules,
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'keira',
          style: 'kebab-case',
          type: 'element',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'keira',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-duplicate-imports': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'prefer-const': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'info', 'error'],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.po.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angularTemplateParser },
    plugins: { '@angular-eslint/template': angularTemplate },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.component.html'],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
];
