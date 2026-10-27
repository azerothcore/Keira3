/** How an item of the legend is drawn (see the legend panel's SVG shapes). */
export type LegendShape =
  'pin' | 'cube' | 'cone' | 'square' | 'pentagon' | 'triangle' | 'diamond' | 'ring' | 'line' | 'dashed' | 'beam' | 'check' | 'tile';

export interface LegendSection {
  title: string;
  items: { shape: LegendShape; color: string; label: string }[];
}

/** What every shape and colour of the 3D view and the world map means (the colours of the drawing code). */
export const LEGEND: LegendSection[] = [
  {
    title: 'WORLD_EDITOR.LEGEND_SPAWNS',
    items: [
      { shape: 'pin', color: '#ff9f1c', label: 'WORLD_EDITOR.LEGEND_CREATURE' },
      { shape: 'cube', color: '#2ec4f1', label: 'WORLD_EDITOR.LEGEND_GAMEOBJECT' },
      { shape: 'pin', color: '#fff35c', label: 'WORLD_EDITOR.LEGEND_SELECTED' },
      { shape: 'line', color: '#ff9f1c', label: 'WORLD_EDITOR.LEGEND_FACING' },
      { shape: 'ring', color: '#ffd166', label: 'WORLD_EDITOR.LEGEND_WANDER' },
      { shape: 'ring', color: '#4ade80', label: 'WORLD_EDITOR.LEGEND_BOUNDING' },
      { shape: 'ring', color: '#f87171', label: 'WORLD_EDITOR.LEGEND_REACH' },
      { shape: 'tile', color: '#c77dff', label: 'WORLD_EDITOR.LEGEND_AREA_TRIGGER' },
    ],
  },
  {
    title: 'WORLD_EDITOR.LEGEND_WAYPOINTS',
    items: [
      { shape: 'cone', color: '#e63946', label: 'WORLD_EDITOR.LEGEND_WP_GROUND' },
      { shape: 'square', color: '#e63946', label: 'WORLD_EDITOR.LEGEND_WP_AIR' },
      { shape: 'pentagon', color: '#e63946', label: 'WORLD_EDITOR.LEGEND_WP_WATER' },
      { shape: 'line', color: '#e63946', label: 'WORLD_EDITOR.LEGEND_WP_ARROW' },
      { shape: 'check', color: '#2ecc71', label: 'WORLD_EDITOR.LEGEND_CHECK_OK' },
      { shape: 'check', color: '#f1c40f', label: 'WORLD_EDITOR.LEGEND_CHECK_WARN' },
      { shape: 'check', color: '#e74c3c', label: 'WORLD_EDITOR.LEGEND_CHECK_BAD' },
    ],
  },
  {
    title: 'WORLD_EDITOR.LEGEND_GROUPS',
    items: [
      { shape: 'dashed', color: '#9b5de5', label: 'WORLD_EDITOR.LEGEND_FORMATION' },
      { shape: 'diamond', color: '#9b5de5', label: 'WORLD_EDITOR.LEGEND_FORMATION_SLOT' },
      { shape: 'diamond', color: '#00b894', label: 'WORLD_EDITOR.LEGEND_POOL' },
      { shape: 'triangle', color: '#f0c419', label: 'WORLD_EDITOR.LEGEND_FLIGHT_PATH' },
      { shape: 'diamond', color: '#f0c419', label: 'WORLD_EDITOR.LEGEND_FLIGHT_MASTER' },
      { shape: 'diamond', color: '#dfe6e9', label: 'WORLD_EDITOR.LEGEND_GRAVEYARD' },
      { shape: 'dashed', color: '#74b9ff', label: 'WORLD_EDITOR.LEGEND_TELEPORT' },
      { shape: 'tile', color: '#ff9ff3', label: 'WORLD_EDITOR.LEGEND_BOUNDARY' },
      { shape: 'dashed', color: '#ff4757', label: 'WORLD_EDITOR.LEGEND_BOUNDARY_OUT' },
    ],
  },
  {
    title: 'WORLD_EDITOR.LEGEND_TOOLS',
    items: [
      { shape: 'beam', color: '#fff35c', label: 'WORLD_EDITOR.LEGEND_MARKER' },
      { shape: 'pin', color: '#3b82f6', label: 'WORLD_EDITOR.LEGEND_PROBE_START' },
      { shape: 'pin', color: '#ef4444', label: 'WORLD_EDITOR.LEGEND_PROBE_END' },
      { shape: 'line', color: '#22d3ee', label: 'WORLD_EDITOR.LEGEND_PROBE_PATH' },
      { shape: 'line', color: '#4ade80', label: 'WORLD_EDITOR.LEGEND_PROBE_SIGHT' },
      { shape: 'line', color: '#ef4444', label: 'WORLD_EDITOR.LEGEND_PROBE_BLOCKED' },
      { shape: 'pin', color: '#facc15', label: 'WORLD_EDITOR.LEGEND_PROBE_ATTACK' },
    ],
  },
  {
    title: 'WORLD_EDITOR.LEGEND_MAP',
    items: [
      { shape: 'tile', color: '#a33a46', label: 'WORLD_EDITOR.LEGEND_MAP_MISSING' },
      { shape: 'ring', color: '#ffffff', label: 'WORLD_EDITOR.LEGEND_MAP_CAMERA' },
      { shape: 'ring', color: '#ff4d6d', label: 'WORLD_EDITOR.LEGEND_MAP_SEARCH' },
    ],
  },
];
