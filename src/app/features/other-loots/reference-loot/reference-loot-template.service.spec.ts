import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

describe('ReferenceLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ReferenceLootHandlerService,
        ReferenceLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(ReferenceLootTemplateService)).toBeTruthy();
  });
});
