import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { ItemSearchService } from '../../search/item-search.service';
import { ItemSelectorModule } from './item-selector.module';

describe('ItemSelectorModalComponent', () => {
  let component: ItemSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: ItemSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ItemSelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
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
