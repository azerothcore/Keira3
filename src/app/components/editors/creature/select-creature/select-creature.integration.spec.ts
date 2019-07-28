import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { SelectCreatureComponent } from './select-creature.component';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';
import { SelectCreatureModule } from './select-creature.module';
import { PageObject } from '../../../../test-utils/page-object';
import { CreatureTemplate } from '../../../../types/creature-template.type';

class SelectCreatureComponentPage extends PageObject<SelectCreatureComponent> {
  get createInput() { return this.query<HTMLInputElement>('app-create input#id'); }
  get selectNewBtn() { return this.query<HTMLButtonElement>('app-create #select-button'); }
  get freeStatusWrapper() { return this.query<HTMLDivElement>('#id-free-status'); }

  get queryWrapper() { return this.query<HTMLElement>('code.hljs'); }

  get searchEntryInput() { return this.query<HTMLInputElement>('input#entry'); }
  get searchNameInput() { return this.query<HTMLInputElement>('input#name'); }
  get searchSubnameInput() { return this.query<HTMLInputElement>('input#subname'); }
  get searchLimitInput() { return this.query<HTMLInputElement>('input#limit'); }
  get searchBtn() { return this.query<HTMLButtonElement>('#search-btn'); }

  get topBar() { return this.query<HTMLElement>('app-top-bar'); }

  expectTopBarCreatingNew(id: number) {
    expect(this.topBar.innerText).toContain(`Creating new: ${id}`);
  }

  expectTopBarEditing(id: number, name: string) {
    expect(this.topBar.innerText).toContain(`Editing: ${name} (${id})`);
  }

  expectNewEntityFree() {
    const error = 'Expected new entity to be free';
    expect(this.selectNewBtn.disabled).toBe(false, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-check-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain('The entry is free', error);
  }

  expectEntityAlreadyInUse() {
    const error = 'Expected new entity to be already in use';
    expect(this.selectNewBtn.disabled).toBe(true, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-times-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain('The entry is already in use', error);
  }
}

describe('SelectCreature integration tests', () => {
  let component: SelectCreatureComponent;
  let fixture: ComponentFixture<SelectCreatureComponent>;
  let selectService: CreatureSelectService;
  let page: SelectCreatureComponentPage;
  let queryService: QueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

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
    navigateSpy = spyOn(TestBed.get(Router), 'navigate');
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of(
      { results: [{ max: 1 }] }
    ));

    selectService = TestBed.get(CreatureSelectService);

    fixture = TestBed.createComponent(SelectCreatureComponent);
    page = new SelectCreatureComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {
      expect(page.createInput.value).toEqual(`${component.customStartingId}`);
      page.expectNewEntityFree();
      expect(querySpy).toHaveBeenCalledWith(
        'SELECT MAX(entry) AS max FROM creature_template;'
      );
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `creature_template` LIMIT 100'
      );
    });
  }));

  it('should correctly behave when inserting and selecting free entry', async(() => {
    fixture.whenStable().then(() => {
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        { results: [] }
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`creature_template\` WHERE (entry = ${value})`
      );
      page.expectNewEntityFree();

      page.clickElement(page.selectNewBtn);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
      page.expectTopBarCreatingNew(value);
    });
  }));

  it('should correctly behave when inserting an existing entity', async(() => {
    fixture.whenStable().then(() => {
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        { results: ['mock value'] }
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`creature_template\` WHERE (entry = ${value})`
      );
      page.expectEntityAlreadyInUse();
    });
  }));

  for (const { id, entry, name, subname, limit, expectedQuery } of [
    {
      id: 1, entry: 1200, name: 'Helias', subname: 'Dev', limit: '100', expectedQuery:
      'SELECT * FROM `creature_template` WHERE (entry LIKE \'%1200%\') AND (name LIKE \'%Helias%\') AND (subname LIKE \'%Dev%\') LIMIT 100'
    },
    {
      id: 2, entry: '', name: 'Helias', subname: 'Dev', limit: '100', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (name LIKE \'%Helias%\') AND (subname LIKE \'%Dev%\') LIMIT 100'
    },
    {
      id: 3, entry: '', name: 'Helias', subname: '', limit: '100', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (name LIKE \'%Helias%\') LIMIT 100'
    },
    {
      id: 4, entry: '', name: '', subname: 'Developer', limit: '', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (subname LIKE \'%Developer%\')'
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      querySpy.calls.reset();
      if (entry) {
        page.setInputValue(page.searchEntryInput, entry);
      }
      if (name) {
        page.setInputValue(page.searchNameInput, name);
      }
      if (subname) {
        page.setInputValue(page.searchSubnameInput, subname);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: Partial<CreatureTemplate>[] = [
      { entry: 1, name: 'Shin',   subname: 'Developer',    minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Shin.cpp'   },
      { entry: 2, name: 'Helias', subname: 'Developer',    minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Helias.cpp' },
      { entry: 3, name: 'Kalhac', subname: 'Mathmatician', minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Kalhac.cpp' },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRow(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRow(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].name);
    expect(row1.innerText).toContain(results[1].name);
    expect(row2.innerText).toContain(results[2].name);

    page.clickElement(page.getDatatableCell(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
    page.expectTopBarEditing(results[1].entry, results[1].name);
  });
});
