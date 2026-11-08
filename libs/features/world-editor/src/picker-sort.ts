/** What the map picker can sort by. */
export type MapSortKey = 'id' | 'name' | 'expansion' | 'type';
/** What the zone picker can sort by. */
export type ZoneSortKey = 'id' | 'name';

/** One sort key: the first rule sorts, the next ones break its ties. */
export interface SortRule<K extends string> {
  key: K;
  desc: boolean;
}

export interface PickerSort {
  maps: SortRule<MapSortKey>[];
  zones: SortRule<ZoneSortKey>[];
}

export const MAP_SORT_KEYS: MapSortKey[] = ['id', 'name', 'expansion', 'type'];
export const ZONE_SORT_KEYS: ZoneSortKey[] = ['id', 'name'];

/** By id, smallest first (top to bottom). */
export const DEFAULT_PICKER_SORT: PickerSort = { maps: [{ key: 'id', desc: false }], zones: [{ key: 'id', desc: false }] };

export const PICKER_SORT_KEY = 'keira3.worldEditor.pickerSort';

/**
 * Clicking a key: not sorting by it yet → also by it, ascending (after the keys already used); ascending → descending;
 * descending → not by it any more (but always by something: the last key left turns back to ascending).
 */
export function toggleSort<K extends string>(rules: SortRule<K>[], key: K): SortRule<K>[] {
  const rule = rules.find((r) => r.key === key);
  if (!rule) {
    return [...rules, { key, desc: false }];
  }
  if (!rule.desc) {
    return rules.map((r) => (r === rule ? { key, desc: true } : r));
  }
  const rest = rules.filter((r) => r !== rule);
  return rest.length ? rest : [{ key, desc: false }];
}

/** The items sorted by the rules, each key's value given by `value` (numbers or text). */
export function sortItems<T, K extends string>(items: T[], rules: SortRule<K>[], value: (item: T, key: K) => number | string): T[] {
  return [...items].sort((a, b) => {
    for (const rule of rules) {
      const [x, y] = [value(a, rule.key), value(b, rule.key)];
      const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      if (order) {
        return rule.desc ? -order : order;
      }
    }
    return 0;
  });
}

function validRules<K extends string>(rules: unknown, keys: K[], fallback: SortRule<K>[]): SortRule<K>[] {
  if (!Array.isArray(rules)) {
    return fallback;
  }
  const valid = rules.filter(
    (rule: Partial<SortRule<K>>, at) =>
      keys.includes(rule?.key as K) &&
      typeof rule.desc === 'boolean' &&
      rules.findIndex((other: Partial<SortRule<K>>) => other?.key === rule.key) === at,
  ) as SortRule<K>[];
  return valid.length ? valid.map(({ key, desc }) => ({ key, desc })) : fallback;
}

/** The sort the pickers start with (the preference saved in the settings). */
export function loadPickerSort(): PickerSort {
  try {
    const stored = JSON.parse(localStorage.getItem(PICKER_SORT_KEY) ?? '{}') as Partial<Record<keyof PickerSort, unknown>>;
    return {
      maps: validRules(stored.maps, MAP_SORT_KEYS, DEFAULT_PICKER_SORT.maps),
      zones: validRules(stored.zones, ZONE_SORT_KEYS, DEFAULT_PICKER_SORT.zones),
    };
  } catch {
    return DEFAULT_PICKER_SORT;
  }
}

export function savePickerSort(sort: PickerSort): void {
  localStorage.setItem(PICKER_SORT_KEY, JSON.stringify(sort));
}
