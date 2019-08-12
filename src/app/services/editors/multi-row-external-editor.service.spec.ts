import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MultiRowExternalEditorService } from './multi-row-external-editor.service';
import { CreatureSpawnAddon } from '../../types/creature-spawn-addon.type';
import { CreatureSpawnAddonService } from './creature/creature-spawn-addon.service';


describe('MultiRowExternalEditorService', () => {
  let service: MultiRowExternalEditorService<CreatureSpawnAddon>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureSpawnAddonService);
  });

  it('updateDiffQuery() should correctly work', () => {
    service['_diffQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(queryResult);

    service['updateDiffQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      null,
      service.entitySecondIdField,
      service['_originalRows'],
      service.newRows,
    );
    expect(service.diffQuery).toEqual(queryResult);
  });

  it('updateFullQuery() should correctly work', () => {
    service['_fullQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service.newRows,
      null,
      service.entitySecondIdField,
    );
    expect(service.fullQuery).toEqual(queryResult);
  });
});
