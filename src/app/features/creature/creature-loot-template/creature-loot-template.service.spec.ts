import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureLootTemplateService } from './creature-loot-template.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

describe('CreatureLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      CreatureLootTemplateService,
    ],
  }));

  it('should be created', () => {
    const service: CreatureLootTemplateService = TestBed.inject(CreatureLootTemplateService);
    expect(service).toBeTruthy();
  });
});
