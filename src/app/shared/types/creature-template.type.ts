import { TableRow } from './general';

export const CREATURE_TEMPLATE_TABLE = 'creature_template';
export const CREATURE_TEMPLATE_ID = 'entry';
export const CREATURE_TEMPLATE_NAME = 'name';
export const CREATURE_TEMPLATE_CUSTOM_STARTING_ID = 9_000_000;
export const CREATURE_TEMPLATE_SEARCH_FIELDS = [
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME,
  'subname'
];

export const CREATURE_TEMPLATE_LOOT_ID = 'lootid';
export const CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID = 'pickpocketloot';
export const CREATURE_TEMPLATE_SKINNING_LOOT_ID = 'skinloot';

export class CreatureTemplate extends TableRow {
  entry: number = 0;
  difficulty_entry_1: number = 0;
  difficulty_entry_2: number = 0;
  difficulty_entry_3: number = 0;
  KillCredit1: number = 0;
  KillCredit2: number = 0;
  modelid1: number = 0;
  modelid2: number = 0;
  modelid3: number = 0;
  modelid4: number = 0;
  name: string = '';
  subname: string = '';
  IconName: string = '';
  gossip_menu_id: number = 0;
  minlevel: number = 1;
  maxlevel: number = 1;
  exp: number = 0;
  faction: number = 0;
  npcflag: number = 0;
  speed_walk: number = 1;
  speed_run: number = 1.14286;
  scale: number = 1;
  rank: number = 0;
  mindmg: number = 0;
  maxdmg: number = 0;
  dmgschool: number = 0;
  attackpower: number = 0;
  DamageModifier: number = 1;
  BaseAttackTime: number = 0;
  RangeAttackTime: number = 0;
  unit_class: number = 0;
  unit_flags: number = 0;
  unit_flags2: number = 0;
  dynamicflags: number = 0;
  family: number = 0;
  trainer_type: number = 0;
  trainer_spell: number = 0;
  trainer_class: number = 0;
  trainer_race: number = 0;
  minrangedmg: number = 0;
  maxrangedmg: number = 0;
  rangedattackpower: number = 0;
  type: number = 0;
  type_flags: number = 0;
  lootid: number = 0;
  pickpocketloot: number = 0;
  skinloot: number = 0;
  resistance1: number = 0;
  resistance2: number = 0;
  resistance3: number = 0;
  resistance4: number = 0;
  resistance5: number = 0;
  resistance6: number = 0;
  spell1: number = 0;
  spell2: number = 0;
  spell3: number = 0;
  spell4: number = 0;
  spell5: number = 0;
  spell6: number = 0;
  spell7: number = 0;
  spell8: number = 0;
  PetSpellDataId: number = 0;
  VehicleId: number = 0;
  mingold: number = 0;
  maxgold: number = 0;
  AIName: string = '';
  MovementType: number = 0;
  InhabitType: number = 3;
  HoverHeight: number = 1;
  HealthModifier: number = 1;
  ManaModifier: number = 1;
  ArmorModifier: number = 1;
  RacialLeader: number = 0;
  movementId: number = 0;
  RegenHealth: number = 1;
  mechanic_immune_mask: number = 0;
  flags_extra: number = 0;
  ScriptName: string = '';
  VerifiedBuild: number = 0;
}
