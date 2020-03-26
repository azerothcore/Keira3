import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemHandlerService } from '../item-handler.service';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MockedToastrService } from '@keira-shared/testing/mocks';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemTemplate } from '@keira-shared/types/item-template.type';
import { Lock } from './item-preview';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { of } from 'rxjs';
import { TableRow } from '@keira-shared/types/general';

fdescribe('ItemPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemPreviewService,
      ItemTemplateService,
      ItemHandlerService,
    ]
  }));

    const createItem = (partial: Partial<ItemTemplate>) => Object.assign(new ItemTemplate(), partial);
    const mockItemNameById = 'mockItemNameById';
    const mockGetSpellNameById = 'mockGetSpellNameById';
    const mockGetSpellDescriptionById = 'mockGetSpellDescriptionById';
    const mockGetFactionNameById = 'mockGetFactionNameById';
    const mockGetLockById: Lock[] = [];
    const mockGetMapNameById = 'mockGetMapNameById';
    const mockGetAreaNameById = 'mockGetAreaNameById';
    const mockGetEventNameByHolidayId = 'mockGetEventNameByHolidayId';
    const mockGetSocketBonusById = 'mockGetSocketBonusById';

    beforeEach(() => {
      const queryService = TestBed.inject(MysqlQueryService);
      spyOn(queryService, 'getItemNameById').and.callFake(i => of(mockItemNameById + i).toPromise());
      spyOn(queryService, 'query').and.callFake(i => of([]));

      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'getSpellNameById').and.callFake(i => of(mockGetSpellNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getSpellDescriptionById').and.callFake(i => of(mockGetSpellDescriptionById + i).toPromise());
      spyOn(sqliteQueryService, 'getFactionNameById').and.callFake(i => of(mockGetFactionNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getLockById').and.callFake(i => of(mockGetLockById).toPromise());
      spyOn(sqliteQueryService, 'getMapNameById').and.callFake(i => of(mockGetMapNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getAreaNameById').and.callFake(i => of(mockGetAreaNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getEventNameByHolidayId').and.callFake(i => of(mockGetEventNameByHolidayId + i).toPromise());
      spyOn(sqliteQueryService, 'getSocketBonusById').and.callFake(i => of(mockGetSocketBonusById + i).toPromise());
      spyOn(sqliteQueryService, 'query').and.callFake(i => of([]));
    });

  it('calculatePreview()', async() => {
    const service: ItemPreviewService = TestBed.inject(ItemPreviewService);
    const editorService: ItemTemplateService = TestBed.inject(ItemTemplateService);

    for (const test of [
      { template: createItem({}), output: '' },
      { template: createItem({}), output: '' },
    ]) {
      editorService['_form'].setValue(test.template);
      expect(await service.calculatePreview()).toEqual(test.output);
    }
  });
});
