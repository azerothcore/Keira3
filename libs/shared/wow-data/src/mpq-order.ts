/**
 * Load order of a WoW 3.3.5a client's MPQ archives, lowest priority first (later archives override earlier ones).
 * Only the names the client itself loads are recognised; anything else (e.g. `ARAC_patch-A.mpq`, speech or backup
 * archives) is ignored, so the editor sees the same files as the game.
 */

const BASE_RANKS: Record<string, number> = {
  'common.mpq': 0,
  'common-2.mpq': 1,
  'expansion.mpq': 2,
  'lichking.mpq': 3,
  'patch.mpq': 10,
};

const LOCALE_PATTERN = /^[a-z]{2}[a-z]{2}$/;

function suffixRank(suffix: string, digitBase: number, letterBase: number): number | undefined {
  if (/^[2-9]$/.test(suffix)) {
    return digitBase + Number(suffix);
  }
  if (/^[a-z]$/.test(suffix)) {
    return letterBase + suffix.charCodeAt(0) - 'a'.charCodeAt(0);
  }
  return undefined;
}

function baseRank(name: string): number | undefined {
  if (name in BASE_RANKS) {
    return BASE_RANKS[name];
  }
  const patch = /^patch-(.)\.mpq$/.exec(name);
  return patch ? suffixRank(patch[1], 10, 20) : undefined;
}

function localeRank(locale: string, name: string): number | undefined {
  // the locale's base archives sit between the base ones and the base patches (so a custom patch-4.MPQ overrides
  // the stock DBCs of locale-enUS.MPQ, as in the game); the locale's patches above everything
  const fixed: Record<string, number> = {
    [`locale-${locale}.mpq`]: 5,
    [`expansion-locale-${locale}.mpq`]: 6,
    [`lichking-locale-${locale}.mpq`]: 7,
    [`patch-${locale}.mpq`]: 110,
  };
  if (name in fixed) {
    return fixed[name];
  }
  const patch = new RegExp(`^patch-${locale}-(.)\\.mpq$`).exec(name);
  return patch ? suffixRank(patch[1], 110, 120) : undefined;
}

/**
 * Priority of an archive given its path relative to the client's `Data` folder (`patch-3.MPQ`, `enUS/locale-enUS.MPQ`),
 * or `undefined` when the client wouldn't load it. Like the game (lowest first): common, common-2, expansion, lichking,
 * the locale's locale / expansion-locale / lichking-locale, patch, patch-2…9, patch-A…Z, then the locale's patches.
 */
export function rankMpqArchive(relativePath: string, locale: string): number | undefined {
  const parts = relativePath.replace(/\\/g, '/').toLowerCase().split('/');
  const wantedLocale = locale.toLowerCase();

  if (parts.length === 1) {
    return baseRank(parts[0]);
  }
  if (parts.length === 2 && LOCALE_PATTERN.test(parts[0]) && parts[0] === wantedLocale) {
    return localeRank(wantedLocale, parts[1]);
  }
  return undefined;
}

/** Recognised archives sorted lowest priority first. */
export function sortMpqArchives(relativePaths: string[], locale: string): string[] {
  return relativePaths
    .map((path) => ({ path, rank: rankMpqArchive(path, locale) }))
    .filter((entry): entry is { path: string; rank: number } => entry.rank !== undefined)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.path);
}

/** Reads `SET locale "xxXX"` from a `WTF/Config.wtf` file. */
export function parseConfigWtfLocale(configWtf: string): string | undefined {
  return /^\s*SET\s+locale\s+"([a-zA-Z]{4})"/im.exec(configWtf)?.[1];
}

/** Chooses the locale folder to use: the configured one if present, otherwise enUS, enGB, or the first one found. */
export function pickLocale(localeFolders: string[], preferred?: string): string | undefined {
  const byLower = new Map(localeFolders.filter((f) => LOCALE_PATTERN.test(f.toLowerCase())).map((f) => [f.toLowerCase(), f]));
  for (const candidate of [preferred, 'enUS', 'enGB']) {
    const found = candidate ? byLower.get(candidate.toLowerCase()) : undefined;
    if (found) {
      return found;
    }
  }
  return byLower.values().next().value;
}
