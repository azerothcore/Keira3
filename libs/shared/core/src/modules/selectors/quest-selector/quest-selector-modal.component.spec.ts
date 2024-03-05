import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestSearchService } from '../../search/quest-search.service';
import { QuestSelectorModule } from './quest-selector.module';
import { MockedMysqlQueryService } from '../../../services/mocks';

describe('QuestSelectorModalComponent', () => {
  let component: QuestSelectorModalComponent;
  let fixture: ComponentFixture<QuestSelectorModalComponent>;
  let searchService: QuestSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuestSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
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
