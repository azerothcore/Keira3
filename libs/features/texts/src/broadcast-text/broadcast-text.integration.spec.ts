import { TestBed, waitForAsync } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { BroadcastText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { BroadcastTextComponent } from './broadcast-text.component';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

describe('BroadcastText integration tests', () => {
  class Page extends EditorPageObject<BroadcastTextComponent> {}

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `broadcast_text` (`ID`, `LanguageID`, `MaleText`, `FemaleText`, ' +
    '`EmoteID1`, `EmoteID2`, `EmoteID3`, `EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, ' +
    '`SoundEntriesId`, `EmotesID`, `Flags`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);\n";

  const originalEntity = new BroadcastText();
  originalEntity.ID = id;
  originalEntity.LanguageID = 1;
  originalEntity.MaleText = '2';
  originalEntity.FemaleText = '3';
  originalEntity.EmoteID1 = 4;
  originalEntity.EmoteID2 = 5;
  originalEntity.EmoteID3 = 6;
  originalEntity.EmoteDelay1 = 7;
  originalEntity.EmoteDelay2 = 8;
  originalEntity.EmoteDelay3 = 9;
  originalEntity.SoundEntriesId = 10;
  originalEntity.EmotesID = 11;
  originalEntity.Flags = 12;
  originalEntity.VerifiedBuild = 13;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), BroadcastTextComponent, TranslateTestingModule],
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(BroadcastTextHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(BroadcastTextComponent);
    const component = fixture.componentInstance;
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, fixture, component, page: page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'LanguageID';
      expect(handlerService.isUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isUnsaved).toBe(false);
      page.removeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `broadcast_text` (`ID`, `LanguageID`, `MaleText`, `FemaleText`, `EmoteID1`, `EmoteID2`, `EmoteID3`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `SoundEntriesId`, `EmotesID`, `Flags`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 'Shin', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);";
      querySpy.calls.reset();

      page.setInputValueById('MaleText', 'Shin');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `LanguageID`, `MaleText`, `FemaleText`, `EmoteID1`, `EmoteID2`, `EmoteID3`, ' +
          '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `SoundEntriesId`, `EmotesID`, `Flags`, `VerifiedBuild`) VALUES\n' +
          "(1234, 1, '2', '3', 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);",
      );
      page.removeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        'UPDATE `broadcast_text` SET `LanguageID` = 0, ' +
        "`MaleText` = '1', `FemaleText` = '2', `EmoteID1` = 3, `EmoteID2` = 4, `EmoteID3` = 5, " +
        '`EmoteDelay1` = 6, `EmoteDelay2` = 7, `EmoteDelay3` = 8, `SoundEntriesId` = 9, `EmotesID` = 10, `Flags` = 11 ' +
        'WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('FemaleText', 'Shin');
      page.expectDiffQueryToContain("UPDATE `broadcast_text` SET `FemaleText` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `LanguageID`, `MaleText`, `FemaleText`, `EmoteID1`, `EmoteID2`, `EmoteID3`, ' +
          '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `SoundEntriesId`, `EmotesID`, `Flags`, `VerifiedBuild`) VALUES\n' +
          "(1234, 1, '2', 'Shin', 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);",
      );

      page.setInputValueById('MaleText', '22');
      page.expectDiffQueryToContain("UPDATE `broadcast_text` SET `MaleText` = '22', `FemaleText` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `LanguageID`, `MaleText`, `FemaleText`, `EmoteID1`, `EmoteID2`, `EmoteID3`, `EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `SoundEntriesId`, `EmotesID`, `Flags`, `VerifiedBuild`) VALUES\n' +
          "(1234, 1, '22', 'Shin', 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);",
      );
      page.removeElement();
    });
  });
});
