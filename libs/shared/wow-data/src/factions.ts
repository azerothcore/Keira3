import { DbcFile, PLAYER_RACES } from './dbc';

/** FactionTemplate.dbc: who a creature or gameobject (by its `faction` column) is friendly or hostile to. */
export interface FactionTemplate {
  id: number;
  /** Faction.dbc entry: its name and reputation. */
  faction: number;
  flags: number;
  /** FactionGroup masks (1 player, 2 Alliance, 4 Horde, 8 monster): what it is… */
  ourMask: number;
  /** …what it's friendly to and hostile to. */
  friendMask: number;
  enemyMask: number;
  enemies: number[];
  friends: number[];
}

/** Faction.dbc: a faction's name and, when it has reputation, the reputation each race starts with. */
export interface Faction {
  id: number;
  name: string;
  /** ≥ 0 when players have reputation with it. */
  reputationIndex: number;
  /** Race masks (bit = 1 << (race − 1)) and the reputation they start with. */
  raceMasks: number[];
  baseReputation: number[];
}

export interface FactionData {
  templates: Map<number, FactionTemplate>;
  factions: Map<number, Faction>;
}

/** Reputation ranks, from their lowest standing. */
export const REPUTATION_RANKS: { name: string; from: number }[] = [
  { name: 'Hated', from: -Infinity },
  { name: 'Hostile', from: -6000 },
  { name: 'Unfriendly', from: -3000 },
  { name: 'Neutral', from: 0 },
  { name: 'Friendly', from: 3000 },
  { name: 'Honored', from: 9000 },
  { name: 'Revered', from: 21000 },
  { name: 'Exalted', from: 42000 },
];
const NEUTRAL_RANK = 3;
const HOSTILE_RANK = 1;
const FRIENDLY_RANK = 4;

/** Each playable race's own faction template (ChrRaces.dbc FactionID). */
export const RACE_FACTION_TEMPLATES: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 115, 8: 116, 10: 1610, 11: 1629 };
const ALLIANCE = [1, 3, 4, 7, 11];
const HORDE = [2, 5, 6, 8, 10];
/** FACTION_TEMPLATE_FLAG_HOSTILE_BY_DEFAULT. */
const HOSTILE_BY_DEFAULT = 0x1000;

/** FactionTemplate.dbc (3.3.5a): 0 ID, 1 Faction, 2 Flags, 3 FactionGroup, 4 FriendGroup, 5 EnemyGroup, 6-9 Enemies, 10-13 Friend. */
export function parseFactionTemplates(dbc: DbcFile): Map<number, FactionTemplate> {
  const templates = new Map<number, FactionTemplate>();
  for (let r = 0; r < dbc.recordCount; r++) {
    const list = (from: number) => [0, 1, 2, 3].map((i) => dbc.getUint(r, from + i)).filter((id) => id > 0);
    templates.set(dbc.getUint(r, 0), {
      id: dbc.getUint(r, 0),
      faction: dbc.getUint(r, 1),
      flags: dbc.getUint(r, 2),
      ourMask: dbc.getUint(r, 3),
      friendMask: dbc.getUint(r, 4),
      enemyMask: dbc.getUint(r, 5),
      enemies: list(6),
      friends: list(10),
    });
  }
  return templates;
}

/** Faction.dbc (3.3.5a): 0 ID, 1 ReputationIndex, 2-5 ReputationRaceMask, 10-13 ReputationBase, 23..38 Name_lang. */
export function parseFactions(dbc: DbcFile): Map<number, Faction> {
  const factions = new Map<number, Faction>();
  for (let r = 0; r < dbc.recordCount; r++) {
    let name = '';
    for (let field = 23; field <= 38 && !name; field++) {
      name = dbc.getString(r, field);
    }
    factions.set(dbc.getUint(r, 0), {
      id: dbc.getUint(r, 0),
      name,
      reputationIndex: dbc.getInt(r, 1),
      raceMasks: [2, 3, 4, 5].map((field) => dbc.getUint(r, field)),
      baseReputation: [10, 11, 12, 13].map((field) => dbc.getInt(r, field)),
    });
  }
  return factions;
}

/** The rank of a reputation standing (index into `REPUTATION_RANKS`). */
export function reputationRank(standing: number): number {
  let rank = 0;
  while (rank + 1 < REPUTATION_RANKS.length && standing >= REPUTATION_RANKS[rank + 1].from) {
    rank++;
  }
  return rank;
}

