export const LOCALES = [
  'enUS',
  'enGB',
  'koKR',
  'frFR',
  'deDE',
  'enCN',
  'zhCN',
  'enTW',
  'zhTW',
  'esES',
  'esMX',
  'ruRU',
  'ptPT',
  'ptBR',
  'itIT',
  'Unk',
] as const;

export type Locale = (typeof LOCALES)[number];

export const SPELL_DBC_TEXT_FIELDS = ['Name_Lang', 'NameSubtext_Lang', 'Description_Lang', 'AuraDescription_Lang'] as const;

export type SpellDbcTextFieldPrefix = (typeof SPELL_DBC_TEXT_FIELDS)[number];
