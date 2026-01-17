import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { NpcText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { NpcTextComponent } from './npc-text.component';
import { NpcTextHandlerService } from './npc-text-handler.service';

describe('NpcText integration tests', () => {
  class Page extends EditorPageObject<NpcTextComponent> {}

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `npc_text` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `npc_text` (`ID`, `text0_0`, `text0_1`, `BroadcastTextID0`, `lang0`, `Probability0`, ' +
    '`em0_0`, `em0_1`, `em0_2`, `em0_3`, `em0_4`, `em0_5`, `text1_0`, `text1_1`, `BroadcastTextID1`, `lang1`, `Probability1`, ' +
    '`em1_0`, `em1_1`, `em1_2`, `em1_3`, `em1_4`, `em1_5`, `text2_0`, `text2_1`, `BroadcastTextID2`, `lang2`, `Probability2`, ' +
    '`em2_0`, `em2_1`, `em2_2`, `em2_3`, `em2_4`, `em2_5`, `text3_0`, `text3_1`, `BroadcastTextID3`, `lang3`, `Probability3`, ' +
    '`em3_0`, `em3_1`, `em3_2`, `em3_3`, `em3_4`, `em3_5`, `text4_0`, `text4_1`, `BroadcastTextID4`, `lang4`, `Probability4`, ' +
    '`em4_0`, `em4_1`, `em4_2`, `em4_3`, `em4_4`, `em4_5`, `text5_0`, `text5_1`, `BroadcastTextID5`, `lang5`, `Probability5`, ' +
    '`em5_0`, `em5_1`, `em5_2`, `em5_3`, `em5_4`, `em5_5`, `text6_0`, `text6_1`, `BroadcastTextID6`, `lang6`, `Probability6`, ' +
    '`em6_0`, `em6_1`, `em6_2`, `em6_3`, `em6_4`, `em6_5`, `text7_0`, `text7_1`, `BroadcastTextID7`, `lang7`, `Probability7`, ' +
    '`em7_0`, `em7_1`, `em7_2`, `em7_3`, `em7_4`, `em7_5`, `VerifiedBuild`) VALUES\n' +
    "(1234, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0," +
    " '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', " +
    "0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);\n";

  const originalEntity = new NpcText();
  originalEntity.ID = id;
  originalEntity.text0_0 = '1';
  originalEntity.text0_1 = '2';
  originalEntity.BroadcastTextID0 = 3;
  originalEntity.lang0 = 4;
  originalEntity.Probability0 = 5;
  originalEntity.em0_0 = 6;
  originalEntity.em0_1 = 7;
  originalEntity.em0_2 = 8;
  originalEntity.em0_3 = 9;
  originalEntity.em0_4 = 10;
  originalEntity.em0_5 = 11;
  originalEntity.text1_0 = '12';
  originalEntity.text1_1 = '13';
  originalEntity.BroadcastTextID1 = 14;
  originalEntity.lang1 = 15;
  originalEntity.Probability1 = 16;
  originalEntity.em1_0 = 17;
  originalEntity.em1_1 = 18;
  originalEntity.em1_2 = 19;
  originalEntity.em1_3 = 20;
  originalEntity.em1_4 = 21;
  originalEntity.em1_5 = 22;
  originalEntity.text2_0 = '23';
  originalEntity.text2_1 = '24';
  originalEntity.BroadcastTextID2 = 25;
  originalEntity.lang2 = 26;
  originalEntity.Probability2 = 27;
  originalEntity.em2_0 = 28;
  originalEntity.em2_1 = 29;
  originalEntity.em2_2 = 30;
  originalEntity.em2_3 = 31;
  originalEntity.em2_4 = 32;
  originalEntity.em2_5 = 33;
  originalEntity.text3_0 = '34';
  originalEntity.text3_1 = '35';
  originalEntity.BroadcastTextID3 = 36;
  originalEntity.lang3 = 37;
  originalEntity.Probability3 = 38;
  originalEntity.em3_0 = 39;
  originalEntity.em3_1 = 40;
  originalEntity.em3_2 = 41;
  originalEntity.em3_3 = 42;
  originalEntity.em3_4 = 43;
  originalEntity.em3_5 = 44;
  originalEntity.text4_0 = '45';
  originalEntity.text4_1 = '46';
  originalEntity.BroadcastTextID4 = 47;
  originalEntity.lang4 = 48;
  originalEntity.Probability4 = 49;
  originalEntity.em4_0 = 50;
  originalEntity.em4_1 = 51;
  originalEntity.em4_2 = 52;
  originalEntity.em4_3 = 53;
  originalEntity.em4_4 = 54;
  originalEntity.em4_5 = 55;
  originalEntity.text5_0 = '56';
  originalEntity.text5_1 = '57';
  originalEntity.BroadcastTextID5 = 58;
  originalEntity.lang5 = 59;
  originalEntity.Probability5 = 60;
  originalEntity.em5_0 = 61;
  originalEntity.em5_1 = 62;
  originalEntity.em5_2 = 63;
  originalEntity.em5_3 = 64;
  originalEntity.em5_4 = 65;
  originalEntity.em5_5 = 66;
  originalEntity.text6_0 = '67';
  originalEntity.text6_1 = '68';
  originalEntity.BroadcastTextID6 = 69;
  originalEntity.lang6 = 70;
  originalEntity.Probability6 = 71;
  originalEntity.em6_0 = 72;
  originalEntity.em6_1 = 73;
  originalEntity.em6_2 = 74;
  originalEntity.em6_3 = 75;
  originalEntity.em6_4 = 76;
  originalEntity.em6_5 = 77;
  originalEntity.text7_0 = '78';
  originalEntity.text7_1 = '79';
  originalEntity.BroadcastTextID7 = 80;
  originalEntity.lang7 = 81;
  originalEntity.Probability7 = 82;
  originalEntity.em7_0 = 83;
  originalEntity.em7_1 = 84;
  originalEntity.em7_2 = 85;
  originalEntity.em7_3 = 86;
  originalEntity.em7_4 = 87;
  originalEntity.em7_5 = 88;
  originalEntity.VerifiedBuild = 90;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), NpcTextComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(NpcTextHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(NpcTextComponent);
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
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'lang0';
      expect(handlerService.isUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `npc_text` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_text` (`ID`, `text0_0`, `text0_1`, `BroadcastTextID0`, `lang0`, `Probability0`, ' +
        '`em0_0`, `em0_1`, `em0_2`, `em0_3`, `em0_4`, `em0_5`, `text1_0`, `text1_1`, `BroadcastTextID1`, `lang1`, `Probability1`, ' +
        '`em1_0`, `em1_1`, `em1_2`, `em1_3`, `em1_4`, `em1_5`, `text2_0`, `text2_1`, `BroadcastTextID2`, `lang2`, `Probability2`, ' +
        '`em2_0`, `em2_1`, `em2_2`, `em2_3`, `em2_4`, `em2_5`, `text3_0`, `text3_1`, `BroadcastTextID3`, `lang3`, `Probability3`, ' +
        '`em3_0`, `em3_1`, `em3_2`, `em3_3`, `em3_4`, `em3_5`, `text4_0`, `text4_1`, `BroadcastTextID4`, `lang4`, `Probability4`, ' +
        '`em4_0`, `em4_1`, `em4_2`, `em4_3`, `em4_4`, `em4_5`, `text5_0`, `text5_1`, `BroadcastTextID5`, `lang5`, `Probability5`, ' +
        '`em5_0`, `em5_1`, `em5_2`, `em5_3`, `em5_4`, `em5_5`, `text6_0`, `text6_1`, `BroadcastTextID6`, `lang6`, `Probability6`, ' +
        '`em6_0`, `em6_1`, `em6_2`, `em6_3`, `em6_4`, `em6_5`, `text7_0`, `text7_1`, `BroadcastTextID7`, `lang7`, `Probability7`, ' +
        '`em7_0`, `em7_1`, `em7_2`, `em7_3`, `em7_4`, `em7_5`, `VerifiedBuild`) VALUES\n' +
        "(1234, 'Shin', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, " +
        "0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, " +
        "0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);";
      querySpy.calls.reset();

      page.setInputValueById('text0_0', 'Shin');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `npc_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `npc_text` (`ID`, `text0_0`, `text0_1`, `BroadcastTextID0`, `lang0`, `Probability0`, ' +
          '`em0_0`, `em0_1`, `em0_2`, `em0_3`, `em0_4`, `em0_5`, `text1_0`, `text1_1`, `BroadcastTextID1`, `lang1`, `Probability1`, ' +
          '`em1_0`, `em1_1`, `em1_2`, `em1_3`, `em1_4`, `em1_5`, `text2_0`, `text2_1`, `BroadcastTextID2`, `lang2`, `Probability2`, ' +
          '`em2_0`, `em2_1`, `em2_2`, `em2_3`, `em2_4`, `em2_5`, `text3_0`, `text3_1`, `BroadcastTextID3`, `lang3`, `Probability3`, ' +
          '`em3_0`, `em3_1`, `em3_2`, `em3_3`, `em3_4`, `em3_5`, `text4_0`, `text4_1`, `BroadcastTextID4`, `lang4`, `Probability4`, ' +
          '`em4_0`, `em4_1`, `em4_2`, `em4_3`, `em4_4`, `em4_5`, `text5_0`, `text5_1`, `BroadcastTextID5`, `lang5`, `Probability5`, ' +
          '`em5_0`, `em5_1`, `em5_2`, `em5_3`, `em5_4`, `em5_5`, `text6_0`, `text6_1`, `BroadcastTextID6`, `lang6`, `Probability6`, ' +
          '`em6_0`, `em6_1`, `em6_2`, `em6_3`, `em6_4`, `em6_5`, `text7_0`, `text7_1`, `BroadcastTextID7`, `lang7`, `Probability7`, ' +
          '`em7_0`, `em7_1`, `em7_2`, `em7_3`, `em7_4`, `em7_5`, `VerifiedBuild`) VALUES\n' +
          "(1234, '1', '2', 3, 4, 5, 6, 7, 8, 9, 10, 11, '12', '13', 14, 15, 16, 17, 18, 19, 20, 21, 22, '23', '24', 25, 26, 27, 28, 29, 30, 31, 32, 33, '34', '35', 36, 37, 38, 39, 40, 41, 42, 43, 44, '45', '46', 47, 48, 49, 50, 51, 52, 53, 54, 55, '56', '57', 58, 59, 60, 61, 62, 63, 64, 65, 66, '67', '68', 69, 70, 71, 72, 73, 74, 75, 76, 77, '78', '79', 80, 81, 82, 83, 84, 85, 86, 87, 88, 90);",
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        "UPDATE `npc_text` SET `text0_0` = '0', `text0_1` = '1', " +
        '`BroadcastTextID0` = 2, `lang0` = 3, `Probability0` = 4, `em0_0` = 5, `em0_1` = 6, `em0_2` = 7, `em0_3` = 8, ' +
        "`em0_4` = 9, `em0_5` = 10, `text1_0` = '11', `text1_1` = '12', `BroadcastTextID1` = 13, `lang1` = 14, " +
        '`Probability1` = 15, `em1_0` = 16, `em1_1` = 17, `em1_2` = 18, `em1_3` = 19, `em1_4` = 20, `em1_5` = 21, ' +
        "`text2_0` = '22', `text2_1` = '23', `BroadcastTextID2` = 24, `lang2` = 25, `Probability2` = 26, `em2_0` = 27, " +
        "`em2_1` = 28, `em2_2` = 29, `em2_3` = 30, `em2_4` = 31, `em2_5` = 32, `text3_0` = '33', `text3_1` = '34', " +
        '`BroadcastTextID3` = 35, `lang3` = 36, `Probability3` = 37, `em3_0` = 38, `em3_1` = 39, `em3_2` = 40, `em3_3` = 41, ' +
        "`em3_4` = 42, `em3_5` = 43, `text4_0` = '44', `text4_1` = '45', `BroadcastTextID4` = 46, `lang4` = 47, " +
        "`Probability4` = 48, `em4_0` = 49, `em4_1` = 50, `em4_2` = 51, `em4_3` = 52, `em4_4` = 53, `em4_5` = 54, `text5_0` = '55', " +
        "`text5_1` = '56', `BroadcastTextID5` = 57, `lang5` = 58, `Probability5` = 59, `em5_0` = 60, `em5_1` = 61, `em5_2` = 62, " +
        "`em5_3` = 63, `em5_4` = 64, `em5_5` = 65, `text6_0` = '66', `text6_1` = '67', `BroadcastTextID6` = 68, `lang6` = 69, " +
        "`Probability6` = 70, `em6_0` = 71, `em6_1` = 72, `em6_2` = 73, `em6_3` = 74, `em6_4` = 75, `em6_5` = 76, `text7_0` = '77', " +
        "`text7_1` = '78', `BroadcastTextID7` = 79, `lang7` = 80, `Probability7` = 81, `em7_0` = 82, `em7_1` = 83, `em7_2` = 84, " +
        '`em7_3` = 85, `em7_4` = 86, `em7_5` = 87 WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['ID', 'VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('text0_1', 'Shin');
      page.expectDiffQueryToContain("UPDATE `npc_text` SET `text0_1` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `npc_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `npc_text` (`ID`, `text0_0`, `text0_1`, `BroadcastTextID0`, `lang0`, `Probability0`, ' +
          '`em0_0`, `em0_1`, `em0_2`, `em0_3`, `em0_4`, `em0_5`, `text1_0`, `text1_1`, `BroadcastTextID1`, `lang1`, `Probability1`, ' +
          '`em1_0`, `em1_1`, `em1_2`, `em1_3`, `em1_4`, `em1_5`, `text2_0`, `text2_1`, `BroadcastTextID2`, `lang2`, `Probability2`, ' +
          '`em2_0`, `em2_1`, `em2_2`, `em2_3`, `em2_4`, `em2_5`, `text3_0`, `text3_1`, `BroadcastTextID3`, `lang3`, `Probability3`, ' +
          '`em3_0`, `em3_1`, `em3_2`, `em3_3`, `em3_4`, `em3_5`, `text4_0`, `text4_1`, `BroadcastTextID4`, `lang4`, `Probability4`, ' +
          '`em4_0`, `em4_1`, `em4_2`, `em4_3`, `em4_4`, `em4_5`, `text5_0`, `text5_1`, `BroadcastTextID5`, `lang5`, `Probability5`, ' +
          '`em5_0`, `em5_1`, `em5_2`, `em5_3`, `em5_4`, `em5_5`, `text6_0`, `text6_1`, `BroadcastTextID6`, `lang6`, `Probability6`, ' +
          '`em6_0`, `em6_1`, `em6_2`, `em6_3`, `em6_4`, `em6_5`, `text7_0`, `text7_1`, `BroadcastTextID7`, `lang7`, `Probability7`, ' +
          '`em7_0`, `em7_1`, `em7_2`, `em7_3`, `em7_4`, `em7_5`, `VerifiedBuild`) VALUES\n' +
          "(1234, '1', 'Shin', 3, 4, 5, 6, 7, 8, 9, 10, 11, '12', '13', 14, 15, 16, 17, 18, 19, 20, 21, 22, '23', '24', 25, " +
          "26, 27, 28, 29, 30, 31, 32, 33, '34', '35', 36, 37, 38, 39, 40, 41, 42, 43, 44, '45', '46', 47, 48, 49, 50, 51, 52, 53, " +
          "54, 55, '56', '57', 58, 59, 60, 61, 62, 63, 64, 65, 66, '67', '68', 69, 70, 71, 72, 73, 74, 75, 76, 77, '78', '79', " +
          '80, 81, 82, 83, 84, 85, 86, 87, 88, 90);',
      );

      page.setInputValueById('text0_0', '22');
      page.expectDiffQueryToContain("UPDATE `npc_text` SET `text0_0` = '22', `text0_1` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `npc_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `npc_text` (`ID`, `text0_0`, `text0_1`, `BroadcastTextID0`, `lang0`, `Probability0`, ' +
          '`em0_0`, `em0_1`, `em0_2`, `em0_3`, `em0_4`, `em0_5`, `text1_0`, `text1_1`, `BroadcastTextID1`, `lang1`, `Probability1`, ' +
          '`em1_0`, `em1_1`, `em1_2`, `em1_3`, `em1_4`, `em1_5`, `text2_0`, `text2_1`, `BroadcastTextID2`, `lang2`, `Probability2`, ' +
          '`em2_0`, `em2_1`, `em2_2`, `em2_3`, `em2_4`, `em2_5`, `text3_0`, `text3_1`, `BroadcastTextID3`, `lang3`, `Probability3`, ' +
          '`em3_0`, `em3_1`, `em3_2`, `em3_3`, `em3_4`, `em3_5`, `text4_0`, `text4_1`, `BroadcastTextID4`, `lang4`, `Probability4`, ' +
          '`em4_0`, `em4_1`, `em4_2`, `em4_3`, `em4_4`, `em4_5`, `text5_0`, `text5_1`, `BroadcastTextID5`, `lang5`, `Probability5`, ' +
          '`em5_0`, `em5_1`, `em5_2`, `em5_3`, `em5_4`, `em5_5`, `text6_0`, `text6_1`, `BroadcastTextID6`, `lang6`, `Probability6`, ' +
          '`em6_0`, `em6_1`, `em6_2`, `em6_3`, `em6_4`, `em6_5`, `text7_0`, `text7_1`, `BroadcastTextID7`, `lang7`, `Probability7`, ' +
          '`em7_0`, `em7_1`, `em7_2`, `em7_3`, `em7_4`, `em7_5`, `VerifiedBuild`) VALUES\n' +
          "(1234, '22', 'Shin', 3, 4, 5, 6, 7, 8, 9, 10, 11, '12', '13', 14, 15, 16, 17, 18, 19, 20, 21, 22, '23', '24', " +
          "25, 26, 27, 28, 29, 30, 31, 32, 33, '34', '35', 36, 37, 38, 39, 40, 41, 42, 43, 44, '45', '46', 47, 48, 49, 50, 51, " +
          "52, 53, 54, 55, '56', '57', 58, 59, 60, 61, 62, 63, 64, 65, 66, '67', '68', 69, 70, 71, 72, 73, 74, 75, 76, 77, " +
          "'78', '79', 80, 81, 82, 83, 84, 85, 86, 87, 88, 90);",
      );
      page.removeNativeElement();
    });
  });
});
