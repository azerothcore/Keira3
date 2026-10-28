import { DbcFile } from './dbc';
import {
  describeFaction,
  FactionData,
  FactionTemplate,
  parseFactions,
  parseFactionTemplates,
  raceReactions,
  reputationRank,
  REPUTATION_RANKS,
} from './factions';

const template = (
  id: number,
  faction: number,
  ourMask: number,
  friendMask: number,
  enemyMask: number,
  extra: Partial<FactionTemplate> = {},
) => ({
  id,
  faction,
  flags: 0,
  ourMask,
  friendMask,
  enemyMask,
  enemies: [],
  friends: [],
  ...extra,
});
/** The playable races' own templates: Alliance (2) and Horde (4) players. */
const RACES = [
  ...[1, 3, 4, 115, 1629].map((id) => template(id, id, 3, 2, 12)),
  ...[2, 5, 6, 116, 1610].map((id) => template(id, id, 5, 4, 10)),
];
const data = (templates: FactionTemplate[], factions: FactionData['factions'] = new Map()): FactionData => ({
  templates: new Map([...RACES, ...templates].map((t) => [t.id, t])),
  factions,
});

describe('factions', () => {
  it('reads FactionTemplate.dbc and Faction.dbc', () => {
    const values = new Uint32Array(14);
    values.set([11, 72, 2081, 3, 2, 12, 76, 0, 0, 0, 1, 0, 0, 0]);
    const templates = {
      recordCount: 1,
      getUint: (_r: number, field: number) => values[field],
    } as unknown as DbcFile;
    expect(parseFactionTemplates(templates).get(11)).toEqual({
      id: 11,
      faction: 72,
      flags: 2081,
      ourMask: 3,
      friendMask: 2,
      enemyMask: 12,
      enemies: [76],
      friends: [1],
    });
    const faction = [72, 19, 1100, 690, 1, 0, 0, 0, 0, 0, 3100, -42000, 4000, 0];
    const factions = {
      recordCount: 1,
      getUint: (_r: number, field: number) => faction[field] ?? 0,
      getInt: (_r: number, field: number) => faction[field] ?? 0,
      getString: (_r: number, field: number) => (field === 24 ? 'Stormwind' : ''),
    } as unknown as DbcFile;
    expect(parseFactions(factions).get(72)).toEqual({
      id: 72,
      name: 'Stormwind',
      reputationIndex: 19,
      raceMasks: [1100, 690, 1, 0],
      baseReputation: [3100, -42000, 4000, 0],
    });
  });

  it('ranks reputation standings', () => {
    const names = [-42000, -6000, -1, 0, 2999, 3000, 9000, 21000, 42000, 99999].map((s) => REPUTATION_RANKS[reputationRank(s)].name);
    expect(names).toEqual(['Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted', 'Exalted']);
  });

  it("uses a faction's reputation when it has one: each race starts with its own standing", () => {
    const stormwind = {
      id: 72,
      name: 'Stormwind',
      reputationIndex: 19,
      raceMasks: [1100, 690, 1, 0],
      baseReputation: [3100, -42000, 4000, 0],
    };
    const result = describeFaction(11, data([template(11, 72, 3, 2, 12)], new Map([[72, stormwind]])));
    expect(result?.line).toBe('Interact: Alliance (Friendly) · Horde no, (Hated)');
    expect(result?.details).toContain('Faction template 11 (Stormwind)');
    expect(result?.details).toContain('  Human: Friendly (4000)');
    expect(result?.details).toContain('  Orc: Hated (-42000)');
    // a race in none of its masks starts neutral (0)
    const odd = { ...stormwind, raceMasks: [1, 0, 0, 0], baseReputation: [9000, 0, 0, 0] };
    expect(describeFaction(11, data([template(11, 72, 3, 2, 12)], new Map([[72, odd]])))?.line).toBe(
      'Interact: Human, Orc, Dwarf, Night Elf, Undead, Tauren, Gnome, Troll, Blood Elf, Draenei',
    );
  });

  it('otherwise compares the faction groups and the friend and enemy lists, like the server', () => {
    // friendly to players (mask 1)
    expect(describeFaction(35, data([template(35, 31, 0, 1, 0)]))?.line).toBe('Interact: everyone (Friendly)');
    // monsters hostile to players
    expect(describeFaction(14, data([template(14, 14, 8, 0, 1)]))?.line).toBe('Interact: no one (Hostile)');
    // neutral, and hostile by default
    expect(describeFaction(7, data([template(7, 7, 0, 0, 0)]))?.line).toBe('Interact: everyone (Neutral)');
    expect(describeFaction(8, data([template(8, 8, 0, 0, 0, { flags: 0x1000 })]))?.line).toBe('Interact: no one (Hostile)');
    // enemies and friends by faction: hostile to Orcs (faction 2), friendly to Gnomes (115)
    const listed = template(9, 9, 0, 0, 0, { enemies: [2], friends: [115] });
    expect(describeFaction(9, data([listed]))?.line).toBe(
      'Interact: Human, Dwarf, Night Elf, Undead, Tauren, Gnome, Troll, Blood Elf, Draenei',
    );
    // players friendly to it (their own lists)
    const liked = data([template(10, 10, 0, 0, 0)]);
    (liked.templates.get(1) as FactionTemplate).friends.push(10);
    expect(raceReactions(10, liked)?.find((r) => r.race === 1)?.rank).toBe(4);
    // its own template: friendly; an enemy listed by the race: hostile
    const self = data([]);
    expect(raceReactions(1, self)?.find((r) => r.race === 1)?.rank).toBe(4);
    (self.templates.get(2) as FactionTemplate).enemies.push(1);
    expect(raceReactions(2, self)?.find((r) => r.race === 1)?.rank).toBe(1);
    // friends listed win over the groups
    const forgiving = template(12, 12, 0, 0, 12, { friends: [2] });
    expect(raceReactions(12, data([forgiving]))?.find((r) => r.race === 2)?.rank).toBe(4);
  });

  it('is neutral to a race whose own template lists it as an enemy, and names no one when none can interact', () => {
    const disliked = data([template(9, 9, 0, 0, 0)]);
    (disliked.templates.get(1) as FactionTemplate).enemies.push(9);
    expect(raceReactions(9, disliked)?.find((r) => r.race === 1)?.rank).toBe(3);
    // hated by Humans and Orcs, hostile to the others: no side agrees, and no one can interact
    const feared = { id: 50, name: 'Feared', reputationIndex: 1, raceMasks: [3, 4092, 0, 0], baseReputation: [-42000, -5000, 0, 0] };
    expect(describeFaction(50, data([template(50, 50, 0, 0, 0)], new Map([[50, feared]])))?.line).toBe('Interact: no one');
  });

  it('knows nothing of unknown templates, and takes races without a template as neutral', () => {
    expect(describeFaction(999, data([]))).toBeUndefined();
    const lonely: FactionData = { templates: new Map([[14, template(14, 14, 8, 0, 1)]]), factions: new Map() };
    expect(describeFaction(14, lonely)?.line).toBe('Interact: everyone (Neutral)');
  });
});
