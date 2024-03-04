import { Option } from '@keira/shared-constants';

export const CREATURE_ICON: Option[] = [
  { value: null, name: 'None' },
  { value: 'Directions', name: 'Used for guards and teleporter NPC’s.' },
  { value: 'Gunner', name: 'Indicator of a turret NPC/Player Controlled.' },
  { value: 'vehichleCursor', name: 'Indicator that this is a PCV (Player Controlled Vehicle)' },
  { value: 'Driver', name: 'Shows a steering wheel icon when mouse over.' },
  { value: 'Attack', name: 'Shows a sword icon indicating you can attack this target.' },
  { value: 'Buy', name: 'Shows a brown bag icon usually if the NPC only sells things.' },
  { value: 'Speak', name: 'Shows a chat bubble icon if this NPC has quest/gossip options.' },
  { value: 'Pickup', name: 'Shows a hand grasping icon if this NPC can be picked up for quest/items.' },
  { value: 'Interact', name: 'Shows cog icon commonly used for quest/transport.' },
  { value: 'Trainer', name: 'Shows a book icon, identifying this NPC as a trainer.' },
  { value: 'Taxi', name: 'Shows a boot with wings icon identifying this NPC as a taxi.' },
  { value: 'Repair', name: 'Shows a anvil icon identifying that this NPC can repair.' },
  { value: 'LootAll', name: 'Shows a multiple brown bag icon (same as holding shift before looting a creature).' },
  { value: 'Quest', name: 'Unused or unknown (see entry 32870 “The Real Ronakada”).' },
  { value: 'PVP', name: 'Unused or Unknown (see entry 29387 “Arena Master: Dalaran Arena”).' },
];
