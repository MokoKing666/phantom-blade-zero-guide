import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dist-ssr',
      'node_modules',
      'coverage',
      'playwright-report',
      'test-results',
      'src/generated',
      'scripts/vendor',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 浏览器侧
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Node 侧（构建脚本、配置文件、e2e）
  {
    files: ['scripts/**/*.{mjs,ts}', '*.config.{ts,js}', 'e2e/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
  },

  // Suspense 统一包装：禁止页面/组件直接使用 Suspense
  {
    files: ['src/pages/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: ['src/components/common/SsrSuspense.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['Suspense'],
              message: '请使用 SsrSuspense：其 fallback 带 data-ssr-fallback 标记，SSG 依赖该标记判定产物有效性。',
            },
          ],
        },
      ],
    },
  },
);
