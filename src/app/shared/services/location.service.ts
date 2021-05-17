import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  /* istanbul ignore next */
  reload() {
    location.reload();
  }
}
