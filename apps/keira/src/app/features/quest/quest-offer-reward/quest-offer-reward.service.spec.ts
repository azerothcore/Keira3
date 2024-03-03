import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestOfferRewardService } from './quest-offer-reward.service';

describe('QuestOfferRewardService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        QuestHandlerService,
        QuestOfferRewardService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestOfferRewardService = TestBed.inject(QuestOfferRewardService);
    expect(service).toBeTruthy();
  });
});
