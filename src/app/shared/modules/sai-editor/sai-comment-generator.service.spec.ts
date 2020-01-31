import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SaiCommentGeneratorService } from './sai-comment-generator.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { QueryService } from '@keira-shared/services/query.service';
import { SAI_ACTIONS } from '@keira-shared/modules/sai-editor/constants/sai-actions';

fdescribe('SaiCommentGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  describe('Comment generation should correctly work', () => {
    const createSai = (partial: Partial<SmartScripts>) => Object.assign(new SmartScripts(), partial);
    const mockName = 'MockEntity';
    const mockCreatureNameById = 'mockCreatureNameById';
    const mockCreatureNameByGuid = 'mockCreatureNameByGuid';
    const mockGameobjectNameById = 'mockGameobjectNameById';
    const mockGameobjectNameByGuid = 'mockGameobjectNameByGuid';
    const mockQuestTitleById = 'mockQuestTitleById';
    const mockItemNameById = 'mockItemNameById';

    beforeEach(() => {
      const queryService = TestBed.get(QueryService);
      spyOn(queryService, 'getCreatureNameById').and.callFake(i => of(mockCreatureNameById + i).toPromise());
      spyOn(queryService, 'getCreatureNameByGuid').and.callFake(i => of(mockCreatureNameByGuid + i).toPromise());
      spyOn(queryService, 'getGameObjectNameById').and.callFake(i => of(mockGameobjectNameById + i).toPromise());
      spyOn(queryService, 'getGameObjectNameByGuid').and.callFake(i => of(mockGameobjectNameByGuid + i).toPromise());
      spyOn(queryService, 'getQuestTitleById').and.callFake(i => of(mockQuestTitleById + i).toPromise());
      spyOn(queryService, 'getItemNameById').and.callFake(i => of(mockItemNameById + i).toPromise());
    });

    it('should correctly handle linked events', async () => {
      const rows: SmartScripts[] = [
        createSai({ id: 1, event_type: SAI_EVENTS.ACCEPTED_QUEST, link: 2 }),
        createSai({ id: 2, event_type: SAI_EVENTS.LINK, link: 3 }),
        createSai({ id: 3, event_type: SAI_EVENTS.LINK }),
      ];
      const expected = `MockEntity - On Quest 'mockQuestTitleById0' Taken - No Action Type`;
      const service: SaiCommentGeneratorService = TestBed.get(SaiCommentGeneratorService);

      expect(await service.generateComment(rows, rows[2], mockName)).toEqual(expected);
    });

    const cases: { name: string, input: Partial<SmartScripts>, expected: string }[] = [
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
        expected: ' - No Action Type',
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
      // {
      //   name: 'SAI_ACTIONS.FAIL_QUEST',
      //   input: {
      //     action_type: SAI_ACTIONS.FAIL_QUEST,
      //     action_param1: 11,
      //     action_param2: 22,
      //     action_param3: 33,
      //     action_param4: 44,
      //     action_param5: 55,
      //     action_param6: 66,
      //   },
      //   expected: `MockEntity - In Combat - Pick Closest Waypoint 11 22 33 44 55 66`,
      // },
    ];

    for (const { name, input, expected } of cases) {
      it(`Case: ${name}`, async () => {
        const service: SaiCommentGeneratorService = TestBed.get(SaiCommentGeneratorService);
        const sai = createSai(input);
        expect(await service.generateComment([sai], sai, mockName)).toEqual(expected);
      });
    }

  });
});
