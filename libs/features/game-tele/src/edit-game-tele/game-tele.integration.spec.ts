import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
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

class GameTelePage extends EditorPageObject<GameTeleComponent> {}

describe('GameTele integration tests', () => {
  let fixture: ComponentFixture<GameTeleComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameTeleHandlerService;
  let page: GameTelePage;

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
  originalEntity.name = 'ABC';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        GameTeleComponent, // This should typically be in declarations, but as per your instruction, it's left unchanged
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [
        GameTeleHandlerService,
        {
          provide: SqliteService,
          useValue: instance(mock(SqliteService)),
        },
      ],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GameTeleHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    fixture = TestBed.createComponent(GameTeleComponent);
    page = new GameTelePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

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
        "(1, 0, 0, 0, 0, 0, 'ABC');";

      querySpy.calls.reset();

      page.setInputValueById('name', 'ABC');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    describe('Editing existing', () => {
      beforeEach(() => setup(false));

      it('should correctly initialise', () => {
        page.expectDiffQueryToBeShown();
        page.expectDiffQueryToBeEmpty();
        page.expectFullQueryToContain(expectedFullCreateQuery);
      });

      it('changing all properties and executing the query should correctly work', () => {
        const expectedQuery =
          "UPDATE `game_tele` SET `position_x` = 1, `position_x` = 1, `position_x` = 2, `map` = 3, `name` = 'ABCD'," +
          'WHERE (`id` = 1)' +
          ';\n';
        querySpy.calls.reset();

        page.changeAllFields(originalEntity, []);
        page.expectDiffQueryToContain(expectedQuery);

        page.clickExecuteQuery();
        expect(querySpy).toHaveBeenCalledTimes(1);
        expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      });

      it('changing values should correctly update the queries', () => {
        page.setInputValueById('name', 'ABCD');
        page.expectDiffQueryToContain("UPDATE `game_tele` SET `name` = 'ABCD' WHERE (`id` = 1)" + ';\n');
        page.expectFullQueryToContain(
          'DELETE FROM `game_tele` WHERE (`id` = 1);\n' +
            'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
            "(1, 0, 0, 0, 0, 0, 'ABCD');",
        );

        page.setInputValueById('position_x', '1234');
        page.expectDiffQueryToContain("UPDATE `game_tele` SET  `name` = 'ABCD', `position_x` = 1234 WHERE (`id` = 1)" + ';\n');
        page.expectFullQueryToContain(
          'DELETE FROM `game_tele` WHERE (`id` = 1);\n' +
            'INSERT INTO `game_tele` (`id`, `position_x`, `position_y`, `position_z`, `orientation`, `map`, `name`) VALUES\n' +
            "(1, 1234, 0, 0, 0, 0, 'ABCD');",
        );

        querySpy.calls.reset();
      });
    });
  });
});
