import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiTopBarComponent } from './sai-top-bar.component';
import { SaiHandlerService } from '../../../../../services/handlers/sai-handler.service';
import { PageObject } from '../../../../../test-utils/page-object';
import { SAI_SEARCH_TYPES } from '../../../../../types/smart-scripts.type';
import { QueryService } from '../../../../../services/query.service';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

class SaiTopBarComponentPage extends PageObject<SaiTopBarComponent> {
  get mainText() { return this.query<HTMLSpanElement>('.main-text'); }
}

describe('SaiTopBarComponent', () => {
  let component: SaiTopBarComponent;
  let fixture: ComponentFixture<SaiTopBarComponent>;
  let handler: SaiHandlerService;
  let page: SaiTopBarComponentPage;
  let querySpy: Spy;

  const entryorguid = 1234;
  const name = 'Francesco';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaiTopBarComponent ],
      imports: [
        RouterTestingModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    handler = TestBed.get(SaiHandlerService);
    handler['_selected'] = JSON.stringify({ source_type: SAI_SEARCH_TYPES.SAI_TYPE_GAMEOBJECT, entryorguid });
    querySpy = spyOn(TestBed.get(QueryService), 'query');

    fixture = TestBed.createComponent(SaiTopBarComponent);
    component = fixture.componentInstance;
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
    { testId: 1, type: SAI_SEARCH_TYPES.SAI_TYPE_AREATRIGGER, positive: true, expected: `Areatrigger ID ${entryorguid}` },
    { testId: 2, type: SAI_SEARCH_TYPES.SAI_TYPE_TIMED_ACTIONLIST, positive: true, expected: `Timed Actionlist ID ${entryorguid}` },
    { testId: 3, type: SAI_SEARCH_TYPES.SAI_TYPE_GAMEOBJECT, positive: true, expected: `Gameobject ID ${entryorguid}` },
    { testId: 4, type: SAI_SEARCH_TYPES.SAI_TYPE_GAMEOBJECT, positive: false, expected: `Gameobject GUID ${entryorguid}` },
    { testId: 5, type: SAI_SEARCH_TYPES.SAI_TYPE_CREATURE, positive: true, expected: `Creature ID ${entryorguid}` },
    { testId: 6, type: SAI_SEARCH_TYPES.SAI_TYPE_CREATURE, positive: false, expected: `Creature GUID ${entryorguid}` },
  ]) {
    it(`should correctly handle different types [${testId}]`, () => {
      querySpy.and.returnValue(of({ results: [{ name }] }));
      handler['_selected'] = JSON.stringify({ source_type: type, entryorguid: positive ? entryorguid : -entryorguid });
      fixture.detectChanges();

      expect(page.mainText.innerText).toContain(expected);
    });
  }

  describe('after fetching the creature name', () => {
    beforeEach(() => {
      handler['_selected'] = JSON.stringify({ source_type: SAI_SEARCH_TYPES.SAI_TYPE_CREATURE, entryorguid });
    });

    it('should correctly show the name', fakeAsync(() => {
      querySpy.and.returnValue(of({ results: [{ name }] }));

      fixture.detectChanges();
      tick();

      expect(page.mainText.innerText).toContain(name);
    }));

    it('should output a console error if the creature cannot be found', fakeAsync(() => {
      spyOn(console, 'error');
      querySpy.and.returnValue(of({ results: [] }));

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(`Unable to find creature having entryorguid = ${entryorguid}`);
    }));
  });
});
