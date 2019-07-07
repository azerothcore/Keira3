import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { LootEditorService } from './loot-editor.service';
import { CreatureLootTemplate } from '../../types/creature-loot-template.type';
import { CreatureLootTemplateService } from './creature/creature-loot-template.service';
import { MysqlResult } from '../../types/general';
import { of } from 'rxjs';


describe('LootEditorService', () => {
  let service: LootEditorService<CreatureLootTemplate>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureLootTemplateService);
  });

  it('getLootId() should correctly work', () => {
    const lootId = 1200;
    const mockData: MysqlResult<{ lootId: number }> = { results: [{ lootId }] };
    const querySpy = spyOn(TestBed.get(QueryService), 'query').and.returnValue(of(mockData));

    service.getLootId().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    expect(querySpy).toHaveBeenCalledWith(`SELECT ${service.entityTemplateLootField} AS lootId `
    + `FROM ${service.entityTemplateTable} `
    + `WHERE ${service['_entityTemplateIdField']} = ${service['handlerService.selected']}`);
  });
});
