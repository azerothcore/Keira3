import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { SelectWaypointComponent } from './select-waypoint.component';
import { SelectWaypointService } from './select-waypoint.service';

class Page extends SelectPageObject<SelectWaypointComponent> {
  override ID_FIELD = 'id';
}

describe('SelectWaypointComponent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectWaypointComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), WaypointHandlerService],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 1 }]));
    const fixture = TestBed.createComponent(SelectWaypointComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { navigateSpy, querySpy, fixture, page };
  }

  it('lists one row per id, with how many rows it has, and opens one', async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual('10000000');
    expect(page.queryWrapper.innerText).toContain('GROUP BY');
    querySpy.mockReturnValue(of([{ id: 7 }]));
    page.clickElement(page.searchBtn);
    expect(page.getDatatableCell(0, 0).innerText).toBe('7');
    page.clickRowOfDatatable(0);
    expect(navigateSpy).toHaveBeenCalledWith(['waypoints/waypoint-data']);
    expect(TestBed.inject(SelectWaypointService)).toBeTruthy();
  });
});
