// ESLint Flat Config (ESM)
// Required packages:
//   pnpm add -D eslint typescript-eslint eslint-plugin-vue vue-eslint-parser
//             eslint-plugin-import eslint-plugin-security eslint-config-prettier

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import importPlugin from 'eslint-plugin-import';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Vue
  ...vue.configs['flat/recommended'],

  // Files-specific config for .vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },

  // Plugins
  {
    plugins: {
      import: importPlugin,
      security,
    },
    rules: {
      // Import order
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // Security
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-object-injection': 'off', // false positive 多い

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Vue
      'vue/multi-word-component-names': 'off', // ページ単位の単一名コンポーネントを許容
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-v-html': 'error',
    },
  },

  // Prettier (last to override formatting rules)
  prettier,

  // Ignore patterns
  {
    ignores: [
      'dist',
      'build',
      'coverage',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'src/api/generated/**', // orval generated
    ],
  }
);
