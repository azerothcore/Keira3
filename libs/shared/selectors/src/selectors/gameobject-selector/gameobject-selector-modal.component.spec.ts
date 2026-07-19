import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectSearchService } from '../../search/gameobject-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('GameobjectSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameobjectSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

  function setup() {
    const searchService = TestBed.inject(GameobjectSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(GameobjectSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
