import { Option } from '@keira/shared/constants';

export const CREATURE_ICON: Option[] = [
  { value: null, name: 'None', icon: '' },
  { value: 'Directions', name: 'Used for guards and teleporter NPC’s.', icon: 'creature-icons/Directions.png' },
  { value: 'Gunner', name: 'Indicator of a turret NPC/Player Controlled.', icon: 'creature-icons/Gunner.png' },
  { value: 'vehichleCursor', name: 'Indicator that this is a PCV (Player Controlled Vehicle)', icon: 'creature-icons/vehichleCursor.png' },
  { value: 'Driver', name: 'Shows a steering wheel icon when mouse over.', icon: 'creature-icons/Driver.png' },
  { value: 'Attack', name: 'Shows a sword icon indicating you can attack this target.', icon: 'creature-icons/Attack.png' },
  { value: 'Buy', name: 'Shows a brown bag icon usually if the NPC only sells things.', icon: 'creature-icons/Buy.png' },
  { value: 'Speak', name: 'Shows a chat bubble icon if this NPC has quest/gossip options.', icon: 'creature-icons/Speak.png' },
  { value: 'Pickup', name: 'Shows a hand grasping icon if this NPC can be picked up for quest/items.', icon: 'creature-icons/Pickup.png' },
  { value: 'Interact', name: 'Shows cog icon commonly used for quest/transport.', icon: 'creature-icons/Interact.png' },
  { value: 'Trainer', name: 'Shows a book icon, identifying this NPC as a trainer.', icon: 'creature-icons/Trainer.png' },
  { value: 'Taxi', name: 'Shows a boot with wings icon identifying this NPC as a taxi.', icon: 'creature-icons/Taxi.png' },
  { value: 'Repair', name: 'Shows a anvil icon identifying that this NPC can repair.', icon: 'creature-icons/Repair.png' },
  {
    value: 'LootAll',
    name: 'Shows a multiple brown bag icon (same as holding shift before looting a creature).',
    icon: 'creature-icons/LootAll.png',
  },
  { value: 'Quest', name: 'Unused or unknown (see entry 32870 “The Real Ronakada”).', icon: 'creature-icons/Quest.png' },
  { value: 'PVP', name: 'Unused or Unknown (see entry 29387 “Arena Master: Dalaran Arena”).', icon: 'creature-icons/PVP.png' },
];
