import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { SelectReferenceLootService } from './select-reference-loot.service';

class SelectReferenceLootComponentPage extends SelectPageObject<SelectReferenceLootComponent> {
  ID_FIELD = 'Entry';
}

describe('SelectReferenceLoot integration tests', () => {
  const value = 1200;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        SelectReferenceLootComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [ReferenceLootHandlerService],
    }).compileComponents();
  }));

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectReferenceLootService);

    const fixture = TestBed.createComponent(SelectReferenceLootComponent);
    const page = new SelectReferenceLootComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, selectService, page, queryService, querySpy, navigateSpy };
  }

  it('should correctly initialise', waitForAsync(async () => {
    const { fixture, page, querySpy, component } = setup();

    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(Entry) AS max FROM reference_loot_template;');
    expect(page.queryWrapper.innerText).toContain('SELECT `Entry` FROM `reference_loot_template` GROUP BY Entry LIMIT 50');
  }));

  it('should correctly behave when inserting and selecting free entry', waitForAsync(async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`reference_loot_template\` WHERE (Entry = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/reference']);
    page.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    const { fixture, page, querySpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([{}]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`reference_loot_template\` WHERE (Entry = ${value})`);
    page.expectEntityAlreadyInUse();
  }));

  for (const { id, entry, limit, expectedQuery } of [
    {
      id: 1,
      entry: 1200,
      limit: '100',
      expectedQuery: 'SELECT `Entry` FROM `reference_loot_template` ' + "WHERE (`Entry` LIKE '%1200%') GROUP BY Entry LIMIT 100",
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      const { page, querySpy } = setup();

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
    const { navigateSpy, page, querySpy } = setup();

    const results: Partial<ReferenceLootTemplate>[] = [{ Entry: 1 }, { Entry: 2 }, { Entry: 3 }];
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
