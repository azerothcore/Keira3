import { Option } from '@keira/acore-world-model';

export const CREATURE_AI_NAME: Option[] = [
  { value: 'NullCreatureAI', name: 'Empty AI, creature does nothing; cannot be charmed.' },
  {
    value: 'TriggerAI',
    name: 'Same as "NullCreatureAI", except that the creature casts the spell from field spell1 when summoned',
  },
  { value: 'AggressorAI', name: 'Creature attacks when entering aggro radius; uses only melee attacks.' },
  { value: 'ReactorAI', name: 'Creature attacks only if aggroed; uses only melee attacks..' },
  { value: 'PassiveAI', name: 'Creature behaves passive, cannot attack. ' },
  { value: 'CritterAI', name: 'Critter which flees if attacked.' },
  { value: 'GuardAI', name: 'Creature is a zone guard.' },
  { value: 'PetAI', name: 'The creature is a pet.' },
  { value: 'TotemAI', name: 'Creature casts spell from field spell1; does not move.' },
  { value: 'CombatAI', name: 'Creature attacks as soon as something is in aggro range; uses also spells.' },
  { value: 'ArcherAI', name: 'Creature casts spell from field spell1; chases the victim.' },
  { value: 'TurretAI', name: 'Creature attacks using spell from field spell1; does not move.' },
  { value: 'VehicleAI', name: 'Creature acts as player vehicle.' },
  { value: 'SmartAI', name: 'The creature uses SmartAI' },
];
