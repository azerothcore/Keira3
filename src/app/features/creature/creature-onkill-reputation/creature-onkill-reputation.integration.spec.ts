import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureOnkillReputationComponent } from './creature-onkill-reputation.component';
import { CreatureOnkillReputationModule } from './creature-onkill-reputation.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { highlightOptions } from '@keira-config/highlight.config';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureOnkillReputation } from '@keira-types/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

class CreatureOnkillReputationPage extends EditorPageObject<CreatureOnkillReputationComponent> {}

describe('CreatureOnkillReputation integration tests', () => {
  let component: CreatureOnkillReputationComponent;
  let fixture: ComponentFixture<CreatureOnkillReputationComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureOnkillReputationPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
  'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`,' +
  ' `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, '  +
  '`MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n'  +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0);';

  const originalEntity = new CreatureOnkillReputation();
  originalEntity.creature_id = id;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureOnkillReputationModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: HIGHLIGHT_OPTIONS, useValue: highlightOptions },
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    fixture = TestBed.createComponent(CreatureOnkillReputationComponent);
    component = fixture.componentInstance;
    page = new CreatureOnkillReputationPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise',   waitForAsync(async () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('should correctly update the unsaved status', () => {
      const field = 'RewOnKillRepFaction1';
      expect(handlerService.isCreatureOnkillReputationUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureOnkillReputationUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureOnkillReputationUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
      'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`,' +
      ' `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, '  +
      '`MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n'  +
        '(1234, 2, 0, 0, 0, 0, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.setInputValueById('RewOnKillRepFaction1', '2');
      page.clickExecuteQuery();

      await page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', waitForAsync(async () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('changing all properties and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'UPDATE `creature_onkill_reputation` SET ' +
        '`RewOnKillRepFaction2` = 1, `MaxStanding1` = 2, `IsTeamAward1` = 3, `RewOnKillRepValue1` = 4, ' +
        '`MaxStanding2` = 5, `IsTeamAward2` = 6, `RewOnKillRepValue2` = 7, `TeamDependent` = 8 WHERE (`creature_id` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      await page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

    it('changing values should correctly update the queries',  waitForAsync(async () => {
      page.setInputValueById('RewOnKillRepFaction2', '1');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_onkill_reputation` SET `RewOnKillRepFaction2` = 1 WHERE (`creature_id` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
        'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`,' +
        ' `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, '  +
        '`MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n'  +
        '(1234, 0, 1, 0, 0, 0, 0, 0, 0, 0);'
      );

      page.setInputValueById('IsTeamAward1', '3');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_onkill_reputation` SET `RewOnKillRepFaction2` = 1, `IsTeamAward1` = 3 WHERE (`creature_id` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
        'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`,' +
        ' `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, '  +
        '`MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n'  +
        '(1234, 0, 1, 0, 3, 0, 0, 0, 0, 0);'
      );
    }));

    it('changing a value via SingleValueSelector should correctly work', waitForAsync(async () => {
      const field = 'MaxStanding1';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();
      await page.whenReady();

      page.clickRowOfDatatableInModal(7);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('7');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_onkill_reputation` SET `MaxStanding1` = 7 WHERE (`creature_id` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
        'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`,' +
        ' `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, '  +
        '`MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n'  +
        '(1234, 0, 0, 7, 0, 0, 0, 0, 0, 0);'
      );
    }));

    it('changing a value via FactionSelector should correctly work', waitForAsync(async () => {
      const field = 'RewOnKillRepFaction1';
      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'query').and.returnValue(of(
        [{ m_ID: 123, m_name_lang_1: 'Mock Faction' }]
      ));

      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickSearchBtn();
      await fixture.whenStable();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      await page.expectDiffQueryToContain(
        'UPDATE `creature_onkill_reputation` SET `RewOnKillRepFaction1` = 123 WHERE (`creature_id` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_onkill_reputation` WHERE (`creature_id` = 1234);\n' +
        'INSERT INTO `creature_onkill_reputation` (`creature_id`, `RewOnKillRepFaction1`, `RewOnKillRepFaction2`, `MaxStanding1`, `IsTeamAward1`, `RewOnKillRepValue1`, `MaxStanding2`, `IsTeamAward2`, `RewOnKillRepValue2`, `TeamDependent`) VALUES\n' +
        '(1234, 123, 0, 0, 0, 0, 0, 0, 0, 0);'
      );
    }));
  });
});

