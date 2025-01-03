import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SelectGameTeleComponent } from './select-game-tele.component';
import Spy = jasmine.Spy;
import { instance, mock } from 'ts-mockito';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GameTele } from '@keira/shared/acore-world-model';

class SelectGameTeleComponentPage extends SelectPageObject<SelectGameTeleComponent> {}

describe('SelectConditions integration tests', () => {
  let fixture: ComponentFixture<SelectGameTeleComponent>;
  let page: SelectGameTeleComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;
  let component: SelectGameTeleComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        SelectGameTeleComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [GameTeleHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    fixture = TestBed.createComponent(SelectGameTeleComponent);
    page = new SelectGameTeleComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', waitForAsync(async () => {
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(id) AS max FROM game_tele;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `game_tele` LIMIT 50');
  }));

  for (const { id, name, limit, expectedQuery } of [
    {
      id: 1,
      name: 'ABC',
      limit: '100',
      expectedQuery: "SELECT * FROM `game_tele` WHERE (`id` LIKE '%1%') AND (`name` LIKE '%ABC%') LIMIT 100",
    },
    {
      id: 2,
      name: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `game_tele` WHERE (`id` LIKE '%2%') LIMIT 100",
    },
    {
      id: null,
      name: 'AB',
      limit: '100',
      expectedQuery: "SELECT * FROM `game_tele` WHERE (`name` LIKE '%AB%') LIMIT 100",
    },
  ]) {
    it(`searching an existing entity should correctly work [id: ${id}, name: ${name}]`, () => {
      querySpy.calls.reset();

      // Set input values based on the test case
      if (id !== null) {
        page.setInputValue(page.searchIdInput, `${id}`);
      }
      if (name) {
        page.setInputValue(page.searchNameInput, name);
      }

      page.setInputValue(page.searchLimitInput, limit);

      // Validate the query in the UI
      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      // Trigger the search
      page.clickElement(page.searchBtn);

      // Validate the query was executed as expected
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toBe(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results = [
      {
        id: 1,
        name: 'Test',
        position_x: 1,
        position_y: 2,
        position_z: 3,
        orientation: 4,
        map: 5,
      },
      {
        id: 2,
        name: 'Test2',
        position_x: 2,
        position_y: 3,
        position_z: 4,
        orientation: 5,
        map: 6,
      },
      {
        id: 3,
        name: 'Test3',
        position_x: 3,
        position_y: 4,
        position_z: 5,
        orientation: 6,
        map: 7,
      },
    ] as GameTele[];

    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].name.toString());
    expect(row1.innerText).toContain(results[1].name.toString());
    expect(row2.innerText).toContain(results[2].name.toString());

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['game-tele/tele']);
  });
});
