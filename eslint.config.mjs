// @ts-check

import pluginJs from '@eslint/js'
import * as tsParser from '@typescript-eslint/parser'
import pluginImportX from 'eslint-plugin-import-x'
import pluginPerfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'
import * as tsEslint from 'typescript-eslint'

// Define common file patterns for reuse
const allJsTs = ['**/*.{js,mjs,cjs,ts,mts}']
const allTs = ['**/*.{ts,mts}']

export default tsEslint.config(
  // Base configuration - ignore patterns
  {
    ignores: [
      '**/.smithery/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
    ],
  },

  // Common configuration for all JavaScript/TypeScript files
  {
    files: allJsTs,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Import plugin configuration
  {
    files: allJsTs,
    extends: [
      pluginImportX.flatConfigs.recommended,
      pluginImportX.flatConfigs.typescript,
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      // Disable problematic import rules that conflict with TypeScript
      'import-x/default': 'off',
      'import-x/namespace': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-duplicates': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-extraneous-dependencies': 'off',

      // Enable non-problematic import rules
      'import-x/first': 'error',
    },
  },

  // JavaScript recommended rules
  pluginJs.configs.recommended,

  // TypeScript configuration for packages
  {
    files: allTs,
    extends: [
      tsEslint.configs.recommendedTypeChecked,
      tsEslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/only-throw-error': 'off',

      // Enforce consistent type assertions
      '@typescript-eslint/consistent-type-assertions': 'error',

      // Enforce consistent type definitions
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // Prevent type-only imports from causing side effects
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Enforce consistent usage of type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Enforce consistent naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Enforce PascalCase for types, interfaces, enums, and type parameters
        {
          selector: ['typeLike'],
          format: ['PascalCase'],
        },
        // Enforce camelCase for methods, properties, and variables
        {
          selector: ['method', 'accessor', 'parameter'],
          format: ['camelCase'],
        },
        // Allowing both camelCase and PascalCase for functions.
        {
          selector: ['function'],
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // Disallow unused variables and enforce their removal
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prevent usage of any type when it can be avoided
      '@typescript-eslint/no-explicit-any': 'warn',

      // Ensure promises are properly handled
      '@typescript-eslint/no-floating-promises': 'error',

      // Ensure proper usage of awaited values
      '@typescript-eslint/await-thenable': 'error',

      // Prevent misused promises
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
          checksConditionals: true,
        },
      ],
    },
  },

  // Code organization and formatting rules
  {
    plugins: {
      perfectionist: pluginPerfectionist,
    },
    rules: {
      // Import sorting
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
            'unknown',
          ],
          newlinesBetween: 'always',
        },
      ],
      'perfectionist/sort-named-imports': [
        'error',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-exports': [
        'error',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-named-exports': [
        'error',
        { type: 'natural', order: 'asc' },
      ],

      // Type organization
      'perfectionist/sort-interfaces': [
        'error',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-union-types': [
        'error',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-object-types': [
        'error',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-classes': [
        'error',
        { type: 'natural', order: 'asc' },
      ],

      // JSX and object organization
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          objectDeclarations: false,
        },
      ],
    },
  },

  // Common best practices for all files
  {
    files: allJsTs,
    rules: {
      // Enforce a consistent code style
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': ['error', { array: false, object: true }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': ['error', 'always'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // Error prevention
      'no-use-before-define': ['error', { functions: false }],
      'no-param-reassign': [
        'error',
        { props: true, ignorePropertyModificationsFor: ['state'] },
      ],
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',

      // Modern JavaScript features
      'prefer-arrow-callback': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-spread': 'error',
      'prefer-regex-literals': 'error',
    },
  },
)
