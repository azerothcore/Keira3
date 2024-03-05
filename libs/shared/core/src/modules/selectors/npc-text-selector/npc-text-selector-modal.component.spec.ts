import { TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { NpcTextSelectorModule } from './npc-text-selector.module';
import { MockedMysqlQueryService } from '../../../services/services.mock';

describe('NpcTextSelectorModalComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NpcTextSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(NpcTextSelectorModalComponent);
    const component = fixture.componentInstance;
    const searchService = TestBed.inject(NpcTextSearchService);
    searchService.query = '--mock query';

    fixture.detectChanges();

    return { component, fixture, searchService };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
