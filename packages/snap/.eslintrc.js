module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    'jsdoc/tag-lines': 'off',
  },

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['snap.config.ts'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        // This allows importing the `Text` JSX component.
        '@typescript-eslint/no-shadow': [
          'error',
          {
            allow: ['Text'],
          },
        ],
      },
    },

    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      env: { browser: true },
      rules: {
        'no-restricted-globals': 'off',
        'no-void': 'off',
        'require-unicode-regexp': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'id-length': 'off',
        'id-denylist': 'off',
        'jsdoc/require-description': 'off',
        'jsdoc/require-returns': 'off',
        'jsdoc/require-param-description': 'off',
        'jsdoc/match-description': 'off',
        'no-empty': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
      },
    },
    {
      files: ['src/test/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      env: { jest: true, browser: true, node: true },
      rules: {
        'no-restricted-globals': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/ban-types': 'off',
        'no-control-regex': 'off',
        'require-unicode-regexp': 'off',
        'id-length': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'dist/'],
};
