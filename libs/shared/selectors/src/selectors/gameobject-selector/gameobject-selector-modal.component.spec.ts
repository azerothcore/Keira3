import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectSearchService } from '../../search/gameobject-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('GameobjectSelectorModalComponent', () => {
  let component: GameobjectSelectorModalComponent;
  let fixture: ComponentFixture<GameobjectSelectorModalComponent>;
  let searchService: GameobjectSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GameobjectSelectorModalComponent, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }).compileComponents();
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
