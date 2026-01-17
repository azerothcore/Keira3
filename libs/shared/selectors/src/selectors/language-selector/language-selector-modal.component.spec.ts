import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { LanguageSearchService } from '../../search/language-search.service';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('LanguageSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LanguageSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

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
