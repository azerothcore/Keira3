import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '../../query.service';
import { MockedQueryService, MockedToastrService } from '../../../test-utils/mocks';
import { MillingLootTemplateService } from './milling-loot-template.service';

describe('MillingLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
    ],
  }));

  it('should be created', () => {
    const service: MillingLootTemplateService = TestBed.get(MillingLootTemplateService);
    expect(service).toBeTruthy();
  });
});
