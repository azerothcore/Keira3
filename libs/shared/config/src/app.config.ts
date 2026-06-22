import { InjectionToken } from '@angular/core';

export interface KeiraAppConfig {
  production: boolean;
  environment: string;
  sqlitePath: string;
}

export const KEIRA_APP_CONFIG_TOKEN = new InjectionToken<KeiraAppConfig>('KEIRA_APP_CONFIG');
