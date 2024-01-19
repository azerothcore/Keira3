import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { FactionSearchService } from '../../search/faction-search.service';
import { FactionSelectorModule } from './faction-selector.module';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component copy';

describe('FactionSelectorModalComponent', () => {
  let component: QuestFactionSelectorModalComponent;
  let fixture: ComponentFixture<QuestFactionSelectorModalComponent>;
  let searchService: FactionSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FactionSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(FactionSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(QuestFactionSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
