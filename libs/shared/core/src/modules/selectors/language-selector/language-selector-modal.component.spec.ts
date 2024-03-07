import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { LanguageSearchService } from '../../search/language-search.service';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';
import { LanguageSelectorModule } from './language-selector.module';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '../../../services/sqlite.service';

describe('LanguageSelectorModalComponent', () => {
  let component: LanguageSelectorModalComponent;
  let fixture: ComponentFixture<LanguageSelectorModalComponent>;
  let searchService: LanguageSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LanguageSelectorModule, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
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
