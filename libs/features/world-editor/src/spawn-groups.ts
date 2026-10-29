import { WorldLink, WorldMarker, WorldTag } from '@keira/shared/world-viewer';
import { FormationMember, PoolMember, SpawnRecord, spawnKey } from './world-editor.model';

export const FORMATION_COLOR = 0x9b5de5;
/** Pool colours, picked by pool id so a pool keeps its colour. */
const POOL_COLORS = [0x00b894, 0x00cec9, 0x55efc4, 0x81ecec, 0x26de81, 0x20bf6b, 0x0fb9b1, 0x2bcbba];

const nameOf = (spawn: SpawnRecord): string => `${spawn.name || spawn.entry} (${spawn.guid})`;
const positionOf = (spawn: SpawnRecord) => ({ x: spawn.x, y: spawn.y, z: spawn.z });

/** A line from each loaded formation member to its loaded leader. */
export function formationLinks(spawns: SpawnRecord[], formations: FormationMember[]): WorldLink[] {
  const creatures = new Map(spawns.filter((s) => s.type === 'creature').map((s) => [s.guid, s]));
  return formations.flatMap((row) => {
    const [leader, member] = [creatures.get(row.leader), creatures.get(row.member)];
    return leader && member && leader !== member
      ? [
          {
            key: `formation:${row.leader}:${row.member}`,
            from: positionOf(member),
            to: positionOf(leader),
            color: FORMATION_COLOR,
            arrow: true,
            dashed: true,
          },
        ]
      : [];
  });
}

/** GROUP_AI_FLAG_FOLLOW_LEADER: the member walks beside the leader (others stay where they are while it moves). */
export const FOLLOW_LEADER = 0x200;

/** A formation: its leader's guid, and its members (not the leader) in guid order, numbered 1, 2, 3… in that order. */
export interface Formation {
  leader: number;
  members: FormationMember[];
}

/** The formation a creature leads or is in (from `creature_formations`), undefined when in none. */
export function formationOf(guid: number, formations: FormationMember[]): Formation | undefined {
  const leader = formations.find((row) => row.member === guid || row.leader === guid)?.leader;
  if (leader === undefined) {
    return undefined;
  }
  const members = formations.filter((row) => row.leader === leader && row.member !== leader).sort((a, b) => a.member - b.member);
  return { leader, members };
}

/** The spawn keys of a formation: its leader first, then its members. */
export function formationKeys(formation: Formation): string[] {
  return [formation.leader, ...formation.members.map((row) => row.member)].map((guid) => spawnKey('creature', guid));
}

/** "Leader" over the leader and 1, 2, 3… over the members of a formation, over the ones loaded. */
export function formationTags(formation: Formation, spawns: SpawnRecord[]): WorldTag[] {
  const creatures = new Map(spawns.filter((s) => s.type === 'creature').map((s) => [s.guid, s]));
  return [
    { guid: formation.leader, text: 'Leader' },
    ...formation.members.map((row, i) => ({ guid: row.member, text: String(i + 1) })),
  ].flatMap(({ guid, text }) => {
    const spawn = creatures.get(guid);
    return spawn ? [{ key: spawnKey('creature', guid), position: positionOf(spawn), text }] : [];
  });
}

/**
 * Where the members of the selected creature's formation walk while the leader moves: `dist` yards away, `angle`
 * degrees from the leader's facing (as the server places them, with the facing standing in for the way it walks).
 */
export function formationSlots(spawns: SpawnRecord[], formations: FormationMember[], selected: SpawnRecord | undefined): WorldMarker[] {
  if (selected?.type !== 'creature') {
    return [];
  }
  const leaderGuid = formations.find((row) => row.member === selected.guid || row.leader === selected.guid)?.leader;
  const leader = spawns.find((s) => s.type === 'creature' && s.guid === leaderGuid);
  if (!leader) {
    return [];
  }
  return formations
    .filter((row) => row.leader === leader.guid && row.member !== leader.guid && row.dist > 0)
    .map((row) => {
      const member = spawns.find((s) => s.type === 'creature' && s.guid === row.member);
      const angle = leader.o + (row.angle * Math.PI) / 180;
      return {
        key: `formation-slot:${row.member}`,
        position: { x: leader.x + Math.cos(angle) * row.dist, y: leader.y + Math.sin(angle) * row.dist, z: leader.z },
        color: FORMATION_COLOR,
        label: `Formation place of ${member ? nameOf(member) : row.member}: ${row.dist} yd, ${row.angle}° from ${nameOf(leader)}'s facing`,
      };
    });
}

/** Pools with loaded spawns: a label above the middle of their spawns, linked to each of them. */
export function poolOverlays(spawns: SpawnRecord[], pools: PoolMember[]): { links: WorldLink[]; markers: WorldMarker[] } {
  const byPool = new Map<number, { rows: PoolMember[]; spawns: SpawnRecord[] }>();
  for (const row of pools) {
    const spawn = spawns.find((s) => s.type === row.type && s.guid === row.guid);
    if (spawn) {
      const group = byPool.get(row.pool) ?? { rows: [], spawns: [] };
      group.rows.push(row);
      group.spawns.push(spawn);
      byPool.set(row.pool, group);
    }
  }
  const links: WorldLink[] = [];
  const markers: WorldMarker[] = [];
  for (const [pool, group] of byPool) {
    const color = POOL_COLORS[pool % POOL_COLORS.length];
    const count = group.spawns.length;
    const center = {
      x: group.spawns.reduce((sum, s) => sum + s.x, 0) / count,
      y: group.spawns.reduce((sum, s) => sum + s.y, 0) / count,
      z: Math.max(...group.spawns.map((s) => s.z)) + 3,
    };
    const { maxLimit, description } = group.rows[0];
    const limit = maxLimit > 0 ? `${maxLimit} of ${count} up at once` : `all ${count} up`;
    markers.push({
      key: `pool:${pool}`,
      position: center,
      color,
      label: `Pool ${pool}${description ? `: ${description}` : ''} - ${limit} (loaded spawns)`,
    });
    for (const spawn of group.spawns) {
      links.push({ key: `pool:${pool}:${spawnKey(spawn.type, spawn.guid)}`, from: center, to: positionOf(spawn), color, dashed: true });
    }
  }
  return { links, markers };
}

/** Hover lines about the formation and the pool of a spawn. */
export function groupDetails(spawn: SpawnRecord, formations: FormationMember[], pools: PoolMember[]): string[] {
  const lines: string[] = [];
  if (spawn.type === 'creature') {
    const led = formations.filter((row) => row.leader === spawn.guid && row.member !== spawn.guid).length;
    const follows = formations.find((row) => row.member === spawn.guid && row.leader !== spawn.guid);
    if (led) {
      lines.push(`Formation leader (${led} members)`);
    } else if (follows) {
      lines.push(`In the formation of ${follows.leader}: ${follows.dist} yd, ${follows.angle}°`);
    }
  }
  const pool = pools.find((row) => row.type === spawn.type && row.guid === spawn.guid);
  if (pool) {
    lines.push(`Pool ${pool.pool}${pool.description ? ` (${pool.description})` : ''}${pool.chance ? `, chance ${pool.chance}%` : ''}`);
  }
  return lines;
}
