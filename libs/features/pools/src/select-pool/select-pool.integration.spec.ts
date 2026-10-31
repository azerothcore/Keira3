import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { PoolHandlerService } from '../pool-handler.service';
import { SelectPoolComponent } from './select-pool.component';
import { SelectPoolService } from './select-pool.service';

class Page extends SelectPageObject<SelectPoolComponent> {
  override ID_FIELD = 'entry';
}

describe('SelectPoolComponent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectPoolComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), PoolHandlerService],
    }).compileComponents();
  });

  it('searches by entry, max_limit and description, and opens a pool', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => Promise.resolve(true));
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 1 }]));
    const fixture = TestBed.createComponent(SelectPoolComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual('100000');
    page.setInputValueById('search-description', 'Copper');
    expect(page.queryWrapper.innerText).toContain("WHERE (`description` LIKE '%Copper%')");
    querySpy.mockReturnValue(of([{ entry: 7, max_limit: 1, description: 'Copper veins' }]));
    page.clickElement(page.searchBtn);
    expect(page.getDatatableCell(0, 2).innerText).toBe('Copper veins');
    page.clickRowOfDatatable(0);
    expect(navigateSpy).toHaveBeenCalledWith(['pools/pool-template']);
    expect(TestBed.inject(PoolHandlerService).selectedName).toBe('Copper veins');
    expect(TestBed.inject(SelectPoolService)).toBeTruthy();
  });
});
