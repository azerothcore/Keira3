import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';
import { SelectScriptWaypointComponent } from './select-script-waypoint.component';
import { SelectScriptWaypointService } from './select-script-waypoint.service';

class Page extends SelectPageObject<SelectScriptWaypointComponent> {
  override ID_FIELD = 'entry';
}

describe('SelectScriptWaypointComponent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectScriptWaypointComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), ScriptWaypointHandlerService],
    }).compileComponents();
  });

  it('searches escort paths by their columns, one row per entry, and opens one', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 1 }]));
    const fixture = TestBed.createComponent(SelectScriptWaypointComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual('2');
    page.setInputValueById('search-point_comment', 'gate');
    expect(page.queryWrapper.innerText).toContain("WHERE (`point_comment` LIKE '%gate%')");
    querySpy.mockReturnValue(of([{ entry: 7 }]));
    page.clickElement(page.searchBtn);
    page.clickRowOfDatatable(0);
    expect(navigateSpy).toHaveBeenCalledWith(['scripts/script-waypoint']);
    expect(TestBed.inject(SelectScriptWaypointService)).toBeTruthy();
  });
});
