import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { ItemTemplateService } from './item-template.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-shared/types/item-template.type';
import { of } from 'rxjs';

describe('ItemTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      ItemTemplateService,
    ]
  }));

  // const createSai = (partial: Partial<SmartScripts>) => Object.assign(new SmartScripts(), partial);
  const itemTemplate = (partial: Partial<ItemTemplate>) => Object.assign(new ItemTemplate(), partial);
  const mockItemNameById = 'mockItemNameById';
  const mockGetSpellNameById = 'mockGetSpellNameById';

  beforeEach(() => {
    const queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'getItemNameById').and.callFake(i => of(mockItemNameById + i).toPromise());

    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    spyOn(sqliteQueryService, 'getSpellNameById').and.callFake(i => of(mockGetSpellNameById + i).toPromise());
  });

  it('should be created', () => {
    const service: ItemTemplateService = TestBed.inject(ItemTemplateService);
    expect(service).toBeTruthy();
  });
});
