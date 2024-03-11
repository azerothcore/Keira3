import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ConnectionOptions } from 'mysql2';

declare type Config = Partial<ConnectionOptions>;

@Injectable({
  providedIn: 'root',
})
export class LoginConfigService {
  private readonly localStorageService = inject(LocalStorageService);

  readonly KEY = 'strl';

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
    const raw: string = this.localStorageService.getItem(this.KEY) as string;
    const configs = JSON.parse(raw) ?? [];

    for (const config of configs) {
      config.password = atob(config.password);
    }

    return configs;
  }

  saveRememberPreference(rememberMe: boolean): void {
    this.localStorageService.setItem('rememberMe', String(rememberMe));
  }

  isRememberMeEnabled(): boolean {
    return this.localStorageService.getItem('rememberMe') === 'true';
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
      config.password = btoa(config.password as string);
    }

    this.localStorageService.setItem(this.KEY, JSON.stringify(configs));
  }
}
