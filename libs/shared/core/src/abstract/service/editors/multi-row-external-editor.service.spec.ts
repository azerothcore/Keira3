import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { MultiRowExternalEditorService } from './multi-row-external-editor.service';
import { MockedMysqlQueryService, MockedToastrService } from '../../../services/services.mock';
import { MockEntity, MockHandlerService, MockMultiRowExternalEditorService } from '../../../core.mock';

describe('MultiRowExternalEditorService', () => {
  let service: MultiRowExternalEditorService<MockEntity>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        MockHandlerService,
        MockMultiRowExternalEditorService,
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(MockMultiRowExternalEditorService);
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

  xit('updateFullQuery() should correctly work', () => {
    service['_fullQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(service.entityTable, service.newRows, null, service.entitySecondIdField);
    expect(service.fullQuery).toEqual(queryResult);
  });
});
