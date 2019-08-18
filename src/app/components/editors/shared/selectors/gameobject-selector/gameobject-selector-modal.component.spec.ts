import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { QueryService } from '../../../../../services/query.service';
import { MockedQueryService } from '../../../../../test-utils/mocks';
import { GameobjectSearchService } from '../../../../../services/search/gameobject-search.service';
import { GameobjectSelectorModule } from './gameobject-selector.module';

describe('GameobjectSelectorModalComponent', () => {
  let component: GameobjectSelectorModalComponent;
  let fixture: ComponentFixture<GameobjectSelectorModalComponent>;
  let searchService: GameobjectSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ GameobjectSelectorModule ],
      providers: [
        BsModalRef,
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.get(GameobjectSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(GameobjectSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
