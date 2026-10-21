import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '.local/**', 'coverage/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node } },
  { files: ['client/src/**/*.{js,jsx}'], languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } } },
];
