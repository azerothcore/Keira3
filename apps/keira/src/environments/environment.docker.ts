import { KeiraAppConfig } from '@keira/shared/config';

export const KEIRA_APP_CONFIG: KeiraAppConfig = {
  production: true,
  environment: 'DOCKER',
  sqlitePath: 'assets/sqlite.db',
  databaseApiUrl: '/api/database',
};
