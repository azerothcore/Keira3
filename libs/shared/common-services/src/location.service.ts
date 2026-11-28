import { Service } from '@angular/core';

@Service()
export class LocationService {
  /* v8 ignore next */
  reload() {
    location.reload();
  }
}
