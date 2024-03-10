import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SpellLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [SpellLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SpellLootHandlerService)).toBeTruthy();
  });
});
