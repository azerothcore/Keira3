import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureSpawnAddon } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { MultiRowExternalEditorService } from './multi-row-external-editor.service';
import { CreatureHandlerService } from '../../../../../../../apps/keira/src/app/features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../../../../../apps/keira/src/app/features/creature/sai-creature-handler.service';
import { CreatureSpawnAddonService } from '../../../../../../../apps/keira/src/app/features/creature/creature-spawn-addon/creature-spawn-addon.service';
import { MockedMysqlQueryService, MockedToastrService } from '../../../services/services-mock.spec';

describe('MultiRowExternalEditorService', () => {
  let service: MultiRowExternalEditorService<CreatureSpawnAddon>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureSpawnAddonService,
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(CreatureSpawnAddonService);
  });

  it('updateDiffQuery() should correctly work', () => {
    service['_diffQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(queryResult);

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
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(service.entityTable, service.newRows, null, service.entitySecondIdField);
    expect(service.fullQuery).toEqual(queryResult);
  });
});
