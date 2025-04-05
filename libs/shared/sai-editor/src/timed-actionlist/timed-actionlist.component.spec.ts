import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { PageObject } from '@keira/shared/test-utils';
import { SmartScripts } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { of } from 'rxjs';
import { TimedActionlistComponent } from './timed-actionlist.component';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Component({
  template: `<keira-timed-actionlist [creatureId]="creatureId" />`,
  imports: [NgxDatatableModule, TimedActionlistComponent],
})
class TestHostComponent {
  @ViewChild(TimedActionlistComponent) child!: TimedActionlistComponent;
  creatureId!: string;
}

class TimedActionlistPage extends PageObject<TestHostComponent> {}

describe('TimedActionlistComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxDatatableModule, TimedActionlistComponent, TestHostComponent],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new TimedActionlistPage(fixture);
    const queryService = TestBed.inject(MysqlQueryService);
    page.detectChanges();
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
    spyOn(queryService, 'getTimedActionlists').and.returnValue(of(timedActionlists));

    host.creatureId = id;
    host.child.ngOnChanges();
    page.detectChanges();

    expect(page.getDatatableCell(0, 0).innerText).toContain(String(timedActionlists[0].entryorguid));
    expect(page.getDatatableCell(0, 1).innerText).toContain(String(timedActionlists[0].id));
    expect(page.getDatatableCell(1, 0).innerText).toContain(String(timedActionlists[1].entryorguid));
    expect(page.getDatatableCell(1, 1).innerText).toContain(String(timedActionlists[1].id));
  });
});
