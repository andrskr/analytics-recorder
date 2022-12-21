module.exports = {
  ignorePatterns: ['node_modules', 'dist', 'coverage', 'playground', '**/*.d.ts'],
  plugins: ['import', 'sonarjs', 'react', 'react-hooks', 'jsx-a11y', 'prettier'],
  extends: [
    'eslint:recommended',
    'airbnb',
    'plugin:import/recommended',
    'plugin:sonarjs/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': ['.cjs'],
  },
  overrides: [
    {
      files: ['*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json'],
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
        'prettier',
      ],
      settings: {
        'import/extensions': ['.cjs', '.ts', '.tsx'],
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
          typescript: {
            project: ['tsconfig.json', 'tsconfig.node.json'],
          },
          node: {
            extensions: ['.cjs', '.ts', '.tsx'],
          },
        },
      },
      rules: {
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            format: null,
            selector: 'parameter',
            modifiers: ['unused'],
            leadingUnderscore: 'require',
          },
        ],
        '@typescript-eslint/no-namespace': 'off',
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            cjs: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              'vite.config.ts',
              '**/__tests__/**/*.ts?(x)',
              '**/?(*.)+(spec|test).ts?(x)',
            ],
          },
        ],
      },
    },
    {
      files: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
      env: {
        'jest/globals': true,
      },
      plugins: ['jest', 'testing-library'],
      extends: ['plugin:jest/recommended', 'plugin:testing-library/react'],
    },
  ],
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': 'error',
    'no-restricted-syntax': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/**/*.cjs'],
      },
    ],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
        pathGroups: [
          {
            pattern: '~/**',
            group: 'internal',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        warnOnUnassignedImports: true,
      },
    ],
    'no-restricted-exports': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
  },
};
