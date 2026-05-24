import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Trainer } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { TrainerHandlerService } from '../trainer-handler.service';
import { SelectTrainerComponent } from './select-trainer.component';

class SelectTrainerPage extends SelectPageObject<SelectTrainerComponent> {}

describe('SelectTrainer integration tests', () => {
  // SelectTrainerService does not set entityNameField; SelectService.onSelect therefore
  // passes the entityTable name ('trainer') as the second argument of handlerService.select.
  const customStartingId = 1000000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), SelectTrainerComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        TrainerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup() {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    const queryService = TestBed.inject(MysqlQueryService);
    // getMaxId() is called by keira-create on init; return a max below customStartingId.
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([{ max: 1 }]));

    const fixture: ComponentFixture<SelectTrainerComponent> = TestBed.createComponent(SelectTrainerComponent);
    const page = new SelectTrainerPage(fixture);
    const handlerService = TestBed.inject(TrainerHandlerService);

    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, fixture, queryService, querySpy, navigateSpy, handlerService };
  }

  it('should correctly initialise', async () => {
    const { page, querySpy } = setup();
    await page.fixture.whenStable();

    // custom_starting_id: with DB max (1) below customStartingId, the create input defaults to customStartingId
    expect(page.createInput.value).toEqual(`${customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(Id) AS max FROM trainer;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `trainer` LIMIT 50');
  });

  it('searching by Id should correctly build and run the query', () => {
    const { page, querySpy } = setup();
    querySpy.mockClear();

    page.setInputValue(page.searchIdInput, '7');
    page.setInputValue(page.searchLimitInput, '100');

    const expectedQuery = "SELECT * FROM `trainer` WHERE (`Id` LIKE '%7%') LIMIT 100";
    expect(page.queryWrapper.innerText).toContain(expectedQuery);

    page.clickElement(page.searchBtn);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy.mock.calls.at(-1)[0]).toBe(expectedQuery);
  });

  it('searching by Type should correctly build and run the query', () => {
    const { page, querySpy } = setup();
    querySpy.mockClear();

    page.setInputValue(page.query<HTMLInputElement>('input#type'), '3');
    page.setInputValue(page.searchLimitInput, '100');

    const expectedQuery = "SELECT * FROM `trainer` WHERE (`Type` LIKE '%3%') LIMIT 100";
    expect(page.queryWrapper.innerText).toContain(expectedQuery);

    page.clickElement(page.searchBtn);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy.mock.calls.at(-1)[0]).toBe(expectedQuery);
  });

  it('searching by Id and Type combined should correctly build the query', () => {
    const { page } = setup();

    page.setInputValue(page.searchIdInput, '9');
    page.setInputValue(page.query<HTMLInputElement>('input#type'), '2');
    page.setInputValue(page.searchLimitInput, '50');

    expect(page.queryWrapper.innerText).toContain("SELECT * FROM `trainer` WHERE (`Id` LIKE '%9%') AND (`Type` LIKE '%2%') LIMIT 50");
  });

  it('searching and selecting an existing row from the datatable should call handlerService.select', () => {
    const { page, querySpy, navigateSpy, handlerService } = setup();
    const results = [
      { Id: 1, Type: 0, Requirement: 0, Greeting: 'A' },
      { Id: 2, Type: 1, Requirement: 0, Greeting: 'B' },
      { Id: 3, Type: 2, Requirement: 0, Greeting: 'C' },
    ] as Trainer[];

    querySpy.mockClear();
    querySpy.mockReturnValue(of(results));

    page.clickElement(page.searchBtn);

    const row1 = page.getDatatableRowExternal(1);
    expect(row1.innerText).toContain('B');

    const selectSpy = vi.spyOn(handlerService, 'select');

    page.clickElement(page.getDatatableCellExternal(1, 0));

    // no entityNameField configured -> SelectService passes the entityTable name as the display name
    expect(selectSpy).toHaveBeenCalledWith(false, `${results[1].Id}`, 'trainer');
    expect(navigateSpy).toHaveBeenCalledWith(['trainer/trainer']);
  });
});
