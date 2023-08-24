import { TestBed, waitForAsync } from '@angular/core/testing';
import { SAI_ACTIONS } from '@keira-shared/modules/sai-editor/constants/sai-actions';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { of } from 'rxjs';
import { MysqlQueryService } from '../../services/mysql-query.service';
import {
  DYNAMIC_FLAGS,
  EVENT_FLAGS,
  GO_FLAGS,
  NPC_FLAGS,
  UNIT_FLAGS,
  templates,
  unitBytes1Flags,
  unitFieldBytes1Type,
  unitStandFlags,
  unitStandStateType,
} from './constants/sai-constants';
import { SAI_TARGETS } from './constants/sai-targets';
import { SaiCommentGeneratorService } from './sai-comment-generator.service';

describe('SaiCommentGeneratorService', () => {
  beforeEach(waitForAsync(() => TestBed.configureTestingModule({})));

  describe('Comment generation should correctly work', () => {
    const createSai = (partial: Partial<SmartScripts>) => Object.assign(new SmartScripts(), partial);
    const mockName = 'MockEntity';
    const mockCreatureNameById = 'mockCreatureNameById';
    const mockCreatureNameByGuid = 'mockCreatureNameByGuid';
    const mockGameobjectNameById = 'mockGameobjectNameById';
    const mockGameobjectNameByGuid = 'mockGameobjectNameByGuid';
    const mockQuestTitleById = 'mockQuestTitleById';
    const mockItemNameById = 'mockItemNameById';
    const mockQuestTitleByCriteria = 'mockQuestTitleByCriteria';
    const mockGetSpellNameById = 'mockGetSpellNameById';

    beforeEach(() => {
      const queryService = TestBed.inject(MysqlQueryService);
      spyOn(queryService, 'getCreatureNameById').and.callFake((i) => of(mockCreatureNameById + i).toPromise());
      spyOn(queryService, 'getCreatureNameByGuid').and.callFake((i) => of(mockCreatureNameByGuid + i).toPromise());
      spyOn(queryService, 'getGameObjectNameById').and.callFake((i) => of(mockGameobjectNameById + i).toPromise());
      spyOn(queryService, 'getGameObjectNameByGuid').and.callFake((i) => of(mockGameobjectNameByGuid + i).toPromise());
      spyOn(queryService, 'getQuestTitleById').and.callFake((i) => of(mockQuestTitleById + i).toPromise());
      spyOn(queryService, 'getItemNameById').and.callFake((i) => of(mockItemNameById + i).toPromise());
      spyOn(queryService, 'getQuestTitleByCriteria').and.callFake((i) => of(mockQuestTitleByCriteria + i).toPromise());

      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'getSpellNameById').and.callFake((i) => of(mockGetSpellNameById + i).toPromise());
    });

    it('should correctly handle linked events', waitForAsync(async () => {
      const rows: SmartScripts[] = [
        createSai({ id: 1, event_type: SAI_EVENTS.ACCEPTED_QUEST, link: 2 }),
        createSai({ id: 2, event_type: SAI_EVENTS.LINK, link: 3 }),
        createSai({ id: 3, event_type: SAI_EVENTS.LINK }),
      ];
      const expected = `MockEntity - On Quest 'mockQuestTitleById0' Taken - No Action Type`;
      const service: SaiCommentGeneratorService = TestBed.inject(SaiCommentGeneratorService);

      expect(await service.generateComment(rows, rows[2], mockName)).toEqual(expected);
    }));

    const cases: { name: string; input: Partial<SmartScripts>; expected: string }[] = [
      {
        name: 'Non-existing event type',
        input: {
          event_type: 99999,
        },
        expected: 'Missing comment for event_type 99999 - No Action Type',
      },
      {
        name: 'Non-existing action type',
        input: {
          action_type: 99999,
        },
        expected: 'MockEntity - In Combat - Missing comment for action_type 99999',
      },
      {
        name: 'Empty Creature',
        input: {
          source_type: SAI_TYPES.SAI_TYPE_CREATURE,
        },
        expected: 'MockEntity - In Combat - No Action Type',
      },
      {
        name: 'Empty Gameobject',
        input: {
          source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT,
        },
        expected: 'MockEntity - In Combat - No Action Type',
      },
      {
        name: 'Empty Areatrigger',
        input: {
          source_type: SAI_TYPES.SAI_TYPE_AREATRIGGER,
          event_type: SAI_EVENTS.AREATRIGGER_ONTRIGGER,
        },
        expected: 'Areatrigger - On Trigger - No Action Type',
      },
      {
        name: 'Empty Areatrigger with wrong event type',
        input: {
          source_type: SAI_TYPES.SAI_TYPE_AREATRIGGER,
          event_type: SAI_EVENTS.AGGRO,
        },
        expected: 'Areatrigger - INCORRECT EVENT TYPE - No Action Type',
      },
      {
        name: 'Empty TimedActionlist',
        input: {
          source_type: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST,
        },
        expected: 'MockEntity - Actionlist - No Action Type',
      },
      {
        name: 'SAI_EVENTS.ACCEPTED_QUEST',
        input: {
          event_type: SAI_EVENTS.ACCEPTED_QUEST,
        },
        expected: `MockEntity - On Quest 'mockQuestTitleById0' Taken - No Action Type`,
      },
      {
        name: 'SAI_EVENTS.MANA_PCT check event param 1 and 2',
        input: {
          event_type: SAI_EVENTS.MANA_PCT,
          event_param1: 10,
          event_param2: 20,
        },
        expected: `MockEntity - Between 10-20% Mana - No Action Type`,
      },
      {
        name: 'SAI_ACTIONS.START_CLOSEST_WAYPOINT check action params 1,2,3,4,5,6',
        input: {
          action_type: SAI_ACTIONS.START_CLOSEST_WAYPOINT,
          action_param1: 11,
          action_param2: 22,
          action_param3: 33,
          action_param4: 44,
          action_param5: 55,
          action_param6: 66,
        },
        expected: `MockEntity - In Combat - Pick Closest Waypoint 11 22 33 44 55 66`,
      },
      {
        name: 'SAI_ACTIONS.FAIL_QUEST check action params 1',
        input: {
          action_type: SAI_ACTIONS.FAIL_QUEST,
          action_param1: 11,
        },
        expected: `MockEntity - In Combat - Fail Quest 'mockQuestTitleById11'`,
      },
      {
        name: 'SAI_ACTIONS.CALL_KILLEDMONSTER check action params 1',
        input: {
          action_type: SAI_ACTIONS.CALL_KILLEDMONSTER,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Quest Credit 'mockQuestTitleByCriteria1'`,
      },
      {
        name: 'SAI_ACTIONS.SET_REACT_STATE check action params 1 (0)',
        input: {
          action_type: SAI_ACTIONS.SET_REACT_STATE,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Reactstate Passive`,
      },
      {
        name: 'SAI_ACTIONS.SET_REACT_STATE check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.SET_REACT_STATE,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Reactstate Defensive`,
      },
      {
        name: 'SAI_ACTIONS.SET_REACT_STATE check action params 1 (2)',
        input: {
          action_type: SAI_ACTIONS.SET_REACT_STATE,
          action_param1: 2,
        },
        expected: `MockEntity - In Combat - Set Reactstate Aggressive`,
      },
      {
        name: 'SAI_ACTIONS.SET_REACT_STATE check action params 1 (others)',
        input: {
          action_type: SAI_ACTIONS.SET_REACT_STATE,
          action_param1: 3,
        },
        expected: `MockEntity - In Combat - Set Reactstate [Unknown Reactstate]`,
      },
      ...[
        { action_param2: 1, comment: 'Circle' },
        { action_param2: 2, comment: 'Semi-Circle Behind' },
        { action_param2: 3, comment: 'Semi-Circle Front' },
        { action_param2: 4, comment: 'Line' },
        { action_param2: 5, comment: 'Column' },
        { action_param2: 6, comment: 'Angular' },
        { action_param2: 123, comment: '[Unknown Follow Type]' },
      ].map(({ action_param2, comment }) => ({
        name: `SAI_ACTIONS.FOLLOW_GROUP - action param 2 - ${comment}`,
        input: {
          action_type: SAI_ACTIONS.FOLLOW_GROUP,
          action_param2,
        },
        expected: `MockEntity - In Combat - Follow Type ${comment}`,
      })),
      {
        name: 'SAI_ACTIONS.RANDOM_EMOTE check action params 1,2,3,4,5,6',
        input: {
          action_type: SAI_ACTIONS.RANDOM_EMOTE,
          action_param1: 1,
          action_param2: 2,
          action_param3: 3,
          action_param4: 4,
          action_param5: 5,
          action_param6: 6,
        },
        expected: `MockEntity - In Combat - Play Random Emote (1, 2, 3, 4, 5, 6)`,
      },
      {
        name: 'SAI_ACTIONS.RANDOM_PHASE check action params 1,2,3,4,5,6',
        input: {
          action_type: SAI_ACTIONS.RANDOM_PHASE,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Random Phase (0, 0)`,
      },
      {
        name: 'SAI_ACTIONS.SUMMON_CREATURE check action params 1',
        input: {
          action_type: SAI_ACTIONS.SUMMON_CREATURE,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Summon Creature 'mockCreatureNameById1'`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 SERVER_CONTROLLED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.SERVER_CONTROLLED,
        },
        expected: `MockEntity - In Combat - Set Flags Server Controlled`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 NON_ATTACKABLE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.NON_ATTACKABLE,
        },
        expected: `MockEntity - In Combat - Set Flags Not Attackable`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 DISABLE_MOVE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.DISABLE_MOVE,
        },
        expected: `MockEntity - In Combat - Set Flags Disable Movement`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PVP_ATTACKABLE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PVP_ATTACKABLE,
        },
        expected: `MockEntity - In Combat - Set Flags PvP Attackable`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 RENAME',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.RENAME,
        },
        expected: `MockEntity - In Combat - Set Flags Rename`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PREPARATION',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PREPARATION,
        },
        expected: `MockEntity - In Combat - Set Flags Preparation`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 NOT_ATTACKABLE_1',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.NOT_ATTACKABLE_1,
        },
        expected: `MockEntity - In Combat - Set Flags Not Attackable`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 IMMUNE_TO_PC',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.IMMUNE_TO_PC,
        },
        expected: `MockEntity - In Combat - Set Flags Immune To Players`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 IMMUNE_TO_NPC',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.IMMUNE_TO_NPC,
        },
        expected: `MockEntity - In Combat - Set Flags Immune To NPC\'s`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 LOOTING',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.LOOTING,
        },
        expected: `MockEntity - In Combat - Set Flags Looting`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PET_IN_COMBAT',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PET_IN_COMBAT,
        },
        expected: `MockEntity - In Combat - Set Flags Pet In Combat`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PVP',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PVP,
        },
        expected: `MockEntity - In Combat - Set Flags PvP`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 SILENCED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.SILENCED,
        },
        expected: `MockEntity - In Combat - Set Flags Silenced`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PACIFIED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PACIFIED,
        },
        expected: `MockEntity - In Combat - Set Flags Pacified`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 STUNNED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.STUNNED,
        },
        expected: `MockEntity - In Combat - Set Flags Stunned`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 IN_COMBAT',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.IN_COMBAT,
        },
        expected: `MockEntity - In Combat - Set Flags In Combat`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 DISARMED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.DISARMED,
        },
        expected: `MockEntity - In Combat - Set Flags Disarmed`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 CONFUSED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.CONFUSED,
        },
        expected: `MockEntity - In Combat - Set Flags Confused`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 FLEEING',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.FLEEING,
        },
        expected: `MockEntity - In Combat - Set Flags Fleeing`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 PLAYER_CONTROLLED',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.PLAYER_CONTROLLED,
        },
        expected: `MockEntity - In Combat - Set Flags Player Controlled`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 NOT_SELECTABLE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.NOT_SELECTABLE,
        },
        expected: `MockEntity - In Combat - Set Flags Not Selectable`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 SKINNABLE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.SKINNABLE,
        },
        expected: `MockEntity - In Combat - Set Flags Skinnable`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 MOUNT',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.MOUNT,
        },
        expected: `MockEntity - In Combat - Set Flags Mounted`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 SHEATHE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: UNIT_FLAGS.SHEATHE,
        },
        expected: `MockEntity - In Combat - Set Flags Sheathed`,
      },
      {
        name: 'SAI_ACTIONS.SET_UNIT_FLAG check action params 1 NONE',
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FLAG,
          action_param1: SAI_ACTIONS.NONE,
        },
        expected: `MockEntity - In Combat - Set Flag `,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 NONE',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.NONE,
        },
        expected: `MockEntity - In Combat - Set Npc Flag `,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 GOSSIP',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.GOSSIP,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Gossip`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 QUESTGIVER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.QUESTGIVER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Questgiver`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 UNK1',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.UNK1,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Unknown 1`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 UNK2',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.UNK2,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Unknown 2`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 TRAINER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.TRAINER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Trainer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 TRAINER_CLASS',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.TRAINER_CLASS,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Class Trainer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 TRAINER_PROFESSION',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.TRAINER_PROFESSION,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Profession Trainer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 VENDOR',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.VENDOR,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 VENDOR_AMMO',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.VENDOR_AMMO,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Ammo Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 VENDOR_FOOD',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.VENDOR_FOOD,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Food Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 VENDOR_POISON',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.VENDOR_POISON,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Poison Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 VENDOR_REAGENT',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.VENDOR_REAGENT,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Reagent Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 REPAIR',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.REPAIR,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Repair Vendor`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 FLIGHTMASTER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.FLIGHTMASTER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Flightmaster`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 SPIRITHEALER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.SPIRITHEALER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Spirithealer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 SPIRITGUIDE',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.SPIRITGUIDE,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Spiritguide`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 INNKEEPER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.INNKEEPER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Innkeeper`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 BANKER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.BANKER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Banker`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 PETITIONER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.PETITIONER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Petitioner`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 TABARDDESIGNER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.TABARDDESIGNER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Tabard Designer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 BATTLEMASTER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.BATTLEMASTER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Battlemaster`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 AUCTIONEER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.AUCTIONEER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Auctioneer`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 STABLEMASTER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.STABLEMASTER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Stablemaster`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 GUILD_BANKER',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.GUILD_BANKER,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Guild Banker`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 SPELLCLICK',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.SPELLCLICK,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Spellclick`,
      },
      {
        name: 'SAI_ACTIONS.SET_NPC_FLAG check action params 1 PLAYER_VEHICLE',
        input: {
          action_type: SAI_ACTIONS.SET_NPC_FLAG,
          action_param1: NPC_FLAGS.PLAYER_VEHICLE,
        },
        expected: `MockEntity - In Combat - Set Npc Flags Player Vehicle`,
      },
      {
        name: 'SAI_ACTIONS.AUTO_ATTACK check action params 1 (0)',
        input: {
          action_type: SAI_ACTIONS.AUTO_ATTACK,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Stop Attacking`,
      },
      {
        name: 'SAI_ACTIONS.AUTO_ATTACK check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.AUTO_ATTACK,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Start Attacking`,
      },
      {
        name: 'SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT check action params 1 (0)',
        input: {
          action_type: SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Disable Combat Movement`,
      },
      {
        name: 'SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Enable Combat Movement`,
      },
      {
        name: 'SAI_ACTIONS.INC_EVENT_PHASE check action params 1',
        input: {
          action_type: SAI_ACTIONS.INC_EVENT_PHASE,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Increment Phase`,
      },
      {
        name: 'SAI_ACTIONS.INC_EVENT_PHASE check action params 2',
        input: {
          action_type: SAI_ACTIONS.INC_EVENT_PHASE,
          action_param2: 1,
        },
        expected: `MockEntity - In Combat - Decrement Phase`,
      },
      {
        name: 'SAI_ACTIONS.INC_EVENT_PHASE check action params 3',
        input: {
          action_type: SAI_ACTIONS.INC_EVENT_PHASE,
          action_param3: 1,
        },
        expected: `MockEntity - In Combat - Increment or Decrement Phase`,
      },
      {
        name: 'SAI_ACTIONS.SET_SHEATH check action params 3',
        input: {
          action_type: SAI_ACTIONS.SET_SHEATH,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Sheath Unarmed`,
      },
      {
        name: 'SAI_ACTIONS.SET_SHEATH check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.SET_SHEATH,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Sheath Melee`,
      },
      {
        name: 'SAI_ACTIONS.SET_SHEATH check action params 1 (2)',
        input: {
          action_type: SAI_ACTIONS.SET_SHEATH,
          action_param1: 2,
        },
        expected: `MockEntity - In Combat - Set Sheath Ranged`,
      },
      {
        name: 'SAI_ACTIONS.SET_SHEATH check action params 1 (3)',
        input: {
          action_type: SAI_ACTIONS.SET_SHEATH,
          action_param1: 3,
        },
        expected: `MockEntity - In Combat - Set Sheath [Unknown Sheath]`,
      },
      {
        name: 'SAI_ACTIONS.FORCE_DESPAWN check action params 1 (3)',
        input: {
          action_type: SAI_ACTIONS.FORCE_DESPAWN,
          action_param1: 3,
        },
        expected: `MockEntity - In Combat - Despawn In 3 ms`,
      },
      {
        name: 'SAI_ACTIONS.FORCE_DESPAWN check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.FORCE_DESPAWN,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Despawn Instant`,
      },
      {
        name: 'SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL check action params 1',
        input: {
          action_type: SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Invincibility Hp 1`,
      },
      {
        name: 'SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL check action params 2',
        input: {
          action_type: SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL,
          action_param2: 1,
        },
        expected: `MockEntity - In Combat - Set Invincibility Hp 1%`,
      },
      {
        name: 'SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL check action params 1, 2 (0,0)',
        input: {
          action_type: SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL,
          action_param1: 0,
          action_param2: 0,
        },
        expected: `MockEntity - In Combat - Reset Invincibility Hp`,
      },
      {
        name: 'SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL check action params 1, 2 (1,1)',
        input: {
          action_type: SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL,
          action_param1: -1,
          action_param2: -1,
        },
        expected: `MockEntity - In Combat - [Unsupported parameters]`,
      },
      {
        name: 'SAI_ACTIONS.SET_VISIBILITY check action params 1 (1)',
        input: {
          action_type: SAI_ACTIONS.SET_VISIBILITY,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Visibility On`,
      },
      {
        name: 'SAI_ACTIONS.SET_VISIBILITY check action params 1 (0)',
        input: {
          action_type: SAI_ACTIONS.SET_VISIBILITY,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Visibility Off`,
      },
      {
        name: 'SAI_ACTIONS.SUMMON_GO check action params 1 (0)',
        input: {
          action_type: SAI_ACTIONS.SUMMON_GO,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Summon Gameobject 'mockGameobjectNameById0'`,
      },
      {
        name: 'SAI_ACTIONS.ADD_ITEM check action params 1,2 (2,2)',
        input: {
          action_type: SAI_ACTIONS.ADD_ITEM,
          action_param1: 2,
          action_param2: 2,
        },
        expected: `MockEntity - In Combat - Add Item 'mockItemNameById2' 2 Times`,
      },
      {
        name: 'SAI_ACTIONS.ADD_ITEM check action params 1,2 (2,1)',
        input: {
          action_type: SAI_ACTIONS.ADD_ITEM,
          action_param1: 2,
          action_param2: 1,
        },
        expected: `MockEntity - In Combat - Add Item 'mockItemNameById2' 1 Time`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.BASIC)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.BASIC,
        },
        expected: `MockEntity - In Combat - Install Basic Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.CASTER)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.CASTER,
        },
        expected: `MockEntity - In Combat - Install Caster Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.TURRET)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.TURRET,
        },
        expected: `MockEntity - In Combat - Install Turret Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.PASSIVE)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.PASSIVE,
        },
        expected: `MockEntity - In Combat - Install Passive Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.CAGED_GO_PART)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.CAGED_GO_PART,
        },
        expected: `MockEntity - In Combat - Install Caged Gameobject Part Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (templates.CAGED_NPC_PART)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: templates.CAGED_NPC_PART,
        },
        expected: `MockEntity - In Combat - Install Caged Creature Part Template`,
      },
      {
        name: `SAI_ACTIONS.INSTALL_AI_TEMPLATE check action params 1 (6)`,
        input: {
          action_type: SAI_ACTIONS.INSTALL_AI_TEMPLATE,
          action_param1: 6,
        },
        expected: `MockEntity - In Combat - Install [_updateAiTemplateActionParamOne_ Unknown ai template] Template`,
      },
      {
        name: `SAI_ACTIONS.SET_ORIENTATION check target type (SAI_TARGETS.SELF)`,
        input: {
          action_type: SAI_ACTIONS.SET_ORIENTATION,
          target_type: SAI_TARGETS.SELF,
        },
        expected: `MockEntity - In Combat - Set Orientation Home Position`,
      },
      {
        name: `SAI_ACTIONS.SET_ORIENTATION check target type (SAI_TARGETS.POSITION)`,
        input: {
          action_type: SAI_ACTIONS.SET_ORIENTATION,
          target_type: SAI_TARGETS.POSITION,
        },
        expected: `MockEntity - In Combat - Set Orientation 0`,
      },
      {
        name: `SAI_ACTIONS.SET_ORIENTATION check target type (SAI_TARGETS.HOSTILE_SECOND_AGGRO)`,
        input: {
          action_type: SAI_ACTIONS.SET_ORIENTATION,
          target_type: SAI_TARGETS.HOSTILE_SECOND_AGGRO,
        },
        expected: `MockEntity - In Combat - Set Orientation Second On Threatlist`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.SELF)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.SELF,
        },
        expected: `MockEntity - In Combat - Move To Self`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.VICTIM)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.VICTIM,
        },
        expected: `MockEntity - In Combat - Move To Victim`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.HOSTILE_LAST_AGGRO)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.HOSTILE_LAST_AGGRO,
        },
        expected: `MockEntity - In Combat - Move To Last On Threatlist`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.HOSTILE_RANDOM)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.HOSTILE_RANDOM,
        },
        expected: `MockEntity - In Combat - Move To Random On Threatlist`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP,
        },
        expected: `MockEntity - In Combat - Move To Random On Threatlist Not Top`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.ACTION_INVOKER)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.ACTION_INVOKER,
        },
        expected: `MockEntity - In Combat - Move To Invoker`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.POSITION)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.POSITION,
        },
        expected: `MockEntity - In Combat - Move To Position`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CREATURE_RANGE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CREATURE_RANGE,
          target_param1: UNIT_FLAGS.SERVER_CONTROLLED,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockCreatureNameById1'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CREATURE_DISTANCE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CREATURE_DISTANCE,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockCreatureNameById0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CLOSEST_CREATURE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CLOSEST_CREATURE,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockCreatureNameById0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.STORED)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.STORED,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Stored`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CREATURE_GUID)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CREATURE_GUID,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockCreatureNameByGuid0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.GAMEOBJECT_RANGE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.GAMEOBJECT_RANGE,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockGameobjectNameById0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.GAMEOBJECT_DISTANCE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.GAMEOBJECT_DISTANCE,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockGameobjectNameById0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CLOSEST_GAMEOBJECT)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CLOSEST_GAMEOBJECT,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockGameobjectNameById0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.GAMEOBJECT_GUID)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.GAMEOBJECT_GUID,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Closest Creature 'mockGameobjectNameByGuid0'`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.INVOKER_PARTY)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.INVOKER_PARTY,
        },
        expected: `MockEntity - In Combat - Move To Invoker\'s Party`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.PLAYER_RANGE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.PLAYER_RANGE,
        },
        expected: `MockEntity - In Combat - Move To Players in Range`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.PLAYER_DISTANCE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.PLAYER_DISTANCE,
        },
        expected: `MockEntity - In Combat - Move To Players in Distance`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CLOSEST_PLAYER)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CLOSEST_PLAYER,
        },
        expected: `MockEntity - In Combat - Move To Closest Player`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.ACTION_INVOKER_VEHICLE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.ACTION_INVOKER_VEHICLE,
        },
        expected: `MockEntity - In Combat - Move To Invoker's Vehicle`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.OWNER_OR_SUMMONER)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.OWNER_OR_SUMMONER,
        },
        expected: `MockEntity - In Combat - Move To Owner Or Summoner`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.THREAT_LIST)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.THREAT_LIST,
        },
        expected: `MockEntity - In Combat - Move To Threatlist`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CLOSEST_ENEMY)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CLOSEST_ENEMY,
        },
        expected: `MockEntity - In Combat - Move To Closest Enemy`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.CLOSEST_FRIENDLY)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.CLOSEST_FRIENDLY,
        },
        expected: `MockEntity - In Combat - Move To Closest Friendly Unit`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.LOOT_RECIPIENTS)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: 27,
        },
        expected: `MockEntity - In Combat - Move To Loot Recipients`,
      },
      {
        name: `SAI_ACTIONS.GO_SET_LOOT_STATE check action param 1 (0)`,
        input: {
          action_type: SAI_ACTIONS.GO_SET_LOOT_STATE,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Lootstate Not Ready`,
      },
      {
        name: `SAI_ACTIONS.GO_SET_LOOT_STATE check action param 1 (1)`,
        input: {
          action_type: SAI_ACTIONS.GO_SET_LOOT_STATE,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Lootstate Ready`,
      },
      {
        name: `SAI_ACTIONS.GO_SET_LOOT_STATE check action param 1 (2)`,
        input: {
          action_type: SAI_ACTIONS.GO_SET_LOOT_STATE,
          action_param1: 2,
        },
        expected: `MockEntity - In Combat - Set Lootstate Activated`,
      },
      {
        name: `SAI_ACTIONS.GO_SET_LOOT_STATE check action param 1 (3)`,
        input: {
          action_type: SAI_ACTIONS.GO_SET_LOOT_STATE,
          action_param1: 3,
        },
        expected: `MockEntity - In Combat - Set Lootstate Deactivated`,
      },
      {
        name: `SAI_ACTIONS.GO_SET_LOOT_STATE check action param 1 (4)`,
        input: {
          action_type: SAI_ACTIONS.GO_SET_LOOT_STATE,
          action_param1: 4,
        },
        expected: `MockEntity - In Combat - Set Lootstate [Unknown Gameobject State]`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.IN_USE)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.IN_USE,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags In Use`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.LOCKED)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.LOCKED,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Locked`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.INTERACT_COND)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.INTERACT_COND,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Interact Condition`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.TRANSPORT)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.TRANSPORT,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Transport`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.NOT_SELECTABLE)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.NOT_SELECTABLE,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Not Selectable`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.NODESPAWN)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.NODESPAWN,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags No Despawn`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.TRIGGERED)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.TRIGGERED,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Triggered`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.DAMAGED)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.DAMAGED,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Damaged`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.DESTROYED)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.DESTROYED,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flags Destroyed`,
      },
      {
        name: `SAI_ACTIONS.SET_GO_FLAG check action param 1 (GO_FLAGS.NONE)`,
        input: {
          action_type: SAI_ACTIONS.SET_GO_FLAG,
          action_param1: GO_FLAGS.NONE,
        },
        expected: `MockEntity - In Combat - Set Gameobject Flag `,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.NONE)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.NONE,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flag `,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.LOOTABLE)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.LOOTABLE,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Lootable`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.TRACK_UNIT)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.TRACK_UNIT,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Track Units`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.TAPPED)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.TAPPED,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Tapped`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.TAPPED_BY_PLAYER)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.TAPPED_BY_PLAYER,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Tapped By Player`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.SPECIALINFO)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.SPECIALINFO,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Special Info`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.DEAD)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.DEAD,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Dead`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.REFER_A_FRIEND)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.REFER_A_FRIEND,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Refer A Friend`,
      },
      {
        name: `SAI_ACTIONS.SET_DYNAMIC_FLAG check action param 1 (DYNAMIC_FLAGS.TAPPED_BY_ALL_THREAT_LIST)`,
        input: {
          action_type: SAI_ACTIONS.SET_DYNAMIC_FLAG,
          action_param1: DYNAMIC_FLAGS.TAPPED_BY_ALL_THREAT_LIST,
        },
        expected: `MockEntity - In Combat - Set Dynamic Flags Tapped By Threatlist`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.STAND, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.STAND,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Stand Up`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SIT, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SIT,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sit Down`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SIT_CHAIR, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SIT_CHAIR,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sit Down Chair`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SLEEP, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SLEEP,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sleep`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SIT_LOW_CHAIR, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SIT_LOW_CHAIR,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sit Low Chair`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SIT_MEDIUM_CHAIR, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SIT_MEDIUM_CHAIR,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sit Medium Chair`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SIT_HIGH_CHAIR, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SIT_HIGH_CHAIR,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Sit High Chair`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.DEAD, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.DEAD,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Dead`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.KNEEL, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.KNEEL,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Kneel`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandStateType.SUBMERGED, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandStateType.SUBMERGED,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Standstate Submerged`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (123, unitFieldBytes1Type.STAND_STAND_STATE_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: 123,
          action_param2: unitFieldBytes1Type.STAND_STAND_STATE_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown bytes1 (unitStandStateType.)]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 2 (unitFieldBytes1Type.PET_TALENTS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param2: unitFieldBytes1Type.PET_TALENTS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown bytes1 type]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.UNK1, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.UNK1,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.UNK4, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.UNK4,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.UNK5, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.UNK5,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.CREEP, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.CREEP,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Creep`,
      },
      {
        name:
          `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 ` +
          `check action param 1,2 (unitStandFlags.UNTRACKABLE, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.UNTRACKABLE,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Untrackable`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 ` + `check action param 1,2 (unitStandFlags.NONE, unitFieldBytes1Type.STAND_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitStandFlags.NONE,
          action_param2: unitFieldBytes1Type.STAND_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown bytes1 (UnitStandFlags)]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.NONE, unitFieldBytes1Type.BYTES1_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitBytes1Flags.UNK_3,
          action_param2: unitFieldBytes1Type.BYTES1_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.HOVER, unitFieldBytes1Type.BYTES1_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitBytes1Flags.HOVER,
          action_param2: unitFieldBytes1Type.BYTES1_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Hover`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (unitStandFlags.ALWAYS_STAND, unitFieldBytes1Type.BYTES1_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: unitBytes1Flags.ALWAYS_STAND,
          action_param2: unitFieldBytes1Type.BYTES1_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag Always Stand`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 1,2 (123, unitFieldBytes1Type.BYTES1_FLAGS_TYPE)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param1: 123,
          action_param2: unitFieldBytes1Type.BYTES1_FLAGS_TYPE,
        },
        expected: `MockEntity - In Combat - Set Flag [Unknown bytes1 (UnitBytes1_Flags)]`,
      },
      {
        name: `SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1 check action param 2 (123)`,
        input: {
          action_type: SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1,
          action_param2: 123,
        },
        expected: `MockEntity - In Combat - Set Flag _getBytes1Flags_`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (0)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Mana To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (1)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Set Rage To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (2)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 2,
        },
        expected: `MockEntity - In Combat - Set Focus To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (3)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 3,
        },
        expected: `MockEntity - In Combat - Set Energy To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (4)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 4,
        },
        expected: `MockEntity - In Combat - Set Happiness To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (5)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 5,
        },
        expected: `MockEntity - In Combat - Set Rune To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (6)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 6,
        },
        expected: `MockEntity - In Combat - Set Runic Power To 0`,
      },
      {
        name: `SAI_ACTIONS.SET_POWER check action param 1 (7)`,
        input: {
          action_type: SAI_ACTIONS.SET_POWER,
          action_param1: 7,
        },
        expected: `MockEntity - In Combat - Set [Unknown Powertype] To 0`,
      },
      {
        name: `SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL check action param 1 (0)`,
        input: {
          action_type: SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Demorph`,
      },
      {
        name: `SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL check action param 1 (1)`,
        input: {
          action_type: SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Morph To Creature mockCreatureNameById1`,
      },
      {
        name: `SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL check action param 2 (1)`,
        input: {
          action_type: SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL,
          action_param2: 1,
        },
        expected: `MockEntity - In Combat - Morph To Model 1`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 1 (0)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Dismount`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 1 (1)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Mount To Creature mockCreatureNameById1`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
        },
        expected: `MockEntity - In Combat - Mount To Model 1`,
      },
      {
        name: `SAI_ACTIONS.FOLLOW check target_type 2 (SAI_TARGETS.VICTIM)`,
        input: {
          action_type: SAI_ACTIONS.FOLLOW,
          target_type: SAI_TARGETS.VICTIM,
        },
        expected: `MockEntity - In Combat - Start Follow Victim`,
      },
      {
        name: `SAI_ACTIONS.FOLLOW check target_type 2 (0)`,
        input: {
          action_type: SAI_ACTIONS.FOLLOW,
          target_type: 0,
        },
        expected: `MockEntity - In Combat - Stop Follow `,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (9), event_flags (NOT_REPEATABLE)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 9,
          event_flags: EVENT_FLAGS.NOT_REPEATABLE,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phases 1 & 4) (No Repeat)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon & Raid)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.NORMAL_DUNGEON + EVENT_FLAGS.HEROIC_DUNGEON + EVENT_FLAGS.NORMAL_RAID + EVENT_FLAGS.HEROIC_RAID,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Dungeon & Raid) (Raid)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.NORMAL_DUNGEON + EVENT_FLAGS.HEROIC_DUNGEON,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Dungeon)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.NORMAL_DUNGEON,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Normal Dungeon)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.HEROIC_DUNGEON,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Heroic Dungeon)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.NORMAL_RAID,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Normal Raid)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.HEROIC_RAID,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Heroic Raid)`,
      },
      {
        name: `SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL check action param 2 (1), event_phase_mask (2), event_flags (Dungeon)`,
        input: {
          action_type: SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL,
          action_param2: 1,
          event_phase_mask: 2,
          event_flags: EVENT_FLAGS.DEBUG_ONLY,
        },
        expected: `MockEntity - In Combat - Mount To Model 1 (Phase 2) (Debug)`,
      },
      {
        name: `SAI_EVENTS.SPELLHIT, SAI_ACTIONS.CAST`,
        input: {
          event_type: SAI_EVENTS.SPELLHIT,
          event_param1: 123,
          action_type: SAI_ACTIONS.CAST,
          action_param1: 456,
        },
        expected: `MockEntity - On Spellhit 'mockGetSpellNameById123' - Cast 'mockGetSpellNameById456'`,
      },
      {
        name: `SAI_EVENTS.WAYPOINT_START`,
        input: {
          event_type: SAI_EVENTS.WAYPOINT_START,
          event_param2: 124,
        },
        expected: `MockEntity - On Path 124 Started - No Action Type`,
      },
      {
        name: `SAI_EVENTS.WAYPOINT_START`,
        input: {
          event_type: SAI_EVENTS.WAYPOINT_START,
        },
        expected: `MockEntity - On Path Any Started - No Action Type`,
      },
      {
        name: `SAI_EVENTS.WAYPOINT_REACHED`,
        input: {
          event_type: SAI_EVENTS.WAYPOINT_REACHED,
          event_param1: 123,
          event_param2: 124,
        },
        expected: `MockEntity - On Point 123 of Path 124 Reached - No Action Type`,
      },
      {
        name: `SAI_EVENTS.WAYPOINT_REACHED`,
        input: {
          event_type: SAI_EVENTS.WAYPOINT_REACHED,
        },
        expected: `MockEntity - On Point Any of Path Any Reached - No Action Type`,
      },
      {
        name: `SAI_EVENTS.VICTIM_CASTING, SAI_ACTIONS.INTERRUPT_SPELL`,
        input: {
          event_type: SAI_EVENTS.VICTIM_CASTING,
          event_param3: 123,
          action_type: SAI_ACTIONS.INTERRUPT_SPELL,
          action_param2: 456,
        },
        expected: `MockEntity - On Victim Casting 'mockGetSpellNameById123' - Interrupt Spell 'mockGetSpellNameById456'`,
      },
      {
        name: `SAI_EVENTS.HAS_AURA`,
        input: {
          event_type: SAI_EVENTS.HAS_AURA,
          event_param1: 123,
        },
        expected: `MockEntity - On Aura 'mockGetSpellNameById123' - No Action Type`,
      },
      {
        name: `SAI_ACTIONS.DISABLE_EVADE`,
        input: {
          action_type: SAI_ACTIONS.DISABLE_EVADE,
          action_param1: 1,
        },
        expected: `MockEntity - In Combat - Disable Evade`,
      },
      {
        name: `SAI_ACTIONS.DISABLE_EVADE`,
        input: {
          action_type: SAI_ACTIONS.DISABLE_EVADE,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Enable Evade`,
      },
      {
        name: `SAI_ACTIONS.WP_START`,
        input: {
          action_type: SAI_ACTIONS.WP_START,
          action_param3: 0,
        },
        expected: `MockEntity - In Combat - Start Waypoint Path 0`,
      },
      {
        name: `SAI_ACTIONS.WP_START`,
        input: {
          action_type: SAI_ACTIONS.WP_START,
          action_param3: 1,
        },
        expected: `MockEntity - In Combat - Start Patrol Path 0`,
      },
      {
        name: `SAI_ACTIONS.WP_START`,
        input: {
          action_type: SAI_ACTIONS.WP_START,
          action_param3: 123,
        },
        expected: `MockEntity - In Combat - Start [Unknown Value] Path 0`,
      },
      {
        name: `SAI_ACTIONS.SET_MOVEMENT_SPEED`,
        input: {
          action_type: SAI_ACTIONS.SET_MOVEMENT_SPEED,
          action_param1: 0,
        },
        expected: `MockEntity - In Combat - Set Walk Speed to 0.0`,
      },
      ...[
        { action_param1: 0, comment: 'Walk' },
        { action_param1: 1, comment: 'Run' },
        { action_param1: 2, comment: 'Run Back' },
        { action_param1: 3, comment: 'Swim' },
        { action_param1: 4, comment: 'Swim Back' },
        { action_param1: 5, comment: 'Turn Rate' },
        { action_param1: 6, comment: 'Flight' },
        { action_param1: 7, comment: 'Flight Back' },
        { action_param1: 8, comment: 'Pitch Rate' },
        { action_param1: 123, comment: '[Unknown Value]' },
      ].map(({ action_param1, comment }) => ({
        name: `SAI_ACTIONS.SET_MOVEMENT_SPEED ${comment}`,
        input: {
          action_type: SAI_ACTIONS.SET_MOVEMENT_SPEED,
          action_param1,
        },
        expected: `MockEntity - In Combat - Set ${comment} Speed to 0.0`,
      })),
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.STORED)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.STORED,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Stored`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.FARTHEST)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.FARTHEST,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Farthest Target`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.VEHICLE_PASSENGER)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.VEHICLE_PASSENGER,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Vehicle Seat`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.PLAYER_WITH_AURA)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.PLAYER_WITH_AURA,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Player With Aura`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.RANDOM_POINT)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.RANDOM_POINT,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Random Point`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.ROLE_SELECTION)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.ROLE_SELECTION,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Class Roles`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.SUMMONED_CREATURES)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.SUMMONED_CREATURES,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Summoned Creatures`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (SAI_TARGETS.INSTANCE_STORAGE)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: SAI_TARGETS.INSTANCE_STORAGE,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To Instance Storage`,
      },
      {
        name: `SAI_ACTIONS.MOVE_TO_POS check target type (unsupported target type)`,
        input: {
          action_type: SAI_ACTIONS.MOVE_TO_POS,
          target_type: 10000,
          target_param1: 0,
        },
        expected: `MockEntity - In Combat - Move To [unsupported target type]`,
      },
    ];

    for (const { name, input, expected } of cases) {
      it(`Case: ${name}`, waitForAsync(async () => {
        const service: SaiCommentGeneratorService = TestBed.inject(SaiCommentGeneratorService);
        const sai = createSai(input);
        expect(await service.generateComment([sai], sai, mockName)).toEqual(expected);
      }));
    }
  });
});
