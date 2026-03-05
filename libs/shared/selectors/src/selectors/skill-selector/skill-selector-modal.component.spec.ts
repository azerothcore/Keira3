import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SkillSearchService } from '../../search/skill-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('SkillSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkillSelectorModalComponent, TranslateTestingModule],
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
    const searchService = TestBed.inject(SkillSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(SkillSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
