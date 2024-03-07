import { KeiraAppConfig } from './app.config';

export const KEIRA_MOCK_CONFIG: KeiraAppConfig = {
  production: false,
  environment: 'LOCAL',
  sqlitePath: 'src/assets/sqlite.db',
  sqliteItem3dPath: 'src/assets/item_display.db',
};
