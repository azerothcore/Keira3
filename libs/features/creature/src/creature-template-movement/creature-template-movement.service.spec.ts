import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

describe('CreatureTemplateMovementService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
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
