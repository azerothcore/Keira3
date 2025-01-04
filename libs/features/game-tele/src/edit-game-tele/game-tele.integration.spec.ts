import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameTele } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameTeleComponent } from './game-tele.component';
import Spy = jasmine.Spy;
import { GameTeleHandlerService } from '../game-tele-handler.service';

describe('GameTele integration tests', () => {
  // Page Object Class
  class GameTelePage extends EditorPageObject<GameTeleComponent> {}

  // Shared Variables
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameTeleHandlerService;

  // Constants
  const id = 1;

  const expectedFullCreateQuery =
    'DELETE FROM `game_tele` WHERE (`id` = ' +
    id +
    ');\n' +
    'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
    '(' +
    id +
    ", 0, 0, 0, 0, 0, '');\n";

  const originalEntity = new GameTele();
  originalEntity.id = 1;
  originalEntity.name = '';
  originalEntity.position_x = 0;
  originalEntity.position_y = 0;
  originalEntity.position_z = 0;
  originalEntity.orientation = 0;
  originalEntity.map = 0;

  // TestBed Configuration
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), TranslateTestingModule],
      declarations: [],
      providers: [
        GameTeleHandlerService,
        {
          provide: SqliteService,
          useValue: instance(mock(SqliteService)),
        },
      ],
    }).compileComponents();
  }));

  // Setup Function
  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GameTeleHandlerService);
    // Ideally, use a public method or setter to set '_selected'
    // For illustration, we're setting it directly
    (handlerService as any)._selected = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const _fixture = TestBed.createComponent(GameTeleComponent);
    const page = new GameTelePage(_fixture);
    _fixture.autoDetectChanges(true);
    _fixture.detectChanges();
    return { page, _fixture };
  }

  // Creating New Tests
  describe('Creating new', () => {
    let page: GameTelePage;
    let _fixture: ComponentFixture<GameTeleComponent>;

    beforeEach(() => {
      ({ page, _fixture } = setup(true));
    });

    it('should correctly initialise', () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      querySpy.calls.reset();
    });

    it('should correctly update the unsaved status', () => {
      const field = 'name';
      expect(handlerService.isGameTeleUnsaved).toBe(false);
      page.setInputValueById(field, 'ABC');
      expect(handlerService.isGameTeleUnsaved).toBe(true);
      page.setInputValueById(field, '');
      expect(handlerService.isGameTeleUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `game_tele` WHERE (`id` = 1);\n' +
        'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
        "(1, 0, 0, 0, 0, 0, 'ABC');\n";

      querySpy.calls.reset();

      page.setInputValueById('name', 'ABC');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });
  });

  // Editing Existing Tests
  describe('Editing existing', () => {
    let page: GameTelePage;
    let _fixture: ComponentFixture<GameTeleComponent>;

    beforeEach(() => {
      ({ page, _fixture } = setup(false));
    });

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery =
        "UPDATE `game_tele` SET `position_x` = 1, `position_y` = 2, `position_z` = 3, `orientation` = 4, `map` = 5, `name` = '6' " +
        'WHERE (`id` = 1);';
      querySpy.calls.reset();

      page.setInputValueById('position_x', 1);
      page.setInputValueById('position_y', 2);
      page.setInputValueById('position_z', 3);
      page.setInputValueById('orientation', 4);
      page.setInputValueById('map', 5);
      page.setInputValueById('name', '6');
      // If you have a method to change all fields, consider using it
      // page.changeAllFields(originalEntity, ['name'], values);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('name', 'ABCD');
      page.expectDiffQueryToContain("UPDATE `game_tele` SET `name` = 'ABCD' WHERE (`id` = 1);");
      page.expectFullQueryToContain(
        'DELETE FROM `game_tele` WHERE (`id` = 1);\n' +
          'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
          "(1, 0, 0, 0, 0, 0, 'ABCD');\n",
      );

      page.setInputValueById('position_x', 1.234);
      page.expectDiffQueryToContain("UPDATE `game_tele` SET `position_x` = 1.234, `name` = 'ABCD' WHERE (`id` = 1);");
      page.expectFullQueryToContain(
        'DELETE FROM `game_tele` WHERE (`id` = 1);\n' +
          'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
          "(1, 1.234, 0, 0, 0, 0, 'ABCD');\n",
      );

      querySpy.calls.reset();
    });
  });
});
