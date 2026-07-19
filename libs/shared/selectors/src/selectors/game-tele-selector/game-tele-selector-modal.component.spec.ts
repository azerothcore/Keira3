import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { GameTeleSelectorModalComponent } from './game-tele-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameTeleSearchService } from '../../search/game-tele-search.service';

describe('GameTeleSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameTeleSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

  function setup() {
    const searchService = TestBed.inject(GameTeleSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(GameTeleSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
