import { characterAttachments, characterGeosets, ItemDisplay, parseItemDbc, weaponAttachment } from './character';
import { DbcFile } from './dbc';
import { buildDbc } from './dbc.mock';

const item = (overrides: Partial<ItemDisplay> = {}): ItemDisplay => ({
  models: ['', ''],
  textures: ['', ''],
  geosetGroups: [0, 0, 0],
  helmetVis: [0, 0],
  ...overrides,
});

describe('character', () => {
  it('picks the geosets of the clothes worn', () => {
    const geosets = characterGeosets({
      race: 2,
      sex: 1,
      hair: 0,
      items: {
        gloves: item({ geosetGroups: [2, 0, 0] }),
        shirt: item({ geosetGroups: [1, 1, 0] }),
        chest: item({ geosetGroups: [0, 0, 1] }),
        legs: item({ geosetGroups: [3, 0, 0] }),
        tabard: item(),
        cape: item({ geosetGroups: [4, 0, 0] }),
        belt: item({ geosetGroups: [1, 0, 0] }),
        // a female's helmet row; no rows known: hides nothing
        head: item({ helmetVis: [0, 9] }),
      },
      helmetVis: new Map(),
    });
    // bald (hair geoset 0): the scalp only
    expect(geosets).toEqual([0, 1, 101, 201, 301, 403, 501, 702, 802, 904, 1002, 1101, 1202, 1302, 1505, 1802]);
  });

  it('wears a helmet for its race and sex, and nothing for a race without models', () => {
    const head = item({ models: ['Helm_Cloth.mdx', ''], textures: ['', ''] });
    expect(characterAttachments({ race: 10, sex: 1, hair: 1, items: { head } })).toEqual([
      { point: 11, model: 'Item\\ObjectComponents\\Head\\Helm_Cloth_BeF.m2', texture: undefined },
    ]);
    expect(characterAttachments({ race: 99, sex: 0, hair: 1, items: { head } })).toEqual([]);
    expect(characterAttachments({ race: 1, sex: 0, hair: 1 })).toEqual([]);
  });

  it('holds weapons and shields in their hand', () => {
    const sword = item({ models: ['Sword_1H.mdx', ''], textures: ['Sword_1H.blp', ''] });
    expect(weaponAttachment(sword, 'right')).toEqual({
      point: 1,
      model: 'Item\\ObjectComponents\\Weapon\\Sword_1H.m2',
      texture: 'Item\\ObjectComponents\\Weapon\\Sword_1H.blp',
    });
    expect(weaponAttachment(sword, 'left')?.point).toBe(2);
    expect(weaponAttachment(item({ models: ['Shield_A.mdx', ''] }), 'left', true)).toEqual({
      point: 0,
      model: 'Item\\ObjectComponents\\Shield\\Shield_A.m2',
      texture: undefined,
    });
    expect(weaponAttachment(item(), 'right')).toBeUndefined();
  });

  it('reads the look of each item', () => {
    const dbc = new DbcFile(buildDbc([[25, 2, 7, 0, 0, 1234, 13, 3]], 8));
    expect([...parseItemDbc(dbc)]).toEqual([[25, { displayId: 1234, inventoryType: 13 }]]);
  });
});
