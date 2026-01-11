import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureDefaultTrainer } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureDefaultTrainerComponent } from './creature-default-trainer.component';
import Spy = jasmine.Spy;

class CreatureDefaultTrainerPage extends EditorPageObject<CreatureDefaultTrainerComponent> {}

describe('CreatureDefaultTrainer integration tests', () => {
  let fixture: ComponentFixture<CreatureDefaultTrainerComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureDefaultTrainerPage;

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `creature_default_trainer` WHERE (`CreatureId` = 1234);\n' +
    'INSERT INTO `creature_default_trainer` (`CreatureId`, `TrainerId`) VALUES\n' +
    '(1234, 0);';

  const originalEntity = new CreatureDefaultTrainer();
  originalEntity.CreatureId = id;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureDefaultTrainerComponent,
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
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    fixture = TestBed.createComponent(CreatureDefaultTrainerComponent);
    page = new CreatureDefaultTrainerPage(fixture);
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
      const field = 'TrainerId';
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_default_trainer` WHERE (`CreatureId` = 1234);\n' +
        'INSERT INTO `creature_default_trainer` (`CreatureId`, `TrainerId`) VALUES\n' +
        '(1234, 100);';
      querySpy.calls.reset();

      page.setInputValueById('TrainerId', '100');
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
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `creature_default_trainer` SET `TrainerId` = 1 WHERE (`CreatureId` = 1234);';
      querySpy.calls.reset();

      page.setInputValueById('TrainerId', '1');

      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('TrainerId', '50');
      page.expectDiffQueryToContain('UPDATE `creature_default_trainer` SET `TrainerId` = 50 WHERE (`CreatureId` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_default_trainer` WHERE (`CreatureId` = 1234);\n' +
          'INSERT INTO `creature_default_trainer` (`CreatureId`, `TrainerId`) VALUES\n' +
          '(1234, 50);',
      );

      page.setInputValueById('TrainerId', '75');
      page.expectDiffQueryToContain('UPDATE `creature_default_trainer` SET `TrainerId` = 75 WHERE (`CreatureId` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_default_trainer` WHERE (`CreatureId` = 1234);\n' +
          'INSERT INTO `creature_default_trainer` (`CreatureId`, `TrainerId`) VALUES\n' +
          '(1234, 75);',
      );
    });
  });
});
