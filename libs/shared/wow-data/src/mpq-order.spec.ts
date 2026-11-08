import { parseConfigWtfLocale, pickLocale, rankMpqArchive, sortMpqArchives } from './mpq-order';

describe('mpq-order', () => {
  it('sorts a 3.3.5a client in load order, ignoring archives the client does not load', () => {
    const files = [
      'patch-Z.mpq',
      'ARAC_patch-A.mpq',
      'enUS/patch-enUS-3.MPQ',
      'patch.MPQ',
      'enUS/speech-enUS.MPQ',
      'common.MPQ',
      'enUS/locale-enUS.MPQ',
      'patch-3.MPQ',
      'lichking.MPQ',
      'common-2.MPQ',
      'enUS/patch-enUS.MPQ',
      'expansion.MPQ',
      'patch-2.MPQ',
      'patch-W.mpq',
      'enUS/expansion-locale-enUS.MPQ',
      'enUS/lichking-locale-enUS.MPQ',
      'enUS/patch-enUS-y.mpq',
      'enUS/patch-enUS-2.MPQ',
      'deDE/locale-deDE.MPQ',
      'Interface',
    ];
    expect(sortMpqArchives(files, 'enUS')).toEqual([
      'common.MPQ',
      'common-2.MPQ',
      'expansion.MPQ',
      'lichking.MPQ',
      // (the locale's base archives under the base patches: a custom patch overrides their DBCs, as in the game)
      'enUS/locale-enUS.MPQ',
      'enUS/expansion-locale-enUS.MPQ',
      'enUS/lichking-locale-enUS.MPQ',
      'patch.MPQ',
      'patch-2.MPQ',
      'patch-3.MPQ',
      'patch-W.mpq',
      'patch-Z.mpq',
      'enUS/patch-enUS.MPQ',
      'enUS/patch-enUS-2.MPQ',
      'enUS/patch-enUS-3.MPQ',
      'enUS/patch-enUS-y.mpq',
    ]);
  });

  it('ranks archives', () => {
    expect(rankMpqArchive('patch-1.mpq', 'enUS')).toBeUndefined();
    expect(rankMpqArchive('patch-ab.mpq', 'enUS')).toBeUndefined();
    expect(rankMpqArchive('enUS\\patch-enUS-ab.MPQ', 'enUS')).toBeUndefined();
    expect(rankMpqArchive('enUS/random.MPQ', 'enUS')).toBeUndefined();
    expect(rankMpqArchive('Cache/enUS/patch.MPQ', 'enUS')).toBeUndefined();
    expect(rankMpqArchive('enUS\\patch-enUS-4.MPQ', 'enUS')).toBe(114);
  });

  it('reads the locale from Config.wtf', () => {
    expect(parseConfigWtfLocale('SET realmlist "x"\nSET locale "deDE"\n')).toBe('deDE');
    expect(parseConfigWtfLocale('SET gxApi "d3d9"')).toBeUndefined();
  });

  it('picks the locale folder', () => {
    expect(pickLocale(['deDE', 'enUS'], 'dede')).toBe('deDE');
    expect(pickLocale(['deDE', 'enUS'])).toBe('enUS');
    expect(pickLocale(['deDE', 'enGB'], 'frFR')).toBe('enGB');
    expect(pickLocale(['Interface', 'ruRU'])).toBe('ruRU');
    expect(pickLocale(['Interface'])).toBeUndefined();
  });
});
