import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { QuestSearchService } from '../../search/quest-search.service';
import { QuestSelectorModule } from './quest-selector.module';

describe('QuestSelectorModalComponent', () => {
  let component: QuestSelectorModalComponent;
  let fixture: ComponentFixture<QuestSelectorModalComponent>;
  let searchService: QuestSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ QuestSelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(QuestSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(QuestSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
