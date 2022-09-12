import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { CreatureSearchService } from '../../search/creature-search.service';
import { CreatureSelectorModule } from './creature-selector.module';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';

describe('CreatureSelectorModalComponent', () => {
  let component: CreatureSelectorModalComponent;
  let fixture: ComponentFixture<CreatureSelectorModalComponent>;
  let searchService: CreatureSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreatureSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(CreatureSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(CreatureSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
