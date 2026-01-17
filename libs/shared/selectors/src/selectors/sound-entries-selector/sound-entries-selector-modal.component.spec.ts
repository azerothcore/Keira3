import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { SoundEntriesSearchService } from '../../search/sound-entries-search.service';
import { SoundEntriesSelectorModalComponent } from './sound-entries-selector-modal.component';

describe('SoundEntriesSelectorModalComponent', () => {
  let component: SoundEntriesSelectorModalComponent;
  let fixture: ComponentFixture<SoundEntriesSelectorModalComponent>;
  let searchService: SoundEntriesSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SoundEntriesSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    searchService = TestBed.inject(SoundEntriesSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(SoundEntriesSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
