import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

class CreatureDefaultTrainerPage extends EditorPageObject<CreatureDefaultTrainerComponent> {}

describe('CreatureDefaultTrainer integration tests', () => {
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
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(CreatureDefaultTrainerComponent);
    const page = new CreatureDefaultTrainerPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      const field = 'TrainerId';
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureDefaultTrainerUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
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
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { querySpy, page } = setup(false);
      const expectedQuery = 'UPDATE `creature_default_trainer` SET `TrainerId` = 1 WHERE (`CreatureId` = 1234);';
      querySpy.calls.reset();

      page.setInputValueById('TrainerId', '1');

      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
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
