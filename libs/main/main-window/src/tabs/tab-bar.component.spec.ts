import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { KeiraTab, KeiraTabsService } from './keira-tabs.service';
import { TabBarComponent } from './tab-bar.component';

describe('TabBarComponent', () => {
  it('shows the tabs, opens and closes them, and launches any part', () => {
    const tabs = signal<KeiraTab[]>([]);
    const service = {
      tabs,
      activeId: signal(1),
      number: (tab: KeiraTab) => (tab.n > 1 ? `[${tab.n}]` : ''),
      testId: (tab: KeiraTab) => (tab.section || 'dashboard') + (tab.n > 1 ? `-${tab.n}` : ''),
      titleKey: (tab: KeiraTab) => tab.section || 'Dashboard',
      pageName: (tab: KeiraTab) => (tab.section === 'creature' ? 'Creature Template' : ''),
      show: vi.fn(),
      close: vi.fn(),
      launch: vi.fn(),
      isOpen: (section: string) => section === 'creature',
    };
    TestBed.configureTestingModule({
      imports: [TabBarComponent, TranslateTestingModule],
      providers: [{ provide: KeiraTabsService, useValue: service }],
    });
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // shown always, even before a tab is open (with its launcher)
    expect(el.querySelector('[data-testid="tab-bar"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="tab-launcher"]')).toBeTruthy();
    tabs.set([
      { id: 1, section: 'world-editor', url: '/world-editor', n: 1 },
      { id: 2, section: 'creature', url: '/creature/creature-template', n: 1 },
      { id: 3, section: '', url: '/', n: 1 },
      { id: 4, section: 'creature', url: '/creature/select', n: 2 },
    ]);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="tab-creature-2"]')?.textContent).toContain('[2]');
    expect(el.querySelector('[data-testid="tab-world-editor"]')?.classList).toContain('active');
    expect(el.querySelector('[data-testid="tab-creature"]')?.textContent).toContain('Creature Template');
    (el.querySelector('[data-testid="tab-open-creature"]') as HTMLButtonElement).click();
    expect(service.show).toHaveBeenCalledWith(tabs()[1]);
    (el.querySelector('[data-testid="tab-close-dashboard"]') as HTMLButtonElement).click();
    expect(service.close).toHaveBeenCalledWith(tabs()[2]);
    // the launcher: every part, the open ones marked
    (el.querySelector('[data-testid="tab-launcher"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="tab-launch-creature"]')?.classList).toContain('open');
    expect(el.querySelector('[data-testid="tab-launch-dashboard"]')).toBeTruthy();
    (el.querySelector('[data-testid="tab-launch-quest"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(service.launch).toHaveBeenCalledWith('quest');
    expect(el.querySelector('[data-testid="tab-launcher-grid"]')).toBeNull();
  });
});
