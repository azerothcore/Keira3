import { creatureTextSql, parseSniff, waypointDataSql, waypointsSql } from './sniff';
import { SNIFF } from './sniff.mock';

describe('parseSniff', () => {
  it("reads where creatures walked and what they said, once each, not players' things", () => {
    const { paths, texts } = parseSniff(`header line\n${SNIFF}`);

    expect(paths).toEqual([
      {
        entry: 18287,
        low: 4660,
        points: [
          { x: 11, y: 21, z: 31 },
          { x: 12, y: 22, z: 32 },
        ],
      },
      { entry: 300, low: 9, points: [{ x: 5, y: 6, z: 7 }] },
    ]);
    expect(texts).toEqual([
      { entry: 18287, text: "Don't move!", type: 12, language: 0 },
      { entry: 300, text: 'For the Horde!', type: 14, language: 1 },
      { entry: 300, text: 'waves.', type: 16, language: 0 },
    ]);
    expect(parseSniff('')).toEqual({ paths: [], texts: [] });
  });
});

describe('the SQL of a sniff', () => {
  const { paths, texts } = parseSniff(SNIFF);

  it('writes a path as waypoint_data or waypoints', () => {
    expect(waypointDataSql({ ...paths[0], points: [{ x: 1.23456, y: 2, z: 3 }] }, 50)).toBe(
      '-- creature 18287 (sniff low guid 4660): 1 points\n' +
        'SET @PATH := 50;\n' +
        'DELETE FROM `waypoint_data` WHERE `id` = @PATH;\n' +
        'INSERT INTO `waypoint_data` (`id`, `point`, `position_x`, `position_y`, `position_z`, `orientation`, `delay`) VALUES\n' +
        '(@PATH, 1, 1.235, 2, 3, NULL, 0);\n',
    );
    expect(waypointsSql(paths[0], 7)).toContain("(@PATH, 2, 12, 22, 32, NULL, 0, 'creature 18287');");
  });

  it('writes texts as creature_text, a group each from the next free one, with their broadcast text', () => {
    const sql = creatureTextSql([...texts, { ...texts[0], text: 'Other' }], new Map([["Don't move!", 1234]]), new Map([[18287, 3]]));

    expect(sql).toContain("(18287, 3, 0, 'Don\\'t move!', 12, 0, 100, 0, 0, 0, 1234, 0, 'creature 18287')");
    expect(sql).toContain("(18287, 4, 0, 'Other', 12, 0, 100, 0, 0, 0, 0, 0, 'creature 18287')");
    expect(sql).toContain("(300, 0, 0, 'For the Horde!', 14, 1, 100, 0, 0, 0, 0, 0, 'creature 300')");
    expect(creatureTextSql(texts, new Map())).toContain('(18287, 0, 0,');
  });
});
