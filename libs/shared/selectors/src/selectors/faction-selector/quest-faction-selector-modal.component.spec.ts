import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { FactionSearchService } from '../../search/faction-search.service';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component';

import { SqliteService } from '../../../services/sqlite.service';
import { FactionSelectorModalComponent } from './faction-selector-modal.component';

describe('QuestFactionSelectorModalComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [FactionSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
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
