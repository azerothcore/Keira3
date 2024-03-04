import { TableRow } from '../../../constants/src/types/general';

export const ITEM_TEMPLATE_TABLE = 'item_template';
export const ITEM_TEMPLATE_ID = 'entry';
export const ITEM_TEMPLATE_NAME = 'name';
export const ITEM_TEMPLATE_SEARCH_FIELDS = [ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME];
export const ITEM_TEMPLATE_CUSTOM_STARTING_ID = 90_000;

export const DISENCHANT_TEMPLATE_LOOT_ID = 'DisenchantID';

export class ItemTemplate extends TableRow {
  entry: number = 0;
  class: number = 0;
  subclass: number = 0;
  SoundOverrideSubclass: number = -1;
  name: string = '';
  displayid: number = 0;
  Quality: number = 0;
  Flags: number = 0;
  FlagsExtra: number = 0;
  BuyCount: number = 1;
  BuyPrice: number = 0;
  SellPrice: number = 0;
  InventoryType: number = 0;
  AllowableClass: number = -1;
  AllowableRace: number = -1;
  ItemLevel: number = 0;
  RequiredLevel: number = 0;
  RequiredSkill: number = 0;
  RequiredSkillRank: number = 0;
  requiredspell: number = 0;
  requiredhonorrank: number = 0;
  RequiredCityRank: number = 0;
  RequiredReputationFaction: number = 0;
  RequiredReputationRank: number = 0;
  maxcount: number = 0;
  stackable: number = 1;
  ContainerSlots: number = 0;
  StatsCount: number = 0;
  stat_type1: number = 0;
  stat_value1: number = 0;
  stat_type2: number = 0;
  stat_value2: number = 0;
  stat_type3: number = 0;
  stat_value3: number = 0;
  stat_type4: number = 0;
  stat_value4: number = 0;
  stat_type5: number = 0;
  stat_value5: number = 0;
  stat_type6: number = 0;
  stat_value6: number = 0;
  stat_type7: number = 0;
  stat_value7: number = 0;
  stat_type8: number = 0;
  stat_value8: number = 0;
  stat_type9: number = 0;
  stat_value9: number = 0;
  stat_type10: number = 0;
  stat_value10: number = 0;
  ScalingStatDistribution: number = 0;
  ScalingStatValue: number = 0;
  dmg_min1: number = 0;
  dmg_max1: number = 0;
  dmg_type1: number = 0;
  dmg_min2: number = 0;
  dmg_max2: number = 0;
  dmg_type2: number = 0;
  armor: number = 0;
  holy_res: number = 0;
  fire_res: number = 0;
  nature_res: number = 0;
  frost_res: number = 0;
  shadow_res: number = 0;
  arcane_res: number = 0;
  delay: number = 1000;
  ammo_type: number = 0;
  RangedModRange: number = 0;
  spellid_1: number = 0;
  spelltrigger_1: number = 0;
  spellcharges_1: number = 0;
  spellppmRate_1: number = 0;
  spellcooldown_1: number = -1;
  spellcategory_1: number = 0;
  spellcategorycooldown_1: number = -1;
  spellid_2: number = 0;
  spelltrigger_2: number = 0;
  spellcharges_2: number = 0;
  spellppmRate_2: number = 0;
  spellcooldown_2: number = -1;
  spellcategory_2: number = 0;
  spellcategorycooldown_2: number = -1;
  spellid_3: number = 0;
  spelltrigger_3: number = 0;
  spellcharges_3: number = 0;
  spellppmRate_3: number = 0;
  spellcooldown_3: number = -1;
  spellcategory_3: number = 0;
  spellcategorycooldown_3: number = -1;
  spellid_4: number = 0;
  spelltrigger_4: number = 0;
  spellcharges_4: number = 0;
  spellppmRate_4: number = 0;
  spellcooldown_4: number = -1;
  spellcategory_4: number = 0;
  spellcategorycooldown_4: number = -1;
  spellid_5: number = 0;
  spelltrigger_5: number = 0;
  spellcharges_5: number = 0;
  spellppmRate_5: number = 0;
  spellcooldown_5: number = -1;
  spellcategory_5: number = 0;
  spellcategorycooldown_5: number = -1;
  bonding: number = 0;
  description: string = '';
  PageText: number = 0;
  LanguageID: number = 0;
  PageMaterial: number = 0;
  startquest: number = 0;
  lockid: number = 0;
  Material: number = 0;
  sheath: number = 0;
  RandomProperty: number = 0;
  RandomSuffix: number = 0;
  block: number = 0;
  itemset: number = 0;
  MaxDurability: number = 0;
  area: number = 0;
  Map: number = 0;
  BagFamily: number = 0;
  TotemCategory: number = 0;
  socketColor_1: number = 0;
  socketContent_1: number = 0;
  socketColor_2: number = 0;
  socketContent_2: number = 0;
  socketColor_3: number = 0;
  socketContent_3: number = 0;
  socketBonus: number = 0;
  GemProperties: number = 0;
  RequiredDisenchantSkill: number = -1;
  ArmorDamageModifier: number = 0;
  duration: number = 0;
  ItemLimitCategory: number = 0;
  HolidayId: number = 0;
  ScriptName: string = '';
  DisenchantID: number = 0;
  FoodType: number = 0;
  minMoneyLoot: number = 0;
  maxMoneyLoot: number = 0;
  flagsCustom: number = 0;
  VerifiedBuild: number = 0;
}
