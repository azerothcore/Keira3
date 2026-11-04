import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { WorldEditorService } from '../world-editor.service';
import { ASSET_SEARCH_DELAY, AssetBrowserComponent, AssetPick, RECENT_ASSETS_KEY } from './asset-browser.component';
import { Composition, CompositionsService } from './compositions';

class AssetPage extends PageObject<AssetBrowserComponent> {
  el<T extends HTMLElement>(id: string, assert = true): T {
    return this.query<T>(`[data-testid="${id}"]`, assert);
  }
  async settle(ms = 0): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    this.fixture.detectChanges();
  }
}

describe(AssetBrowserComponent.name, () => {
  const kobold = { entry: 6, name: 'Kobold Vermin', displayId: 60, scale: 1, group: 7 };
  const wolf = { entry: 299, name: 'Young Wolf', displayId: 61, scale: 1, group: 1 };
  const chest = { entry: 55, name: '', displayId: 3, scale: 1, group: 3 };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  const setup = async (recent?: string) => {
    localStorage.clear();
    if (recent !== undefined) {
      localStorage.setItem(RECENT_ASSETS_KEY, recent);
    }
    const browseTemplates = vi.fn((type: string) =>
      Promise.resolve(
        type === 'creature'
          ? [kobold, wolf]
          : [chest, { entry: 56, name: 'Odd', displayId: 0, scale: 1 }, { ...chest, entry: 57, group: 99 }],
      ),
    );
    TestBed.configureTestingModule({
      imports: [AssetBrowserComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: WorldEditorService, useValue: { browseTemplates } }],
    });
    const page = new AssetPage(TestBed.createComponent(AssetBrowserComponent));
    const picks: AssetPick[] = [];
    const browser = page.fixture.componentInstance;
    browser.picked.subscribe((pick) => picks.push(pick));
    const compositions: Composition[] = [];
    const saved: string[] = [];
    browser.compositionPicked.subscribe((composition) => compositions.push(composition));
    browser.compositionSaved.subscribe((name) => saved.push(name));
    page.fixture.detectChanges();
    await page.settle();
    return { page, browseTemplates, picks, compositions, saved };
  };

  it('lists the creature templates by type, searched and of one type, picked and kept as recently used', async () => {
    const { page, browseTemplates, picks } = await setup();
    expect(browseTemplates).toHaveBeenCalledWith('creature', null, '');
    expect(page.el('asset-section-1').textContent).toContain('BEAST');
    expect(page.el('asset-section-7').textContent).toContain('HUMANOID');

    const search = page.el<HTMLInputElement>('asset-search');
    search.value = 'kob';
    search.dispatchEvent(new Event('input'));
    await page.settle(ASSET_SEARCH_DELAY);
    expect(browseTemplates).toHaveBeenLastCalledWith('creature', null, 'kob');

    const group = page.el<HTMLSelectElement>('asset-group');
    group.selectedIndex = 1;
    group.dispatchEvent(new Event('change'));
    await page.settle();
    expect(browseTemplates.mock.calls.at(-1)?.[1]).not.toBeNull();

    page.el('asset-6').click();
    await page.settle();
    expect(picks).toEqual([{ type: 'creature', template: kobold }]);
    expect(page.el('asset-recent-6')).toBeTruthy();
    page.el('asset-299').click();
    page.el('asset-6').click();
    await page.settle();
    expect(JSON.parse(localStorage.getItem(RECENT_ASSETS_KEY) as string).creature.map((t: { entry: number }) => t.entry)).toEqual([6, 299]);
    page.el('asset-recent-299').click();
    expect(picks.at(-1)?.template).toEqual(wolf);
  });

  it('lists the gameobject templates, and says when there are none', async () => {
    const { page, browseTemplates } = await setup('{"gameobject":[{"entry":55,"name":"","displayId":3,"scale":1}]}');
    page.el('asset-mode-gameobject').click();
    await page.settle();
    expect(browseTemplates).toHaveBeenLastCalledWith('gameobject', null, '');
    expect(page.el('asset-section-3').textContent).toContain('CHEST');
    expect(page.el('asset-section-0').textContent).toContain('DOOR');
    expect(page.el('asset-section-99').textContent).toContain('99');
    expect(page.el('asset-recent-55').textContent).toContain('?');

    browseTemplates.mockImplementation(() => Promise.reject(new Error('down')));
    page.el('asset-mode-creature').click();
    await page.settle();
    expect(page.el('asset-none')).toBeTruthy();
  });

  it('keeps only the templates of the latest search, and works without a usable storage', async () => {
    const { page, browseTemplates } = await setup('not json');
    let answer!: (rows: never[]) => void;
    browseTemplates.mockImplementationOnce(() => new Promise((resolve) => (answer = resolve)));
    page.el('asset-mode-gameobject').click();
    page.el('asset-mode-creature').click();
    await page.settle();
    answer([]);
    await page.settle();
    expect(page.el('asset-6')).toBeTruthy();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    page.el('asset-6').click();
    await page.settle();
    expect(page.el('asset-recent-6')).toBeTruthy();
    setItem.mockRestore();
  });

  it('has the compositions: picked to place, saved from the selection, deleted', async () => {
    const { page, browseTemplates, compositions, saved } = await setup();
    TestBed.inject(CompositionsService).save({ id: 'c1', name: 'Camp', members: [{}, {}] } as Composition);
    browseTemplates.mockClear();
    page.el('asset-mode-composition').click();
    await page.settle();
    expect(browseTemplates).not.toHaveBeenCalled();
    expect(page.el('composition-c1').textContent).toContain('Camp');
    page.el('composition-c1').click();
    await page.settle();
    expect(compositions.map((c) => c.id)).toEqual(['c1']);
    expect(page.el('composition-c1').classList).toContain('active');

    // saved from the selection, when there is one and a name
    const save = page.el<HTMLButtonElement>('composition-save');
    expect(save.disabled).toBe(true);
    const name = page.el<HTMLInputElement>('composition-name');
    name.value = ' Patrol ';
    name.dispatchEvent(new Event('input'));
    await page.settle();
    expect(save.disabled).toBe(true);
    page.fixture.componentRef.setInput('selectionCount', 3);
    await page.settle();
    save.click();
    await page.settle();
    expect(saved).toEqual(['Patrol']);
    expect(name.value).toBe('');
    // (nothing when the name is empty)
    (page.fixture.componentInstance as unknown as { saveComposition: () => void }).saveComposition();
    expect(saved).toEqual(['Patrol']);

    page.el('composition-delete-c1').click();
    await page.settle();
    expect(page.el('composition-none')).toBeTruthy();
    expect(page.el('asset-recent-6', false)).toBeFalsy();
  });

  it('switches mode and focuses the search when the editor asks (its keys)', async () => {
    const { page, browseTemplates } = await setup();
    page.fixture.componentRef.setInput('request', { n: 1, mode: 'gameobject' });
    await page.settle();
    expect(browseTemplates).toHaveBeenLastCalledWith('gameobject', null, '');
    // the same mode again: not read again
    browseTemplates.mockClear();
    page.fixture.componentRef.setInput('request', { n: 2, mode: 'gameobject' });
    await page.settle();
    expect(browseTemplates).not.toHaveBeenCalled();
    page.fixture.componentRef.setInput('request', { n: 3, mode: 'composition' });
    await page.settle();
    expect(page.el('composition-none')).toBeTruthy();
    // the search: back to the creatures from the compositions, focused
    page.fixture.componentRef.setInput('request', { n: 4, search: true });
    await page.settle(1);
    expect(document.activeElement).toBe(page.el('asset-search'));
    page.fixture.componentRef.setInput('request', { n: 5, search: true });
    await page.settle(1);
    expect(page.el('asset-mode-creature').classList).toContain('btn-secondary');
  });
});
