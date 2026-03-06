import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { SpellSelectorModalComponent } from './spell-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SpellSearchService } from '../../search/spell-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('SpellSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpellSelectorModalComponent, TranslateTestingModule],
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
    const searchService = TestBed.inject(SpellSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(SpellSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
