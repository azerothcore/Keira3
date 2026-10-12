import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { CreatureImmunities } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';
import { SelectCreatureImmunitiesComponent } from './select-creature-immunities.component';

describe('SelectCreatureImmunities integration tests', () => {
  class SelectCreatureImmunitiesPage extends SelectPageObject<SelectCreatureImmunitiesComponent> {}

  const EDITOR_ROUTE = ['creature-immunities/creature-immunities'];
  const NO_FILTER_QUERY = 'SELECT * FROM `creature_immunities` ORDER BY ID ASC LIMIT 50';

  const entity368 = Object.assign(new CreatureImmunities(), {
    ID: -368,
    SchoolMask: 127,
    DispelTypeMask: 0,
    MechanicsMask: 1301741246,
    Effects: '98,145',
    Auras: '11',
    ImmuneAoE: 1,
    ImmuneChain: 0,
    Comment: 'school and mech',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule],
      declarations: [],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureImmunitiesHandlerService,
        {
          provide: SqliteService,
          useValue: instance(mock(SqliteService)),
        },
      ],
    }).compileComponents();
  });

  function setup() {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => undefined);
    const handlerService = TestBed.inject(CreatureImmunitiesHandlerService);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([{ min: -430 }]));

    const fixture: ComponentFixture<SelectCreatureImmunitiesComponent> = TestBed.createComponent(SelectCreatureImmunitiesComponent);
    const page = new SelectCreatureImmunitiesPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, navigateSpy, handlerService, queryService };
  }

  it('should correctly initialise', async () => {
    const { page, querySpy } = setup();
    await page.whenReady();

    // the create-new block proposes MIN(ID) - 1
    expect(page.createInput.value).toEqual('-431');
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MIN(ID) AS min FROM creature_immunities;');

    // the search query is ordered by id ascending
    expect(page.queryWrapper.innerText).toContain(NO_FILTER_QUERY);
  });

  it('should correctly filter and order the search query', async () => {
    const { page, querySpy } = setup();
    await page.whenReady();
    querySpy.mockClear();

    const expectedQuery = "SELECT * FROM `creature_immunities` WHERE (`ID` LIKE '%-430%') ORDER BY ID ASC LIMIT 100";

    page.setInputValue(page.searchIdInput, '-430');
    page.setInputValue(page.searchLimitInput, '100');

    expect(page.queryWrapper.innerText).toContain(expectedQuery);

    page.clickElement(page.searchBtn);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy.mock.calls.at(-1)[0]).toBe(expectedQuery);
  });

  it('should show every column of the results and select the clicked row', async () => {
    const { page, querySpy, navigateSpy, handlerService } = setup();
    await page.whenReady();

    querySpy.mockReturnValue(of([entity368]));
    page.clickElement(page.searchBtn);
    await page.whenReady();

    const expectedCells = ['-368', '127', '0', '1301741246', '98,145', '11', '1', '0', 'school and mech'];
    expectedCells.forEach((expected, index) => {
      expect(page.getDatatableCellExternal(0, index).innerText.trim()).toContain(expected);
    });

    page.clickElement(page.getDatatableCellExternal(0, 0));

    expect(handlerService.selected).toBe('-368');
    expect(handlerService.selectedName).toBe('creature_immunities');
    expect(navigateSpy).toHaveBeenCalledWith(EDITOR_ROUTE);
  });

  it('should select the proposed new entity', async () => {
    const { page, navigateSpy, handlerService } = setup();
    await page.whenReady();

    page.clickElement(page.selectNewBtn);

    expect(handlerService.isNew).toBe(true);
    expect(handlerService.selected).toBe('-431');
    expect(navigateSpy).toHaveBeenCalledWith(EDITOR_ROUTE);
  });

  it('should detect whether the proposed id is already in use', async () => {
    const { page, queryService } = setup();
    const selectAllSpy = vi.spyOn(queryService, 'selectAll').mockReturnValue(of([]));
    await page.whenReady();

    page.setInputValue(page.createInput, '-431');
    await page.whenReady();
    page.expectNewEntityFree();

    selectAllSpy.mockReturnValue(of([entity368]) as any);
    page.setInputValue(page.createInput, '-368');
    await page.whenReady();
    page.expectEntityAlreadyInUse();
  });
});
