import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { GAMEOBJECT_TEMPLATE_TYPE } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';

describe('GameobjectLootTemplateService', () => {
  let service: GameobjectLootTemplateService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GameobjectLootTemplateService,
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(GameobjectLootTemplateService);
  });

  it('getType() should correctly work', () => {
    const type = 3;
    const mockData: { type: number }[] = [{ type }];
    const querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of(mockData));

    service.getType().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT ${GAMEOBJECT_TEMPLATE_TYPE} ` +
        `FROM ${service.entityTemplateTable} ` +
        `WHERE ${service['_entityTemplateIdField']} = ${service['handlerService.selected']}`,
    );
  });
});
