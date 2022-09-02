import { Injectable } from '@angular/core';
import { LocalStorageService } from '@keira-shared/services/local-storage.service';
import { ConnectionOptions as ConnectionOptions } from 'mysql2';

declare type Config = Partial<ConnectionOptions>;

@Injectable({
  providedIn: 'root',
})
export class ConnectionWindowService {
  readonly KEY = 'strl';

  constructor(private localStorageService: LocalStorageService) {}

  removeAllConfigs(): void {
    this.localStorageService.removeItem(this.KEY);
  }

  saveNewConfig(newConfig: Config): void {
    const configs: Config[] = this.getConfigs();

    for (let i = 0; i < configs.length; i++) {
      if (this.isSameConfig(configs[i], newConfig)) {
        // existing config
        configs.splice(i, 1);
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
    const raw: string = this.localStorageService.getItem(this.KEY);
    const configs = JSON.parse(raw) ?? [];

    for (const config of configs) {
      config.password = atob(config.password);
    }

    return configs;
  }

  private isSameConfig(config1: Config, config2: Config): boolean {
    return (
      config1.host === config2.host &&
      config1.port === config2.port &&
      config1.user === config2.user &&
      config1.database === config2.database
    );
  }

  private setConfigsToStorage(configs: Config[]): void {
    for (const config of configs) {
      config.password = btoa(config.password);
    }

    this.localStorageService.setItem(this.KEY, JSON.stringify(configs));
  }
}
