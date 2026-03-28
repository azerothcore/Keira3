import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestSearchService } from '../../search/quest-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('QuestSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuestSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

  function setup() {
    const searchService = TestBed.inject(QuestSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(QuestSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
