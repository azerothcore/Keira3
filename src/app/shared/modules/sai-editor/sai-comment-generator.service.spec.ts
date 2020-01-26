import { TestBed } from '@angular/core/testing';

import { SaiCommentGeneratorService } from './sai-comment-generator.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';

fdescribe('SaiCommentGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  describe('Comment generation should correctly work', () => {
    const createSai = (partial: Partial<SmartScripts>) => Object.assign(new SmartScripts(), partial);

    const mockName = 'MockEntity';
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
