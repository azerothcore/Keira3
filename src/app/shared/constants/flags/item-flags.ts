import { Flag } from '../../types/general';

export const ITEM_FLAGS: Flag[] = [
  { bit: 0,  name: 'NO_PICKUP' },
  { bit: 1,  name: 'CONJURED' },
  { bit: 2,  name: 'HAS_LOOT - Item can be right clicked to open its loot' },
  { bit: 3,  name: 'HEROIC_TOOLTIP - Makes green "Heroic" text appear on item' },
  { bit: 4,  name: 'DEPRECATED - Cannot equip or use' },
  { bit: 5,  name: 'NO_USER_DESTROY - Item can not be destroyed, except by using a spell' },
  { bit: 6,  name: 'PLAYERCAST - Item\'s spells are castable by players' },
  { bit: 7,  name: 'NO_EQUIP_COOLDOWN No default 30 seconds cooldown when equipped' },
  { bit: 8,  name: 'MULTI_LOOT_QUEST' },
  { bit: 9,  name: 'IS_WRAPPER - Item can wrap other items' },
  { bit: 10, name: 'USES_RESOURCES' },
  { bit: 11, name: 'MULTI_DROP - Looting this item does not remove it from available loot' },
  { bit: 12, name: 'ITEM_PURCHASE_RECORD - Item can be returned to the vendor for its original extended cost' },
  { bit: 13, name: 'PETITION - Item is a guild or arena charter' },
  { bit: 14, name: 'HAS_TEXT - Only readable items have this' },
  { bit: 15, name: 'NO_DISENCHANT' },
  { bit: 16, name: 'REAL_DURATION' },
  { bit: 17, name: 'NO_CREATOR' },
  { bit: 18, name: 'IS_PROSPECTABLE' },
  { bit: 19, name: 'UNIQUE_EQUIPPABLE - You can only equip one of these items' },
  { bit: 20, name: 'IGNORE_FOR_AURAS' },
  { bit: 21, name: 'IGNORE_DEFAULT_ARENA_RESTRICTIONS - Item can be used during an arena match' },
  { bit: 22, name: 'NO_DURABILITY_LOSS' },
  { bit: 23, name: 'USE_WHEN_SHAPESHIFTED - Item can be used in shapeshift forms' },
  { bit: 24, name: 'HAS_QUEST_GLOW' },
  { bit: 25, name: 'HIDE_UNUSABLE_RECIPE - Profession recipes: can only be looted if you meet requirements and don\'t already know it' },
  { bit: 26, name: 'NOT_USEABLE_IN_ARENA - Item cannot be used in arena' },
  { bit: 27, name: 'IS_BOUND_TO_ACCOUNT - Item binds to account and can be sent only to your own characters' },
  { bit: 28, name: 'NO_REAGENT_COST' },
  { bit: 29, name: 'IS_MILLABLE' },
  { bit: 30, name: 'REPORT_TO_GUILD_CHAT' },
  { bit: 31, name: 'NO_PROGRESSIVE_LOOT' },
];

// ItemFlags values
export enum ITEM_FLAG {
  CONJURED         = 0x00000002,
  OPENABLE         = 0x00000004,
  HEROIC           = 0x00000008,
  DEPRECATED       = 0x00000010,
  INDESTRUCTIBLE   = 0x00000020,
  NO_EQUIPCD       = 0x00000080,
  PARTYLOOT        = 0x00000800,
  REFUNDABLE       = 0x00001000,
  PROSPECTABLE     = 0x00040000,
  UNIQUEEQUIPPED   = 0x00080000,
  USABLE_ARENA     = 0x00200000,
  USABLE_SHAPED    = 0x00800000,
  SMARTLOOT        = 0x02000000,
  ACCOUNTBOUND     = 0x08000000,
  MILLABLE         = 0x20000000,
}
