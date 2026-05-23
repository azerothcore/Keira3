import { vi } from 'vitest';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameobjectTemplate } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateComponent } from './gameobject-template.component';

class GameobjectTemplatePage extends EditorPageObject<GameobjectTemplateComponent> {}

describe('GameobjectTemplate integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `gameobject_template` WHERE (`entry` = ' +
    id +
    ');\n' +
    'INSERT INTO `gameobject_template` (`entry`, `type`, `displayId`, `name`, `IconName`, `castBarCaption`, ' +
    '`unk1`, `size`, `Data0`, `Data1`, `Data2`, `Data3`, `Data4`, `Data5`, `Data6`, `Data7`, `Data8`, `Data9`, ' +
    '`Data10`, `Data11`, `Data12`, `Data13`, `Data14`, `Data15`, `Data16`, `Data17`, `Data18`, `Data19`, `Data20`, ' +
    '`Data21`, `Data22`, `Data23`, `AIName`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    '(' +
    id +
    ", 0, 0, '', '', '', '', 1, 0, 0, 0, 0, 0, 0, 0, " +
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0);";

  const originalEntity = new GameobjectTemplate();
  originalEntity.entry = id;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        GameobjectTemplateComponent,
        RouterTestingModule,
        TranslateTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    const model3DViewerService = TestBed.inject(Model3DViewerService);
    vi.spyOn(model3DViewerService, 'generateModels').mockReturnValue(new Promise((resolve) => resolve({ destroy: () => {} })));

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(GameobjectTemplateComponent);
    const page = new GameobjectTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, handlerService, page, model3DViewerService };
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
      const field = 'Data0';
      expect(handlerService.isGameobjectTemplateUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isGameobjectTemplateUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isGameobjectTemplateUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `gameobject_template` WHERE (`entry` = ' +
        id +
        ');\n' +
        'INSERT INTO `gameobject_template` (`entry`, `type`, `displayId`, `name`, `IconName`, `castBarCaption`, ' +
        '`unk1`, `size`, `Data0`, `Data1`, `Data2`, `Data3`, `Data4`, `Data5`, `Data6`, `Data7`, `Data8`, `Data9`, ' +
        '`Data10`, `Data11`, `Data12`, `Data13`, `Data14`, `Data15`, `Data16`, `Data17`, `Data18`, `Data19`, `Data20`, ' +
        '`Data21`, `Data22`, `Data23`, `AIName`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(' +
        id +
        ", 0, 0, 'Helias', '', '', '', 1, 0, 0, 0, 0, 0, 0, 0, " +
        "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0);";

      querySpy.mockClear();

      page.setInputValueById('name', 'Helias');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
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
      const expectedQuery =
        "UPDATE `gameobject_template` SET `displayId` = 1, `name` = '2', " +
        "`castBarCaption` = '4', `unk1` = '5', `size` = 6, `Data0` = 7, `Data1` = 8, `Data2` = 9, `Data3` = 10, " +
        '`Data4` = 11, `Data5` = 12, `Data6` = 13, `Data7` = 14, `Data8` = 15, `Data9` = 16, `Data10` = 17, `Data11` = 18, ' +
        '`Data12` = 19, `Data13` = 20, `Data14` = 21, `Data15` = 22, `Data16` = 23, `Data17` = 24, `Data18` = 25, ' +
        "`Data19` = 26, `Data20` = 27, `Data21` = 28, `Data22` = 29, `Data23` = 30, `AIName` = '31', " +
        "`ScriptName` = '32' WHERE (`entry` = 1234);";

      querySpy.mockClear();

      const values: (string | number)[] = [];

      values[4] = 'Directions'; // IconName

      page.changeAllFields(originalEntity, ['VerifiedBuild'], values);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('name', 'Helias');
      page.expectDiffQueryToContain("UPDATE `gameobject_template` SET `name` = 'Helias' WHERE (`entry` = " + id + ');');
      page.expectFullQueryToContain('Helias');

      page.setInputValueById('Data0', '35');
      page.expectDiffQueryToContain("UPDATE `gameobject_template` SET `name` = 'Helias', `Data0` = 35 WHERE (`entry` = " + id + ');');
      page.expectFullQueryToContain('Helias');
      page.expectFullQueryToContain('35');
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      const written = await page.changeAllFieldsAsync(originalEntity, ['VerifiedBuild']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.setInputValueById('name', 'Helias');

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });
});
