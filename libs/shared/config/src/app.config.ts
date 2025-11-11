import { InjectionToken } from '@angular/core';

/**
 * Strict type definitions for Keira3 application configuration
 */

export type KeiraEnvironment = 'ELECTRON' | 'WEB' | 'DOCKER' | 'DEV_WEB' | 'PROD' | 'test' | 'production';

export interface KeiraAppConfig {
  readonly production: boolean;
  readonly environment: KeiraEnvironment;
  readonly sqlitePath: string;
  readonly sqliteItem3dPath: string;
  readonly databaseApiUrl?: string;
}

/**
 * Type-safe configuration for different deployment environments
 */
export interface ElectronAppConfig extends KeiraAppConfig {
  readonly environment: 'ELECTRON';
  readonly production: false;
  readonly databaseApiUrl?: never; // Electron doesn't use API URL
}

export interface DockerAppConfig extends KeiraAppConfig {
  readonly environment: 'DOCKER';
  readonly production: true;
  readonly databaseApiUrl: string; // Required for Docker
}

export interface WebAppConfig extends KeiraAppConfig {
  readonly environment: 'WEB' | 'DEV_WEB';
  readonly databaseApiUrl: string; // Required for web environments
}

export type EnvironmentSpecificConfig = ElectronAppConfig | DockerAppConfig | WebAppConfig;

/**
 * Configuration validation utilities
 */
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
