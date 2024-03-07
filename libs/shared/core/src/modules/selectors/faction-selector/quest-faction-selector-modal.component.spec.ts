import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { FactionSearchService } from '../../search/faction-search.service';
import { FactionSelectorModule } from './faction-selector.module';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '../../../services/sqlite.service';

describe('QuestFactionSelectorModalComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [FactionSelectorModule, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<QuestFactionSelectorModalComponent> = TestBed.createComponent(QuestFactionSelectorModalComponent);
    const component: QuestFactionSelectorModalComponent = fixture.componentInstance;
    fixture.detectChanges();

    const searchService: FactionSearchService = TestBed.inject(FactionSearchService);
    searchService.query = '--mock query';

    return { fixture, component, searchService };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
