import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import Spy = jasmine.Spy;

import { SaiTopBarComponent } from './sai-top-bar.component';
import { SaiHandlerService } from '../sai-handler.service';
import { PageObject } from '@keira-testing/page-object';
import { SAI_TYPES } from '@keira-types/smart-scripts.type';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { Component, ViewChild } from '@angular/core';
import { of } from 'rxjs';

class SaiTopBarComponentPage extends PageObject<TestHostComponent> {
  get mainText() { return this.query<HTMLSpanElement>('.main-text'); }
}

@Component({
  template: '<keira-sai-top-bar [handler]="handlerService"><</keira-sai-top-bar>'
})
class TestHostComponent {
  @ViewChild(SaiTopBarComponent, { static: true }) child: SaiTopBarComponent;
  constructor(public handlerService: SaiHandlerService) {}
}

describe('SaiTopBarComponent', () => {
  let host: TestHostComponent;
  let component: SaiTopBarComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let handler: SaiHandlerService;
  let page: SaiTopBarComponentPage;
  let querySpy: Spy;

  const entryorguid = 1234;
  const name = 'Francesco';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHostComponent, SaiTopBarComponent ],
      imports: [
        RouterTestingModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    handler = TestBed.inject(SaiHandlerService);
    handler['_selected'] = JSON.stringify({ source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, entryorguid });
    querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of([]));

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = host.child;
    page = new SaiTopBarComponentPage(fixture);
  });

  it('should correctly distinguish between editing an existing entity and creating a new one', () => {
    handler.isNew = false;
    fixture.detectChanges();
    expect(page.mainText.innerText).toContain('Editing');

    handler.isNew = true;
    fixture.detectChanges();
    expect(page.mainText.innerText).toContain('Creating new');
  });

  for (const { testId, type, positive, expected } of [
    { testId: 1, type: SAI_TYPES.SAI_TYPE_AREATRIGGER, positive: true, expected: `Areatrigger ID ${entryorguid}` },
    { testId: 2, type: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST, positive: true, expected: `Timed Actionlist ID ${entryorguid}` },
    { testId: 3, type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, positive: true, expected: `Gameobject ID ${entryorguid}` },
    { testId: 4, type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, positive: false, expected: `Gameobject GUID ${entryorguid}` },
    { testId: 5, type: SAI_TYPES.SAI_TYPE_CREATURE, positive: true, expected: `Creature ID ${entryorguid}` },
    { testId: 6, type: SAI_TYPES.SAI_TYPE_CREATURE, positive: false, expected: `Creature GUID ${entryorguid}` },
  ]) {
    it(`should correctly handle different types [${testId}]`, () => {
      handler['_selected'] = JSON.stringify({ source_type: type, entryorguid: positive ? entryorguid : -entryorguid });
      spyOn(handler, 'getName').and.returnValue(of(name));
      // TODO: for some reasons this test cannot get the async name

      fixture.detectChanges();

      expect(page.mainText.innerText).toContain(expected);
    });
  }
});
