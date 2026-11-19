import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { EdenStatusBarComponent } from './eden-status-bar.component';

class StatusPage extends PageObject<EdenStatusBarComponent> {
  text(id: string): string {
    return this.query<HTMLElement>(`[data-testid="${id}"]`).textContent ?? '';
  }
}

describe(EdenStatusBarComponent.name, () => {
  it('shows where the camera is, the map and zone, the pending changes and what is read', () => {
    TestBed.configureTestingModule({
      imports: [EdenStatusBarComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection()],
    });
    const page = new StatusPage(TestBed.createComponent(EdenStatusBarComponent));
    page.fixture.detectChanges();
    expect(page.text('eden-status-position')).toContain('-');
    expect(page.query('[data-testid="eden-light-database"]').classList).not.toContain('lit');

    page.fixture.componentRef.setInput('position', { x: 1.25, y: -2, z: 3 });
    page.fixture.componentRef.setInput('mapName', 'Kalimdor');
    page.fixture.componentRef.setInput('zoneName', 'Durotar');
    page.fixture.componentRef.setInput('pending', 2);
    page.fixture.componentRef.setInput('lights', { database: true, gameData: false, source: true });
    page.fixture.detectChanges();

    expect(page.text('eden-status-position')).toContain('X 1.3 · Y -2.0 · Z 3.0');
    expect(page.text('eden-status-place')).toBe('Kalimdor · Durotar');
    expect(page.query('[data-testid="eden-status-pending"]').classList).toContain('text-warning');
    expect(page.query('[data-testid="eden-light-database"]').classList).toContain('lit');
    expect(page.query('[data-testid="eden-light-gameData"]').classList).not.toContain('lit');

    page.fixture.componentRef.setInput('zoneName', '');
    page.fixture.componentRef.setInput('pending', 0);
    page.fixture.detectChanges();
    expect(page.text('eden-status-place')).toBe('Kalimdor');
    expect(page.query('[data-testid="eden-status-pending"]').classList).not.toContain('text-warning');
  });
});
