import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { QueryService } from '../../../services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { CreatureSearchService } from '../../search/creature-search.service';
import { CreatureSelectorModule } from './creature-selector.module';

describe('CreatureSelectorModalComponent', () => {
  let component: CreatureSelectorModalComponent;
  let fixture: ComponentFixture<CreatureSelectorModalComponent>;
  let searchService: CreatureSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CreatureSelectorModule ],
      providers: [
        BsModalRef,
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
    })
    .compileComponents();
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
