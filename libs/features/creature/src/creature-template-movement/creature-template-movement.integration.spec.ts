import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateMovementComponent } from './creature-template-movement.component';
import Spy = jasmine.Spy;

class CreatureTemplateMovementPage extends EditorPageObject<CreatureTemplateMovementComponent> {}

describe('CreatureTemplateMovement integration tests', () => {
  let fixture: ComponentFixture<CreatureTemplateMovementComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateMovementPage;

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `creature_template_movement` WHERE (`CreatureId` = 1234);\n' +
    'INSERT INTO `creature_template_movement` (`CreatureId`, `Ground`, `Swim`, `Flight`, `Rooted`, `Chase`, `Random`, `InteractionPauseTimer`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0);';

  const originalEntity = new CreatureTemplateMovement();
  originalEntity.CreatureId = id;
  originalEntity.Ground = 0;
  originalEntity.Swim = 1;
  originalEntity.Flight = 2;
  originalEntity.Rooted = 1;
  originalEntity.Chase = 0;
  originalEntity.Random = 2;
  originalEntity.InteractionPauseTimer = 0;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureTemplateMovementComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    fixture = TestBed.createComponent(CreatureTemplateMovementComponent);
    page = new CreatureTemplateMovementPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const field = 'Ground';
      expect(handlerService.isCreatureTemplateMovementUnsaved()).toBe(false);
      page.setSelectValueById(field, 3);
      expect(handlerService.isCreatureTemplateMovementUnsaved()).toBe(true);
      page.setSelectValueById(field, 0);
      expect(handlerService.isCreatureTemplateMovementUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_template_movement` WHERE (`CreatureId` = 1234);\n' +
        'INSERT INTO `creature_template_movement` (`CreatureId`, `Ground`, `Swim`, `Flight`, `Rooted`, `Chase`, `Random`, `InteractionPauseTimer`) VALUES\n' +
        '(1234, 1, 0, 0, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.setSelectValueById('Ground', 1);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_movement` WHERE (`CreatureId` = 1234);\n' +
          'INSERT INTO `creature_template_movement` (`CreatureId`, `Ground`, `Swim`, `Flight`, `Rooted`, `Chase`, `Random`, `InteractionPauseTimer`) VALUES\n' +
          '(1234, 0, 1, 2, 1, 0, 2, 0);',
      );
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery =
        'UPDATE `creature_template_movement` SET `Ground` = 1, `Swim` = 0, `Flight` = 1, `Rooted` = 0, `Chase` = 1, `Random` = 1, `InteractionPauseTimer` = 6 WHERE (`CreatureId` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['CreatureId'], [1, 0, 1, 0, 1, 1, 1]);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setSelectValueById('Ground', 1);
      page.expectDiffQueryToContain('UPDATE `creature_template_movement` SET `Ground` = 1 WHERE (`CreatureId` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_movement` WHERE (`CreatureId` = 1234);\n' +
          'INSERT INTO `creature_template_movement` (`CreatureId`, `Ground`, `Swim`, `Flight`, `Rooted`, `Chase`, `Random`, `InteractionPauseTimer`) VALUES\n' +
          '(1234, 1, 1, 2, 1, 0, 2, 0);',
      );

      page.setInputValueById('InteractionPauseTimer', '2');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_movement` SET `Ground` = 1, `InteractionPauseTimer` = 2 WHERE (`CreatureId` = 1234);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_movement` WHERE (`CreatureId` = 1234);\n' +
          'INSERT INTO `creature_template_movement` (`CreatureId`, `Ground`, `Swim`, `Flight`, `Rooted`, `Chase`, `Random`, `InteractionPauseTimer`) VALUES\n' +
          '(1234, 1, 1, 2, 1, 0, 2, 2);\n',
      );
    });
  });
});
