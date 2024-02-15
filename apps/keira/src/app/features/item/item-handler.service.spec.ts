import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemHandlerService } from './item-handler.service';

describe('ItemHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [ItemHandlerService],
    }),
  );

  it('should be created', () => {
    const service: ItemHandlerService = TestBed.inject(ItemHandlerService);
    expect(service).toBeTruthy();
  });
});
