import { TestBed } from '@angular/core/testing';
import { parseTheme, THEME_KEY, THEME_VARIABLES, ThemeService } from './theme.service';

describe('parseTheme', () => {
  it('reads a theme, trimming it', () => {
    expect(parseTheme('{"name":" Night ","base":"dark","colors":{"--keira-content-bg":" #101010 "}}')).toEqual({
      name: 'Night',
      base: 'dark',
      colors: { '--keira-content-bg': '#101010' },
    });
  });

  it('says what is wrong', () => {
    expect(() => parseTheme('{')).toThrow('Not valid JSON.');
    expect(() => parseTheme('null')).toThrow('needs a "name"');
    expect(() => parseTheme('{"name":"dark","base":"dark","colors":{}}')).toThrow('built-in');
    expect(() => parseTheme('{"name":"A","base":"blue","colors":{}}')).toThrow('"base"');
    expect(() => parseTheme('{"name":"A","base":"light"}')).toThrow('"colors"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":[]}')).toThrow('"colors"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"color":"red"}}')).toThrow('"color"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"--x":"red; } body { display: none"}}')).toThrow('"--x"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"--x":5}}')).toThrow('"--x"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"--x":"url(evil)"}}')).toThrow('"--x"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"--x":"rgb(1, 2, 3"}}')).toThrow('"--x"');
    expect(() => parseTheme('{"name":"A","base":"light","colors":{"--x":"a) b("}}')).toThrow('"--x"');
    expect(parseTheme('{"name":"A","base":"light","colors":{"--x":"rgba(1, 2, 3, 0.5)"}}').colors['--x']).toBe('rgba(1, 2, 3, 0.5)');
  });
});

describe('ThemeService', () => {
  const dark = { matches: false, addEventListener: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    document.getElementById('keira-custom-theme')?.remove();
    window.matchMedia = vi.fn(() => dark) as never;
  });

  it("follows the computer's mode by default, and keeps the choice", () => {
    const service = TestBed.inject(ThemeService);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(service.dark()).toBe(false);
    dark.matches = true;
    (dark.addEventListener.mock.calls[0][1] as () => void)();
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(service.dark()).toBe(true);
    dark.matches = false;
    service.select('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem(THEME_KEY) as string).choice).toBe('dark');
    service.select('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('imports, applies, exports and removes themes of one own', () => {
    const service = TestBed.inject(ThemeService);
    service.importTheme('{"name":"Night","base":"dark","colors":{"--keira-content-bg":"#101010"}}');
    expect(service.choice()).toBe('Night');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(document.getElementById('keira-custom-theme')?.textContent).toBe(':root[data-bs-theme] { --keira-content-bg: #101010; }');
    // the same name replaces it
    service.importTheme('{"name":"Night","base":"light","colors":{}}');
    expect(service.custom()).toHaveLength(1);
    expect(document.getElementById('keira-custom-theme')?.textContent).toBe('');
    expect(JSON.parse(service.exportTheme('Night'))).toEqual({ name: 'Night', base: 'light', colors: {} });
    expect(JSON.parse(service.exportTheme('dark'))).toEqual({ name: 'My theme', base: 'dark', colors: THEME_VARIABLES });
    expect(JSON.parse(service.exportTheme('system')).base).toBe('light');
    // kept on this computer (broken ones left out)
    const stored = JSON.parse(localStorage.getItem(THEME_KEY) as string);
    localStorage.setItem(THEME_KEY, JSON.stringify({ ...stored, custom: [...stored.custom, { name: 'bad' }] }));
    TestBed.resetTestingModule();
    const again = TestBed.inject(ThemeService);
    expect(again.custom().map((theme) => theme.name)).toEqual(['Night']);
    again.select('light');
    again.removeTheme('Night');
    expect(again.choice()).toBe('light');
    again.importTheme('{"name":"Other","base":"light","colors":{}}');
    again.removeTheme('Other');
    expect(again.choice()).toBe('system');
  });

  it('survives broken or blocked storage, and no media queries', () => {
    localStorage.setItem(THEME_KEY, '{broken');
    window.matchMedia = undefined as never;
    const service = TestBed.inject(ThemeService);
    expect(service.choice()).toBe('system');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => service.select('dark')).not.toThrow();
    blocked.mockRestore();
    TestBed.resetTestingModule();
    localStorage.setItem(THEME_KEY, JSON.stringify({ choice: 5, custom: 'x' }));
    expect(TestBed.inject(ThemeService).choice()).toBe('system');
  });
});
