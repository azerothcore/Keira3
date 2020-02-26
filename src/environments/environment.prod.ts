export const AppConfig = {
  production: true,
  environment: 'PROD',
  sqlitePath: `${__dirname}/assets/sqlite.db`.replace('app.asar', 'app.asar.unpacked'),
};
