import { Injectable } from '@angular/core';
import { LocalStorageService } from '@keira-shared/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionWindowService {
  private KEY = 'stored_logins';

  constructor(private localStorageService: LocalStorageService) { }

  clearAllLogins() {
    this.localStorageService.removeItem(this.KEY);
  }
}
