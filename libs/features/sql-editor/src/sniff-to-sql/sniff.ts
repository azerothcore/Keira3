import { escape } from 'sqlstring';

/**
 * WowPacketParser's text output (a parsed sniff) read for what Keira can write: where creatures walked
 * (SMSG_ON_MONSTER_MOVE) and what they said (SMSG_MESSAGECHAT). WaypointCreator's and cmangos-designer's idea.
 */

export interface SniffPoint {
  x: number;
  y: number;
  z: number;
}

/** The places one creature spawn walked to, in order (each move's end point). */
export interface SniffPath {
  entry: number;
  /** The spawn's low guid in the sniff (not the database's guid). */
  low: number;
  points: SniffPoint[];
}

/** Something a creature said: its chat type (ChatMsg) and language, as sent. */
export interface SniffText {
  entry: number;
  text: string;
  type: number;
  language: number;
}

/** ChatMsg values creature_text takes (monster say, yell, whisper, emote, boss emote and whisper). */
const CREATURE_CHAT_TYPES = [12, 14, 15, 16, 41, 42];

const NUMBER = '(-?\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?)';
const POINT = new RegExp(`(Waypoint Endpoint|Waypoint|Points)\\s*:\\s*X:\\s*${NUMBER}\\s+Y:\\s*${NUMBER}\\s+Z:\\s*${NUMBER}`);
const CREATURE = /GUID: .*Type: (?:Creature|Vehicle) Entry: (\d+) Low: (\d+)/;

/** The packets of a sniff: each starts at a "ServerToClient:" / "ClientToServer:" line. */
function packets(text: string): string[][] {
  const out: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^(ServerToClient|ClientToServer):/.test(line) || !out.length) {
      out.push([]);
    }
    out[out.length - 1].push(line);
  }
  return out;
}

export function parseSniff(text: string): { paths: SniffPath[]; texts: SniffText[] } {
  const paths = new Map<string, SniffPath>();
  const texts: SniffText[] = [];
  const seen = new Set<string>();
  for (const lines of packets(text)) {
    const [header] = lines;
    const creature = lines.map((line) => CREATURE.exec(line)).find(Boolean);
    if (!creature) {
      continue;
    }
    const [entry, low] = [Number(creature[1]), Number(creature[2])];
    if (header.includes('SMSG_ON_MONSTER_MOVE') || header.includes('SMSG_MONSTER_MOVE')) {
      const points = lines.map((line) => POINT.exec(line)).filter((match): match is RegExpExecArray => !!match);
      // (the move's end: its endpoint, else its last point)
      const end = points.find((match) => match[1] === 'Waypoint Endpoint') ?? points[points.length - 1];
      if (end) {
        const key = `${entry}:${low}`;
        const path = paths.get(key) ?? { entry, low, points: [] };
        path.points.push({ x: Number(end[2]), y: Number(end[3]), z: Number(end[4]) });
        paths.set(key, path);
      }
    } else if (header.includes('SMSG_MESSAGECHAT') || header.includes('SMSG_CHAT')) {
      const field = (name: RegExp) => lines.map((line) => name.exec(line)).find(Boolean);
      const type = Number(field(/Chat ?[Tt]ype: .*\((\d+)\)/)?.[1] ?? -1);
      const said = field(/^Text: (.*)$/)?.[1]?.trim();
      if (said && CREATURE_CHAT_TYPES.includes(type) && !seen.has(`${entry}:${said}`)) {
        seen.add(`${entry}:${said}`);
        texts.push({ entry, text: said, type, language: Number(field(/Language: .*\((\d+)\)/)?.[1] ?? 0) });
      }
    }
  }
  return { paths: [...paths.values()], texts };
}

const coordinate = (value: number): string => String(Math.round(value * 1000) / 1000);

/** A path as waypoint_data rows (creature_addon.path_id / MovementType 2), its id in @PATH. */
export function waypointDataSql(path: SniffPath, pathId: number): string {
  const rows = path.points.map((p, i) => `(@PATH, ${i + 1}, ${coordinate(p.x)}, ${coordinate(p.y)}, ${coordinate(p.z)}, NULL, 0)`);
  return (
    `-- creature ${path.entry} (sniff low guid ${path.low}): ${path.points.length} points\n` +
    `SET @PATH := ${Math.trunc(pathId)};\n` +
    'DELETE FROM `waypoint_data` WHERE `id` = @PATH;\n' +
    'INSERT INTO `waypoint_data` (`id`, `point`, `position_x`, `position_y`, `position_z`, `orientation`, `delay`) VALUES\n' +
    `${rows.join(',\n')};\n`
  );
}

/** A path as waypoints rows (SmartAI's WP_START), its id in @PATH. */
export function waypointsSql(path: SniffPath, pathId: number): string {
  const rows = path.points.map(
    (p, i) => `(@PATH, ${i + 1}, ${coordinate(p.x)}, ${coordinate(p.y)}, ${coordinate(p.z)}, NULL, 0, ${escape(`creature ${path.entry}`)})`,
  );
  return (
    `-- creature ${path.entry} (sniff low guid ${path.low}): ${path.points.length} points\n` +
    `SET @PATH := ${Math.trunc(pathId)};\n` +
    'DELETE FROM `waypoints` WHERE `entry` = @PATH;\n' +
    'INSERT INTO `waypoints` (`entry`, `pointid`, `position_x`, `position_y`, `position_z`, `orientation`, `delay`, `point_comment`) VALUES\n' +
    `${rows.join(',\n')};\n`
  );
}

/**
 * What creatures said as creature_text rows, a group per text (from the creature's next free group), matched to
 * broadcast_text by their text when found.
 */
export function creatureTextSql(texts: SniffText[], broadcast: Map<string, number>, firstGroup: Map<number, number> = new Map()): string {
  const groups = new Map<number, number>();
  const byEntry = new Map<number, SniffText[]>();
  for (const said of texts) {
    byEntry.set(said.entry, [...(byEntry.get(said.entry) ?? []), said]);
  }
  let sql = '';
  for (const [entry, said] of byEntry) {
    const rows = said.map((line) => {
      const group = groups.get(entry) ?? firstGroup.get(entry) ?? 0;
      groups.set(entry, group + 1);
      const id = broadcast.get(line.text) ?? 0;
      return `(${entry}, ${group}, 0, ${escape(line.text)}, ${line.type}, ${line.language}, 100, 0, 0, 0, ${id}, 0, ${escape(`creature ${entry}`)})`;
    });
    sql +=
      `-- creature ${entry}: ${said.length} texts\n` +
      'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
      `${rows.join(',\n')};\n`;
  }
  return sql;
}
