import { FIND_KINDS, FIND_REFERENCES, findQuery } from './find-anywhere';

describe('findQuery', () => {
  it('puts the id in the reference, limited', () => {
    expect(findQuery({ table: 'creature', where: 'id1 = @ID OR id2 = @ID' }, 12.7)).toBe(
      'SELECT * FROM `creature` WHERE id1 = 12 OR id2 = 12 LIMIT 50',
    );
    expect(findQuery({ table: 't', where: 'a = -@ID' }, 3, 5)).toBe('SELECT * FROM `t` WHERE a = -3 LIMIT 5');
  });

  it('has references for every kind, each using the id', () => {
    for (const kind of FIND_KINDS) {
      expect(FIND_REFERENCES[kind].length).toBeGreaterThan(0);
      FIND_REFERENCES[kind].forEach((reference) => expect(reference.where).toContain('@ID'));
    }
    expect(FIND_REFERENCES.item.find((reference) => reference.table === 'item_template')).toBeUndefined();
    expect(FIND_REFERENCES.spell.find((reference) => reference.table === 'item_template')?.where).toContain('`spellid_5` = @ID');
  });
});
