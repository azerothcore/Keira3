/** WowPacketParser (TrinityCore/WowPacketParser): where Keira gets it, and the config it runs it with. */

export const WPP_REPOSITORY = 'https://github.com/TrinityCore/WowPacketParser.git';
export const WPP_SOLUTION = 'WowPacketParser.slnx';
/** TargetedDatabase 2: Wrath of the Lich King (AzerothCore's 3.3.5). */
export const WPP_TARGET_WOTLK = 2;
/** DumpFormat 1: the text output, plus the SQL. */
export const WPP_DUMP_TEXT_AND_SQL = 1;

/** The MySQL login WPP is given (Keira's own), and the databases it reads. */
export interface WppDatabase {
  host: string;
  port: number;
  user: string;
  password: string;
  /** WPP's own database (names of spells, creatures… in its text output): Keira's sniff database. */
  wppDatabase: string;
  /** The world database it compares with (its SQL then only holds what differs). */
  worldDatabase: string;
}

const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Sets an `<add key="…" value="…"/>` of WPP's App.config (added before </appSettings> when it isn't there). */
export function setConfigValue(config: string, key: string, value: string | number | boolean): string {
  const line = new RegExp(`(<add\\s+key="${key}"\\s+value=")[^"]*(")`);
  const text = escapeXml(String(value));
  return line.test(config)
    ? config.replace(line, `$1${text}$2`)
    : config.replace('</appSettings>', `    <add key="${key}" value="${text}" />\n    </appSettings>`);
}

/** WPP's config for Keira: the text and SQL output for 3.3.5, and Keira's databases when asked. */
export function keiraWppConfig(template: string, database?: WppDatabase): string {
  let config = setConfigValue(template, 'TargetedDatabase', WPP_TARGET_WOTLK);
  config = setConfigValue(config, 'DumpFormat', WPP_DUMP_TEXT_AND_SQL);
  config = setConfigValue(config, 'DBEnabled', !!database);
  if (database) {
    config = setConfigValue(config, 'Server', database.host);
    config = setConfigValue(config, 'Port', database.port);
    config = setConfigValue(config, 'Username', database.user);
    config = setConfigValue(config, 'Password', database.password);
    config = setConfigValue(config, 'WPPDatabase', database.wppDatabase);
    config = setConfigValue(config, 'TDBDatabase', database.worldDatabase);
  }
  return config;
}

/** The files a parse wrote: those next to the sniff, named after it, changed since it started. */
export function parseOutputs(files: { name: string; modified: number }[], pkt: string, since: number): string[] {
  const base = (pkt.split(/[\\/]/).pop() as string).replace(/\.(pkt|bin)$/i, '');
  return files
    .filter((file) => file.modified >= since && file.name.includes(base) && /\.(txt|sql)$/i.test(file.name))
    .map((file) => file.name)
    .sort();
}
