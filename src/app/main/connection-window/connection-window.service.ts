import { Injectable } from '@angular/core';
import { LocalStorageService } from '@keira-shared/services/local-storage.service';
import { ConnectionConfig } from 'mysql';

declare type Config = Partial<ConnectionConfig>;

@Injectable({
  providedIn: 'root'
})
export class ConnectionWindowService {
  private KEY = 'strl';

  constructor(private localStorageService: LocalStorageService) { }

  clearAllConfigs(): void {
    this.localStorageService.removeItem(this.KEY);
  }

  saveNewConfig(newConfig: Config): void {
    let configs: Config[] = this.getConfigs();

    for (let i = 0; i < configs.length; i++) {
      if (this.isSameConfig(configs[i], newConfig)) {
        // existing config
        configs = configs.splice(i, 1);
        configs.push(newConfig);
        this.setConfigsToStorage(configs);
        return;
      }
    }

    // new config
    configs.push(newConfig);
    this.setConfigsToStorage(configs);
  }

  getConfigs(): Config[] {
    const configs: string = this.localStorageService.getItem(this.KEY);
    return JSON.parse(configs) ?? [];
  }

  private isSameConfig(config1: Config, config2: Config): boolean {
    return config1.host === config2.host
        && config1.port === config2.port
        && config1.user === config2.user
        && config1.database === config2.database;
  }

  private setConfigsToStorage(configs: Config[]): void {
    this.localStorageService.setItem(this.KEY, JSON.stringify(configs));
  }
}
