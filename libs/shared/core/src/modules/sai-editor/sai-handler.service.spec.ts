/*eslint camelcase: ["error", {properties: "never"}]*/
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { SAI_TYPES } from '@keira/shared/acore-world-model';
import { SaiHandlerService } from './sai-handler.service';
import { MockedMysqlQueryService } from '../../services/services.mock';

describe('SaiHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  for (const { testId, sourceType, entryOrGuid, isNew } of [
    { testId: 1, sourceType: 1, entryOrGuid: 111, isNew: true },
    { testId: 2, sourceType: 2, entryOrGuid: 222, isNew: false },
  ]) {
    it(`selectFromEntity() should correctly work [${testId}]`, fakeAsync(() => {
      const service: SaiHandlerService = TestBed.inject(SaiHandlerService);
      const queryService: MysqlQueryService = TestBed.inject(MysqlQueryService);
      const mockResults = isNew ? [] : ['some result'];
      spyOn(queryService, 'query').and.returnValue(of(mockResults as any));
      spyOn(service, 'select');

      service.selectFromEntity(sourceType, entryOrGuid);
      tick();

      expect(queryService.query).toHaveBeenCalledTimes(1);
      expect(queryService.query).toHaveBeenCalledWith(
        `SELECT * FROM smart_scripts WHERE source_type = ${sourceType} AND entryorguid = ${entryOrGuid}`,
      );
      expect(service.select).toHaveBeenCalledTimes(1);
      expect(service.select).toHaveBeenCalledWith(isNew, { source_type: sourceType, entryorguid: entryOrGuid });
    }));
  }

  const entry = 100;

  for (const { sourceType, id, expectedQuery } of [
    {
      sourceType: SAI_TYPES.SAI_TYPE_CREATURE,
      id: entry,
      expectedQuery: `UPDATE \`creature_template\` SET \`AIName\` = 'SmartAI' WHERE \`entry\` = ${entry};`,
    },
    {
      sourceType: SAI_TYPES.SAI_TYPE_GAMEOBJECT,
      id: entry,
      expectedQuery: `UPDATE \`gameobject_template\` SET \`AIName\` = 'SmartGameObjectAI' WHERE \`entry\` = ${entry};`,
    },
    {
      sourceType: SAI_TYPES.SAI_TYPE_AREATRIGGER,
      id: entry,
      expectedQuery:
        `DELETE FROM \`areatrigger_scripts\` WHERE \`entry\` = ${entry};\n` +
        `INSERT INTO \`areatrigger_scripts\` (\`entry\`, \`ScriptName\`) VALUES (${entry}, 'SmartTrigger');`,
    },
    {
      sourceType: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST,
      id: entry,
      expectedQuery: null,
    },
    {
      sourceType: SAI_TYPES.SAI_TYPE_CREATURE,
      id: -entry,
      expectedQuery: null,
    },
  ]) {
    it(`when selecting, the templateQuery should be updated [${sourceType}]`, () => {
      const service: SaiHandlerService = TestBed.inject(SaiHandlerService);
      spyOn(TestBed.inject(Router), 'navigate');

      service.select(false, { source_type: sourceType, entryorguid: id });

      expect(service.templateQuery).toEqual(expectedQuery);
    });
  }

  it('navigation should not be triggered when navigate is false', () => {
    const service: SaiHandlerService = TestBed.inject(SaiHandlerService);
    const spy = spyOn(TestBed.inject(Router), 'navigate');

    service.select(false, { source_type: 1, entryorguid: 123 }, 'Mock Name', false);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  describe('getName() should work correctly', () => {
    const mockName = 'Mock Name';

    const cases: {
      testId: number;
      sourceType: number;
      entryorguid: number;
      name: string;
      returnValue: { name: string }[];
      expectedName: string;
      expectedQuery: string;
    }[] = [
      {
        testId: 1,
        sourceType: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST,
        entryorguid: 12301,
        name: mockName,
        returnValue: [{ name: mockName }],
        expectedName: mockName,
        expectedQuery: 'SELECT name FROM creature_template WHERE entry = 123',
      },
      {
        testId: 2,
        sourceType: SAI_TYPES.SAI_TYPE_CREATURE,
        entryorguid: -123,
        name: mockName,
        returnValue: [{ name: mockName }],
        expectedName: mockName,
        expectedQuery: 'SELECT ct.name FROM creature_template AS ct INNER JOIN creature AS c ON c.id1 = ct.entry WHERE c.guid = 123',
      },
      {
        testId: 3,
        sourceType: SAI_TYPES.SAI_TYPE_CREATURE,
        entryorguid: 123,
        name: mockName,
        returnValue: [],
        expectedName: null,
        expectedQuery: 'SELECT name FROM creature_template WHERE entry = 123',
      },
      {
        testId: 4,
        sourceType: SAI_TYPES.SAI_TYPE_GAMEOBJECT,
        entryorguid: -123,
        name: mockName,
        returnValue: [{ name: mockName }],
        expectedName: mockName,
        expectedQuery: 'SELECT ct.name FROM gameobject_template AS ct INNER JOIN gameobject AS c ON c.id1 = ct.entry WHERE c.guid = 123',
      },
      {
        testId: 5,
        sourceType: SAI_TYPES.SAI_TYPE_GAMEOBJECT,
        entryorguid: 123,
        name: mockName,
        returnValue: [{ name: mockName }],
        expectedName: mockName,
        expectedQuery: 'SELECT name FROM gameobject_template WHERE entry = 123',
      },
    ];

    for (const { testId, sourceType, entryorguid, name, returnValue, expectedName, expectedQuery } of cases) {
      it(`${testId}`, fakeAsync(() => {
        const service: SaiHandlerService = TestBed.inject(SaiHandlerService);
        const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
        const queryService = TestBed.inject(MysqlQueryService);
        const querySpy = spyOn(queryService, 'query');

        service.select(false, { source_type: sourceType, entryorguid }, name, false);

        querySpy.and.returnValue(of(returnValue));
        service.getName().subscribe((actualName) => {
          // TODO: this should not be inside subscribe
          expect(actualName).toEqual(expectedName);
          expect(navigateSpy).toHaveBeenCalledTimes(0);
          expect(querySpy).toHaveBeenCalledTimes(1);
          expect(querySpy).toHaveBeenCalledWith(expectedQuery);
        });

        service.select(false, { source_type: null, entryorguid: -123 }, mockName, false);

        querySpy.and.returnValue(of());
        service.getName().subscribe((actualName) => {
          expect(actualName).toEqual(`Unknown source_type`);
        });

        tick();
      }));
    }
  });
});
