import { WorldLink, WorldMarker } from '@keira/shared/world-viewer';
import { AreaTriggerInfo, TaxiNode, TaxiPath, WorldPosition } from '@keira/shared/wow-data';
import { Graveyard, Teleport } from './world-editor.model';

/** What the travel layer shows for a map: graveyards, teleports, flight masters and flight paths. */
export interface TravelData {
  mapId: number;
  graveyards: Graveyard[];
  teleports: Teleport[];
  taxiNodes: TaxiNode[];
  taxiPaths: TaxiPath[];
}

export const EMPTY_TRAVEL: TravelData = { mapId: -1, graveyards: [], teleports: [], taxiNodes: [], taxiPaths: [] };

const GRAVEYARD_COLOR = 0xdfe6e9;
const TELEPORT_COLOR = 0x74b9ff;
const FLIGHT_COLOR = 0xf0c419;
/** Flight paths are drawn when one of their points is this close (yards) to the camera target. */
const FLIGHT_PATH_RANGE = 1500;

/**
 * The travel layer: graveyards and flight masters as markers, flight paths near the camera as lines, and teleporting
 * area triggers as arrows to where they lead (or a marker naming the map, when it's another one).
 */
export function travelOverlays(
  data: TravelData,
  triggers: AreaTriggerInfo[],
  mapNames: Map<number, string>,
  center: WorldPosition | undefined,
): { links: WorldLink[]; markers: WorldMarker[] } {
  const links: WorldLink[] = [];
  const markers: WorldMarker[] = [];
  for (const graveyard of data.graveyards) {
    markers.push({
      key: `graveyard:${graveyard.id}`,
      position: graveyard,
      color: GRAVEYARD_COLOR,
      label: `Graveyard ${graveyard.id}${graveyard.comment ? `: ${graveyard.comment}` : ''}`,
    });
  }
  for (const node of data.taxiNodes) {
    markers.push({ key: `taxi:${node.id}`, position: node, color: FLIGHT_COLOR, label: `Flight master: ${node.name} (node ${node.id})` });
  }
  const near = (p: WorldPosition) => !!center && Math.hypot(p.x - center.x, p.y - center.y) <= FLIGHT_PATH_RANGE;
  for (const path of data.taxiPaths) {
    if (path.points.length > 1 && path.points.some(near)) {
      links.push({
        key: `flight:${path.id}`,
        from: path.points[0],
        to: path.points[path.points.length - 1],
        via: path.points.slice(1, -1),
        color: FLIGHT_COLOR,
        arrow: true,
      });
    }
  }
  for (const teleport of data.teleports) {
    const trigger = triggers.find((t) => t.id === teleport.id);
    if (!trigger) {
      continue;
    }
    const name = teleport.name || `area trigger ${teleport.id}`;
    if (teleport.map === data.mapId) {
      links.push({ key: `teleport:${teleport.id}`, from: trigger, to: teleport, color: TELEPORT_COLOR, arrow: true, dashed: true });
      markers.push({
        key: `teleport-to:${teleport.id}`,
        position: teleport,
        color: TELEPORT_COLOR,
        label: `Teleport destination: ${name}`,
      });
    } else {
      markers.push({
        key: `teleport:${teleport.id}`,
        position: trigger,
        color: TELEPORT_COLOR,
        label: `Teleport: ${name} → ${mapNames.get(teleport.map) ?? `map ${teleport.map}`} (${teleport.x.toFixed(1)}, ${teleport.y.toFixed(1)}, ${teleport.z.toFixed(1)})`,
      });
    }
  }
  return { links, markers };
}
