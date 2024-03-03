import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureQuestitemService } from './creature-questitem.service';

describe('CreatureQuestitemService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureQuestitemService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureQuestitemService = TestBed.inject(CreatureQuestitemService);
    expect(service).toBeTruthy();
  });
});
