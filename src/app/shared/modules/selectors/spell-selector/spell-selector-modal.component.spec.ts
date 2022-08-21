import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { SpellSelectorModalComponent } from './spell-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SpellSearchService } from '../../search/spell-search.service';
import { SpellSelectorModule } from './spell-selector.module';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';

describe('SpellSelectorModalComponent', () => {
  let component: SpellSelectorModalComponent;
  let fixture: ComponentFixture<SpellSelectorModalComponent>;
  let searchService: SpellSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SpellSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(SpellSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(SpellSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
