import { Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { registerTabState } from '@keira/shared/base-abstract-classes';
import { KeepAliveRouteStrategy } from './keep-alive.strategy';
import { KeiraTabsService, urlSection } from './keira-tabs.service';

@Component({ template: '' })
class PageComponent {}

/** A creature handler and editor, as the tabs see them. */
class FakeHandler {
  mainEditorRoutePath = 'creature/creature-template';
  _selected: string | undefined = undefined;
  selectedName: string | undefined = undefined;
  isNew = false;
  forceReload = false;
  _statusMap: Record<string, WritableSignal<boolean>> = { creature_template: signal(false) };
  constructor() {
    registerTabState(this);
  }
}

class FakeEditor {
  _form: object = { name: 'form 0' };
  _loadedEntityId: string | undefined = undefined;
  _newRows: { id: number }[] = [];
  forms = 0;
  constructor(readonly handlerService: FakeHandler) {
    registerTabState(this);
  }
  initForm(): void {
    this._form = { name: `form ${++this.forms}` };
  }
}

describe('KeiraTabsService', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageComponent },
          { path: 'world-editor', component: PageComponent },
          { path: 'creature/:page', component: PageComponent },
          { path: 'custom-thing', component: PageComponent },
          { path: 'refused', component: PageComponent, canActivate: [() => false] },
        ]),
      ],
    });
    const tabs = TestBed.inject(KeiraTabsService);
    return { tabs, router: TestBed.inject(Router), strategy: TestBed.inject(KeepAliveRouteStrategy) };
  };
  const settle = () => new Promise((resolve) => setTimeout(resolve));
  const shape = (tabs: KeiraTabsService) => tabs.tabs().map(({ section, url, n }) => ({ section, url, n }));

  it('reads the part of Keira and the page of a url', () => {
    expect(urlSection('/creature/creature-template?x=1')).toEqual({ section: 'creature', page: 'creature-template' });
    expect(urlSection('/')).toEqual({ section: '', page: '' });
  });

  it('opens a tab for each part of Keira, remembering its last page, and closes them', async () => {
    const { tabs, router, strategy } = setup();
    await router.navigateByUrl('/world-editor');
    await router.navigateByUrl('/creature/select-creature');
    await router.navigateByUrl('/creature/creature-template');
    await router.navigateByUrl('/custom-thing');
    expect(shape(tabs)).toEqual([
      { section: 'world-editor', url: '/world-editor', n: 1 },
      { section: 'creature', url: '/creature/creature-template', n: 1 },
      { section: 'custom-thing', url: '/custom-thing', n: 1 },
    ]);
    expect(tabs.active()).toBe('custom-thing');
    const [editor, creature, custom] = tabs.tabs();
    expect([tabs.titleKey(editor), tabs.titleKey(creature), tabs.titleKey(custom)]).toEqual([
      'SIDEBAR.WORLD_EDITOR',
      'SIDEBAR.CREATURE.TITLE',
      'Custom Thing',
    ]);
    expect([tabs.pageName(editor), tabs.pageName(creature)]).toEqual(['', 'Creature Template']);
    expect([tabs.number(creature), tabs.testId(creature)]).toEqual(['', 'creature']);

    // back to a tab: its last page
    tabs.show(creature);
    await settle();
    expect(router.url).toBe('/creature/creature-template');

    // closing the one shown goes to the one before; another one just closes; the pages kept are let go
    const drop = vi.spyOn(strategy, 'drop');
    tabs.close(tabs.tabs()[1]);
    await settle();
    expect(router.url).toBe('/world-editor');
    expect(drop).toHaveBeenCalledWith('creature');
    tabs.close(tabs.tabs()[1]);
    expect(drop).toHaveBeenCalledWith('custom-thing');
    expect(shape(tabs)).toEqual([{ section: 'world-editor', url: '/world-editor', n: 1 }]);
    // the first closed while shown goes to the next; the last one alone stays shown
    await router.navigateByUrl('/');
    await router.navigateByUrl('/world-editor');
    tabs.close(tabs.tabs()[0]);
    await settle();
    expect(router.url).toBe('/');
    tabs.close(tabs.tabs()[0]);
    expect(tabs.tabs()).toEqual([]);
  });

  it('opens a part with one page in its tab, and an editor in a new tab each time', async () => {
    const { tabs, router } = setup();
    await router.navigateByUrl('/world-editor');
    await router.navigateByUrl('/creature/creature-template');
    expect(tabs.isOpen('creature')).toBe(true);
    expect(tabs.isOpen('quest')).toBe(false);
    tabs.launch('world-editor');
    await settle();
    expect(router.url).toBe('/world-editor');
    expect(tabs.tabs().length).toBe(2);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    tabs.launch('quest');
    expect(navigate).toHaveBeenCalledWith('/quest/select', { onSameUrlNavigation: 'reload' });
  });

  it('keeps an entity and its changes in each tab of a part, and reads the rows again in a tab without changes', async () => {
    const { tabs, router, strategy } = setup();
    const handler = new FakeHandler();
    const editor = new FakeEditor(handler);
    // creature 38, changed and not executed
    await router.navigateByUrl('/creature/creature-template');
    Object.assign(handler, { _selected: '38', selectedName: 'Defias Thug' });
    Object.assign(editor, { _loadedEntityId: '38', _newRows: [{ id: 1 }] });
    handler._statusMap['creature_template'].set(true);
    const form38 = editor._form;

    // a second creature tab: nothing selected, a form of its own
    tabs.launch('creature');
    expect(strategy.renew).toBe(true);
    await settle();
    expect(strategy.renew).toBe(false);
    expect(router.url).toBe('/creature/select');
    expect(shape(tabs)).toEqual([
      { section: 'creature', url: '/creature/creature-template', n: 1 },
      { section: 'creature', url: '/creature/select', n: 2 },
    ]);
    const [first, second] = tabs.tabs();
    expect([tabs.number(first), tabs.number(second), tabs.testId(second)]).toEqual(['[1]', '[2]', 'creature-2']);
    expect(tabs.activeId()).toBe(second.id);
    expect(handler._selected).toBeUndefined();
    expect(handler._statusMap['creature_template']()).toBe(false);
    expect(editor._form).not.toBe(form38);
    expect(editor._loadedEntityId).toBeUndefined();

    // creature 299 there, executed
    await router.navigateByUrl('/creature/creature-template');
    Object.assign(handler, { _selected: '299', selectedName: 'Diseased Young Wolf' });
    Object.assign(editor, { _loadedEntityId: '299', _newRows: [{ id: 2 }] });
    const form299 = editor._form;

    // back to the first: 38 with its changes, as they were (not read again)
    tabs.show(tabs.tabs()[0]);
    await settle();
    expect(handler._selected).toBe('38');
    expect(handler.selectedName).toBe('Defias Thug');
    expect(handler._statusMap['creature_template']()).toBe(true);
    expect(editor._form).toBe(form38);
    expect(editor._loadedEntityId).toBe('38');
    expect(editor._newRows).toEqual([{ id: 1 }]);

    // and to the second: 299, read again (no changes pending)
    tabs.show(tabs.tabs()[1]);
    await settle();
    expect(handler._selected).toBe('299');
    expect(editor._form).toBe(form299);
    expect(editor._loadedEntityId).toBeUndefined();

    // a link from another part lands in the tab holding the part's editors
    await router.navigateByUrl('/custom-thing');
    await router.navigateByUrl('/creature/creature-template-addon');
    expect(tabs.activeId()).toBe(tabs.tabs()[1].id);
    // the same tab again: nothing handed over
    tabs.show(tabs.tabs()[1]);
    await settle();
    expect(handler._selected).toBe('299');

    // closing the tab holding them: a link opens a new tab
    tabs.close(tabs.tabs()[1]);
    await settle();
    expect(handler._selected).toBe('38');
    await router.navigateByUrl('/custom-thing');
    tabs.close(tabs.tabs()[0]);
    await router.navigateByUrl('/creature/select');
    expect(shape(tabs).map((tab) => tab.section)).toEqual(['custom-thing', 'creature']);
  });

  it('opens a new tab of a part shown at its first page, and leaves nothing waiting after a navigation that did not happen', async () => {
    const { tabs, router, strategy } = setup();
    const handler = new FakeHandler();
    new FakeEditor(handler);
    await router.navigateByUrl('/creature/select');
    handler._selected = '38';
    tabs.launch('creature');
    await settle();
    expect(shape(tabs)).toEqual([
      { section: 'creature', url: '/creature/select', n: 1 },
      { section: 'creature', url: '/creature/select', n: 2 },
    ]);
    expect(tabs.activeId()).toBe(tabs.tabs()[1].id);
    expect(handler._selected).toBeUndefined();
    // a page refusing to open: nothing left waiting, the page isn't made again next time
    strategy.renew = true;
    await router.navigateByUrl('/refused');
    expect(strategy.renew).toBe(false);
    await router.navigateByUrl('/creature/creature-template');
    expect(tabs.activeId()).toBe(tabs.tabs()[1].id);
  });

  it('names the dashboard tab, and shows no part before a page is shown', async () => {
    const { tabs, router } = setup();
    expect(tabs.active()).toBe('');
    await router.navigateByUrl('/');
    await router.navigateByUrl('/creature/select');
    tabs.launch('creature');
    await settle();
    expect(tabs.testId(tabs.tabs()[0])).toBe('dashboard');
    // a tab not holding its part's editors closes alone
    const handler = new FakeHandler();
    handler._selected = '38';
    tabs.close(tabs.tabs()[1]);
    expect(handler._selected).toBe('38');
  });

  it("empties a part's editors when the tab holding them closes", async () => {
    const { tabs, router } = setup();
    const handler = new FakeHandler();
    new FakeEditor(handler);
    await router.navigateByUrl('/creature/creature-template');
    handler._selected = '38';
    await router.navigateByUrl('/custom-thing');
    tabs.close(tabs.tabs()[0]);
    expect(handler._selected).toBeUndefined();
    // a link to the part: a new tab, empty
    await router.navigateByUrl('/creature/select');
    expect(shape(tabs).map((tab) => tab.section)).toEqual(['custom-thing', 'creature']);
  });
});
