import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';

describe('CreatureTemplateResistanceService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureTemplateResistanceService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureTemplateResistanceService = TestBed.inject(CreatureTemplateResistanceService);
    expect(service).toBeTruthy();
  });
});
