import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureTemplateAddonService } from './creature-template-addon.service';
import { QueryService } from '../../../shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '../../../shared/testing/mocks';

describe('CreatureTemplateAddonService', () => {
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
    const service: CreatureTemplateAddonService = TestBed.get(CreatureTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
