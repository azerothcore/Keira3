import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { instance } from 'ts-mockito';

import { SaiHandlerService } from './sai-handler.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { SAI_TYPES } from '../../types/smart-scripts.type';
import { MockedMysqlQueryService } from '@keira-testing/mocks';

describe('SaiHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
    ]
  }));

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

  it('getName() should work correctly', fakeAsync(() => {
    const service: SaiHandlerService = TestBed.inject(SaiHandlerService);
    const spy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query');
    const mockName = 'Mock Name';

    // TODO: this test case should be refactored and split in several cases
    for (const test of [
      {
        source_type: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST,  entryorguid: 123, name: mockName,
        returnValue: [ { name: mockName } ],
        expected: mockName,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_CREATURE,  entryorguid: -123, name: mockName,
        returnValue: [ { name: mockName } ],
        expected: mockName,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_CREATURE,  entryorguid: 123, name: mockName,
        returnValue: [],
        expected: null,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT,  entryorguid: -123, name: mockName,
        returnValue: [ { name: mockName } ],
        expected: mockName,
      },
      {
        source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT,  entryorguid: 123, name: mockName,
        returnValue: [ { name: mockName } ],
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
