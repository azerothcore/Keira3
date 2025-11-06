import { InjectionToken } from '@angular/core';

/**
 * Supported deployment environments for Keira3
 */
export type KeiraEnvironment =
  | 'ELECTRON'
  | 'WEB'
  | 'DEV_WEB'
  | 'DOCKER'
  | 'LOCAL'
  | 'DEV'
  | 'PROD'
  | 'test'
  | 'production';

export interface KeiraAppConfig {
  readonly production: boolean;
  readonly environment: KeiraEnvironment;
  readonly sqlitePath: string;
  readonly sqliteItem3dPath: string;
  readonly databaseApiUrl?: string;
}

export interface ElectronAppConfig extends KeiraAppConfig {
  readonly environment: 'ELECTRON';
  readonly production: false;
  readonly databaseApiUrl?: never;
}

export interface DockerAppConfig extends KeiraAppConfig {
  readonly environment: 'DOCKER';
  readonly production: true;
  readonly databaseApiUrl: string;
}

export interface WebAppConfig extends KeiraAppConfig {
  readonly environment: 'WEB' | 'DEV_WEB';
  readonly databaseApiUrl: string;
}

export type EnvironmentSpecificConfig = ElectronAppConfig | DockerAppConfig | WebAppConfig;

export function isElectronConfig(config: KeiraAppConfig): config is ElectronAppConfig {
  return config.environment === 'ELECTRON';
}

export function isDockerConfig(config: KeiraAppConfig): config is DockerAppConfig {
  return config.environment === 'DOCKER';
}

export function isWebConfig(config: KeiraAppConfig): config is WebAppConfig {
  return config.environment === 'WEB' || config.environment === 'DEV_WEB';
}

export function requiresDatabaseApi(config: KeiraAppConfig): boolean {
  return !isElectronConfig(config);
}

export const KEIRA_APP_CONFIG_TOKEN = new InjectionToken<KeiraAppConfig>('KEIRA_APP_CONFIG');
