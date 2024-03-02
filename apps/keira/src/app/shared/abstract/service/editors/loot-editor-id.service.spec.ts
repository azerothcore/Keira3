import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureLootTemplate } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../../../../features/creature/creature-handler.service';
import { CreatureLootTemplateService } from '../../../../features/creature/creature-loot-template/creature-loot-template.service';
import { SaiCreatureHandlerService } from '../../../../features/creature/sai-creature-handler.service';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { LootEditorIdService } from './loot-editor-id.service';

describe('LootEditorService', () => {
  let service: LootEditorIdService<CreatureLootTemplate>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureLootTemplateService,
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(CreatureLootTemplateService);
  });

  it('getLootId() should correctly work', () => {
    const lootId = 1200;
    const mockData: { lootId: number }[] = [{ lootId }];
    const querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of(mockData));

    service.getLootId().subscribe((data) => {
      expect(data).toEqual(mockData);
    });
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT ${service.entityTemplateLootField} AS lootId ` +
        `FROM ${service.entityTemplateTable} ` +
        `WHERE ${service['_entityTemplateIdField']} = ${service['handlerService.selected']}`,
    );
  });
});
