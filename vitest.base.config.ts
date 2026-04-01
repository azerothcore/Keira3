import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// __dirname is the workspace root (location of vitest.base.config.ts)
const rootDir = __dirname;

const JASMINE_COMPAT_MODULE = '\0@keira/jasmine-compat';

function jasmineCompatPlugin() {
  return {
    name: 'keira-jasmine-compat',
    enforce: 'post' as const,
    resolveId(id: string) {
      if (id === '@keira/jasmine-compat') return JASMINE_COMPAT_MODULE;
      return undefined;
    },
    load(id: string) {
      if (id !== JASMINE_COMPAT_MODULE) return undefined;
      return `
import '@angular/compiler';
import { vi, expect, it, describe } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed();

expect.extend({
  toHaveBeenCalledOnceWith(received, ...args) {
    const callCount = received.mock?.calls?.length ?? 0;
    const argsMatch = callCount === 1 && this.equals(received.mock.calls[0], args);
    return {
      pass: argsMatch,
      message: () =>
        argsMatch
          ? \`Expected not to have been called once with the specified args\`
          : \`Expected to have been called once with the specified args, but was called \${callCount} times\`,
    };
  },
  toBeTrue(received) {
    return { pass: received === true, message: () => \`Expected \${received} to be true\` };
  },
  toBeFalse(received) {
    return { pass: received === false, message: () => \`Expected \${received} to be false\` };
  },
  toHaveClass(received, className) {
    const el = received;
    const pass = el && el.classList && el.classList.contains(className);
    return {
      pass,
      message: () => pass
        ? \`Expected element not to have class '\${className}'\`
        : \`Expected element to have class '\${className}', but it has: '\${el?.classList?.toString() || ''}'\`,
    };
  },
  toThrowError(received, expected) {
    let thrown = null;
    try { received(); } catch (e) { thrown = e; }
    const pass = thrown !== null && (
      expected === undefined ||
      (typeof expected === 'string' && thrown.message?.includes(expected)) ||
      (expected instanceof RegExp && expected.test(thrown.message)) ||
      (typeof expected === 'function' && thrown instanceof expected)
    );
    return { pass, message: () => pass ? \`Expected not to throw\` : \`Expected to throw\${expected ? ' matching ' + expected : ''}, got: \${thrown}\` };
  },
});

function makeSpyCompatible(spy) {
  const compat = spy;
  compat.and = {
    returnValue: (val) => { spy.mockReturnValue(val); return compat; },
    returnValues: (...vals) => { vals.forEach((val) => spy.mockReturnValueOnce(val)); return compat; },
    callFake: (fn) => { spy.mockImplementation(fn); return compat; },
    callThrough: () => { spy.mockRestore(); return compat; },
    throwError: (err) => { spy.mockImplementation(() => { throw typeof err === 'string' ? new Error(err) : err; }); return compat; },
    stub: () => { spy.mockImplementation(() => undefined); return compat; },
  };
  compat.calls = {
    count: () => spy.mock.calls.length,
    any: () => spy.mock.calls.length > 0,
    allArgs: () => spy.mock.calls,
    argsFor: (index) => spy.mock.calls[index],
    mostRecent: () => ({ args: spy.mock.calls[spy.mock.calls.length - 1], returnValue: spy.mock.results[spy.mock.results.length - 1]?.value }),
    first: () => ({ args: spy.mock.calls[0], returnValue: spy.mock.results[0]?.value }),
    reset: () => spy.mockClear(),
  };
  return compat;
}

// Jasmine's spyOn does NOT call through by default — it replaces with a stub
export const spyOn = (obj, method) => {
  const original = obj[method];
  const spy = vi.spyOn(obj, method).mockImplementation(() => undefined);
  const compat = makeSpyCompatible(spy);
  compat.and.callThrough = () => { spy.mockImplementation(typeof original === 'function' ? original.bind(obj) : original); return compat; };
  return compat;
};

// Jasmine's spyOnProperty — spy on property getter/setter
export const spyOnProperty = (obj, propName, accessType = 'get') => {
  const spy = vi.spyOn(obj, propName, accessType).mockReturnValue(undefined);
  return makeSpyCompatible(spy);
};

export const jasmine = {
  createSpy: (_name, fn) => makeSpyCompatible(vi.fn(fn)),
  createSpyObj: (baseName, methods) => {
    const obj = {};
    if (Array.isArray(methods)) {
      methods.forEach((method) => { obj[method] = makeSpyCompatible(vi.fn()); });
    } else {
      Object.entries(methods).forEach(([key, val]) => {
        const spy = makeSpyCompatible(vi.fn());
        spy.and.returnValue(val);
        obj[key] = spy;
      });
    }
    return obj;
  },
  objectContaining: (obj) => expect.objectContaining(obj),
  arrayContaining: (arr) => expect.arrayContaining(arr),
  stringContaining: (str) => expect.stringContaining(str),
  any: (ctor) => expect.any(ctor),
  anything: () => expect.anything(),
  Spy: class {},
};

// Make jasmine and spyOn available as globals for non-spec files that reference them at module level
globalThis.jasmine = jasmine;
globalThis.spyOn = spyOn;
globalThis.spyOnProperty = spyOnProperty;

// xit/xdescribe — Jasmine's skip functions
globalThis.xit = it.skip.bind(it);
globalThis.xdescribe = describe.skip.bind(describe);
globalThis.pending = () => { throw new Error('pending'); };

// squel is used as a global in mysql-query.service.ts (loaded as a script in the original Karma setup)
import * as squelModule from 'squel';
globalThis.squel = squelModule;

// Polyfill innerText for jsdom (jsdom doesn't implement innerText)
if (typeof HTMLElement !== 'undefined') {
  const BLK = '\\x01'; // sentinel for block-boundary newlines
  const blockTags = new Set(['DIV','P','H1','H2','H3','H4','H5','H6','LI','TR','BLOCKQUOTE','SECTION','ARTICLE','HEADER','FOOTER','NAV','UL','OL','DL','TABLE','HR','FIGCAPTION','FIGURE','DETAILS','SUMMARY']);
  function getInnerTextPoly(node, insidePre) {
    if (node.nodeType === 3) return node.nodeValue || '';
    if (node.nodeType !== 1) return '';
    const tag = node.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') return '';
    if (tag === 'BR') return '\\n';
    const isPre = tag === 'PRE';
    const isBlock = blockTags.has(tag) || isPre;
    const childPre = insidePre || isPre;
    let text = '';
    for (const child of node.childNodes) {
      text += getInnerTextPoly(child, childPre);
    }
    if (!insidePre && !isPre) {
      text = text.replace(/[ \\t]+/g, ' ');
    }
    if (isBlock) {
      text = BLK + text + BLK;
    }
    return text;
  }
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get() {
      let text = '';
      for (const child of this.childNodes) {
        text += getInnerTextPoly(child, false);
      }
      // Convert block sentinels to newlines, collapsing consecutive ones
      text = text.replace(new RegExp(BLK + '+', 'g'), '\\n');
      // Trim each line of horizontal whitespace
      const lines = text.split('\\n');
      const trimmed = lines.map(l => l.trim()).join('\\n');
      // Strip leading/trailing block-boundary newlines
      return trimmed.replace(/^\\n+/, '').replace(/\\n$/, '');
    },
    set(value) { this.textContent = value; },
    configurable: true,
  });
}
`;
    },
    transform(code: string, id: string) {
      if (/\.spec\.[tj]s(\?.*)?$/.test(id) && !id.includes('node_modules')) {
        return { code: `import { spyOn, jasmine } from '@keira/jasmine-compat';\n${code}` };
      }
      return undefined;
    },
  };
}

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
    plugins: [jasmineCompatPlugin(), angular({ tsconfig: options.tsconfig ?? './tsconfig.spec.json' })],
    resolve: {
      alias: buildAliasFromTsconfig(),
    },
    test: {
      globals: true,
      pool: 'forks',
      environment: 'jsdom',
      include: ['**/*.spec.ts'],
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
