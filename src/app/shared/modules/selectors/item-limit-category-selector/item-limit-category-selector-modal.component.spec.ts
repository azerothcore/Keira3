import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { ItemLimitCategorySearchService } from '../../search/item-limit-category-search.service';
import { ItemLimitCategorySelectorModule } from './item-limit-category-selector.module';

describe('ItemLimitCategorySelectorModalComponent', () => {
  let component: ItemLimitCategorySelectorModalComponent;
  let fixture: ComponentFixture<ItemLimitCategorySelectorModalComponent>;
  let searchService: ItemLimitCategorySearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ItemLimitCategorySelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemLimitCategorySearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemLimitCategorySelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
