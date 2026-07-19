import { Service } from '@angular/core';

@Service()
export class LocationService {
  /* istanbul ignore next */
  reload() {
    location.reload();
  }
}
