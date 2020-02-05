import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiHandlerService } from './sai-handler.service';
import { QueryService } from '../../services/query.service';
import { of } from 'rxjs';
import { SAI_TYPES } from '../../types/smart-scripts.type';
import { Router } from '@angular/router';
import { instance } from 'ts-mockito';
import { MockedQueryService } from '@keira-testing/mocks';

describe('SaiHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ]
  }));

  for (const { testId, sourceType, entryOrGuid, isNew } of [
    { testId: 1, sourceType: 1, entryOrGuid: 111, isNew: true },
    { testId: 2, sourceType: 2, entryOrGuid: 222, isNew: false },
  ]) {
    it(`selectFromEntity() should correctly work [${testId}]`, fakeAsync(() => {
      const service: SaiHandlerService = TestBed.get(SaiHandlerService);
      const queryService: QueryService = TestBed.get(QueryService);
      const mockResults = isNew ? [] : ['some result'];
      spyOn(queryService, 'query').and.returnValue(of({ results: mockResults } as any));
      spyOn(service, 'select');

      service.selectFromEntity(sourceType, entryOrGuid);
      tick();

      expect(queryService.query).toHaveBeenCalledTimes(1);
      expect(queryService.query).toHaveBeenCalledWith(
        `SELECT * FROM smart_scripts WHERE source_type = ${sourceType} AND entryorguid = ${entryOrGuid}`
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
      expectedQuery: `DELETE FROM \`areatrigger_scripts\` WHERE \`entry\` = ${entry};\n` +
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
      const service: SaiHandlerService = TestBed.get(SaiHandlerService);
      spyOn(TestBed.get(Router), 'navigate');

      service.select(false, { source_type: sourceType, entryorguid: id });

      expect(service.templateQuery).toEqual(expectedQuery);
    });
  }

  it('navigation should not be triggered when navigate is false', () => {
    const service: SaiHandlerService = TestBed.get(SaiHandlerService);
    const spy = spyOn(TestBed.get(Router), 'navigate');

    service.select(false, { source_type: 1, entryorguid: 123 }, 'Mock Name', false);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('getName() should work correctly', fakeAsync(() => {
    const service: SaiHandlerService = TestBed.get(SaiHandlerService);
    const spy = spyOn(TestBed.get(Router), 'navigate');
    const queryService = TestBed.get(QueryService);
    const querySpy = spyOn(queryService, 'query');
    const mockName = 'Mock Name';

    for (const test of [
      {
        source_type: SAI_TYPES.SAI_TYPE_CREATURE,  entryorguid: -123, name: mockName,
        returnValue: { results: [ { name: mockName } ] },
        expected: mockName,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_CREATURE,  entryorguid: 123, name: mockName,
        returnValue: { results: [] },
        expected: null,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT,  entryorguid: -123, name: mockName,
        returnValue: { results: [ { name: mockName } ] },
        expected: mockName,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT,  entryorguid: 123, name: mockName,
        returnValue: { results: [ { name: mockName } ] },
        expected: mockName,
      },
    ]) {
      service.select(false, { source_type: test.source_type, entryorguid: test.entryorguid }, test.name, false);

      querySpy.and.returnValue(of(test.returnValue));
      service.getName().subscribe((name) => {
        expect(name).toEqual(test.expected);
      });
    }

    service.select(false, { source_type: null, entryorguid: -123 }, mockName, false);

    querySpy.and.returnValue(of());
    expect(service.getName()).toBeUndefined();

    tick();

    expect(spy).toHaveBeenCalledTimes(0);
  }));

});
