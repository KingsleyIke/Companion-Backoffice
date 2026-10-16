const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  // Nx 19.8 leaves these configs unscoped, which runs TypeScript rules on Angular templates.
  ...nx.configs['flat/typescript'].map((config) => ({
    ...config,
    files: config.files ?? ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
  })),
  ...nx.configs['flat/javascript'].map((config) => ({
    ...config,
    files: config.files ?? ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
  })),
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
