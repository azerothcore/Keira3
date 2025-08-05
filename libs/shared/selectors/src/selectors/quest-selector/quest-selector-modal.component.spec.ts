import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestSearchService } from '../../search/quest-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('QuestSelectorModalComponent', () => {
  let component: QuestSelectorModalComponent;
  let fixture: ComponentFixture<QuestSelectorModalComponent>;
  let searchService: QuestSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuestSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(QuestSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(QuestSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
