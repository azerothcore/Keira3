import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ACORE_STRING_ENTRY } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SelectAcoreStringComponent } from './select-acore-string.component';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { SelectAcoreStringService } from './select-acore-string.service';

describe(`${SelectAcoreStringComponent.name} integration tests`, () => {
  class Page extends SelectPageObject<SelectAcoreStringComponent> {
    override ID_FIELD = ACORE_STRING_ENTRY;
  }

  const value = 1200;
  const expectedRoute = 'texts/acore-string';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), SelectAcoreStringComponent, TranslateTestingModule],
      providers: [AcoreStringHandlerService],
    }).compileComponents();
  }));

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectAcoreStringService);

    const fixture = TestBed.createComponent(SelectAcoreStringComponent);
    const page = new Page(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, selectService, broadcast: page, queryService, querySpy, navigateSpy };
  }

  it('should correctly initialise', waitForAsync(async () => {
    const { fixture, broadcast, querySpy, component } = setup();

    await fixture.whenStable();
    expect(broadcast.createInput.value).toEqual(`${component.customStartingId}`);
    broadcast.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(entry) AS max FROM acore_string;');
    expect(broadcast.queryWrapper.innerText).toContain('SELECT * FROM `acore_string` LIMIT 50');
  }));

  it('should correctly behave when inserting and selecting free entry', waitForAsync(async () => {
    const { fixture, broadcast, querySpy, navigateSpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    broadcast.setInputValue(broadcast.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`acore_string\` WHERE (entry = ${value})`);
    broadcast.expectNewEntityFree();

    broadcast.clickElement(broadcast.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    broadcast.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    const { fixture, broadcast, querySpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([{}]));

    broadcast.setInputValue(broadcast.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`acore_string\` WHERE (entry = ${value})`);
    broadcast.expectEntityAlreadyInUse();
  }));

  for (const { id, entry, limit, expectedQuery } of [
    {
      id: 1,
      entry: 1200,
      limit: '100',
      expectedQuery: 'SELECT * FROM `acore_string` ' + "WHERE (`entry` LIKE '%1200%') LIMIT 100",
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      const { broadcast, querySpy } = setup();

      querySpy.calls.reset();
      if (entry) {
        broadcast.setInputValue(broadcast.searchIdInput, entry);
      }
      broadcast.setInputValue(broadcast.searchLimitInput, limit);

      expect(broadcast.queryWrapper.innerText).toContain(expectedQuery);

      broadcast.clickElement(broadcast.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const { navigateSpy, broadcast, querySpy } = setup();

    const results = [{ entry: 1 }, { entry: 2 }, { entry: 3 }];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    broadcast.clickElement(broadcast.searchBtn);

    const row0 = broadcast.getDatatableRow(0);
    const row1 = broadcast.getDatatableRow(1);
    const row2 = broadcast.getDatatableRow(2);

    expect(row0.innerText).toContain(String(results[0].entry));
    expect(row1.innerText).toContain(String(results[1].entry));
    expect(row2.innerText).toContain(String(results[2].entry));

    broadcast.clickElement(broadcast.getDatatableCell(0, 0));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    // TODO: check this
    // Note: this is different than in other editors
    // expect(broadcast.topBar.innerText).toContain(`Editing: broadcast_text (${results[0].ID})`);
  });
});
