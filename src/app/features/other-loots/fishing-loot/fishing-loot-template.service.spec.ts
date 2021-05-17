import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { FishingLootTemplateService } from './fishing-loot-template.service';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

describe('FishingLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        FishingLootHandlerService,
        FishingLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(FishingLootTemplateService)).toBeTruthy();
  });
});
