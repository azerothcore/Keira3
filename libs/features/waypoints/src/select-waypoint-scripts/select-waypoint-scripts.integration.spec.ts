import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { SelectWaypointScriptsComponent } from './select-waypoint-scripts.component';
import { SelectWaypointScriptsService } from './select-waypoint-scripts.service';

class Page extends SelectPageObject<SelectWaypointScriptsComponent> {
  override ID_FIELD = 'id';
}

describe('SelectWaypointScriptsComponent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectWaypointScriptsComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), WaypointScriptsHandlerService],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 1 }]));
    const fixture = TestBed.createComponent(SelectWaypointScriptsComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { navigateSpy, querySpy, fixture, page };
  }

  it('searches by its columns, lists one row per id and opens one', async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual('10000');
    expect(page.queryWrapper.innerText).toContain('GROUP BY');
    page.setInputValueById('search-command', '3');
    expect(page.queryWrapper.innerText).toContain("WHERE (`command` LIKE '%3%')");
    querySpy.mockReturnValue(of([{ id: 7, actions: 3, commands: '0,1', used: 5 }]));
    page.clickElement(page.searchBtn);
    // (with what each one is: its creature, points…)
    expect(page.queryWrapper.innerText).toContain('AS `commands`');
    expect(page.query('ngx-datatable').textContent).toContain('0,1');
    expect(page.query('ngx-datatable').textContent).toContain('5');
    expect(page.getDatatableCell(0, 0).innerText).toBe('7');
    page.clickRowOfDatatable(0);
    expect(navigateSpy).toHaveBeenCalledWith(['waypoints/waypoint-scripts']);
    expect(TestBed.inject(SelectWaypointScriptsService)).toBeTruthy();
  });
});
