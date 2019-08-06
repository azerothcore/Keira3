import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SpawnsAddonService } from './spawns-addon.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('SpawnsAddonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('selectQuery should correctly work', () => {
    const service: SpawnsAddonService = TestBed.get(SpawnsAddonService);
    const querySpy = spyOn(TestBed.get(QueryService), 'query');
    const id = 123;

    service.selectQuery(id);

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  });
});
