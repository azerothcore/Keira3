export const QUEST_FLAG_DAILY = 0x01000;
export const QUEST_FLAG_WEEKLY = 0x08000;
export const QUEST_FLAG_SPECIAL_MONTHLY = 0x10;
export const QUEST_FLAG_REPEATABLE = 0x02000;
export const QUEST_FLAG_SPECIAL_REPEATABLE = 0x01;

export const ICON_SKILLS = {
  171: 'trade_alchemy', // Alchemy
  164: 'trade_blacksmithing', // Blacksmithing
  333: 'trade_engraving', // Enchanting
  202: 'trade_engineering', // Engineering
  182: 'spell_nature_naturetouchgrow', // Herbalism
  773: 'inv_inscription_tradeskill01', // Inscription
  755: 'inv_misc_gem_01', // Jewelcrafting
  165: 'inv_misc_armorkit_17', // Leatherworking
  186: 'trade_mining', // Mining
  393: 'inv_misc_pelt_wolf_01', // Skinning
  197: 'trade_tailoring', // Tailoring
  185: 'inv_misc_food_15', // Cooking
  129: 'spell_holy_sealofsacrifice', // First Aid
  356: 'trade_fishing', // Fishing
  762: 'spell_nature_swiftness', // Riding
};

export const enum QUEST_PERIOD {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}
