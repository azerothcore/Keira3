import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { MysqlResult } from '@keira-types/general';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { GAMEOBJECT_TEMPLATE_TYPE } from '@keira-types/gameobject-template.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('GameobjectLootTemplateService', () => {
  let service: GameobjectLootTemplateService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GameobjectHandlerService,
      SaiGameobjectHandlerService,
      GameobjectLootTemplateService,
    ]
  }));

  beforeEach(() => {
    service = TestBed.inject(GameobjectLootTemplateService);
  });

  it('getType() should correctly work', () => {
    const type = 3;
    const mockData: MysqlResult<{ type: number }> = { results: [{ type }] };
    const querySpy = spyOn(TestBed.inject(QueryService), 'query').and.returnValue(of(mockData));

    service.getType().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    expect(querySpy).toHaveBeenCalledWith(`SELECT ${GAMEOBJECT_TEMPLATE_TYPE} `
    + `FROM ${service.entityTemplateTable} `
    + `WHERE ${service['_entityTemplateIdField']} = ${service['handlerService.selected']}`);
  });
});
