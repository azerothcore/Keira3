import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { SelectCreatureComponent } from './select-creature.component';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';
import { SelectCreatureModule } from './select-creature.module';
import { PageObject } from '../../../../test-utils/page-object';

class SelectCreatureComponentPage extends PageObject<SelectCreatureComponent> {
  get createInput() { return this.query<HTMLInputElement>('app-create input#id'); }
  get selectNewBtn() { return this.query<HTMLButtonElement>('app-create #select-button'); }
  get freeStatusWrapper() { return this.query<HTMLDivElement>('id-free-status'); }

  get queryWrapper() { return this.query<HTMLElement>('code.hljs'); }

  get searchEntryInput() { return this.query<HTMLInputElement>('input#entry'); }
  get searchNameInput() { return this.query<HTMLInputElement>('input#name'); }
  get searchSubnameInput() { return this.query<HTMLInputElement>('input#subname'); }
  get searchLimitInput() { return this.query<HTMLInputElement>('input#limit'); }
  get searchBtn() { return this.query<HTMLButtonElement>('#search-btn'); }
}

describe('SelectCreatureComponent', () => {
  let component: SelectCreatureComponent;
  let fixture: ComponentFixture<SelectCreatureComponent>;
  let selectService: CreatureSelectService;
  let queryService: QueryService;
  let querySpy: Spy;
  let page: SelectCreatureComponentPage;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectCreatureModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of(
      { results: [{ max: 1 }] }
    ));

    selectService = TestBed.get(CreatureSelectService);
    selectService.query = '--mock query';

    fixture = TestBed.createComponent(SelectCreatureComponent);
    page = new SelectCreatureComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {

      expect(page.createInput.value).toEqual(`${component.customStartingId}`);

      // TODO: to be continued...

    });
  }));

  // TODO: test datatable selection
});
