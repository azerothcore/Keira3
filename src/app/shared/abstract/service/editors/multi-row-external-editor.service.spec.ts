import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';


import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { MultiRowExternalEditorService } from './multi-row-external-editor.service';
import { CreatureSpawnAddon } from '@keira-types/creature-spawn-addon.type';
import { CreatureSpawnAddonService } from '../../../../features/creature/creature-spawn-addon/creature-spawn-addon.service';
import { CreatureHandlerService } from '../../../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../../features/creature/sai-creature-handler.service';


describe('MultiRowExternalEditorService', () => {
  let service: MultiRowExternalEditorService<CreatureSpawnAddon>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      CreatureSpawnAddonService,
    ],
  }));

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
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service.newRows,
      null,
      service.entitySecondIdField,
    );
    expect(service.fullQuery).toEqual(queryResult);
  });
});
