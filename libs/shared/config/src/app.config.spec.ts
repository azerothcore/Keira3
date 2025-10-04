import { InjectionToken } from '@angular/core';
import { KeiraAppConfig, KEIRA_APP_CONFIG_TOKEN } from './app.config';

describe('KeiraAppConfig', () => {
  describe('Interface Definition', () => {
    it('should define required properties', () => {
      // Test that a config object can be created with all required properties
      const config: KeiraAppConfig = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        sqliteItem3dPath: 'test_item.db',
      };

      expect(config).toBeDefined();
      expect(config.production).toBeDefined();
      expect(config.environment).toBeDefined();
      expect(config.sqlitePath).toBeDefined();
      expect(config.sqliteItem3dPath).toBeDefined();
    });

    it('should allow optional databaseApiUrl property', () => {
      const configWithoutApi: KeiraAppConfig = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        sqliteItem3dPath: 'test_item.db',
      };

      const configWithApi: KeiraAppConfig = {
        production: true,
        environment: 'docker',
        sqlitePath: 'assets/sqlite.db',
        sqliteItem3dPath: 'assets/item_display.db',
        databaseApiUrl: '/api/database',
      };

      expect(configWithoutApi).toBeDefined();
      expect(configWithoutApi.databaseApiUrl).toBeUndefined();
      expect(configWithApi).toBeDefined();
      expect(configWithApi.databaseApiUrl).toBe('/api/database');
    });

    it('should enforce correct property types', () => {
      const config: KeiraAppConfig = {
        production: true,
        environment: 'production',
        sqlitePath: 'prod.db',
        sqliteItem3dPath: 'prod_item.db',
        databaseApiUrl: '/api/database',
      };

      expect(typeof config.production).toBe('boolean');
      expect(typeof config.environment).toBe('string');
      expect(typeof config.sqlitePath).toBe('string');
      expect(typeof config.sqliteItem3dPath).toBe('string');
      expect(typeof config.databaseApiUrl).toBe('string');
    });
  });

  describe('Database API URL Property', () => {
    it('should be optional in the interface', () => {
      // Test that config can be created without databaseApiUrl
      const minimalConfig: KeiraAppConfig = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        sqliteItem3dPath: 'test_item.db',
      };

      expect(minimalConfig).toBeDefined();
      expect('databaseApiUrl' in minimalConfig).toBe(false);
    });

    it('should accept string values when provided', () => {
      const configs: KeiraAppConfig[] = [
        {
          production: true,
          environment: 'docker',
          sqlitePath: 'docker.db',
          sqliteItem3dPath: 'docker_item.db',
          databaseApiUrl: '/api/database',
        },
        {
          production: false,
          environment: 'dev',
          sqlitePath: 'dev.db',
          sqliteItem3dPath: 'dev_item.db',
          databaseApiUrl: '/custom/api/db',
        },
        {
          production: true,
          environment: 'prod',
          sqlitePath: 'prod.db',
          sqliteItem3dPath: 'prod_item.db',
          databaseApiUrl: 'http://external-api.com/database',
        },
      ];

      configs.forEach((config, index) => {
        expect(config.databaseApiUrl).toBeDefined();
        expect(typeof config.databaseApiUrl).toBe('string');
        expect(config.databaseApiUrl).not.toBe('');
      });
    });

    it('should support various URL formats', () => {
      const urlFormats = [
        '/api/database', // Relative path
        '/custom/db/api', // Custom relative path
        'http://localhost:3001', // Full HTTP URL
        'https://api.example.com', // HTTPS URL
        './database', // Relative to current
        '../api/db', // Parent directory
      ];

      urlFormats.forEach((url) => {
        const config: KeiraAppConfig = {
          production: false,
          environment: 'test',
          sqlitePath: 'test.db',
          sqliteItem3dPath: 'test_item.db',
          databaseApiUrl: url,
        };

        expect(config.databaseApiUrl).toBe(url);
        expect(typeof config.databaseApiUrl).toBe('string');
      });
    });
  });

  describe('Configuration Scenarios', () => {
    it('should support Electron environment configuration', () => {
      const electronConfig: KeiraAppConfig = {
        production: false,
        environment: 'ELECTRON',
        sqlitePath: 'local/sqlite.db',
        sqliteItem3dPath: 'local/item_display.db',
        // No databaseApiUrl for Electron
      };

      expect(electronConfig.databaseApiUrl).toBeUndefined();
      expect(electronConfig.environment).toBe('ELECTRON');
    });

    it('should support Docker environment configuration', () => {
      const dockerConfig: KeiraAppConfig = {
        production: true,
        environment: 'DOCKER',
        sqlitePath: 'assets/sqlite.db',
        sqliteItem3dPath: 'assets/item_display.db',
        databaseApiUrl: '/api/database',
      };

      expect(dockerConfig.databaseApiUrl).toBe('/api/database');
      expect(dockerConfig.production).toBe(true);
      expect(dockerConfig.environment).toBe('DOCKER');
    });

    it('should support web development configuration', () => {
      const webDevConfig: KeiraAppConfig = {
        production: false,
        environment: 'DEV_WEB',
        sqlitePath: 'dev/sqlite.db',
        sqliteItem3dPath: 'dev/item_display.db',
        databaseApiUrl: 'http://localhost:3001/api/database',
      };

      expect(webDevConfig.databaseApiUrl).toContain('localhost');
      expect(webDevConfig.production).toBe(false);
    });
  });
});

describe('KEIRA_APP_CONFIG_TOKEN', () => {
  it('should be an Angular injection token', () => {
    expect(KEIRA_APP_CONFIG_TOKEN).toBeDefined();
    expect(KEIRA_APP_CONFIG_TOKEN instanceof InjectionToken).toBe(true);
  });

  it('should have correct token description', () => {
    expect(KEIRA_APP_CONFIG_TOKEN.toString()).toContain('KEIRA_APP_CONFIG');
  });

  it('should be typed for KeiraAppConfig', () => {
    // This is a compile-time check - if this compiles, the token is correctly typed
    const token: InjectionToken<KeiraAppConfig> = KEIRA_APP_CONFIG_TOKEN;
    expect(token).toBeDefined();
  });

  describe('Dependency Injection Usage', () => {
    it('should be usable in Angular DI system', () => {
      const mockConfig: KeiraAppConfig = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        sqliteItem3dPath: 'test_item.db',
        databaseApiUrl: '/api/test',
      };

      // Test that the token can be used with a config object
      expect(mockConfig).toBeDefined();
      expect(KEIRA_APP_CONFIG_TOKEN).toBeDefined();

      // In real usage: { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig }
      const providerConfig = { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig };
      expect(providerConfig.provide).toBe(KEIRA_APP_CONFIG_TOKEN);
      expect(providerConfig.useValue).toBe(mockConfig);
    });
  });
});
