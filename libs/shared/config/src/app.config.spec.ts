import {
  DockerAppConfig,
  ElectronAppConfig,
  KeiraAppConfig,
  WebAppConfig,
  isDockerConfig,
  isElectronConfig,
  isWebConfig,
  requiresDatabaseApi,
} from './app.config';

describe('App config helpers', () => {
  const baseConfig: KeiraAppConfig = {
    production: false,
    environment: 'LOCAL',
    sqlitePath: 'sqlite.db',
    sqliteItem3dPath: 'item.db',
  };

  it('should detect electron configs correctly', () => {
    const electronConfig: ElectronAppConfig = { ...baseConfig, production: false, environment: 'ELECTRON' };
    expect(isElectronConfig(electronConfig)).toBe(true);
    expect(requiresDatabaseApi(electronConfig)).toBe(false);
  });

  it('should detect docker configs and require API', () => {
    const dockerConfig: DockerAppConfig = {
      ...baseConfig,
      production: true,
      environment: 'DOCKER',
      databaseApiUrl: '/api/database',
    };
    expect(isDockerConfig(dockerConfig)).toBe(true);
    expect(requiresDatabaseApi(dockerConfig)).toBe(true);
  });

  it('should detect web configs and require API', () => {
    const webConfig: WebAppConfig = {
      ...baseConfig,
      production: true,
      environment: 'WEB',
      databaseApiUrl: '/api/database',
    };
    expect(isWebConfig(webConfig)).toBe(true);
    expect(requiresDatabaseApi(webConfig)).toBe(true);
  });
});
