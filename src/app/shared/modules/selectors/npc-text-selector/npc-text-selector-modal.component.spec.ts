import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { NpcTextSelectorModule } from './npc-text-selector.module';

describe('ItemSelectorModalComponent', () => {
  let component: NpcTextSelectorModalComponent;
  let fixture: ComponentFixture<NpcTextSelectorModalComponent>;
  let searchService: NpcTextSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NpcTextSelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(NpcTextSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(NpcTextSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
