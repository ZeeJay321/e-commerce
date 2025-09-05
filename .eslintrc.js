module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: '/Users/zainulabidin/Documents/Qbatch/e-commerce-app/tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended'
  ],
  overrides: [
    {
      files: ['.eslintrc.{js,cjs,ts,cts}'],
      env: { node: true },
      parserOptions: { sourceType: 'script', project: null }
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': 'off',
        'jsx-quotes': 'off'
      }
    }
  ],
  rules: {
    'comma-dangle': [
      'error',
      'never'
    ],
    quotes: ['error', 'single'],
    'no-trailing-spaces': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-param-reassign': 0,
    'react/function-component-definition': 0,
    'react/require-default-props': 0,
    'react/forbid-prop-types': 0,
    'no-nested-ternary': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-underscore-dangle': 0,
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 'off',

    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/prefer-default-export': 'off',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        pathGroups: [
          { pattern: 'react', group: 'builtin', position: 'before' },
          { pattern: 'next/**', group: 'external', position: 'before' },
          { pattern: '~/**', group: 'internal' },
          { pattern: '@/**', group: 'internal' }
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always-and-inside-groups'
      }
    ]
  }
};
