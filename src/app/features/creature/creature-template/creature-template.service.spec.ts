import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureTemplateService } from './creature-template.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';

describe('CreatureTemplateService', () => {
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
    const service: CreatureTemplateService = TestBed.get(CreatureTemplateService);
    expect(service).toBeTruthy();
  });
});
