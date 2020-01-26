import { TestBed } from '@angular/core/testing';

import { SaiCommentGeneratorService } from './sai-comment-generator.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { QueryService } from '@keira-shared/services/query.service';
import { of } from 'rxjs';

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
      spyOn(queryService, 'getCreatureNameById').and.returnValue(of(mockCreatureNameById).toPromise());
      spyOn(queryService, 'getCreatureNameByGuid').and.returnValue(of(mockCreatureNameByGuid).toPromise());
      spyOn(queryService, 'getGameObjectNameById').and.returnValue(of(mockGameobjectNameById).toPromise());
      spyOn(queryService, 'getGameObjectNameByGuid').and.returnValue(of(mockGameobjectNameByGuid).toPromise());
      spyOn(queryService, 'getQuestTitleById').and.returnValue(of(mockQuestTitleById).toPromise());
      spyOn(queryService, 'getItemNameById').and.returnValue(of(mockItemNameById).toPromise());
    });

    it('should correctly handle linked events', async () => {
      const name = 'Event SAI_EVENTS.ACCEPTED_QUEST';
      const rows: SmartScripts[] = [
        createSai({ id: 1, event_type: SAI_EVENTS.ACCEPTED_QUEST, link: 2 }),
        createSai({ id: 2, event_type: SAI_EVENTS.LINK, link: 3 }),
        createSai({ id: 3, event_type: SAI_EVENTS.LINK }),
      ];
      const expected = `MockEntity - On Quest 'mockQuestTitleById' Taken - No Action Type`;
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
        name: 'Event SAI_EVENTS.ACCEPTED_QUEST',
        input: {
          event_type: SAI_EVENTS.ACCEPTED_QUEST,
        },
        expected: `MockEntity - On Quest 'mockQuestTitleById' Taken - No Action Type`,
      },
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
