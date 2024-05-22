import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { NPC_TEXT_ID, NpcText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SelectNpcTextComponent } from './select-npc-text.component';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { SelectNpcTextService } from './select-npc-text.service';

describe(`${SelectNpcTextComponent.name} integration tests`, () => {
  class Page extends SelectPageObject<SelectNpcTextComponent> {
    override ID_FIELD = NPC_TEXT_ID;
  }

  const value = 1200;
  const expectedRoute = 'texts/npc-text';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), SelectNpcTextComponent, TranslateTestingModule],
      providers: [NpcTextHandlerService],
    }).compileComponents();
  }));

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectNpcTextService);

    const fixture = TestBed.createComponent(SelectNpcTextComponent);
    const page = new Page(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, selectService, npc: page, queryService, querySpy, navigateSpy };
  }

  it('should correctly initialise', waitForAsync(async () => {
    const { fixture, npc, querySpy, component } = setup();

    await fixture.whenStable();
    expect(npc.createInput.value).toEqual(`${component.customStartingId}`);
    npc.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(ID) AS max FROM npc_text;');
    expect(npc.queryWrapper.innerText).toContain('SELECT * FROM `npc_text` LIMIT 50');
  }));

  it('should correctly behave when inserting and selecting free entry', waitForAsync(async () => {
    const { fixture, npc, querySpy, navigateSpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    npc.setInputValue(npc.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`npc_text\` WHERE (ID = ${value})`);
    npc.expectNewEntityFree();

    npc.clickElement(npc.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    npc.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    const { fixture, npc, querySpy } = setup();

    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([{}]));

    npc.setInputValue(npc.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`npc_text\` WHERE (ID = ${value})`);
    npc.expectEntityAlreadyInUse();
  }));

  for (const { id, entry, limit, expectedQuery } of [
    {
      id: 1,
      entry: 1200,
      limit: '100',
      expectedQuery: 'SELECT * FROM `npc_text` ' + "WHERE (`ID` LIKE '%1200%') LIMIT 100",
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      const { npc, querySpy } = setup();

      querySpy.calls.reset();
      if (entry) {
        npc.setInputValue(npc.searchIdInput, entry);
      }
      npc.setInputValue(npc.searchLimitInput, limit);

      expect(npc.queryWrapper.innerText).toContain(expectedQuery);

      npc.clickElement(npc.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const { navigateSpy, npc, querySpy } = setup();

    const results = [{ ID: 1 }, { ID: 2 }, { ID: 3 }];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    npc.clickElement(npc.searchBtn);

    const row0 = npc.getDatatableRow(0);
    const row1 = npc.getDatatableRow(1);
    const row2 = npc.getDatatableRow(2);

    expect(row0.innerText).toContain(String(results[0].ID));
    expect(row1.innerText).toContain(String(results[1].ID));
    expect(row2.innerText).toContain(String(results[2].ID));

    npc.clickElement(npc.getDatatableCell(0, 0));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([expectedRoute]);
    // TODO: check this
    // Note: this is different than in other editors
    // expect(npc.topBar.innerText).toContain(`Editing: npc_text (${results[0].ID})`);
  });
});
