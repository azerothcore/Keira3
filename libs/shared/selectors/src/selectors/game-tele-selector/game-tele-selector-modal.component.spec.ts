import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { GameTeleSelectorModalComponent } from './game-tele-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameTeleSearchService } from '../../search/game-tele-search.service';

describe('GameTeleSelectorModalComponent', () => {
  let component: GameTeleSelectorModalComponent;
  let fixture: ComponentFixture<GameTeleSelectorModalComponent>;
  let searchService: GameTeleSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GameTeleSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(GameTeleSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(GameTeleSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
