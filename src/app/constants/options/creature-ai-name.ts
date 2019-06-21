import { Option } from '../../types/general';

export const CREATURE_AI_NAME: Option[] = [
  { value: 'NullCreatureAI', name: 'Empty AI, the creature does nothing.' },
  { value: 'TriggerAI', name: '' },
  { value: 'AggressorAI', name: 'The creature attacks as soon as something is in aggro range.' },
  { value: 'ReactorAI', name: 'The creature attacks only if aggroed by attack, spell etc.' },
  { value: 'PassiveAI', name: '' },
  { value: 'CritterAI', name: '' },
  { value: 'GuardAI', name: '' },
  { value: 'PetAI', name: 'The creature is a pet.' },
  { value: 'TotemAI', name: 'The creature casts spell from field spell1, otherwise like NullAI.' },
  { value: 'CombatAI', name: '' },
  { value: 'ArcherAI', name: '' },
  { value: 'TurretAI', name: '' },
  { value: 'VehicleAI', name: '' },
  { value: 'SmartAI', name: 'The creature uses SmartAI' },
  { value: 'GameObjectAI', name: '' },
  { value: 'SmartGameObjectAI', name: '' },
];
