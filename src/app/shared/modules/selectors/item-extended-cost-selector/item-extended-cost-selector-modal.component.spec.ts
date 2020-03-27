import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { ItemExtendedCostSearchService } from '../../search/item-extended-cost-search.service';
import { ItemExtendedCostSelectorModule } from './item-extended-cost-selector.module';

describe('ItemExtendedCostSelectorModalComponent', () => {
  let component: ItemExtendedCostSelectorModalComponent;
  let fixture: ComponentFixture<ItemExtendedCostSelectorModalComponent>;
  let searchService: ItemExtendedCostSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ItemExtendedCostSelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemExtendedCostSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemExtendedCostSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
