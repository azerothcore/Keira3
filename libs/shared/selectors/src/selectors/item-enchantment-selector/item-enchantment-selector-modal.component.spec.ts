import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ItemEnchantmentSearchService } from '../../search/item-enchantment-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('ItemEnchantmentSelectorModalComponent', () => {
  let component: ItemEnchantmentSelectorModalComponent;
  let fixture: ComponentFixture<ItemEnchantmentSelectorModalComponent>;
  let searchService: ItemEnchantmentSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemEnchantmentSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
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
