import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { LanguageSearchService } from '../../search/language-search.service';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('LanguageSelectorModalComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LanguageSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  }));

  function setup() {
    const searchService = TestBed.inject(LanguageSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(LanguageSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { searchService, fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
