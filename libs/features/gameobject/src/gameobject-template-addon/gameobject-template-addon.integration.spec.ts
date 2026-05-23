import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { instance, mock } from 'ts-mockito';

class GameobjectTemplateAddonPage extends EditorPageObject<GameobjectTemplateAddonComponent> {}

describe('GameobjectTemplateAddon integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' +
    id +
    ');\n' +
    'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`, `artkit0`, `artkit1`, `artkit2`, `artkit3`) VALUES\n' +
    '(' +
    id +
    ', 0, 0, 0, 0, 0, 0, 0, 0);';

  const originalEntity = new GameobjectTemplateAddon();
  originalEntity.entry = id;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        GameobjectTemplateAddonComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(GameobjectTemplateAddonComponent);
    const page = new GameobjectTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'faction';
      expect(handlerService.isGameobjectTemplateAddonUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isGameobjectTemplateAddonUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isGameobjectTemplateAddonUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' +
        id +
        ');\n' +
        'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`, `artkit0`, `artkit1`, `artkit2`, `artkit3`) VALUES\n' +
        '(' +
        id +
        ', 35, 0, 0, 0, 0, 0, 0, 0);';

      querySpy.mockClear();

      page.setInputValueById('faction', '35');
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
      const { page, querySpy } = setup(false);
      const expectedQuery =
        'UPDATE `gameobject_template_addon` SET ' +
        '`flags` = 1, `mingold` = 2, `maxgold` = 3, `artkit0` = 4, `artkit1` = 5, `artkit2` = 6, `artkit3` = 7 WHERE (`entry` = ' +
        id +
        ');';

      querySpy.mockClear();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('faction', '35');
      page.expectDiffQueryToContain('UPDATE `gameobject_template_addon` SET `faction` = 35 WHERE (`entry` = ' + id + ');');
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
      page.setInputValueById('faction', '35');

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });

    it('changing a value via FactionSelector should correctly work', async () => {
      const { page } = setup(false);
      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      vi.spyOn(sqliteQueryService, 'query').mockReturnValue(of([{ m_ID: 42, faction_name_id: 0, m_name_lang_1: 'Mock Faction' }]));

      const result = await page.openSelectorAndPickRow('faction', 0, { clickSearch: true });

      expect(result).toBe('42');
      page.expectDiffQueryToContain('`faction` = 42');
    });

    it('changing a value via FlagsSelector should correctly work', async () => {
      const { page } = setup(false);

      const result = await page.openFlagsAndToggle('flags', [1, 3]);

      expect(result).toBe(10);
      page.expectDiffQueryToContain('UPDATE `gameobject_template_addon` SET `flags` = 10 WHERE (`entry` = ' + id + ');');
      page.expectFullQueryToContain('10');
    });
  });
});
