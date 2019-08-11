import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { GameobjectHandlerService } from './gameobject-handler.service';

describe('GameobjectHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: GameobjectHandlerService = TestBed.get(GameobjectHandlerService);
    expect(service).toBeTruthy();
  });
});
