import { KeiraAppConfig } from '@keira/shared/config';

export const KEIRA_APP_CONFIG: KeiraAppConfig = {
  production: false,
  environment: 'LOCAL',
  sqlitePath: 'apps/keira/src/assets/sqlite.db',
  sqliteItem3dPath: 'src/assets/item_display.db',
};
