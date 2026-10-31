import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { KeepAliveRouteStrategy } from './keep-alive.strategy';
import { KeiraTabsService, urlSection } from './keira-tabs.service';

@Component({ template: '' })
class PageComponent {}

describe('KeiraTabsService', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageComponent },
          { path: 'world-editor', component: PageComponent },
          { path: 'creature/:page', component: PageComponent },
          { path: 'custom-thing', component: PageComponent },
        ]),
      ],
    });
    const tabs = TestBed.inject(KeiraTabsService);
    return { tabs, router: TestBed.inject(Router), strategy: TestBed.inject(KeepAliveRouteStrategy) };
  };

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
    expect(tabs.tabs()).toEqual([
      { section: 'world-editor', url: '/world-editor' },
      { section: 'creature', url: '/creature/creature-template' },
      { section: 'custom-thing', url: '/custom-thing' },
    ]);
    expect(tabs.active()).toBe('custom-thing');
    const [editor, creature, custom] = tabs.tabs();
    expect([tabs.titleKey(editor), tabs.titleKey(creature), tabs.titleKey(custom)]).toEqual([
      'SIDEBAR.WORLD_EDITOR',
      'SIDEBAR.CREATURE.TITLE',
      'Custom Thing',
    ]);
    expect([tabs.pageName(editor), tabs.pageName(creature)]).toEqual(['', 'Creature Template']);

    // back to a tab: its last page
    tabs.show(creature);
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/creature/creature-template');

    // closing the one shown goes to the one before; another one just closes; the pages kept are let go
    const drop = vi.spyOn(strategy, 'drop');
    tabs.close(tabs.tabs()[1]);
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/world-editor');
    expect(drop).toHaveBeenCalledWith('creature');
    tabs.close(tabs.tabs()[1]);
    expect(drop).toHaveBeenCalledWith('custom-thing');
    expect(tabs.tabs()).toEqual([{ section: 'world-editor', url: '/world-editor' }]);
    // the first closed while shown goes to the next; the last one alone stays shown
    await router.navigateByUrl('/');
    await router.navigateByUrl('/world-editor');
    tabs.close(tabs.tabs()[0]);
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/');
    tabs.close(tabs.tabs()[0]);
    expect(tabs.tabs()).toEqual([]);
  });
});
