import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { SpellSelectorModalComponent } from './spell-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SpellSearchService } from '../../search/spell-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('SpellSelectorModalComponent', () => {
  let component: SpellSelectorModalComponent;
  let fixture: ComponentFixture<SpellSelectorModalComponent>;
  let searchService: SpellSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SpellSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(SpellSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(SpellSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
