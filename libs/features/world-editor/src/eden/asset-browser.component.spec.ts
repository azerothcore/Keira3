import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { WorldEditorService } from '../world-editor.service';
import { ASSET_SEARCH_DELAY, AssetBrowserComponent, AssetPick, RECENT_ASSETS_KEY } from './asset-browser.component';

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
    page.fixture.componentInstance.picked.subscribe((pick) => picks.push(pick));
    page.fixture.detectChanges();
    await page.settle();
    return { page, browseTemplates, picks };
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
});
