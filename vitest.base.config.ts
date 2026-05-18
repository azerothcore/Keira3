import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// __dirname is the workspace root (location of vitest.base.config.ts)
const rootDir = __dirname;

function buildAliasFromTsconfig(): Record<string, string> {
  const tsconfigPath = resolve(rootDir, 'tsconfig.base.json');
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
  const paths: Record<string, string[]> = tsconfig?.compilerOptions?.paths ?? {};
  const alias: Record<string, string> = {};
  for (const [key, values] of Object.entries(paths)) {
    if (values.length > 0) {
      // Strip trailing /* from key and value
      const aliasKey = key.replace(/\/\*$/, '');
      const aliasValue = resolve(rootDir, values[0].replace(/\/\*$/, ''));
      alias[aliasKey] = aliasValue;
    }
  }
  return alias;
}

export interface VitestConfigOptions {
  coverageDir: string;
  coverageExclude?: string[];
  tsconfig?: string;
}

export function createVitestConfig(options: VitestConfigOptions) {
  return defineConfig({
    plugins: [angular({ tsconfig: options.tsconfig ?? './tsconfig.spec.json' })],
    resolve: {
      alias: buildAliasFromTsconfig(),
    },
    test: {
      globals: true,
      pool: 'forks',
      environment: 'jsdom',
      include: ['**/*.spec.ts'],
      setupFiles: [resolve(rootDir, 'test-setup.ts')],
      reporters: ['default'],
      dangerouslyIgnoreUnhandledErrors: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        reportsDirectory: resolve(rootDir, options.coverageDir),
        exclude: ['node_modules/**', '**/index.ts', '**/*.d.ts', ...(options.coverageExclude ?? [])],
        thresholds: {
          statements: 100,
          lines: 100,
          branches: 100,
          functions: 100,
        },
      },
    },
  });
}
