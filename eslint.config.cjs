module.exports = [
  {
    languageOptions: { ecmaVersion: 'latest' },
    ignores: ['node_modules/**', 'coverage/**'],
    plugins: { prettier: require('eslint-plugin-prettier') },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
