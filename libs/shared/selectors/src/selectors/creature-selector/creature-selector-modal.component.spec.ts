import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { CreatureSearchService } from '../../search/creature-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('CreatureSelectorModalComponent', () => {
  let component: CreatureSelectorModalComponent;
  let fixture: ComponentFixture<CreatureSelectorModalComponent>;
  let searchService: CreatureSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreatureSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
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
