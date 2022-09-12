import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { MapSelectorModalComponent } from './map-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { MapSearchService } from '../../search/map-search.service';
import { MapSelectorModule } from './map-selector.module';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';

describe('MapSelectorModalComponent', () => {
  let component: MapSelectorModalComponent;
  let fixture: ComponentFixture<MapSelectorModalComponent>;
  let searchService: MapSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MapSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(MapSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(MapSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
