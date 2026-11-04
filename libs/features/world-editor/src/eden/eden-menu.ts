/** What the World Editor's menus do (Eden Editor's menu bar), each an action the editor runs. */
export type EdenAction =
  | 'execute'
  | 'copySql'
  | 'discard'
  | 'refresh'
  | 'undo'
  | 'redo'
  | 'toolSelect'
  | 'toolFace'
  | 'toolPlaceCreature'
  | 'toolPlaceGameobject'
  | 'assets'
  | 'worldMap'
  | 'gameMap'
  | 'filters'
  | 'view'
  | 'tree'
  | 'topView'
  | 'resetNorth'
  | 'legend'
  | 'style'
  | 'fullscreen'
  | 'controls'
  | 'settings'
  | 'wiki';

export interface EdenMenuItem {
  action: EdenAction;
  /** Translation key. */
  label: string;
  /** The key it is bound to, shown next to it. */
  shortcut?: string;
}

export interface EdenMenu {
  label: string;
  items: (EdenMenuItem | 'separator')[];
}

export const EDEN_MENUS: EdenMenu[] = [
  {
    label: 'WORLD_EDITOR.EDEN.MENU_WORLD',
    items: [
      { action: 'execute', label: 'WORLD_EDITOR.EDEN.EXECUTE' },
      { action: 'copySql', label: 'WORLD_EDITOR.EDEN.COPY_SQL' },
      { action: 'discard', label: 'WORLD_EDITOR.EDEN.DISCARD' },
      'separator',
      { action: 'refresh', label: 'WORLD_EDITOR.REFRESH' },
    ],
  },
  {
    label: 'WORLD_EDITOR.EDEN.MENU_EDIT',
    items: [
      { action: 'undo', label: 'WORLD_EDITOR.EDEN.UNDO', shortcut: 'Ctrl+Z' },
      { action: 'redo', label: 'WORLD_EDITOR.EDEN.REDO', shortcut: 'Ctrl+Y' },
      'separator',
      { action: 'toolSelect', label: 'WORLD_EDITOR.EDEN.TOOL_SELECT' },
      { action: 'toolFace', label: 'WORLD_EDITOR.EDEN.TOOL_FACE' },
      { action: 'toolPlaceCreature', label: 'WORLD_EDITOR.EDEN.TOOL_PLACE_CREATURE' },
      { action: 'toolPlaceGameobject', label: 'WORLD_EDITOR.EDEN.TOOL_PLACE_GAMEOBJECT' },
    ],
  },
  {
    label: 'WORLD_EDITOR.EDEN.MENU_VIEW',
    items: [
      { action: 'assets', label: 'WORLD_EDITOR.EDEN.ASSETS' },
      { action: 'tree', label: 'WORLD_EDITOR.TREE' },
      { action: 'filters', label: 'WORLD_EDITOR.FILTERS' },
      { action: 'view', label: 'WORLD_EDITOR.VIEW' },
      'separator',
      { action: 'worldMap', label: 'WORLD_EDITOR.WORLD_MAP' },
      { action: 'gameMap', label: 'WORLD_EDITOR.GAME_MAP' },
      { action: 'topView', label: 'WORLD_EDITOR.TOP_VIEW' },
      { action: 'resetNorth', label: 'WORLD_EDITOR.RESET_NORTH' },
      { action: 'fullscreen', label: 'WORLD_EDITOR.EDEN.FULLSCREEN' },
      'separator',
      { action: 'legend', label: 'WORLD_EDITOR.LEGEND' },
      { action: 'style', label: 'WORLD_EDITOR.STYLE' },
    ],
  },
  {
    label: 'WORLD_EDITOR.EDEN.MENU_SETTINGS',
    items: [
      { action: 'controls', label: 'WORLD_EDITOR.CONTROLS' },
      { action: 'settings', label: 'WORLD_EDITOR.SETTINGS' },
    ],
  },
  {
    label: 'WORLD_EDITOR.EDEN.MENU_HELP',
    items: [
      { action: 'legend', label: 'WORLD_EDITOR.LEGEND' },
      { action: 'controls', label: 'WORLD_EDITOR.EDEN.KEYS' },
      { action: 'wiki', label: 'WORLD_EDITOR.EDEN.WIKI' },
    ],
  },
];

/** Whether an item can be used now: the SQL actions with pending changes, undo and redo when there is one. */
export function edenItemEnabled(action: EdenAction, state: { pending: number; canUndo: boolean; canRedo: boolean }): boolean {
  switch (action) {
    case 'execute':
    case 'copySql':
    case 'discard':
      return state.pending > 0;
    case 'undo':
      return state.canUndo;
    case 'redo':
      return state.canRedo;
    default:
      return true;
  }
}
