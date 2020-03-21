import { TestBed } from '@angular/core/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { instance } from 'ts-mockito';
import { ItemPreviewService } from './item-preview.service';

describe('ItemPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: ItemPreviewService = TestBed.inject(ItemPreviewService);
    expect(service).toBeTruthy();
  });
});
