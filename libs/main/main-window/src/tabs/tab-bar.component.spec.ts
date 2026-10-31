import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { KeiraTab, KeiraTabsService } from './keira-tabs.service';
import { TabBarComponent } from './tab-bar.component';

describe('TabBarComponent', () => {
  it('shows the tabs once one is open, opens and closes them, and launches any part', () => {
    const tabs = signal<KeiraTab[]>([]);
    const service = {
      tabs,
      active: signal('world-editor'),
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
    expect(el.querySelector('[data-testid="tab-bar"]')).toBeNull();
    tabs.set([
      { section: 'world-editor', url: '/world-editor' },
      { section: 'creature', url: '/creature/creature-template' },
      { section: '', url: '/' },
    ]);
    fixture.detectChanges();
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
