import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemHandlerService } from './item-handler.service';

describe('ItemHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), ItemHandlerService],
    }),
  );

  it('should be created', () => {
    const service: ItemHandlerService = TestBed.inject(ItemHandlerService);
    expect(service).toBeTruthy();
  });
});
