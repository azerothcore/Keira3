import { MD5_TRANSLATE_PATH, minimapKey, parseMd5Translate } from './minimap';

describe('minimap', () => {
  it('parses md5translate.trs, skipping dir lines and malformed lines', () => {
    const entries = parseMd5Translate('dir: Azeroth\r\nAzeroth\\map32_48.blp\tb53f.blp\r\nWMO/Dungeon/foo.blp\tabcd.blp\n\nbroken line\n');
    expect(entries.size).toBe(2);
    expect(entries.get('azeroth\\map32_48.blp')).toBe('b53f.blp');
    expect(entries.get('wmo\\dungeon\\foo.blp')).toBe('abcd.blp');
  });

  it('builds lookup keys', () => {
    expect(minimapKey('Azeroth', { tx: 32, ty: 48 })).toBe('azeroth\\map32_48.blp');
    // two digits, like the client lists them (Isle of Quel'Danas is at the top edge of Outland's map)
    expect(minimapKey('Expansion01', { tx: 44, ty: 8 })).toBe('expansion01\\map44_08.blp');
    expect(MD5_TRANSLATE_PATH).toBe('textures\\Minimap\\md5translate.trs');
  });
});
