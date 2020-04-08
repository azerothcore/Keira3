import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { GameobjectSearchService } from '../../search/gameobject-search.service';
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
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(GameobjectSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(GameobjectSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
