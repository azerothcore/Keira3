import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { ItemSearchService } from '../../search/item-search.service';
import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { ItemSelectorModule } from './item-selector.module';

describe('ItemSelectorModalComponent', () => {
  let component: ItemSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: ItemSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
