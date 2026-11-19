import { TableSort } from './table-sort';

describe('TableSort', () => {
  it('sorts up, down, then as it was, numbers as numbers and text naturally', () => {
    const rows = [
      { name: 'a10', n: 2 },
      { name: 'a2', n: 10 },
      { name: 'b', n: 1 },
    ];
    const sort = new TableSort<(typeof rows)[number]>({ name: (row) => row.name, n: (row) => row.n });
    expect(sort.apply(rows)).toBe(rows);
    expect(sort.icon('name')).toBe('fa-sort');
    sort.toggle('name');
    expect(sort.apply(rows).map((row) => row.name)).toEqual(['a2', 'a10', 'b']);
    expect(sort.icon('name')).toBe('fa-sort-up');
    expect(sort.icon('n')).toBe('fa-sort');
    sort.toggle('name');
    expect(sort.apply(rows).map((row) => row.name)).toEqual(['b', 'a10', 'a2']);
    expect(sort.icon('name')).toBe('fa-sort-down');
    sort.toggle('name');
    expect(sort.by()).toBeUndefined();
    sort.toggle('n');
    expect(sort.apply(rows).map((row) => row.n)).toEqual([1, 2, 10]);
  });
});
