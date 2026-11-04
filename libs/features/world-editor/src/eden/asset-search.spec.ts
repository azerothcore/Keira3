import { assetSearch } from './asset-search';

describe('assetSearch', () => {
  it('searches an entry, a part of the name, wildcards or a regular expression', () => {
    expect(assetSearch('  ')).toBeUndefined();
    expect(assetSearch('12', 'ct.')).toEqual({ sql: '(ct.entry = ? OR ct.name LIKE ?)', params: ['12', '%12%'] });
    expect(assetSearch(' kob ')).toEqual({ sql: '(entry = ? OR name LIKE ?)', params: ['-1', '%kob%'] });
    expect(assetSearch('100%_off')?.params[1]).toBe('%100\\%\\_off%');
    expect(assetSearch('*Guard?')).toEqual({ sql: 'name LIKE ?', params: ['%Guard_'] });
    expect(assetSearch('/^Kob(old)?$')).toEqual({ sql: 'name REGEXP ?', params: ['^Kob(old)?$'] });
    // a lone slash is a name part
    expect(assetSearch('/')?.sql).toBe('(entry = ? OR name LIKE ?)');
  });
});
