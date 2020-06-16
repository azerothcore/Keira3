import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { ReferenceLootTemplateModule } from './reference-loot-template.module';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';

class SelectReferenceLootComponentPage extends SelectPageObject<SelectReferenceLootComponent> {
  ID_FIELD = 'Entry';
}

describe('SelectReferenceLoot integration tests', () => {
  let component: SelectReferenceLootComponent;
  let fixture: ComponentFixture<SelectReferenceLootComponent>;
  let selectService: SelectReferenceLootService;
  let page: SelectReferenceLootComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReferenceLootTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        ReferenceLootHandlerService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of(
      [{ max: 1 }]
    ));

    selectService = TestBed.inject(SelectReferenceLootService);

    fixture = TestBed.createComponent(SelectReferenceLootComponent);
    page = new SelectReferenceLootComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async () => {
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith(
      'SELECT MAX(Entry) AS max FROM reference_loot_template;'
    );
    expect(page.queryWrapper.innerText).toContain(
      'SELECT `Entry` FROM `reference_loot_template` GROUP BY Entry LIMIT 50'
    );
  });

  it('should correctly behave when inserting and selecting free entry', async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`reference_loot_template\` WHERE (Entry = ${value})`
    );
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/reference']);
    page.expectTopBarCreatingNew(value);

  });

  it('should correctly behave when inserting an existing entity', async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(['mock value']));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`reference_loot_template\` WHERE (Entry = ${value})`
    );
    page.expectEntityAlreadyInUse();
  });

  for (const { id, entry, limit, expectedQuery } of [
    {
      id: 1, entry: 1200, limit: '100', expectedQuery:
        'SELECT `Entry` FROM `reference_loot_template` ' +
        'WHERE (`Entry` LIKE \'%1200%\') GROUP BY Entry LIMIT 100'
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      querySpy.calls.reset();
      if (entry) {
        page.setInputValue(page.searchIdInput, entry);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: Partial<ReferenceLootTemplate>[] = [
      { Entry: 1 },
      { Entry: 2 },
      { Entry: 3 },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(0);
    const row1 = page.getDatatableRow(1);
    const row2 = page.getDatatableRow(2);

    expect(row0.innerText).toContain(String(results[0].Entry));
    expect(row1.innerText).toContain(String(results[1].Entry));
    expect(row2.innerText).toContain(String(results[2].Entry));

    page.clickElement(page.getDatatableCell(0, 0));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/reference']);
    // Note: this is different than in other editors
    expect(page.topBar.innerText).toContain(`Editing: reference_loot_template (${results[0].Entry})`);
  });
});