function isFriendlyTo(self: FactionTemplate, other: FactionTemplate): boolean {
  if (self.id === other.id) {
    return true;
  }
  if (self.enemies.includes(other.faction)) {
    return false;
  }
  if (self.friends.includes(other.faction)) {
    return true;
  }
  return (self.friendMask & other.ourMask) !== 0 || (self.ourMask & other.friendMask) !== 0;
}

function isHostileTo(self: FactionTemplate, other: FactionTemplate): boolean {
  if (self.id === other.id) {
    return false;
  }
  if (self.enemies.includes(other.faction)) {
    return true;
  }
  if (self.friends.includes(other.faction)) {
    return false;
  }
  return (self.enemyMask & other.ourMask) !== 0;
}

/** How something of a faction template treats a new character of a race (like Unit::GetFactionReactionTo). */
export interface RaceReaction {
  race: number;
  /** Index into `REPUTATION_RANKS`. */
  rank: number;
  /** The reputation the race starts with, when the faction has reputation. */
  standing?: number;
}

export function raceReactions(templateId: number, data: FactionData): RaceReaction[] | undefined {
  const template = data.templates.get(templateId);
  if (!template) {
    return undefined;
  }
  const faction = data.factions.get(template.faction);
  return PLAYER_RACES.map(({ id: race }) => {
    if (faction && faction.reputationIndex >= 0) {
      const slot = faction.raceMasks.findIndex((mask) => (mask & (1 << (race - 1))) !== 0);
      const standing = slot < 0 ? 0 : faction.baseReputation[slot];
      return { race, rank: reputationRank(standing), standing };
    }
    const player = data.templates.get(RACE_FACTION_TEMPLATES[race]);
    // (a race's own template missing from the client: taken as neutral)
    const rank = !player
      ? NEUTRAL_RANK
      : isHostileTo(template, player)
        ? HOSTILE_RANK
        : isFriendlyTo(template, player) || isFriendlyTo(player, template)
          ? FRIENDLY_RANK
          : template.flags & HOSTILE_BY_DEFAULT
            ? HOSTILE_RANK
            : NEUTRAL_RANK;
    return { race, rank };
  });
}

/**
 * Who can interact with something of a faction template (neutral or better), in a line: "Everyone (Friendly)",
 * "Alliance (Friendly) · Horde: no (Hated)", or the races; with `details`, each race with its rank and standing, and the
 * faction's name. Undefined for an unknown template.
 */
export function describeFaction(templateId: number, data: FactionData): { line: string; details: string[] } | undefined {
  const reactions = raceReactions(templateId, data);
  if (!reactions) {
    return undefined;
  }
  const template = data.templates.get(templateId) as FactionTemplate;
  const name = (rank: number) => REPUTATION_RANKS[rank].name;
  const group = (races: number[]) => {
    const ranks = [...new Set(reactions.filter((r) => races.includes(r.race)).map((r) => r.rank))];
    return ranks.length === 1 ? ranks[0] : undefined;
  };
  const can = (rank: number) => (rank >= NEUTRAL_RANK ? '' : 'no, ');
  const all = group([...ALLIANCE, ...HORDE]);
  const [alliance, horde] = [group(ALLIANCE), group(HORDE)];
  const raceName = (race: number) => PLAYER_RACES.find((r) => r.id === race)?.name as string;
  const line =
    all !== undefined
      ? `Interact: ${all >= NEUTRAL_RANK ? 'everyone' : 'no one'} (${name(all)})`
      : alliance !== undefined && horde !== undefined
        ? `Interact: Alliance ${can(alliance)}(${name(alliance)}) · Horde ${can(horde)}(${name(horde)})`
        : `Interact: ${
            reactions
              .filter((r) => r.rank >= NEUTRAL_RANK)
              .map((r) => raceName(r.race))
              .join(', ') || 'no one'
          }`;
  const faction = data.factions.get(template.faction);
  return {
    line,
    details: [
      `Faction template ${templateId}${faction?.name ? ` (${faction.name})` : ''}`,
      ...reactions.map((r) => `  ${raceName(r.race)}: ${name(r.rank)}${r.standing === undefined ? '' : ` (${r.standing})`}`),
    ],
  };
}
