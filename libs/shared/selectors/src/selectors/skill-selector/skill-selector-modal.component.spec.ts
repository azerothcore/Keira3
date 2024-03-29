import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SkillSearchService } from '../../search/skill-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('SkillSelectorModalComponent', () => {
  let component: SkillSelectorModalComponent;
  let fixture: ComponentFixture<SkillSelectorModalComponent>;
  let searchService: SkillSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SkillSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(SkillSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(SkillSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
