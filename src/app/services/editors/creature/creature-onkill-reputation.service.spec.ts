import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';
import { QueryService } from '../../query.service';
import { MockedQueryService, MockedToastrService } from '../../../test-utils/mocks';

describe('CreatureOnkillReputationService', () => {
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
    const service: CreatureOnkillReputationService = TestBed.get(CreatureOnkillReputationService);
    expect(service).toBeTruthy();
  });
});
