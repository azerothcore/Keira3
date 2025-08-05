import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { SelectGameTeleComponent } from './select-game-tele.component';
import { instance, mock } from 'ts-mockito';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GameTele } from '@keira/shared/acore-world-model';

describe('SelectConditions integration tests', () => {
  class SelectGameTelePage extends SelectPageObject<SelectGameTeleComponent> {}
  /**
   * Setup function to initialize the component, spies, and page object.
   * Returns the fixture, page, and component instances for each test.
   */
  function setup() {
    // Inject Services
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    // Create Component Fixture and Page Object
    const fixture: ComponentFixture<SelectGameTeleComponent> = TestBed.createComponent(SelectGameTeleComponent);
    const page: SelectGameTelePage = new SelectGameTelePage(fixture);
    const component: SelectGameTeleComponent = fixture.componentInstance;

    // Initialize Change Detection
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, component, navigateSpy, querySpy };
  }

  /**
   * TestBed Configuration
   * - Declares the component in the `declarations` array.
   * - Moves `SelectGameTeleComponent` from `imports` to `declarations`.
   */
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), TranslateTestingModule],
      declarations: [],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameTeleHandlerService,
        {
          provide: SqliteService,
          useValue: instance(mock(SqliteService)),
        },
      ],
    }).compileComponents();
  }));

  it('should correctly initialise', waitForAsync(async () => {
    const { page, component, querySpy } = setup();
    await page.fixture.whenStable();
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
      const { page, component: _component, navigateSpy: _navigateSpy, querySpy } = setup();
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
    const { page, component: _component, navigateSpy, querySpy } = setup();
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
