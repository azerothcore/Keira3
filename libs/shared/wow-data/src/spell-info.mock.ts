/** Spell.dbc rows for the specs. */
export const float = (value: number): number => {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getUint32(0, true);
};

/** A Spell.dbc row: 234 fields, the ones given set. */
export const spellRow = (fields: Record<number, number | string>): (number | string)[] => {
  const row: (number | string)[] = new Array(234).fill(0);
  for (const [field, value] of Object.entries(fields)) {
    row[Number(field)] = value;
  }
  return row;
};

export const fireball = spellRow({
  0: 133,
  28: 3,
  29: 0,
  40: 5,
  41: 0,
  42: 30,
  46: 4,
  47: float(24),
  71: 2,
  74: 7,
  80: 13,
  86: 6,
  72: 6,
  96: 3,
  99: 2000,
  81: 1,
  87: 6,
  93: 8,
  136: '',
  137: 'Fireball',
  153: 'Rank 1',
  225: 4,
});
