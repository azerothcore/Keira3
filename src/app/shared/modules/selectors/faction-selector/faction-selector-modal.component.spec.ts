import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { FactionSelectorModalComponent } from './faction-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { FactionSearchService } from '../../search/faction-search.service';
import { FactionSelectorModule } from './faction-selector.module';

describe('FactionSelectorModalComponent', () => {
  let component: FactionSelectorModalComponent;
  let fixture: ComponentFixture<FactionSelectorModalComponent>;
  let searchService: FactionSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FactionSelectorModule],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(FactionSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(FactionSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
