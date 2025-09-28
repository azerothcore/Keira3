import { KeiraAppConfig } from '@keira/shared/config';
import { KEIRA_APP_CONFIG } from './environment.docker';

describe('Environment Docker Configuration', () => {
  let config: KeiraAppConfig;

  beforeEach(() => {
    config = KEIRA_APP_CONFIG;
  });

  it('should be defined', () => {
    expect(config).toBeDefined();
  });

  it('should be a production environment', () => {
    expect(config.production).toBe(true);
  });

  it('should have correct environment name', () => {
    expect(config.environment).toBe('DOCKER');
  });

  it('should have correct sqlite path', () => {
    expect(config.sqlitePath).toBe('assets/sqlite.db');
  });

  it('should have correct sqlite item 3D path', () => {
    expect(config.sqliteItem3dPath).toBe('assets/item_display.db');
  });

  it('should have database API URL configured', () => {
    expect(config.databaseApiUrl).toBe('/api/database');
  });

  it('should have database API URL as optional property', () => {
    expect(config.databaseApiUrl).toBeDefined();
    expect(typeof config.databaseApiUrl).toBe('string');
  });

  describe('Configuration Validation', () => {
    it('should have all required properties', () => {
      expect(config).toHaveProperty('production');
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('sqlitePath');
      expect(config).toHaveProperty('sqliteItem3dPath');
      expect(config).toHaveProperty('databaseApiUrl');
    });

    it('should have correct property types', () => {
      expect(typeof config.production).toBe('boolean');
      expect(typeof config.environment).toBe('string');
      expect(typeof config.sqlitePath).toBe('string');
      expect(typeof config.sqliteItem3dPath).toBe('string');
      expect(typeof config.databaseApiUrl).toBe('string');
    });

    it('should have non-empty string values', () => {
      expect(config.environment).not.toBe('');
      expect(config.sqlitePath).not.toBe('');
      expect(config.sqliteItem3dPath).not.toBe('');
      expect(config.databaseApiUrl).not.toBe('');
    });
  });

  describe('Docker-specific Configuration', () => {
    it('should be configured for Docker deployment', () => {
      expect(config.production).toBe(true);
      expect(config.environment).toBe('DOCKER');
    });

    it('should have database API URL for web environment', () => {
      expect(config.databaseApiUrl).toMatch(/^\/api\/database/);
    });

    it('should use assets paths for sqlite files', () => {
      expect(config.sqlitePath).toMatch(/^assets\//);
      expect(config.sqliteItem3dPath).toMatch(/^assets\//);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement KeiraAppConfig interface completely', () => {
      // Test that all properties exist and have correct structure
      const requiredProps: (keyof KeiraAppConfig)[] = ['production', 'environment', 'sqlitePath', 'sqliteItem3dPath'];

      const optionalProps: (keyof KeiraAppConfig)[] = ['databaseApiUrl'];

      // Check required properties
      requiredProps.forEach((prop) => {
        expect(config).toHaveProperty(prop);
        expect(config[prop]).toBeDefined();
      });

      // Check optional properties exist (they're defined in this config)
      optionalProps.forEach((prop) => {
        expect(config).toHaveProperty(prop);
      });
    });

    it('should be assignable to KeiraAppConfig type', () => {
      // TypeScript compile-time check - this test ensures the object structure is correct
      const testConfig: KeiraAppConfig = KEIRA_APP_CONFIG;
      expect(testConfig).toBeDefined();
    });
  });
});
