import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be defined', () => {
    const service: LocationService = TestBed.inject(LocationService);
    expect(service).toBeDefined();
  });
});
