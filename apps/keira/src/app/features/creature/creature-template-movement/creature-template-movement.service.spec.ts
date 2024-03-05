import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

describe('CreatureTemplateMovementService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureTemplateMovementService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureTemplateMovementService = TestBed.inject(CreatureTemplateMovementService);
    expect(service).toBeTruthy();
  });
});
