import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { FishingLootTemplateService } from './fishing-loot-template.service';

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
