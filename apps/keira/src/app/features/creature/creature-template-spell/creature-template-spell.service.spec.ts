import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateSpellService } from './creature-template-spell.service';

describe('CreatureTemplateSpellService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureTemplateSpellService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureTemplateSpellService = TestBed.inject(CreatureTemplateSpellService);
    expect(service).toBeTruthy();
  });
});
