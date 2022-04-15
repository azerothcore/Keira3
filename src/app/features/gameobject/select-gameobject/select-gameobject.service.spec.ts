import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { instance } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SelectGameobjectService } from './select-gameobject.service';

describe('SelectGameobjectService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        SelectGameobjectService,
      ],
    }),
  );

  it('should be created', () => {
    const service: SelectGameobjectService = TestBed.inject(SelectGameobjectService);
    expect(service).toBeTruthy();
  });
});
