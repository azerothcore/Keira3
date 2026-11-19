import { vi } from 'vitest';
import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PageObject } from '@keira/shared/test-utils';
import { SmartScripts } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { of } from 'rxjs';
import { TimedActionlistComponent } from './timed-actionlist.component';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { provideRouter } from '@angular/router';
import { SaiHandlerService } from '../sai-handler.service';

@Component({
  template: `<keira-timed-actionlist [creatureId]="creatureId" />`,
  imports: [NgxDatatableModule, TimedActionlistComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(TimedActionlistComponent);
  creatureId!: string;
}

class TimedActionlistPage extends PageObject<TestHostComponent> {}

describe('TimedActionlistComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxDatatableModule, TimedActionlistComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), provideRouter([])],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new TimedActionlistPage(fixture);
    const queryService = TestBed.inject(MysqlQueryService);
    return { page, host, queryService };
  };

  it('should create', () => {
    const { page, queryService, host } = setup();
    const id = '1234';
    const timedActionlists: SmartScripts[] = [new SmartScripts(), new SmartScripts()];
    timedActionlists[0].entryorguid = 111;
    timedActionlists[0].id = 1;
    timedActionlists[1].entryorguid = 222;
    timedActionlists[1].id = 2;
    vi.spyOn(queryService, 'getTimedActionlists').mockReturnValue(of(timedActionlists));

    host.creatureId = id;
    page.detectChanges();
    host.child().ngOnChanges();

    expect(page.getDatatableCell(0, 0).innerText).toContain(String(timedActionlists[0].entryorguid));
    expect(page.getDatatableCell(0, 1).innerText).toContain(String(timedActionlists[0].id));
    expect(page.getDatatableCell(1, 0).innerText).toContain(String(timedActionlists[1].entryorguid));
    expect(page.getDatatableCell(1, 1).innerText).toContain(String(timedActionlists[1].id));
  });

  it('opens the timed actionlist clicked in the SmartAI editor', () => {
    const { page, queryService, host } = setup();
    const list = Object.assign(new SmartScripts(), { entryorguid: 4600, source_type: 9, id: 0 });
    vi.spyOn(queryService, 'getTimedActionlists').mockReturnValue(of([list]));
    const select = vi.spyOn(TestBed.inject(SaiHandlerService), 'select').mockImplementation(() => undefined);
    host.creatureId = '46';
    page.detectChanges();
    host.child().ngOnChanges();
    page.detectChanges();
    page.clickRowOfDatatable(0);
    expect(select).toHaveBeenCalledWith(false, { entryorguid: 4600, source_type: 9 }, 'Timed Actionlist ID 4600');
  });
});
