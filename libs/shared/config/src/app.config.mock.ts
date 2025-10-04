import { KeiraAppConfig } from './app.config';

export const KEIRA_MOCK_CONFIG: KeiraAppConfig = {
  production: false,
  environment: 'DOCKER',
  sqlitePath: 'apps/keira/src/assets/sqlite.db',
  sqliteItem3dPath: 'apps/keira/src/assets/item_display.db',
};
