import { TestBed } from '@angular/core/testing';
import { WowZone } from '@keira/shared/wow-data';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement, PageObjectModel, typeInElement } from 'ngx-page-object-model';
import { SpawnTreeComponent, TREE_SNAP_KEY } from './spawn-tree.component';
import { SpawnRecord } from './world-editor.model';

const ZONES: WowZone[] = [{ areaId: 14, mapId: 1, name: 'Durotar', bounds: { minX: 0, maxX: 1000, minY: 0, maxY: 1000 } }];
const spawn = (type: 'creature' | 'gameobject', guid: number, entry: number, name: string, at: number): SpawnRecord =>
  ({ type, guid, entry, name, map: 1, x: at, y: at, z: 0, o: 0, pathId: 0 }) as SpawnRecord;
const SPAWNS = [
  spawn('creature', 1, 3100, 'Boar', 10),
  spawn('creature', 2, 3100, 'Boar', 20),
  spawn('gameobject', 3, 500, 'Barrel', 30),
  spawn('creature', 4, 77, 'Lost', 5000),
];

describe(SpawnTreeComponent.name, () => {
  class Page extends PageObjectModel<SpawnTreeComponent> {
    el(id: string, assert = true): DebugHtmlElement<HTMLInputElement> {
      return this.getDebugElementByTestId(id, assert);
    }
    click(id: string): void {
      this.el(id).nativeElement.click();
      this.fixture.detectChanges();
    }
    rows(): string[] {
      return [...this.fixture.nativeElement.querySelectorAll('.spawn-tree-row')].map((row: HTMLElement) =>
        row.getAttribute('data-testid')!.replace('tree-row-', ''),
      );
    }
  }

  beforeEach(async () => {
    localStorage.removeItem(TREE_SNAP_KEY);
    await TestBed.configureTestingModule({ imports: [SpawnTreeComponent, TranslateTestingModule] }).compileComponents();
  });

  const setup = (hidden = new Set<string>()) => {
    const page = new Page(TestBed.createComponent(SpawnTreeComponent));
    page.fixture.componentRef.setInput('spawns', SPAWNS);
    page.fixture.componentRef.setInput('zones', ZONES);
    page.fixture.componentRef.setInput('hidden', hidden);
    page.fixture.componentRef.setInput('selectedKey', 'creature:2');
    const emitted = { hidden: [] as Set<string>[], picked: [] as { spawn: SpawnRecord; snap: boolean }[], closed: 0 };
    page.fixture.componentInstance.hiddenChange.subscribe((value) => {
      emitted.hidden.push(value);
      page.fixture.componentRef.setInput('hidden', value);
    });
    page.fixture.componentInstance.picked.subscribe((value) => emitted.picked.push(value));
    page.fixture.componentInstance.closed.subscribe(() => emitted.closed++);
    page.fixture.detectChanges();
    return { page, emitted };
  };

  it('opens and closes rows, all at once too, and counts what shows', () => {
    const { page } = setup(new Set(['creature:4']));
    expect(page.rows()).toEqual(['zone:14', 'zone:none']);
    expect(page.el('tree-count').nativeElement.textContent).toContain('3 / 4');
    page.click('tree-open-zone:14');
    expect(page.rows()).toEqual(['zone:14', 'zone:14:creature', 'zone:14:gameobject', 'zone:none']);
    // a label opens its row too
    page.click('tree-label-zone:14:creature');
    page.click('tree-label-zone:14:creature:3100');
    expect(page.rows()).toContain('creature:2');
    expect(page.el('tree-row-creature:2').nativeElement.classList).toContain('selected');
    page.click('tree-open-zone:14');
    expect(page.rows()).toEqual(['zone:14', 'zone:none']);

    page.click('tree-expand-all');
    expect(page.rows()).toEqual([
      'zone:14',
      'zone:14:creature',
      'zone:14:creature:3100',
      'zone:14:gameobject',
      'zone:14:gameobject:500',
      'zone:none',
      'zone:none:creature',
      'zone:none:creature:77',
    ]);
    expect(page.el('tree-label-zone:none').nativeElement.textContent).toContain('TREE_NO_ZONE');
    page.click('tree-collapse-all');
    expect(page.rows()).toHaveLength(2);
  });

  it('shows and hides spawns with the tick boxes, half ticked when some', () => {
    const { page, emitted } = setup();
    page.click('tree-expand-all');
    page.click('tree-check-zone:14:creature:3100');
    expect([...emitted.hidden[0]]).toEqual(['creature:1', 'creature:2']);
    expect(page.el('tree-check-zone:14').nativeElement.indeterminate).toBe(true);
    page.click('tree-check-zone:14:creature:3100');
    expect(emitted.hidden[1].size).toBe(0);
    expect(page.el('tree-check-zone:14').nativeElement.checked).toBe(true);

    page.click('tree-uncheck-all');
    expect(emitted.hidden[2].size).toBe(4);
    page.click('tree-check-all');
    expect(emitted.hidden[3].size).toBe(0);
  });

  it('filters, opening zones and types; Escape clears', () => {
    const { page } = setup();
    const filter = page.el('tree-filter');
    typeInElement('barrel', filter.nativeElement);
    page.fixture.detectChanges();
    expect(page.rows()).toEqual(['zone:14', 'zone:14:gameobject', 'zone:14:gameobject:500']);
    filter.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    page.fixture.detectChanges();
    expect(page.rows()).toHaveLength(2);
    typeInElement('nothing', filter.nativeElement);
    page.fixture.detectChanges();
    expect(page.el('tree-rows').nativeElement.textContent).toContain('NO_RESULTS');
  });

  it('picks a spawn, flying there unless told not to (kept), and closes', () => {
    const { page, emitted } = setup();
    page.click('tree-expand-all');
    page.click('tree-open-zone:14:creature:3100');
    page.click('tree-label-creature:1');
    expect(emitted.picked).toEqual([{ spawn: SPAWNS[0], snap: true }]);
    page.click('tree-snap');
    expect(localStorage.getItem(TREE_SNAP_KEY)).toBe('false');
    page.click('tree-label-creature:1');
    expect(emitted.picked[1].snap).toBe(false);
    page.click('tree-close');
    expect(emitted.closed).toBe(1);

    // remembered; storage that can't be read or written: on, not kept
    expect(setup().page.el('tree-snap').nativeElement.checked).toBe(false);
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    const blocked = setup().page;
    expect(blocked.el('tree-snap').nativeElement.checked).toBe(true);
    blocked.click('tree-snap');
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
