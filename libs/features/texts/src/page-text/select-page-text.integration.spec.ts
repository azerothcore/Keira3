import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { PAGE_TEXT_ID } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { SelectPageTextComponent } from './select-page-text.component';
import { PageTextHandlerService } from './page-text-handler.service';
import { SelectPageTextService } from './select-page-text.service';

describe(`${SelectPageTextComponent.name} integration tests`, () => {
  class Page extends SelectPageObject<SelectPageTextComponent> {
    override ID_FIELD = PAGE_TEXT_ID;
  }

  const value = 1200;
  const expectedRoute = 'texts/page-text';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), SelectPageTextComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), PageTextHandlerService],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectPageTextService);

    const fixture = TestBed.createComponent(SelectPageTextComponent);
    const page = new Page(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, selectService, page, queryService, querySpy, navigateSpy };
  }

  it('should correctly initialise', async () => {
    const { fixture, page, querySpy, component } = setup();

    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(ID) AS max FROM page_text;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `page_text` LIMIT 50');
  });

  it('should correctly behave when inserting and selecting free entry', async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`page_text\` WHERE (ID = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    page.expectTopBarCreatingNew(value);
  });

  it('should correctly behave when inserting an existing entity', async () => {
    const { fixture, page, querySpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([{}]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`page_text\` WHERE (ID = ${value})`);
    page.expectEntityAlreadyInUse();
  });

  for (const { id, entry, limit, expectedQuery } of [
    {
      id: 1,
      entry: 1200,
      limit: '100',
      expectedQuery: 'SELECT * FROM `page_text` ' + "WHERE (`ID` LIKE '%1200%') LIMIT 100",
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

    const results = [{ ID: 1 }, { ID: 2 }, { ID: 3 }];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(0);
    const row1 = page.getDatatableRow(1);
    const row2 = page.getDatatableRow(2);

    expect(row0.innerText).toContain(String(results[0].ID));
    expect(row1.innerText).toContain(String(results[1].ID));
    expect(row2.innerText).toContain(String(results[2].ID));

    page.clickElement(page.getDatatableCell(0, 0));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    // TODO: check this
    // Note: this is different than in other editors
    // expect(page.topBar.innerText).toContain(`Editing: page_text (${results[0].ID})`);
  });
});
