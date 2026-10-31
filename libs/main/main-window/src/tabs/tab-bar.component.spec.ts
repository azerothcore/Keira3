import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { KeiraTab, KeiraTabsService } from './keira-tabs.service';
import { TabBarComponent } from './tab-bar.component';

describe('TabBarComponent', () => {
  it('shows the tabs once more than one is open, opens and closes them', () => {
    const tabs = signal<KeiraTab[]>([{ section: 'world-editor', url: '/world-editor' }]);
    const service = {
      tabs,
      active: signal('world-editor'),
      titleKey: (tab: KeiraTab) => tab.section || 'Dashboard',
      pageName: (tab: KeiraTab) => (tab.section === 'creature' ? 'Creature Template' : ''),
      show: vi.fn(),
      close: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [TabBarComponent, TranslateTestingModule],
      providers: [{ provide: KeiraTabsService, useValue: service }],
    });
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="tab-bar"]')).toBeNull();
    tabs.set([...tabs(), { section: 'creature', url: '/creature/creature-template' }, { section: '', url: '/' }]);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="tab-world-editor"]')?.classList).toContain('active');
    expect(el.querySelector('[data-testid="tab-creature"]')?.textContent).toContain('Creature Template');
    (el.querySelector('[data-testid="tab-open-creature"]') as HTMLButtonElement).click();
    expect(service.show).toHaveBeenCalledWith(tabs()[1]);
    (el.querySelector('[data-testid="tab-close-dashboard"]') as HTMLButtonElement).click();
    expect(service.close).toHaveBeenCalledWith(tabs()[2]);
  });
});
