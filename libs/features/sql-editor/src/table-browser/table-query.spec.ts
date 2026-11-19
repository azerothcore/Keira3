import { tableQuery } from './table-query';

describe('tableQuery', () => {
  const columns = ['entry', 'name'];

  it('selects the whole table, limited', () => {
    expect(tableQuery('creature_template', columns, [], 50)).toBe('SELECT * FROM `creature_template` LIMIT 50');
    expect(tableQuery('a`b', columns, [], 0)).toBe('SELECT * FROM `a``b` LIMIT 100');
    expect(tableQuery('t', columns, [], -5)).toBe('SELECT * FROM `t` LIMIT 1');
  });

  it('joins the conditions on the table columns, escaping the values', () => {
    expect(
      tableQuery(
        't',
        columns,
        [
          { join: 'AND', field: 'entry', operator: '>=', value: ' 10 ' },
          { join: 'OR', field: 'name', operator: 'LIKE', value: "%Anub'%" },
          { join: 'AND', field: 'unknown', operator: '=', value: '1' },
          { join: 'AND', field: 'name', operator: 'IS NOT NULL', value: 'x' },
        ],
        10,
      ),
    ).toBe("SELECT * FROM `t` WHERE `entry` >= 10 OR `name` LIKE '%Anub\\'%' AND `name` IS NOT NULL LIMIT 10");
  });

  it('reads a list for IN', () => {
    expect(tableQuery('t', columns, [{ join: 'AND', field: 'entry', operator: 'IN', value: '1, 2,, x' }], 5)).toBe(
      "SELECT * FROM `t` WHERE `entry` IN (1, 2, 'x') LIMIT 5",
    );
    expect(tableQuery('t', columns, [{ join: 'AND', field: 'entry', operator: 'IN', value: ' , ' }], 5)).toBe(
      'SELECT * FROM `t` WHERE `entry` IN (NULL) LIMIT 5',
    );
  });
});
