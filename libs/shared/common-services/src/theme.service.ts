import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

/** A theme: a name, the built-in one it starts from, and the colours it changes (CSS variables: `--keira-…`, `--bs-…`). */
export interface KeiraTheme {
  name: string;
  base: 'light' | 'dark';
  colors: Record<string, string>;
}

/** The themes Keira comes with ("system" follows the computer's light or dark mode). */
export const BUILT_IN_THEMES = ['system', 'light', 'dark'] as const;

export const THEME_KEY = 'keira3.theme';

/** The colours a theme can change, with the light theme's values (a starting point for a theme of one's own). */
export const THEME_VARIABLES: Record<string, string> = {
  '--keira-page-bg': '#e3e3e3',
  '--keira-content-bg': '#fafafa',
  '--keira-row-bg': '#f7f7f7',
  '--keira-row-hover': '#eeeeee',
  '--keira-border': '#e7e7e7',
  '--keira-muted': '#666666',
  '--keira-accent': '#8261a7',
  '--keira-link': '#5d176a',
  '--keira-code-bg': '#efefef',
  '--keira-top-bar-bg': '#000000',
  '--bs-body-bg': '#ffffff',
  '--bs-body-color': '#212529',
  '--bs-primary': '#0d6efd',
  '--bs-border-color': '#dee2e6',
};

/** A value a theme may give a variable: colours and plain lengths, nothing that could end the rule. */
const SAFE_VALUE = /^[#\w\s.,%()-]{1,64}$/;

/** A value fit for a theme: safe characters, balanced brackets, and nothing loaded (no `url(`). */
function safeValue(value: string): boolean {
  let depth = 0;
  for (const char of value) {
    depth += char === '(' ? 1 : char === ')' ? -1 : 0;
    if (depth < 0) {
      return false;
    }
  }
  return SAFE_VALUE.test(value) && depth === 0 && !/url\s*\(/i.test(value);
}

/** Reads a theme someone made (JSON), or says what's wrong with it. */
export function parseTheme(json: string): KeiraTheme {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Not valid JSON.');
  }
  const theme = data as Partial<KeiraTheme>;
  if (!theme || typeof theme.name !== 'string' || !theme.name.trim()) {
    throw new Error('The theme needs a "name".');
  }
  if ((BUILT_IN_THEMES as readonly string[]).includes(theme.name.trim())) {
    throw new Error(`"${theme.name}" is the name of a built-in theme.`);
  }
  if (theme.base !== 'light' && theme.base !== 'dark') {
    throw new Error('The theme\'s "base" must be "light" or "dark".');
  }
  if (!theme.colors || typeof theme.colors !== 'object' || Array.isArray(theme.colors)) {
    throw new Error('The theme needs "colors": { "--variable": "value" }.');
  }
  const colors: Record<string, string> = {};
  for (const [name, value] of Object.entries(theme.colors)) {
    if (!/^--[\w-]{1,48}$/.test(name) || typeof value !== 'string' || !safeValue(value)) {
      throw new Error(`"${name}" can't be set to "${String(value)}".`);
    }
    colors[name] = value.trim();
  }
  return { name: theme.name.trim(), base: theme.base, colors };
}

/**
 * Keira's look: light, dark, the computer's mode, or a theme someone made (imported as JSON, kept on this computer).
 * Sets Bootstrap's `data-bs-theme` on the page, and a theme's colours as CSS variables over it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly stored = this.load();
  /** The theme chosen: a built-in one or a custom one's name. */
  readonly choice = signal<string>(this.stored.choice);
  readonly custom = signal<KeiraTheme[]>(this.stored.custom);
  /** Whether the page is dark now (for what draws its own colours: the SQL editor…). */
  readonly dark = signal(false);

  constructor() {
    this.media?.addEventListener?.('change', () => this.apply());
    this.apply();
  }

  select(choice: string): void {
    this.choice.set(choice);
    this.save();
    this.apply();
  }

  /** Adds a theme (replacing one of the same name) and picks it. */
  importTheme(json: string): KeiraTheme {
    const theme = parseTheme(json);
    this.custom.set([...this.custom().filter((other) => other.name !== theme.name), theme]);
    this.select(theme.name);
    return theme;
  }

  removeTheme(name: string): void {
    this.custom.set(this.custom().filter((theme) => theme.name !== name));
    this.select(this.choice() === name ? 'system' : this.choice());
  }

  /** A theme as JSON (to share it); a built-in one gives a template of every colour. */
  exportTheme(name: string): string {
    const theme = this.custom().find((other) => other.name === name) ?? {
      name: 'My theme',
      base: name === 'dark' ? 'dark' : 'light',
      colors: THEME_VARIABLES,
    };
    return JSON.stringify(theme, null, 2);
  }

  /** Puts the theme chosen on the page. */
  apply(): void {
    const choice = this.choice();
    const theme = this.custom().find((other) => other.name === choice);
    const base = theme?.base ?? (choice === 'light' || choice === 'dark' ? choice : this.media?.matches ? 'dark' : 'light');
    const root = this.document.documentElement;
    root.setAttribute('data-bs-theme', base);
    this.dark.set(base === 'dark');
    let style = this.document.getElementById('keira-custom-theme');
    if (!style) {
      style = this.document.createElement('style');
      style.id = 'keira-custom-theme';
      this.document.head.appendChild(style);
    }
    const rules = Object.entries(theme?.colors ?? {})
      .map(([name, value]) => `${name}: ${value};`)
      .join(' ');
    style.textContent = rules ? `:root[data-bs-theme] { ${rules} }` : '';
  }

  private load(): { choice: string; custom: KeiraTheme[] } {
    try {
      const stored = JSON.parse(localStorage.getItem(THEME_KEY) ?? '{}') as { choice?: unknown; custom?: unknown };
      const custom = (Array.isArray(stored.custom) ? stored.custom : []).flatMap((theme) => {
        try {
          return [parseTheme(JSON.stringify(theme))];
        } catch {
          return [];
        }
      });
      return { choice: typeof stored.choice === 'string' ? stored.choice : 'system', custom };
    } catch {
      return { choice: 'system', custom: [] };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify({ choice: this.choice(), custom: this.custom() }));
    } catch {
      // (storage blocked: the theme lasts until Keira closes)
    }
  }
}
