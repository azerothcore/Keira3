import { TaxiPathNode } from '@keira/shared/wow-data';
import {
  describeTransport,
  legTime,
  roundTrip,
  routeArrows,
  routeLabel,
  routeLines,
  routeNearest,
  RoutePoint,
  routeStops,
  simplifyLine,
} from './game-map-routes';

const node = (x: number, y: number, extra: Partial<TaxiPathNode> = {}): TaxiPathNode => ({
  mapId: 0,
  x,
  y,
  z: 0,
  flags: 0,
  delay: 0,
  ...extra,
});

describe('game map routes', () => {
  // a boat waiting 60 s at A (0, 0) and 30 s at B (300, 0), going back through (300, 400) and a teleport
  const path = [
    node(0, 0, { delay: 60 }),
    node(100, 0),
    node(300, 0, { delay: 30 }),
    node(300, 400, { flags: 1 }),
    node(0, 400, { mapId: 1 }),
  ];

  it('finds the stops, with the distance to the next one, and how long it all takes', () => {
    const stops = routeStops(path);
    expect(stops).toEqual([
      { mapId: 0, x: 0, y: 0, wait: 60, leg: 300 },
      // (the teleport and the other map add nothing)
      { mapId: 0, x: 300, y: 0, wait: 30, leg: 400 },
    ]);
    expect(routeStops([node(0, 0, { delay: 5 })])).toEqual([]);
    // speeding up and braking: a long leg at full speed, a short one never reaching it
    expect(legTime(3000, 30, 1)).toBeCloseTo(130);
    expect(legTime(400, 30, 1)).toBeCloseTo(40);
    expect(legTime(400)).toBeCloseTo(40);
    expect(legTime(100, 0, 0)).toBeCloseTo(20);
    expect(roundTrip(stops, 30, 1)).toBeCloseTo(60 + legTime(300) + 30 + legTime(400));
  });

  it('splits a path into lines on a picture, with its stops', () => {
    // the picture shows x < 350 of map 0, one percent a yard
    const place = (n: TaxiPathNode): RoutePoint | undefined => (n.mapId === 0 && n.x < 350 ? [n.x / 10, n.y / 10] : undefined);
    const { lines, stops } = routeLines(path, place, 0.5);
    // (straight on: the corner in the middle dropped; the loop back to the start after the other map is a new line)
    expect(lines).toEqual([
      [
        [0, 0],
        [30, 0],
        [30, 40],
      ],
    ]);
    expect(stops.map(({ at, wait }) => [at, wait])).toEqual([
      [[0, 0], 60],
      [[30, 0], 30],
    ]);
    // off the picture between two parts: two lines (single points dropped)
    const two = routeLines([node(0, 0), node(10, 0), node(500, 0), node(20, 0), node(30, 0)], place, 0.5);
    expect(two.lines).toHaveLength(2);
    expect(routeLines([node(0, 0), node(500, 0)], place, 0.5).lines).toEqual([]);
  });

  it('simplifies lines, keeping the bends', () => {
    expect(simplifyLine([[0, 0]], 1)).toEqual([[0, 0]]);
    expect(
      simplifyLine(
        [
          [0, 0],
          [5, 0.1],
          [10, 0],
          [10, 10],
        ],
        0.5,
      ),
    ).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
    ]);
    // a line back to where it started
    expect(
      simplifyLine(
        [
          [0, 0],
          [5, 5],
          [0, 0],
        ],
        0.5,
      ),
    ).toHaveLength(3);
  });

  it('places arrows the way a line goes, its number in the middle, and finds the line near a point', () => {
    const line: RoutePoint[] = [
      [0, 50],
      [100, 50],
    ];
    const arrows = routeArrows(line, 1000, 500, 200);
    expect(arrows.map((a) => Math.round(a.u))).toEqual([10, 30, 50, 70, 90]);
    expect(arrows[0].angle).toBe(0);
    expect(
      routeArrows(
        [
          [0, 0],
          [0, 0],
          [0, 10],
        ],
        100,
        100,
        4,
      )[0],
    ).toEqual({ u: 0, v: 2, angle: 90 });
    expect(routeLabel([line], 1000, 500)).toEqual({ u: 50, v: 50, angle: 0 });
    // going left: turned so it isn't upside down; going up and right
    expect(
      routeLabel(
        [
          [
            [100, 50],
            [0, 50],
          ],
        ],
        1000,
        500,
      )?.angle,
    ).toBe(0);
    expect(
      routeLabel(
        [
          [
            [0, 50],
            [10, 50],
            [10, 0],
          ],
        ],
        100,
        100,
      )?.angle,
    ).toBe(-90);
    expect(
      routeLabel(
        [
          [
            [10, 0],
            [0, 50],
          ],
        ],
        100,
        100,
      )?.angle,
    ).toBeCloseTo(-78.69, 1);
    expect(
      routeLabel(
        [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        100,
        100,
      ),
    ).toBeUndefined();
    expect(
      routeLabel(
        [
          [
            [10, 10],
            [0, 0],
          ],
        ],
        100,
        100,
      )?.angle,
    ).toBeCloseTo(45);
    const near = routeNearest(
      [
        line,
        [
          [50, 0],
          [50, 0],
        ],
      ],
      [30, 60],
      1000,
      500,
    );
    expect(near).toEqual({ u: 30, v: 50, angle: 0, distance: 50 });
    expect(routeNearest([], [0, 0], 10, 10)).toBeUndefined();
  });

  it('reads where a transport goes, its ship and side from its description', () => {
    expect(describeTransport('Orgrimmar and Grom\'gol Base Camp (Zeppelin, Horde ("The Purple Princess"))')).toEqual({
      route: "Orgrimmar ↔ Grom'gol Base Camp",
      ship: 'The Purple Princess',
      side: 'horde',
    });
    expect(describeTransport('Boat, Alliance ("The Bravery")')).toEqual({ route: undefined, ship: 'The Bravery', side: 'alliance' });
    expect(describeTransport('Deeprun Tram')).toEqual({ route: undefined, ship: 'Deeprun Tram', side: undefined });
  });
});
