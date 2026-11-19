import {
  DEFAULT_PICKER_SORT,
  loadPickerSort,
  PICKER_SORT_KEY,
  PickerSort,
  savePickerSort,
  SortRule,
  sortItems,
  toggleSort,
} from './picker-sort';

describe('picker sort', () => {
  beforeEach(() => localStorage.clear());

  it('adds a key ascending, turns it descending, then drops it, always sorting by something', () => {
    let rules: SortRule<'id' | 'name'>[] = [{ key: 'id', desc: false }];
    rules = toggleSort(rules, 'name');
    expect(rules).toEqual([
      { key: 'id', desc: false },
      { key: 'name', desc: false },
    ]);
    rules = toggleSort(rules, 'name');
    expect(rules[1]).toEqual({ key: 'name', desc: true });
    rules = toggleSort(rules, 'name');
    expect(rules).toEqual([{ key: 'id', desc: false }]);
    rules = toggleSort(toggleSort(rules, 'id'), 'id');
    expect(rules).toEqual([{ key: 'id', desc: false }]);
  });

  it('sorts by each rule in turn, numbers as numbers and text as text', () => {
    const items = [
      { id: 10, name: 'b' },
      { id: 2, name: 'a' },
      { id: 1, name: 'b' },
    ];
    const value = (item: (typeof items)[number], key: 'id' | 'name') => item[key];
    expect(sortItems(items, [{ key: 'id', desc: false }], value).map((i) => i.id)).toEqual([1, 2, 10]);
    expect(
      sortItems(
        items,
        [
          { key: 'name', desc: true },
          { key: 'id', desc: false },
        ],
        value,
      ).map((i) => i.id),
    ).toEqual([1, 10, 2]);
    // all equal: kept as they were
    expect(sortItems(items, [], value)).toEqual(items);
  });

  it('saves and loads the preference, ignoring what is not valid', () => {
    expect(loadPickerSort()).toEqual(DEFAULT_PICKER_SORT);
    const sort: PickerSort = {
      maps: [
        { key: 'expansion', desc: true },
        { key: 'name', desc: false },
      ],
      zones: [{ key: 'name', desc: false }],
    };
    savePickerSort(sort);
    expect(loadPickerSort()).toEqual(sort);
    localStorage.setItem(
      PICKER_SORT_KEY,
      JSON.stringify({
        maps: [{ key: 'type', desc: false, x: 1 }, { key: 'type', desc: true }, { key: 'size', desc: false }, null],
        zones: [],
      }),
    );
    expect(loadPickerSort()).toEqual({ maps: [{ key: 'type', desc: false }], zones: DEFAULT_PICKER_SORT.zones });
    localStorage.setItem(PICKER_SORT_KEY, JSON.stringify({ maps: 'id', zones: [{ key: 'id', desc: 'yes' }] }));
    expect(loadPickerSort()).toEqual(DEFAULT_PICKER_SORT);
    localStorage.setItem(PICKER_SORT_KEY, '{');
    expect(loadPickerSort()).toEqual(DEFAULT_PICKER_SORT);
  });
});
