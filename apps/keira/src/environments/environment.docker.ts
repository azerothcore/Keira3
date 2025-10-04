import { KeiraAppConfig } from '@keira/shared/config';

export const KEIRA_APP_CONFIG: KeiraAppConfig = {
  production: true,
  environment: 'DOCKER',
  sqlitePath: 'assets/sqlite.db',
  sqliteItem3dPath: 'assets/item_display.db',
  databaseApiUrl: '/api/database',
};
