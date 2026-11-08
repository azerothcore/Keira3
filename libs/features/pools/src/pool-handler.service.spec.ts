import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PoolHandlerService } from './pool-handler.service';

describe('PoolHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), provideZonelessChangeDetection()] }));

  it('tracks whether each table of the pool is unsaved', () => {
    const handler = TestBed.inject(PoolHandlerService);
    expect(handler.isPoolTemplateUnsaved()).toBe(false);
    expect(handler.isPoolCreatureUnsaved()).toBe(false);
    expect(handler.isPoolGameobjectUnsaved()).toBe(false);
    expect(handler.isPoolPoolUnsaved()).toBe(false);
    expect(handler.isPoolQuestUnsaved()).toBe(false);
    expect(handler.isGameEventPoolUnsaved()).toBe(false);
  });
});
