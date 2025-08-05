import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { MapSelectorModalComponent } from './map-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MapSearchService } from '../../search/map-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('MapSelectorModalComponent', () => {
  let component: MapSelectorModalComponent;
  let fixture: ComponentFixture<MapSelectorModalComponent>;
  let searchService: MapSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MapSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
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
