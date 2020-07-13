import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SkillSearchService } from '../../search/skill-search.service';
import { SkillSelectorModule } from './skill-selector.module';

describe('SkillSelectorModalComponent', () => {
  let component: SkillSelectorModalComponent;
  let fixture: ComponentFixture<SkillSelectorModalComponent>;
  let searchService: SkillSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SkillSelectorModule],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
      .compileComponents();
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
