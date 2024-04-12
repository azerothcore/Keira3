import { TestBed } from '@angular/core/testing';
import { PageTextHandlerService } from './page-text-handler.service';

describe('SpellLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [PageTextHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(PageTextHandlerService)).toBeTruthy();
  });
});
