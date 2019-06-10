import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

describe('CreatureOnkillReputationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureOnkillReputationService = TestBed.get(CreatureOnkillReputationService);
    expect(service).toBeTruthy();
  });
});
