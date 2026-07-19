import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );

  it('getters and setters should correctly work', () => {
    const service: SidebarService = TestBed.inject(SidebarService);

    service.setSidebarState(true);
    expect(service.getSidebarState()).toBe(true);

    service.setSidebarState(false);
    expect(service.getSidebarState()).toBe(false);

    service.hasBackgroundImage = true;
    expect(service.hasBackgroundImage).toBe(true);

    service.hasBackgroundImage = false;
    expect(service.hasBackgroundImage).toBe(false);
  });
});
