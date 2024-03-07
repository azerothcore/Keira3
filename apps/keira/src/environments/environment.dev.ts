// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { KeiraAppConfig } from '@keira/shared/config';

export const KEIRA_APP_CONFIG: KeiraAppConfig = {
  production: false,
  environment: 'DEV',
  sqlitePath: 'src/assets/sqlite.db',
  sqliteItem3dPath: 'src/assets/item_display.db',
};
