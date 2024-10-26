import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateModelService } from './creature-template-model.service';

describe('CreatureTemplateModelService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureTemplateModelService,
      ],
    }),
  );

  it('selectQuery should correctly work', () => {
    const service: CreatureTemplateModelService = TestBed.inject(CreatureTemplateModelService);
    const querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query');
    const entry = 123;

    service.selectQuery(entry);

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT ctm.* FROM creature_template AS ct INNER JOIN creature_template_model AS ctm ON ct.entry = ctm.CreatureID WHERE ct.entry = ${entry}`,
    );
  });
});
