import { TestBed } from '@angular/core/testing';
import { EditorSettingsService } from '@keira/shared/common-services';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { EditorSettingsComponent } from './editor-settings.component';

describe('EditorSettingsComponent', () => {
  it('sets how execute & copy, flags and each search work', () => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [EditorSettingsComponent, TranslateTestingModule] });
    const fixture = TestBed.createComponent(EditorSettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(EditorSettingsService);
    const input = (id: string) => el.querySelector<HTMLInputElement>(`[data-testid="${id}"]`) as HTMLInputElement;
    const set = (id: string, value: string) => {
      input(id).value = value;
      input(id).dispatchEvent(new Event('change'));
      fixture.detectChanges();
    };

    expect(input('copy-only-on-success').checked).toBe(true);
    input('copy-only-on-success').click();
    input('bitwise-flags').click();
    expect(service.settings()).toEqual(expect.objectContaining({ copyOnlyOnSuccess: false, bitwiseFlags: false }));

    input('search-default-numbers').click();
    fixture.detectChanges();
    // the creature search follows the default (shown faded) until set itself
    expect(input('search-creature_template-numbers').checked).toBe(true);
    expect(input('search-creature_template-numbers').classList).toContain('opacity-50');
    input('search-creature_template-names').click();
    fixture.detectChanges();
    expect(input('search-creature_template-names').classList).not.toContain('opacity-50');
    expect(el.querySelector('[data-testid="search-default"]')?.textContent).toContain('SETTINGS.SEARCH_DEFAULT');

    set('search-creature_template-limit', '20');
    expect(service.search('creature_template')).toEqual({ exactNumbers: true, exactNames: true, limit: 20 });
    set('search-creature_template-limit', '');
    expect(service.search('creature_template').limit).toBe(50);
    expect(input('search-creature_template-limit').placeholder).toBe('50');
    set('search-creature_template-limit', '-3');
    expect(service.settings().search['creature_template'].limit).toBeUndefined();
    localStorage.clear();
  });
});
