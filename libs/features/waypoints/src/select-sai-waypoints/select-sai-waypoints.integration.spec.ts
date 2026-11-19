import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';
import { SelectSaiWaypointsComponent } from './select-sai-waypoints.component';
import { SelectSaiWaypointsService } from './select-sai-waypoints.service';

class Page extends SelectPageObject<SelectSaiWaypointsComponent> {
  override ID_FIELD = 'entry';
}

describe('SelectSaiWaypointsComponent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectSaiWaypointsComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), SaiWaypointsHandlerService],
    }).compileComponents();
  });

  it('searches SmartAI paths by their columns, one row per entry, and opens one', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 1 }]));
    const fixture = TestBed.createComponent(SelectSaiWaypointsComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual('1000000');
    page.setInputValueById('search-point_comment', 'gate');
    expect(page.queryWrapper.innerText).toContain("WHERE (`point_comment` LIKE '%gate%')");
    querySpy.mockReturnValue(of([{ entry: 7, points: 4, users: 2, name: null }]));
    page.clickElement(page.searchBtn);
    // (with what each one is: its creature, points…)
    expect(page.queryWrapper.innerText).toContain('AS `users`');
    expect(page.query('ngx-datatable').textContent).toContain('4');
    expect(page.query('ngx-datatable').textContent).toContain('2');
    expect(page.query('ngx-datatable').textContent).toContain('—');
    page.clickRowOfDatatable(0);
    expect(navigateSpy).toHaveBeenCalledWith(['waypoints/sai-waypoints']);
    expect(TestBed.inject(SelectSaiWaypointsService)).toBeTruthy();
  });
});
