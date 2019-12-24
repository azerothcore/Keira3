import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  clear() {
    localStorage.clear();
  }
}
