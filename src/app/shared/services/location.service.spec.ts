import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  xit('reload() should correctly work', () => {
    const service: LocationService = TestBed.inject(LocationService);
    const spyLocationReload = spyOn<any>(location, 'reload');

    expect(spyLocationReload).toHaveBeenCalledTimes(0);
    service.reload();
    expect(spyLocationReload).toHaveBeenCalledTimes(1);
  });
});
