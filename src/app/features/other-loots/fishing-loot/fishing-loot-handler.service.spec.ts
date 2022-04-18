import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

describe('FishingLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [FishingLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(FishingLootHandlerService)).toBeTruthy();
  });
});
