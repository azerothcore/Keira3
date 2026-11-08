import { NameCache } from './name-cache';

describe('NameCache', () => {
  it('reads each name once, tells when one comes, and sorts by them', async () => {
    const read = vi.fn((id: string | number) =>
      id === 3 ? Promise.reject(new Error('gone')) : Promise.resolve(id === 1 ? 'Zebra' : id === 2 ? 'Apple' : null),
    );
    const changed = vi.fn();
    const cache = new NameCache(read, changed);
    expect(cache.name(1)).toBe('');
    cache.name(2);
    cache.name(3);
    cache.name(4);
    await new Promise((resolve) => setTimeout(resolve));
    expect([cache.name(1), cache.name(2), cache.name(3), cache.name(4)]).toEqual(['Zebra', 'Apple', '', '']);
    expect(read).toHaveBeenCalledTimes(4);
    expect(changed).toHaveBeenCalledTimes(3);
    expect([1, 2].sort(cache.compare)).toEqual([2, 1]);
    // (nothing to tell)
    const quiet = new NameCache(() => Promise.resolve('a'));
    quiet.name(1);
    await new Promise((resolve) => setTimeout(resolve));
    expect(quiet.name(1)).toBe('a');
  });
});
