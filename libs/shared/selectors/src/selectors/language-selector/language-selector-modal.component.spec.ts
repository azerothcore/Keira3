import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { LanguageSearchService } from '../../search/language-search.service';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('LanguageSelectorModalComponent', () => {
  let component: LanguageSelectorModalComponent;
  let fixture: ComponentFixture<LanguageSelectorModalComponent>;
  let searchService: LanguageSearchService;

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

  beforeEach(() => {
    searchService = TestBed.inject(LanguageSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(LanguageSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
