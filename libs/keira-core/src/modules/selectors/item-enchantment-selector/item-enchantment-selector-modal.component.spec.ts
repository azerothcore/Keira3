import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { MockedMysqlQueryService, TranslateTestingModule } from '@keira/test-utils';
import { ItemEnchantmentSearchService } from '../../search/item-enchantment-search.service';
import { ItemEnchantmentSelectorModule } from './item-enchantment-selector.module';

describe('ItemEnchantmentSelectorModalComponent', () => {
  let component: ItemEnchantmentSelectorModalComponent;
  let fixture: ComponentFixture<ItemEnchantmentSelectorModalComponent>;
  let searchService: ItemEnchantmentSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemEnchantmentSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemEnchantmentSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemEnchantmentSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
