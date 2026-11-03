import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';
import { QuestOfferRewardLocaleService } from './quest-offer-reward-locale.service';
import { QuestHandlerService } from '../quest-handler.service';

describe('QuestOfferRewardLocaleService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        QuestHandlerService,
        QuestOfferRewardLocaleService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestOfferRewardLocaleService = TestBed.inject(QuestOfferRewardLocaleService);
    expect(service).toBeTruthy();
  });
});
