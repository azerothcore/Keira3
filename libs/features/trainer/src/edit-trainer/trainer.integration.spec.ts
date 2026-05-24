import { vi } from 'vitest';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Trainer } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TrainerComponent } from './trainer.component';

class TrainerPage extends EditorPageObject<TrainerComponent> {}

describe('Trainer integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `trainer` WHERE (`Id` = 1234);\n' +
    'INSERT INTO `trainer` (`Id`, `Type`, `Requirement`, `Greeting`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, '', 0);";

  const originalEntity = new Trainer();
  originalEntity.Id = id;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), TrainerComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        TrainerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(TrainerHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(TrainerComponent);
    const page = new TrainerPage(fixture);
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

    it('changing a property and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `trainer` WHERE (`Id` = 1234);\n' +
        'INSERT INTO `trainer` (`Id`, `Type`, `Requirement`, `Greeting`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 5, '', 0);";
      querySpy.mockClear();

      page.setInputValueById('Requirement', 5);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isTrainerUnsaved()).toBe(false);
      page.setInputValueById('Requirement', 3);
      expect(handlerService.isTrainerUnsaved()).toBe(true);
      page.setInputValueById('Requirement', 0);
      expect(handlerService.isTrainerUnsaved()).toBe(false);
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing a value should correctly update the queries', () => {
      const { page } = setup(false);

      page.setInputValueById('Requirement', 7);
      page.expectDiffQueryToContain('UPDATE `trainer` SET `Requirement` = 7 WHERE (`Id` = 1234);');
      page.expectFullQueryToContain('7');

      page.setInputValueById('Greeting', 'Hello there');
      page.expectDiffQueryToContain("UPDATE `trainer` SET `Requirement` = 7, `Greeting` = 'Hello there' WHERE (`Id` = 1234);");
      page.expectFullQueryToContain('Hello there');
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      const written = await page.changeAllFieldsAsync(originalEntity, ['VerifiedBuild']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('structured UPDATE matcher: a single numeric field flows into the diff query', () => {
      const { page } = setup(false);

      // first in-tree caller for expectDiffQueryToUpdate
      page.setInputValueById('Requirement', 42);
      page.expectDiffQueryToUpdate('trainer', { Id: id }, { Requirement: 42 });
      // exact-string check alongside the structured matcher
      page.expectDiffQueryToContain('UPDATE `trainer` SET `Requirement` = 42 WHERE (`Id` = 1234);');
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.setInputValueById('Requirement', 9);

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });
});
