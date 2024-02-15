export const AppConfig = {
  production: true,
  environment: 'PROD',
  sqlitePath: `${__dirname}/assets/sqlite.db`.replace('app.asar', 'app.asar.unpacked'),
  sqliteItem3dPath: `${__dirname}/assets/item_display.db`.replace('app.asar', 'app.asar.unpacked'),
};
