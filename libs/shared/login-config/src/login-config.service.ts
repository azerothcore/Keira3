import { inject, Injectable } from '@angular/core';
import { ConnectionOptions } from 'mysql2';
import { LocalStorageService } from './local-storage.service';

declare type Config = Partial<ConnectionOptions> & {
  sslEnabled?: boolean;
  sshEnabled?: boolean;
  sshHost?: string;
  sshPort?: number;
  sshUser?: string;
  sshPassword?: string;
  sshPrivateKey?: string;
};

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
      if (config.sshPassword) {
        config.sshPassword = atob(config.sshPassword);
      }
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
      config1.database === config2.database &&
      config1.sslEnabled === config2.sslEnabled &&
      config1.sshEnabled === config2.sshEnabled &&
      config1.sshHost === config2.sshHost &&
      config1.sshPort === config2.sshPort &&
      config1.sshUser === config2.sshUser
    );
  }

  private setConfigsToStorage(configs: Config[]): void {
    for (const config of configs) {
      config.password = btoa(config.password as string);
      if (config.sshPassword) {
        config.sshPassword = btoa(config.sshPassword);
      }
    }

    this.localStorageService.setItem(this.KEY, JSON.stringify(configs));
  }
}
