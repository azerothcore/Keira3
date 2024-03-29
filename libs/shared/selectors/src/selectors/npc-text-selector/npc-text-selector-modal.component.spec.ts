import { TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('NpcTextSelectorModalComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NpcTextSelectorModalComponent, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
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
