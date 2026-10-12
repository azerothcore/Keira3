import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ItemHandlerService } from './item-handler.service';

describe('ItemHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), ItemHandlerService],
    }),
  );

  it('should be created', () => {
    const service: ItemHandlerService = TestBed.inject(ItemHandlerService);
    expect(service).toBeTruthy();
  });
});
