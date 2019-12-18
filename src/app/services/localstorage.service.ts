import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  clear() {
    localStorage.clear();
  }
}
