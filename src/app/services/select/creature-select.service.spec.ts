import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureSelectService } from './creature-select.service';

describe('CreatureSelectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureSelectService = TestBed.get(CreatureSelectService);
    expect(service).toBeTruthy();
  });
});
