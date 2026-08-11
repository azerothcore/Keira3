export type ToggleType = 'up' | 'down';

export interface MenuStats {
  creature: ToggleType;
  quest: ToggleType;
  gameobject: ToggleType;
  item: ToggleType;
  otherLoot: ToggleType;
  smartAi: ToggleType;
  conditions: ToggleType;
  texts: ToggleType;
  gossip: ToggleType;
  spell: ToggleType;
  gameTele: ToggleType;
  trainer: ToggleType;
}

/**
 * First path segment of each editor route mapped to the menu that lists it, so that navigating from
 * outside the sidebar (e.g. the quest chain linking to a quest's conditions) reveals where we landed.
 */
export const ROUTE_MENUS: Record<string, keyof MenuStats> = {
  creature: 'creature',
  quest: 'quest',
  gameobject: 'gameobject',
  item: 'item',
  'other-loots': 'otherLoot',
  'smart-ai': 'smartAi',
  conditions: 'conditions',
  texts: 'texts',
  gossip: 'gossip',
  spell: 'spell',
  'game-tele': 'gameTele',
  trainer: 'trainer',
};
