import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

describe('CreatureOnkillReputationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      CreatureOnkillReputationService,
    ],
  }));

  it('should be created', () => {
    const service: CreatureOnkillReputationService = TestBed.inject(CreatureOnkillReputationService);
    expect(service).toBeTruthy();
  });
});
