import { of, throwError } from 'rxjs';
import { Lookup } from './lookup';

describe('Lookup', () => {
  it('reads the rows not read yet, once', () => {
    const query = vi.fn().mockReturnValue(of([{ id: 1, name: 'A' }]));
    const lookup = new Lookup(query, (ids) => `SELECT … IN (${ids})`);
    expect(lookup.get(1)).toBeUndefined();
    lookup.need([1, 2, 2]);
    expect(query).toHaveBeenCalledWith('SELECT … IN (1, 2)');
    expect(lookup.get(1)).toEqual({ id: 1, name: 'A' });
    expect(lookup.get(2)).toBeNull();
    expect(lookup.need([1, 2])).toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when the query fails, or gives nothing', () => {
    const lookup = new Lookup(
      () => throwError(() => new Error('no table')),
      (ids) => ids,
    );
    lookup.need([3]);
    expect(lookup.get(3)).toBeUndefined();
    const empty = new Lookup(
      () => of(undefined as never),
      (ids) => ids,
    );
    empty.need([4]);
    expect(empty.get(4)).toBeNull();
  });
});
