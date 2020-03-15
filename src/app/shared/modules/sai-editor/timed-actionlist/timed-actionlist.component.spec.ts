import { async, TestBed } from '@angular/core/testing';

import { TimedActionlistComponent } from './timed-actionlist.component';
import { PageObject } from '@keira-testing/page-object';
import { Component, ViewChild } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SmartScripts } from '@keira-types/smart-scripts.type';
import { of } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  template: `<keira-timed-actionlist [creatureId]="creatureId"></keira-timed-actionlist>`
})
class TestHostComponent {
  @ViewChild(TimedActionlistComponent) child: TimedActionlistComponent;
  creatureId: string;
}

class TimedActionlistPage extends PageObject<TestHostComponent> {}

describe('TimedActionlistComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimedActionlistComponent, TestHostComponent],
      imports: [NgxDatatableModule],
    })
    .compileComponents();
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

    expect(page.getDatatableCell('ngx-datatable', 0, 0).innerText).toContain(String(timedActionlists[0].entryorguid));
    expect(page.getDatatableCell('ngx-datatable', 0, 1).innerText).toContain(String(timedActionlists[0].id));
    expect(page.getDatatableCell('ngx-datatable', 1,  0).innerText).toContain(String(timedActionlists[1].entryorguid));
    expect(page.getDatatableCell('ngx-datatable', 1,  1).innerText).toContain(String(timedActionlists[1].id));
  });
});
